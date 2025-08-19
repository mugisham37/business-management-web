#!/bin/bash

# Development Services Management Script (Bash)
# Starts all services (API, web, mobile dev server) simultaneously

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_service() {
    echo -e "${CYAN}[$1]${NC} $2"
}

# Global variables
declare -A PROCESSES
declare -A LOG_FILES
DETACHED=false
SERVICE=""

# Function to check if port is available
check_port() {
    local port=$1
    if command -v nc >/dev/null 2>&1; then
        ! nc -z localhost $port 2>/dev/null
    elif command -v netstat >/dev/null 2>&1; then
        ! netstat -ln | grep -q ":$port "
    else
        # Fallback: try to bind to the port
        ! timeout 1 bash -c "</dev/tcp/localhost/$port" 2>/dev/null
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts=${3:-30}
    local delay=${4:-2}
    
    log_info "Waiting for $service_name to be ready at $url..."
    
    for ((i=1; i<=max_attempts; i++)); do
        if curl -f "$url" >/dev/null 2>&1; then
            log_success "$service_name is ready!"
            return 0
        fi
        
        if [ $i -eq $max_attempts ]; then
            log_warning "$service_name did not become ready after $max_attempts attempts"
            return 1
        fi
        
        printf "."
        sleep $delay
    done
    
    return 1
}

# Function to start infrastructure services
start_infrastructure() {
    log_info "Starting infrastructure services..."
    
    # Check if Docker is running
    if ! docker version >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Start infrastructure with Docker Compose
    if [ -f "tools/build/docker-compose.yml" ]; then
        cd tools/build
        
        log_info "Starting PostgreSQL, Redis, and other infrastructure..."
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose up -d
        else
            docker compose up -d
        fi
        
        # Wait for PostgreSQL
        local postgres_ready=false
        for ((i=1; i<=30; i++)); do
            if docker exec fullstack-postgres pg_isready -U postgres >/dev/null 2>&1; then
                postgres_ready=true
                break
            fi
            sleep 2
        done
        
        if [ "$postgres_ready" = true ]; then
            log_success "PostgreSQL is ready"
        else
            log_warning "PostgreSQL may not be ready"
        fi
        
        # Wait for Redis
        local redis_ready=false
        for ((i=1; i<=30; i++)); do
            if [ "$(docker exec fullstack-redis redis-cli ping 2>/dev/null)" = "PONG" ]; then
                redis_ready=true
                break
            fi
            sleep 2
        done
        
        if [ "$redis_ready" = true ]; then
            log_success "Redis is ready"
        else
            log_warning "Redis may not be ready"
        fi
        
        cd ../..
    else
        log_warning "Docker Compose file not found at tools/build/docker-compose.yml"
    fi
}

# Function to start API service
start_api_service() {
    log_service "API" "Starting API server..."
    
    if [ ! -d "apps/api" ]; then
        log_error "API application not found at apps/api"
        return 1
    fi
    
    # Check if port 3000 is available
    if ! check_port 3000; then
        log_warning "Port 3000 is already in use. API may already be running."
        return 1
    fi
    
    # Create log directory
    mkdir -p logs
    
    # Start API
    cd apps/api
    
    local log_file="../../logs/api.log"
    LOG_FILES["api"]="$log_file"
    
    if [ "$DETACHED" = true ]; then
        # Start in background
        nohup pnpm run dev > "$log_file" 2>&1 &
        local pid=$!
        PROCESSES["api"]=$pid
        log_service "API" "Started as background process (PID: $pid)"
    else
        # Start in foreground (will be backgrounded by caller)
        pnpm run dev > "$log_file" 2>&1 &
        local pid=$!
        PROCESSES["api"]=$pid
        log_service "API" "Started as process (PID: $pid)"
    fi
    
    cd ../..
    
    # Wait for API to be ready
    sleep 5
    if wait_for_service "API" "http://localhost:3000/health"; then
        log_success "API server is running at http://localhost:3000"
        return 0
    fi
    
    return 1
}

