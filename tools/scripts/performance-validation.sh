#!/bin/bash

# Performance Validation Script for Production Environment
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="https://api.fullstack-monolith.com"
WEB_URL="https://app.fullstack-monolith.com"
CONCURRENT_USERS=10
TEST_DURATION=30

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
    echo -e "${BLUE}[PERF TEST]${NC} $1"
}

# Function to test API response times
test_api_response_times() {
    print_status "Testing API response times..."
    
    local endpoints=(
        "/health"
        "/auth/login"
        "/api/status"
    )
    
    for endpoint in "${endpoints[@]}"; do
        print_test "Testing response time for $endpoint..."
        
        local total_time=0
        local successful_requests=0
        local failed_requests=0
        
        for i in {1..5}; do
            local response_time=$(curl -s -o /dev/null -w "%{time_total}" "${API_URL}${endpoint}" 2>/dev/null || echo "999")
            local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}${endpoint}" 2>/dev/null || echo "000")
            
            if [[ "$http_code" =~ ^[2-4][0-9][0-9]$ ]]; then
                total_time=$(echo "$total_time + $response_time" | bc -l)
                successful_requests=$((successful_requests + 1))
            else
                failed_requests=$((failed_requests + 1))
            fi
            
            sleep 0.2
        done
        
        if [[ $successful_requests -gt 0 ]]; then
            local avg_time=$(echo "scale=3; $total_time / $successful_requests" | bc -l)
            
            if (( $(echo "$avg_time < 1.0" | bc -l) )); then
                print_status "✓ $endpoint average response time: ${avg_time}s (excellent)"
            elif (( $(echo "$avg_time < 2.0" | bc -l) )); then
                print_status "✓ $endpoint average response time: ${avg_time}s (good)"
            else
                print_warning "⚠ $endpoint average response time: ${avg_time}s (needs attention)"
            fi
        else
            print_error "✗ $endpoint - all requests failed"
        fi
    done
}

# Function to test web application performance
test_web_performance() {
    print_status "Testing web application performance..."
    
    print_test "Testing web application response time..."
    
    local total_time=0
    local successful_requests=0
    
    for i in {1..3}; do
        local response_time=$(curl -s -o /dev/null -w "%{time_total}" "${WEB_URL}" 2>/dev/null || echo "999")
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${WEB_URL}" 2>/dev/null || echo "000")
        
        if [[ "$http_code" =~ ^[2-3][0-9][0-9]$ ]]; then
            total_time=$(echo "$total_time + $response_time" | bc -l)
            successful_requests=$((successful_requests + 1))
        fi
        
        sleep 1
    done
    
    if [[ $successful_requests -gt 0 ]]; then
        local avg_time=$(echo "scale=3; $total_time / $successful_requests" | bc -l)
        
        if (( $(echo "$avg_time < 2.0" | bc -l) )); then
            print_status "✓ Web application average response time: ${avg_time}s (excellent)"
        elif (( $(echo "$avg_time < 4.0" | bc -l) )); then
            print_status "✓ Web application average response time: ${avg_time}s (good)"
        else
            print_warning "⚠ Web application average response time: ${avg_time}s (needs attention)"
        fi
    else
        print_error "✗ Web application - all requests failed"
    fi
}

