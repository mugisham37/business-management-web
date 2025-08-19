# Production Environment Configuration

# Project Configuration
project_name = "fullstack-monolith"
aws_region   = "us-west-2"
owner        = "platform-team"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# EKS Configuration
cluster_version = "1.28"
cluster_endpoint_public_access_cidrs = [
  "0.0.0.0/0"  # Restrict this to your organization's IP ranges in production
]

node_groups = {
  general = {
    instance_types = ["t3.large"]
    capacity_type  = "ON_DEMAND"
    min_size      = 3
    max_size      = 20
    desired_size  = 6
    disk_size     = 100
    labels = {
      role        = "general"
      environment = "production"
    }
    taints = []
  }
  spot = {
    instance_types = ["t3.medium", "t3.large", "m5.large"]
    capacity_type  = "SPOT"
    min_size      = 0
    max_size      = 10
    desired_size  = 3
    disk_size     = 50
    labels = {
      role        = "spot"
      environment = "production"
    }
    taints = [{
      key    = "spot"
      value  = "true"
      effect = "NO_SCHEDULE"
    }]
  }
}

# RDS Configuration
db_instance_class           = "db.r6g.large"
db_allocated_storage        = 100
db_max_allocated_storage    = 1000
db_backup_retention_period  = 30
db_multi_az                = true
db_name                    = "fullstack_monolith"
db_username                = "postgres"

# ElastiCache Configuration
redis_node_type            = "cache.r6g.large"
redis_num_cache_nodes      = 3
redis_parameter_group_name = "default.redis7"

# Application Configuration
api_image_tag = "latest"
web_image_tag = "latest"
api_replicas  = 6
web_replicas  = 4

# Monitoring Configuration
enable_monitoring = true
enable_logging    = true

# Security Configuration
enable_waf    = true
enable_shield = true

# Domain Configuration (update with your actual domain)
domain_name    = "fullstack-monolith.com"
api_subdomain  = "api"
web_subdomain  = "app"

# SSL Certificate ARN (update with your actual certificate ARN)
ssl_certificate_arn = ""

# Backup Configuration
backup_retention_days = 30
backup_schedule      = "cron(0 2 * * ? *)"  # Daily at 2 AM UTC

# Alerting Configuration (update with your actual email)
alert_email = "alerts@fullstack-monolith.com"

# Slack webhook URL for alerts (set via environment variable or update here)
# slack_webhook_url = ""