# Function to start Web service
start_web_service() {
    log_service "WEB" "Starting web development server..."
    
    if [ ! -d "apps/web" ]; then
        log_error "Web application not found at apps/web"
        return 1
    fi
    
    # Check if port 3001 is available
    if ! check_port 3001; then
        log_warning "Port 3001 is already in use. Web server may already be running."
        return 1
    fi
    
    # Create log directory
    mkdir -p logs
    
    # Start Web
    cd apps/web
    
    local log_file="../../logs/web.log"
    LOG_FILES["web"]="$log_file"
    
    if [ "$DETACHED" = true ]; then
        # Start in background
        PORT=3001 nohup pnpm run dev > "$log_file" 2>&1 &
        local pid=$!
        PROCESSES["web"]=$pid
        log_service "WEB" "Started as background process (PID: $pid)"
    else
        # Start in foreground (will be backgrounded by caller)
        PORT=3001 pnpm run dev > "$log_file" 2>&1 &
        local pid=$!
        PROCESSES["web"]=$pid
        log_service "WEB" "Started as process (PID: $pid)"
    fi
    
    cd ../..
    
    # Wait for Web to be ready
    sleep 8
    if wait_for_service "Web" "http://localhost:3001"; then
        log_success "Web server is running at http://localhost:3001"
        return 0
    fi
    
    return 1
}

# Function to start Mobile service
start_mobile_service() {
    log_service "MOBILE" "Starting mobile development server..."
    
    if [ ! -d "apps/mobile" ]; then
        log_error "Mobile application not found at apps/mobile"
        return 1
    fi
    
    # Check if port 8081 is available
    if ! check_port 8081; then
        log_warning "Port 8081 is already in use. Mobile server may already be running."
        return 1
    fi
    
    # Create log directory
    mkdir -p logs
    
    # Start Mobile
    cd apps/mobile
    
    local log_file="../../logs/mobile.log"
    LOG_FILES["mobile"]="$log_file"
    
    if [ "$DETACHED" = true ]; then
        # Start in background
        nohup pnpm run start > "$log_file" 2>&1 &
        local pid=$!
        PROCESSES["mobile"]=$pid
        log_service "MOBILE" "Started as background process (PID: $pid)"
    else
        # Start in foreground (will be backgrounded by caller)
        pnpm run start > "$log_file" 2>&1 &
        local pid=$!
        PROCESSES["mobile"]=$pid
        log_service "MOBILE" "Started as process (PID: $pid)"
    fi
    
    cd ../..
    
    # Wait for Mobile to be ready
    sleep 5
    if wait_for_service "Mobile Metro" "http://localhost:8081/status"; then
        log_success "Mobile development server is running at http://localhost:8081"
        return 0
    fi
    
    return 1
}

# Function to start all services
start_all_services() {
    log_info "Starting all development services..."
    
    # Start infrastructure first
    start_infrastructure
    
    # Start application services
    local api_started=false
    local web_started=false
    local mobile_started=false
    
    if start_api_service; then
        api_started=true
    fi
    
    if start_web_service; then
        web_started=true
    fi
    
    if start_mobile_service; then
        mobile_started=true
    fi
    
    # Summary
    echo ""
    log_info "=== Development Services Status ==="
    
    if [ "$api_started" = true ]; then
        log_success "✓ API Server: http://localhost:3000"
    else
        log_error "✗ API Server: Failed to start"
    fi
    
    if [ "$web_started" = true ]; then
        log_success "✓ Web Server: http://localhost:3001"
    else
        log_error "✗ Web Server: Failed to start"
    fi
    
    if [ "$mobile_started" = true ]; then
        log_success "✓ Mobile Server: http://localhost:8081"
    else
        log_error "✗ Mobile Server: Failed to start"
    fi
    
    echo ""
    log_info "Infrastructure Services:"
    log_info "  PostgreSQL: localhost:5432"
    log_info "  Redis: localhost:6379"
    log_info "  Mailhog UI: http://localhost:8025"
    
    echo ""
    log_info "Log files are available in the 'logs' directory"
    
    if [ "$DETACHED" = false ]; then
        log_info "Press Ctrl+C to stop all services..."
        
        # Set up signal handlers
        trap 'stop_all_services; exit 0' INT TERM
        
        # Keep script running
        while true; do
            sleep 1
        done
    fi
}

