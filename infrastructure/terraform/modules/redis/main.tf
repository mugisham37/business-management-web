# Redis ElastiCache Module

resource "aws_elasticache_cluster" "main" {
  cluster_id           = var.cluster_id
  engine               = "redis"
  node_type            = var.node_type
  num_cache_nodes      = var.num_cache_nodes
  parameter_group_name = var.parameter_group_name
  port                 = var.port
  
  subnet_group_name  = var.subnet_group_name
  security_group_ids = var.security_group_ids
  
  # Encryption
  at_rest_encryption_enabled = var.at_rest_encryption_enabled
  transit_encryption_enabled = var.transit_encryption_enabled
  auth_token                = var.auth_token
  
  # Maintenance
  maintenance_window = var.maintenance_window
  
  # Backup
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window         = var.snapshot_window
  
  # Notifications
  notification_topic_arn = var.notification_topic_arn
  
  tags = var.tags
}

# Redis Replication Group for high availability (alternative to single cluster)
resource "aws_elasticache_replication_group" "main" {
  count = var.create_replication_group ? 1 : 0
  
  replication_group_id         = var.cluster_id
  description                  = "Redis replication group for ${var.cluster_id}"
  
  node_type                    = var.node_type
  port                         = var.port
  parameter_group_name         = var.parameter_group_name
  
  num_cache_clusters           = var.num_cache_clusters
  automatic_failover_enabled   = var.automatic_failover_enabled
  multi_az_enabled            = var.multi_az_enabled
  
  subnet_group_name           = var.subnet_group_name
  security_group_ids          = var.security_group_ids
  
  # Encryption
  at_rest_encryption_enabled  = var.at_rest_encryption_enabled
  transit_encryption_enabled  = var.transit_encryption_enabled
  auth_token                 = var.auth_token
  
  # Maintenance and backup
  maintenance_window          = var.maintenance_window
  snapshot_retention_limit    = var.snapshot_retention_limit
  snapshot_window            = var.snapshot_window
  
  # Notifications
  notification_topic_arn     = var.notification_topic_arn
  
  # Auto scaling
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  
  tags = var.tags
  
  lifecycle {
    ignore_changes = [num_cache_clusters]
  }
}

# CloudWatch alarms for Redis monitoring
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${var.cluster_id}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors Redis CPU utilization"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    CacheClusterId = var.create_replication_group ? null : aws_elasticache_cluster.main.cluster_id
    ReplicationGroupId = var.create_replication_group ? aws_elasticache_replication_group.main[0].id : null
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${var.cluster_id}-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors Redis memory utilization"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    CacheClusterId = var.create_replication_group ? null : aws_elasticache_cluster.main.cluster_id
    ReplicationGroupId = var.create_replication_group ? aws_elasticache_replication_group.main[0].id : null
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_connections" {
  alarm_name          = "${var.cluster_id}-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CurrConnections"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "100"
  alarm_description   = "This metric monitors Redis connection count"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    CacheClusterId = var.create_replication_group ? null : aws_elasticache_cluster.main.cluster_id
    ReplicationGroupId = var.create_replication_group ? aws_elasticache_replication_group.main[0].id : null
  }
  
  tags = var.tags
}

# SNS topic for Redis notifications
resource "aws_sns_topic" "redis_notifications" {
  count = var.create_notification_topic ? 1 : 0
  
  name = "${var.cluster_id}-notifications"
  
  tags = var.tags
}

resource "aws_sns_topic_subscription" "redis_email" {
  count = var.create_notification_topic && var.notification_email != "" ? 1 : 0
  
  topic_arn = aws_sns_topic.redis_notifications[0].arn
  protocol  = "email"
  endpoint  = var.notification_email
}