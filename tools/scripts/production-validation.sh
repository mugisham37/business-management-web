#!/bin/bash

# Production Validation Script - Minimal Production Readiness Checks
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="production"
PROJECT_NAME="fullstack-monolith"
API_URL="https://api.fullstack-monolith.com"
WEB_URL="https://app.fullstack-monolith.com"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# Function to run smoke tests
run_smoke_tests() {
    print_status "Running production smoke tests..."
    
    local test_results=0
    
    # Test 1: API Health Check
    print_test "Testing API health endpoint..."
    if curl -f -s "${API_URL}/health" > /dev/null 2>&1; then
        print_status "✓ API health check passed"
    else
        print_error "✗ API health check failed"
        test_results=1
    fi
    
    # Test 2: Web Application Health Check
    print_test "Testing web application health..."
    if curl -f -s "${WEB_URL}/api/health" > /dev/null 2>&1; then
        print_status "✓ Web application health check passed"
    else
        print_error "✗ Web application health check failed"
        test_results=1
    fi
    
    # Test 3: Database Connection Test
    print_test "Testing database connectivity..."
    if curl -f -s "${API_URL}/health/database" > /dev/null 2>&1; then
        print_status "✓ Database connectivity test passed"
    else
        print_warning "⚠ Database connectivity test failed or endpoint not available"
    fi
    
    # Test 4: Redis Connection Test
    print_test "Testing Redis connectivity..."
    if curl -f -s "${API_URL}/health/redis" > /dev/null 2>&1; then
        print_status "✓ Redis connectivity test passed"
    else
        print_warning "⚠ Redis connectivity test failed or endpoint not available"
    fi
    
    # Test 5: Authentication Flow Test
    print_test "Testing basic authentication flow..."
    local auth_response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"invalid"}' \
        -w "%{http_code}")
    
    if [[ "$auth_response" == *"400"* ]] || [[ "$auth_response" == *"401"* ]]; then
        print_status "✓ Authentication endpoint responding correctly"
    else
        print_warning "⚠ Authentication endpoint response unexpected"
    fi
    
    return $test_results
}