# Function to stop all services
stop_all_services() {
    log_info "Stopping all services..."
    
    # Stop application processes
    for service in "${!PROCESSES[@]}"; do
        local pid=${PROCESSES[$service]}
        
        if kill -0 $pid 2>/dev/null; then
            log_service "${service^^}" "Stopping process (PID: $pid)..."
            kill $pid 2>/dev/null || true
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 $pid 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                ((count++))
            done
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid 2>/dev/null || true
            fi
        fi
    done
    
    # Stop infrastructure
    if [ -f "tools/build/docker-compose.yml" ]; then
        cd tools/build
        log_info "Stopping infrastructure services..."
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose stop
        else
            docker compose stop
        fi
        cd ../..
    fi
    
    log_success "All services stopped."
}

# Function to show service status
show_status() {
    log_info "=== Service Status ==="
    
    # Check infrastructure
    if command -v docker >/dev/null 2>&1; then
        local containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep fullstack || true)
        if [ -n "$containers" ]; then
            log_info "Infrastructure Services:"
            echo "$containers" | while read line; do
                log_info "  $line"
            done
        else
            log_warning "No infrastructure services running"
        fi
    else
        log_warning "Could not check Docker containers"
    fi
    
    # Check application services
    log_info "Application Services:"
    
    # Check API
    if curl -f "http://localhost:3000/health" >/dev/null 2>&1; then
        log_success "  ✓ API: Running (http://localhost:3000)"
    else
        log_error "  ✗ API: Not running"
    fi
    
    # Check Web
    if curl -f "http://localhost:3001" >/dev/null 2>&1; then
        log_success "  ✓ Web: Running (http://localhost:3001)"
    else
        log_error "  ✗ Web: Not running"
    fi
    
    # Check Mobile
    if curl -f "http://localhost:8081/status" >/dev/null 2>&1; then
        log_success "  ✓ Mobile: Running (http://localhost:8081)"
    else
        log_error "  ✗ Mobile: Not running"
    fi
}

# Function to show logs
show_logs() {
    local service_name="$1"
    
    if [ -z "$service_name" ]; then
        log_info "Available log files:"
        if [ -d "logs" ]; then
            for log_file in logs/*.log; do
                if [ -f "$log_file" ]; then
                    log_info "  $(basename "$log_file")"
                fi
            done
        fi
        echo ""
        log_info "Use: $0 logs <service-name>"
        return
    fi
    
    local log_file="logs/$service_name.log"
    if [ -f "$log_file" ]; then
        log_info "Showing logs for $service_name (press Ctrl+C to exit):"
        tail -f "$log_file"
    else
        log_error "Log file not found: $log_file"
    fi
}

# Parse command line arguments
COMMAND="start"
while [[ $# -gt 0 ]]; do
    case $1 in
        start|stop|restart|status|logs)
            COMMAND="$1"
            shift
            ;;
        --detached|-d)
            DETACHED=true
            shift
            ;;
        --service|-s)
            SERVICE="$2"
            shift 2
            ;;
        --help|-h)
            cat << EOF
Development Services Management Script

Usage: $0 [command] [options]

Commands:
  start                    - Start all services (default)
  stop                     - Stop all services
  restart                  - Restart all services
  status                   - Show service status
  logs                     - Show available logs

Options:
  --service, -s <name>     - Target specific service (api|web|mobile|infrastructure)
  --detached, -d           - Run services in background
  --help, -h               - Show this help message

Examples:
  $0 start
  $0 start --service api
  $0 start --detached
  $0 logs --service api
  $0 status
EOF
            exit 0
            ;;
        *)
            if [ -z "$SERVICE" ] && [[ "$1" =~ ^(api|web|mobile|infrastructure)$ ]]; then
                SERVICE="$1"
            else
                log_error "Unknown option: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Main execution
case "$COMMAND" in
    start)
        if [ -n "$SERVICE" ]; then
            case "$SERVICE" in
                api)
                    start_api_service
                    ;;
                web)
                    start_web_service
                    ;;
                mobile)
                    start_mobile_service
                    ;;
                infrastructure)
                    start_infrastructure
                    ;;
                *)
                    log_error "Unknown service: $SERVICE"
                    exit 1
                    ;;
            esac
        else
            start_all_services
        fi
        ;;
    stop)
        stop_all_services
        ;;
    restart)
        stop_all_services
        sleep 3
        start_all_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$SERVICE"
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        exit 1
        ;;
esac