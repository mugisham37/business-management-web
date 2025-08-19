# Redis Module Outputs

# Single cluster outputs
output "cache_cluster_id" {
  description = "The cache cluster identifier"
  value       = try(aws_elasticache_cluster.main.cluster_id, "")
}

output "cache_cluster_address" {
  description = "The DNS name of the cache cluster without the port appended"
  value       = try(aws_elasticache_cluster.main.cache_nodes[0].address, "")
}

output "cache_cluster_port" {
  description = "The port number on which each of the cache nodes will accept connections"
  value       = try(aws_elasticache_cluster.main.port, "")
}

output "cache_cluster_arn" {
  description = "The ARN of the ElastiCache Cluster"
  value       = try(aws_elasticache_cluster.main.arn, "")
}

# Replication group outputs
output "replication_group_id" {
  description = "The ID of the ElastiCache Replication Group"
  value       = try(aws_elasticache_replication_group.main[0].id, "")
}

output "replication_group_arn" {
  description = "The Amazon Resource Name (ARN) of the created ElastiCache Replication Group"
  value       = try(aws_elasticache_replication_group.main[0].arn, "")
}

output "replication_group_primary_endpoint_address" {
  description = "The address of the endpoint for the primary node in the replication group"
  value       = try(aws_elasticache_replication_group.main[0].primary_endpoint_address, "")
}

output "replication_group_reader_endpoint_address" {
  description = "The address of the endpoint for the reader node in the replication group"
  value       = try(aws_elasticache_replication_group.main[0].reader_endpoint_address, "")
}

output "replication_group_configuration_endpoint_address" {
  description = "The configuration endpoint address to allow host discovery"
  value       = try(aws_elasticache_replication_group.main[0].configuration_endpoint_address, "")
}

output "replication_group_member_clusters" {
  description = "The identifiers of all the nodes that are part of this replication group"
  value       = try(aws_elasticache_replication_group.main[0].member_clusters, [])
}

# Common outputs
output "engine_version_actual" {
  description = "The running version of the cache engine"
  value       = var.create_replication_group ? try(aws_elasticache_replication_group.main[0].engine_version_actual, "") : try(aws_elasticache_cluster.main.engine_version_actual, "")
}

output "cluster_enabled" {
  description = "Indicates if cluster mode is enabled"
  value       = var.create_replication_group ? try(aws_elasticache_replication_group.main[0].cluster_enabled, false) : false
}

# SNS topic outputs
output "notification_topic_arn" {
  description = "The ARN of the SNS topic for notifications"
  value       = try(aws_sns_topic.redis_notifications[0].arn, "")
}

# Connection information
output "connection_info" {
  description = "Redis connection information"
  value = {
    host = var.create_replication_group ? try(aws_elasticache_replication_group.main[0].primary_endpoint_address, "") : try(aws_elasticache_cluster.main.cache_nodes[0].address, "")
    port = var.port
    auth_token_required = var.auth_token != ""
  }
  sensitive = false
}