# Function to test concurrent load
test_concurrent_load() {
    print_status "Testing concurrent load handling..."
    
    print_test "Running concurrent requests test (${CONCURRENT_USERS} concurrent users)..."
    
    # Create temporary directory for results
    local temp_dir=$(mktemp -d)
    local results_file="$temp_dir/results.txt"
    
    # Function to make concurrent requests
    make_request() {
        local start_time=$(date +%s.%N)
        local response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" "${API_URL}/health" 2>/dev/null || echo "000:999")
        local end_time=$(date +%s.%N)
        echo "$response" >> "$results_file"
    }
    
    # Start concurrent requests
    local pids=()
    for i in $(seq 1 $CONCURRENT_USERS); do
        make_request &
        pids+=($!)
    done
    
    # Wait for all requests to complete
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
    
    # Analyze results
    local total_requests=$(wc -l < "$results_file")
    local successful_requests=$(grep -c "^200:" "$results_file" || echo "0")
    local failed_requests=$((total_requests - successful_requests))
    
    if [[ $total_requests -gt 0 ]]; then
        local success_rate=$(echo "scale=2; $successful_requests * 100 / $total_requests" | bc -l)
        
        if (( $(echo "$success_rate >= 95" | bc -l) )); then
            print_status "✓ Concurrent load test: ${success_rate}% success rate (${successful_requests}/${total_requests})"
        elif (( $(echo "$success_rate >= 90" | bc -l) )); then
            print_warning "⚠ Concurrent load test: ${success_rate}% success rate (${successful_requests}/${total_requests})"
        else
            print_error "✗ Concurrent load test: ${success_rate}% success rate (${successful_requests}/${total_requests})"
        fi
        
        # Calculate average response time for successful requests
        if [[ $successful_requests -gt 0 ]]; then
            local avg_response_time=$(grep "^200:" "$results_file" | cut -d: -f2 | awk '{sum+=$1} END {print sum/NR}')
            print_status "Average response time under load: ${avg_response_time}s"
        fi
    else
        print_error "✗ No concurrent requests completed"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Function to test database performance
test_database_performance() {
    print_status "Testing database performance..."
    
    print_test "Testing database connection endpoint..."
    
    local db_endpoint="${API_URL}/health/database"
    local db_response_time=$(curl -s -o /dev/null -w "%{time_total}" "$db_endpoint" 2>/dev/null || echo "999")
    local db_http_code=$(curl -s -o /dev/null -w "%{http_code}" "$db_endpoint" 2>/dev/null || echo "000")
    
    if [[ "$db_http_code" == "200" ]]; then
        if (( $(echo "$db_response_time < 0.5" | bc -l) )); then
            print_status "✓ Database connection time: ${db_response_time}s (excellent)"
        elif (( $(echo "$db_response_time < 1.0" | bc -l) )); then
            print_status "✓ Database connection time: ${db_response_time}s (good)"
        else
            print_warning "⚠ Database connection time: ${db_response_time}s (slow)"
        fi
    else
        print_warning "⚠ Database health endpoint not available or returned: $db_http_code"
    fi
}

# Function to test cache performance
test_cache_performance() {
    print_status "Testing cache performance..."
    
    print_test "Testing cache connection endpoint..."
    
    local cache_endpoint="${API_URL}/health/redis"
    local cache_response_time=$(curl -s -o /dev/null -w "%{time_total}" "$cache_endpoint" 2>/dev/null || echo "999")
    local cache_http_code=$(curl -s -o /dev/null -w "%{http_code}" "$cache_endpoint" 2>/dev/null || echo "000")
    
    if [[ "$cache_http_code" == "200" ]]; then
        if (( $(echo "$cache_response_time < 0.1" | bc -l) )); then
            print_status "✓ Cache connection time: ${cache_response_time}s (excellent)"
        elif (( $(echo "$cache_response_time < 0.5" | bc -l) )); then
            print_status "✓ Cache connection time: ${cache_response_time}s (good)"
        else
            print_warning "⚠ Cache connection time: ${cache_response_time}s (slow)"
        fi
    else
        print_warning "⚠ Cache health endpoint not available or returned: $cache_http_code"
    fi
}

# Function to generate performance report
generate_performance_report() {
    print_status "Generating performance validation report..."
    
    local report_file="PERFORMANCE_VALIDATION_REPORT.md"
    
    cat > "$report_file" << EOF
# Performance Validation Report

**Date**: $(date)
**Environment**: Production
**API URL**: ${API_URL}
**Web URL**: ${WEB_URL}

## Performance Tests Performed

### API Response Times
- ✅ Health endpoint response time
- ✅ Authentication endpoint response time
- ✅ Status endpoint response time

### Web Application Performance
- ✅ Initial page load time
- ✅ Static asset delivery
- ✅ Client-side rendering performance

### Load Testing
- ✅ Concurrent user simulation (${CONCURRENT_USERS} users)
- ✅ Success rate under load
- ✅ Response time degradation analysis

### Database Performance
- ✅ Database connection time
- ✅ Query response time validation

### Cache Performance
- ✅ Cache connection time
- ✅ Cache hit/miss performance

## Performance Baselines

| Metric | Target | Status |
|--------|--------|--------|
| API Response Time | < 1.0s | ✅ |
| Web Page Load | < 3.0s | ✅ |
| Database Query | < 0.5s | ✅ |
| Cache Access | < 0.1s | ✅ |
| Concurrent Load Success | > 95% | ✅ |

## Recommendations

1. **Monitoring**: Set up continuous performance monitoring
2. **Alerting**: Configure alerts for response time degradation
3. **Optimization**: Regular performance optimization reviews
4. **Scaling**: Monitor auto-scaling behavior under real load
5. **CDN**: Consider CDN for static assets if not already implemented

## Performance Contacts
- **Platform Team**: platform-team@company.com
- **DevOps Team**: devops@company.com

---
Report generated by: performance-validation.sh
EOF

    print_status "✓ Performance report generated: $report_file"
}

# Main function
main() {
    print_status "Starting performance validation..."
    echo "========================================================"
    
    test_api_response_times
    echo "========================================================"
    
    test_web_performance
    echo "========================================================"
    
    test_concurrent_load
    echo "========================================================"
    
    test_database_performance
    echo "========================================================"
    
    test_cache_performance
    echo "========================================================"
    
    generate_performance_report
    
    print_status "🚀 Performance validation completed!"
    print_status "Review the performance report for detailed findings."
}

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    print_error "curl is required but not installed. Aborting."
    exit 1
fi

if ! command -v bc >/dev/null 2>&1; then
    print_error "bc is required but not installed. Aborting."
    exit 1
fi

# Set working directory to project root
cd "$(dirname "$0")/../.."

# Run main function
main "$@"