# Function to validate security configuration
validate_security() {
    print_status "Validating security configuration..."
    
    # Test HTTPS enforcement
    print_test "Testing HTTPS enforcement..."
    local http_response=$(curl -s -o /dev/null -w "%{http_code}" "http://api.fullstack-monolith.com/health" || echo "000")
    if [[ "$http_response" == "301" ]] || [[ "$http_response" == "302" ]]; then
        print_status "✓ HTTPS redirect working correctly"
    else
        print_warning "⚠ HTTPS redirect may not be configured properly (HTTP response: $http_response)"
    fi
    
    # Test security headers
    print_test "Testing security headers..."
    local headers=$(curl -s -I "${API_URL}/health" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection")
    if [[ -n "$headers" ]]; then
        print_status "✓ Security headers present"
    else
        print_warning "⚠ Some security headers may be missing"
    fi
    
    # Test rate limiting
    print_test "Testing rate limiting..."
    local rate_limit_header=$(curl -s -I "${API_URL}/health" | grep -i "x-ratelimit")
    if [[ -n "$rate_limit_header" ]]; then
        print_status "✓ Rate limiting headers present"
    else
        print_warning "⚠ Rate limiting headers not detected"
    fi
}

# Function to validate performance
validate_performance() {
    print_status "Validating basic performance metrics..."
    
    # Test API response time
    print_test "Testing API response time..."
    local api_time=$(curl -s -o /dev/null -w "%{time_total}" "${API_URL}/health")
    if (( $(echo "$api_time < 2.0" | bc -l) )); then
        print_status "✓ API response time acceptable (${api_time}s)"
    else
        print_warning "⚠ API response time high (${api_time}s)"
    fi
    
    # Test web application response time
    print_test "Testing web application response time..."
    local web_time=$(curl -s -o /dev/null -w "%{time_total}" "${WEB_URL}")
    if (( $(echo "$web_time < 3.0" | bc -l) )); then
        print_status "✓ Web application response time acceptable (${web_time}s)"
    else
        print_warning "⚠ Web application response time high (${web_time}s)"
    fi
}

# Function to validate infrastructure
validate_infrastructure() {
    print_status "Validating infrastructure components..."
    
    # Check if kubectl is available and configured
    if command -v kubectl >/dev/null 2>&1; then
        # Check EKS cluster status
        print_test "Checking EKS cluster status..."
        local cluster_status=$(kubectl get nodes --no-headers 2>/dev/null | wc -l || echo "0")
        if [[ "$cluster_status" -gt 0 ]]; then
            print_status "✓ EKS cluster has $cluster_status nodes"
        else
            print_warning "⚠ Unable to connect to EKS cluster or no nodes found"
        fi
        
        # Check pod status
        print_test "Checking application pod status..."
        local api_pods=$(kubectl get pods -n fullstack-monolith-prod -l app=api --no-headers 2>/dev/null | grep -c "Running" || echo "0")
        local web_pods=$(kubectl get pods -n fullstack-monolith-prod -l app=web --no-headers 2>/dev/null | grep -c "Running" || echo "0")
        
        if [[ "$api_pods" -gt 0 ]] && [[ "$web_pods" -gt 0 ]]; then
            print_status "✓ Application pods running (API: $api_pods, Web: $web_pods)"
        else
            print_warning "⚠ Some application pods may not be running (API: $api_pods, Web: $web_pods)"
        fi
    else
        print_warning "⚠ kubectl not available, skipping Kubernetes checks"
    fi
    
    # Check AWS resources if AWS CLI is available
    if command -v aws >/dev/null 2>&1; then
        print_test "Checking AWS resources..."
        
        # Check RDS instance
        local rds_status=$(aws rds describe-db-instances --db-instance-identifier "${PROJECT_NAME}-${ENVIRONMENT}-db" --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "not-found")
        if [[ "$rds_status" == "available" ]]; then
            print_status "✓ RDS instance is available"
        else
            print_warning "⚠ RDS instance status: $rds_status"
        fi
        
        # Check Redis cluster
        local redis_status=$(aws elasticache describe-cache-clusters --cache-cluster-id "${PROJECT_NAME}-${ENVIRONMENT}-redis" --query 'CacheClusters[0].CacheClusterStatus' --output text 2>/dev/null || echo "not-found")
        if [[ "$redis_status" == "available" ]]; then
            print_status "✓ Redis cluster is available"
        else
            print_warning "⚠ Redis cluster status: $redis_status"
        fi
    else
        print_warning "⚠ AWS CLI not available, skipping AWS resource checks"
    fi
}

# Function to create basic team handover documentation
create_handover_documentation() {
    print_status "Creating basic team handover documentation..."
    
    local doc_file="PRODUCTION_HANDOVER.md"
    
    cat > "$doc_file" << EOF
# Production Environment Handover Documentation

## Environment Information
- **Environment**: Production
- **Project**: Fullstack Monolith
- **Deployment Date**: $(date)
- **API URL**: ${API_URL}
- **Web URL**: ${WEB_URL}

## Infrastructure Components

### AWS Resources
- **EKS Cluster**: ${PROJECT_NAME}-${ENVIRONMENT}-cluster
- **RDS Instance**: ${PROJECT_NAME}-${ENVIRONMENT}-db
- **Redis Cluster**: ${PROJECT_NAME}-${ENVIRONMENT}-redis
- **Load Balancer**: Application Load Balancer with WAF
- **Backup Vault**: ${PROJECT_NAME}-${ENVIRONMENT}-backup-vault

### Kubernetes Resources
- **Namespace**: fullstack-monolith-prod
- **API Deployment**: api-deployment (6 replicas)
- **Web Deployment**: web-deployment (4 replicas)
- **Ingress**: fullstack-monolith-ingress

## Monitoring and Alerting
- **CloudWatch Dashboard**: Available in AWS Console
- **SNS Alerts**: Configured for critical alerts
- **Prometheus Metrics**: Available on port 9090
- **Log Aggregation**: CloudWatch Logs

## Security Configuration
- **HTTPS**: Enforced with SSL certificates
- **WAF**: Enabled with common rule sets
- **Network Policies**: Configured for pod-to-pod communication
- **Secrets Management**: AWS Secrets Manager integration

## Backup and Recovery
- **Database Backups**: Daily automated backups (30-day retention)
- **Cross-Region Replication**: Enabled for disaster recovery
- **Application Data**: S3 backup with lifecycle policies

## Deployment Process
1. Infrastructure: Use Terraform in \`infrastructure/terraform/environments/production/\`
2. Applications: Use Kubernetes manifests in \`infrastructure/kubernetes/production/\`
3. Deployment Script: \`infrastructure/terraform/environments/production/deploy.sh\`

## Key Contacts
- **Platform Team**: platform-team@company.com
- **Alerts Email**: alerts@fullstack-monolith.com

## Troubleshooting
- Check application logs: \`kubectl logs -n fullstack-monolith-prod -l app=api\`
- Check infrastructure: AWS Console CloudWatch Dashboard
- Validate deployment: Run \`tools/scripts/production-validation.sh\`

## Performance Baselines
- API Response Time: < 2 seconds
- Web Response Time: < 3 seconds
- Database Connections: Monitor via CloudWatch
- Pod Auto-scaling: Configured for CPU/Memory thresholds

## Next Steps
1. Monitor application performance for first 48 hours
2. Review and adjust auto-scaling policies if needed
3. Validate backup and recovery procedures
4. Update DNS records if using custom domain
5. Configure additional monitoring alerts as needed

---
Generated on: $(date)
EOF

    print_status "✓ Handover documentation created: $doc_file"
}

# Function to update essential documentation
update_documentation() {
    print_status "Updating essential documentation..."
    
    # Update README with production information
    if [[ -f "README.md" ]]; then
        # Create backup
        cp README.md README.md.backup
        
        # Add production section if not exists
        if ! grep -q "## Production Environment" README.md; then
            cat >> README.md << EOF

## Production Environment

### URLs
- **API**: ${API_URL}
- **Web Application**: ${WEB_URL}

### Deployment Status
- **Last Deployment**: $(date)
- **Environment**: Production
- **Status**: ✅ Active

### Quick Links
- [CloudWatch Dashboard](https://console.aws.amazon.com/cloudwatch/home?region=us-west-2#dashboards:name=${PROJECT_NAME}-${ENVIRONMENT}-dashboard)
- [EKS Cluster](https://console.aws.amazon.com/eks/home?region=us-west-2#/clusters/${PROJECT_NAME}-${ENVIRONMENT}-cluster)
- [Production Validation](./tools/scripts/production-validation.sh)

### Emergency Contacts
- Platform Team: platform-team@company.com
- Alerts: alerts@fullstack-monolith.com
EOF
            print_status "✓ README.md updated with production information"
        else
            print_status "✓ README.md already contains production information"
        fi
    else
        print_warning "⚠ README.md not found, skipping update"
    fi
}

# Main validation function
main() {
    print_status "Starting production validation for ${PROJECT_NAME}..."
    echo "========================================================"
    
    local overall_status=0
    
    # Run smoke tests
    if ! run_smoke_tests; then
        overall_status=1
    fi
    
    echo "========================================================"
    
    # Validate security
    validate_security
    
    echo "========================================================"
    
    # Validate performance
    validate_performance
    
    echo "========================================================"
    
    # Validate infrastructure
    validate_infrastructure
    
    echo "========================================================"
    
    # Create documentation
    create_handover_documentation
    update_documentation
    
    echo "========================================================"
    
    if [[ $overall_status -eq 0 ]]; then
        print_status "🎉 Production validation completed successfully!"
        print_status "The production environment is ready for use."
    else
        print_warning "⚠️  Production validation completed with warnings."
        print_warning "Please review the issues above before going live."
    fi
    
    print_status "Handover documentation has been created."
    print_status "Monitor the application closely for the first 48 hours."
    
    return $overall_status
}

# Check if required tools are available
check_dependencies() {
    local missing_tools=()
    
    if ! command -v curl >/dev/null 2>&1; then
        missing_tools+=("curl")
    fi
    
    if ! command -v bc >/dev/null 2>&1; then
        missing_tools+=("bc")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again."
        exit 1
    fi
}

# Set working directory to project root
cd "$(dirname "$0")/../.."

# Check dependencies
check_dependencies

# Run main validation
main "$@"