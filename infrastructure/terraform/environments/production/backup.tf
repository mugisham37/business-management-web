# Production Backup and Disaster Recovery Configuration

# AWS Backup Vault
resource "aws_backup_vault" "main" {
  name        = "${local.name_prefix}-backup-vault"
  kms_key_arn = aws_kms_key.backup.arn
  
  tags = local.common_tags
}

# KMS Key for backup encryption
resource "aws_kms_key" "backup" {
  description             = "KMS key for backup encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = local.common_tags
}

resource "aws_kms_alias" "backup" {
  name          = "alias/${local.name_prefix}-backup"
  target_key_id = aws_kms_key.backup.key_id
}

# IAM Role for AWS Backup
resource "aws_iam_role" "backup" {
  name = "${local.name_prefix}-backup-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backup" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "backup_restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Backup Plan for RDS
resource "aws_backup_plan" "rds_backup" {
  name = "${local.name_prefix}-rds-backup-plan"
  
  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = var.backup_schedule
    
    start_window      = 60   # 1 hour
    completion_window = 300  # 5 hours
    
    recovery_point_tags = local.common_tags
    
    lifecycle {
      cold_storage_after = 30
      delete_after       = var.backup_retention_days
    }
  }
  
  rule {
    rule_name         = "weekly_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 ? * SUN *)"  # Weekly on Sunday at 3 AM
    
    start_window      = 60
    completion_window = 300
    
    recovery_point_tags = merge(local.common_tags, {
      BackupType = "weekly"
    })
    
    lifecycle {
      cold_storage_after = 7
      delete_after       = 90  # Keep weekly backups for 90 days
    }
  }
  
  tags = local.common_tags
}

# Backup Selection for RDS
resource "aws_backup_selection" "rds_backup" {
  iam_role_arn = aws_iam_role.backup.arn
  name         = "${local.name_prefix}-rds-backup-selection"
  plan_id      = aws_backup_plan.rds_backup.id
  
  resources = [
    module.rds.db_instance_arn
  ]
  
  condition {
    string_equals {
      key   = "aws:ResourceTag/Environment"
      value = "production"
    }
  }
}

# EBS Volume Backup Plan
resource "aws_backup_plan" "ebs_backup" {
  name = "${local.name_prefix}-ebs-backup-plan"
  
  rule {
    rule_name         = "daily_ebs_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 4 * * ? *)"  # Daily at 4 AM
    
    start_window      = 60
    completion_window = 180
    
    recovery_point_tags = local.common_tags
    
    lifecycle {
      delete_after = 7  # Keep EBS snapshots for 7 days
    }
  }
  
  tags = local.common_tags
}

# Cross-Region Backup for Disaster Recovery
resource "aws_backup_vault" "cross_region" {
  provider = aws.disaster_recovery
  
  name        = "${local.name_prefix}-dr-backup-vault"
  kms_key_arn = aws_kms_key.backup_dr.arn
  
  tags = local.common_tags
}

resource "aws_kms_key" "backup_dr" {
  provider = aws.disaster_recovery
  
  description             = "KMS key for disaster recovery backup encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = local.common_tags
}

# Cross-region replication for critical backups
resource "aws_backup_plan" "cross_region_backup" {
  name = "${local.name_prefix}-cross-region-backup-plan"
  
  rule {
    rule_name         = "cross_region_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 6 * * ? *)"  # Daily at 6 AM
    
    start_window      = 60
    completion_window = 300
    
    recovery_point_tags = merge(local.common_tags, {
      BackupType = "cross-region"
    })
    
    lifecycle {
      delete_after = var.backup_retention_days
    }
    
    copy_action {
      destination_vault_arn = aws_backup_vault.cross_region.arn
      
      lifecycle {
        cold_storage_after = 30
        delete_after       = var.backup_retention_days
      }
    }
  }
  
  tags = local.common_tags
}

# S3 Bucket for application data backups
resource "aws_s3_bucket" "app_backups" {
  bucket = "${local.name_prefix}-app-backups-${random_id.bucket_suffix.hex}"
  
  tags = local.common_tags
}

resource "aws_s3_bucket_versioning" "app_backups" {
  bucket = aws_s3_bucket.app_backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "app_backups" {
  bucket = aws_s3_bucket.app_backups.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.backup.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "app_backups" {
  bucket = aws_s3_bucket.app_backups.id
  
  rule {
    id     = "backup_lifecycle"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    
    expiration {
      days = 2555  # 7 years
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# Cross-region replication for S3 backups
resource "aws_s3_bucket" "app_backups_replica" {
  provider = aws.disaster_recovery
  
  bucket = "${local.name_prefix}-app-backups-replica-${random_id.bucket_suffix.hex}"
  
  tags = local.common_tags
}

resource "aws_s3_bucket_replication_configuration" "app_backups" {
  role   = aws_iam_role.s3_replication.arn
  bucket = aws_s3_bucket.app_backups.id
  
  rule {
    id     = "replicate_backups"
    status = "Enabled"
    
    destination {
      bucket        = aws_s3_bucket.app_backups_replica.arn
      storage_class = "STANDARD_IA"
    }
  }
  
  depends_on = [aws_s3_bucket_versioning.app_backups]
}

# IAM Role for S3 replication
resource "aws_iam_role" "s3_replication" {
  name = "${local.name_prefix}-s3-replication-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy" "s3_replication" {
  name = "${local.name_prefix}-s3-replication-policy"
  role = aws_iam_role.s3_replication.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl"
        ]
        Effect = "Allow"
        Resource = "${aws_s3_bucket.app_backups.arn}/*"
      },
      {
        Action = [
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = aws_s3_bucket.app_backups.arn
      },
      {
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete"
        ]
        Effect = "Allow"
        Resource = "${aws_s3_bucket.app_backups_replica.arn}/*"
      }
    ]
  })
}

# Disaster Recovery Provider (different region)
provider "aws" {
  alias  = "disaster_recovery"
  region = "us-east-1"  # Different region for DR
  
  default_tags {
    tags = merge(local.common_tags, {
      Purpose = "disaster-recovery"
    })
  }
}

# CloudWatch Alarm for backup failures
resource "aws_cloudwatch_metric_alarm" "backup_failure" {
  alarm_name          = "${local.name_prefix}-backup-failure"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfBackupJobsFailed"
  namespace           = "AWS/Backup"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors backup job failures"
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]
  
  dimensions = {
    BackupVaultName = aws_backup_vault.main.name
  }
  
  tags = local.common_tags
}