#!/bin/bash

# Production Deployment Script for Fullstack Monolith
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="production"
AWS_REGION="us-west-2"
PROJECT_NAME="fullstack-monolith"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v terraform >/dev/null 2>&1 || { print_error "Terraform is required but not installed. Aborting."; exit 1; }
    command -v aws >/dev/null 2>&1 || { print_error "AWS CLI is required but not installed. Aborting."; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { print_error "kubectl is required but not installed. Aborting."; exit 1; }
    
    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || { print_error "AWS credentials not configured. Aborting."; exit 1; }
    
    print_status "Prerequisites check passed."
}

# Function to initialize Terraform backend
init_terraform() {
    print_status "Initializing Terraform..."
    
    # Create S3 bucket for Terraform state if it doesn't exist
    aws s3api head-bucket --bucket "${PROJECT_NAME}-terraform-state-prod" 2>/dev/null || {
        print_status "Creating S3 bucket for Terraform state..."
        aws s3api create-bucket \
            --bucket "${PROJECT_NAME}-terraform-state-prod" \
            --region ${AWS_REGION} \
            --create-bucket-configuration LocationConstraint=${AWS_REGION}
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "${PROJECT_NAME}-terraform-state-prod" \
            --versioning-configuration Status=Enabled
        
        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket "${PROJECT_NAME}-terraform-state-prod" \
            --server-side-encryption-configuration '{
                "Rules": [{
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }]
            }'
    }
    
    # Create DynamoDB table for state locking if it doesn't exist
    aws dynamodb describe-table --table-name "${PROJECT_NAME}-terraform-locks-prod" 2>/dev/null || {
        print_status "Creating DynamoDB table for Terraform state locking..."
        aws dynamodb create-table \
            --table-name "${PROJECT_NAME}-terraform-locks-prod" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
        
        # Wait for table to be active
        aws dynamodb wait table-exists --table-name "${PROJECT_NAME}-terraform-locks-prod"
    }
    
    # Initialize Terraform
    terraform init
    
    print_status "Terraform initialized successfully."
}

# Function to plan Terraform deployment
plan_terraform() {
    print_status "Planning Terraform deployment..."
    
    terraform plan \
        -var-file="terraform.tfvars" \
        -out="tfplan-${ENVIRONMENT}" \
        -detailed-exitcode
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_status "No changes detected."
        return 0
    elif [ $exit_code -eq 2 ]; then
        print_status "Changes detected. Plan saved to tfplan-${ENVIRONMENT}"
        return 2
    else
        print_error "Terraform plan failed."
        exit 1
    fi
}

# Function to apply Terraform deployment
apply_terraform() {
    print_status "Applying Terraform deployment..."
    
    if [ -f "tfplan-${ENVIRONMENT}" ]; then
        terraform apply "tfplan-${ENVIRONMENT}"
    else
        print_error "No plan file found. Run plan first."
        exit 1
    fi
    
    print_status "Terraform deployment completed successfully."
}

# Function to update kubeconfig
update_kubeconfig() {
    print_status "Updating kubeconfig..."
    
    local cluster_name="${PROJECT_NAME}-${ENVIRONMENT}-cluster"
    
    aws eks update-kubeconfig \
        --region ${AWS_REGION} \
        --name ${cluster_name}
    
    print_status "Kubeconfig updated successfully."
}

# Function to deploy Kubernetes manifests
deploy_kubernetes() {
    print_status "Deploying Kubernetes manifests..."
    
    # Apply Kubernetes manifests from the kubernetes directory
    if [ -d "../../kubernetes/production" ]; then
        kubectl apply -f ../../kubernetes/production/
        print_status "Kubernetes manifests deployed successfully."
    else
        print_warning "No Kubernetes manifests found in ../../kubernetes/production/"
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check EKS cluster status
    local cluster_name="${PROJECT_NAME}-${ENVIRONMENT}-cluster"
    local cluster_status=$(aws eks describe-cluster --name ${cluster_name} --query 'cluster.status' --output text)
    
    if [ "$cluster_status" = "ACTIVE" ]; then
        print_status "EKS cluster is active."
    else
        print_error "EKS cluster is not active. Status: $cluster_status"
        exit 1
    fi
    
    # Check RDS instance status
    local db_identifier="${PROJECT_NAME}-${ENVIRONMENT}-db"
    local db_status=$(aws rds describe-db-instances --db-instance-identifier ${db_identifier} --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "not-found")
    
    if [ "$db_status" = "available" ]; then
        print_status "RDS instance is available."
    else
        print_warning "RDS instance status: $db_status"
    fi
    
    # Check Redis cluster status
    local redis_cluster="${PROJECT_NAME}-${ENVIRONMENT}-redis"
    local redis_status=$(aws elasticache describe-cache-clusters --cache-cluster-id ${redis_cluster} --query 'CacheClusters[0].CacheClusterStatus' --output text 2>/dev/null || echo "not-found")
    
    if [ "$redis_status" = "available" ]; then
        print_status "Redis cluster is available."
    else
        print_warning "Redis cluster status: $redis_status"
    fi
    
    print_status "Deployment verification completed."
}

# Function to show deployment outputs
show_outputs() {
    print_status "Deployment outputs:"
    terraform output -json | jq '.'
}

# Function to cleanup plan files
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f tfplan-${ENVIRONMENT}
}

# Main deployment function
main() {
    print_status "Starting production deployment for ${PROJECT_NAME}..."
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "init")
            check_prerequisites
            init_terraform
            ;;
        "plan")
            check_prerequisites
            init_terraform
            plan_terraform
            ;;
        "apply")
            check_prerequisites
            init_terraform
            apply_terraform
            update_kubeconfig
            deploy_kubernetes
            verify_deployment
            show_outputs
            cleanup
            ;;
        "deploy")
            check_prerequisites
            init_terraform
            local plan_result
            plan_terraform
            plan_result=$?
            
            if [ $plan_result -eq 2 ]; then
                read -p "Do you want to apply these changes? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    apply_terraform
                    update_kubeconfig
                    deploy_kubernetes
                    verify_deployment
                    show_outputs
                else
                    print_status "Deployment cancelled by user."
                fi
            fi
            cleanup
            ;;
        "destroy")
            print_warning "This will destroy all production infrastructure!"
            read -p "Are you sure you want to destroy the production environment? Type 'yes' to confirm: " -r
            if [ "$REPLY" = "yes" ]; then
                terraform destroy -var-file="terraform.tfvars"
            else
                print_status "Destroy cancelled."
            fi
            ;;
        "verify")
            verify_deployment
            ;;
        "outputs")
            show_outputs
            ;;
        *)
            echo "Usage: $0 {init|plan|apply|deploy|destroy|verify|outputs}"
            echo "  init    - Initialize Terraform backend"
            echo "  plan    - Plan Terraform deployment"
            echo "  apply   - Apply Terraform deployment"
            echo "  deploy  - Plan and apply (with confirmation)"
            echo "  destroy - Destroy all infrastructure"
            echo "  verify  - Verify deployment status"
            echo "  outputs - Show deployment outputs"
            exit 1
            ;;
    esac
    
    print_status "Operation completed successfully."
}

# Set working directory to script location
cd "$(dirname "$0")"

# Run main function with all arguments
main "$@"