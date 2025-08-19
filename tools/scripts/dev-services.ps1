# Development Services Management Script (PowerShell)
# Starts all services (API, web, mobile dev server) simultaneously

param(
    [string]$Command = "start",
    [switch]$Detached = $false,
    [switch]$Logs = $false,
    [string]$Service = ""
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Logging functions
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Log-Service {
    param([string]$Service, [string]$Message)
    Write-Host "[$Service] $Message" -ForegroundColor $Cyan
}

# Global variables for process management
$global:processes = @{}
$global:logFiles = @{}

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $false  # Port is in use
    }
    catch {
        return $true   # Port is available
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 2
    )
    
    Log-Info "Waiting for $ServiceName to be ready at $Url..."
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Log-Success "$ServiceName is ready!"
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        
        if ($i -eq $MaxAttempts) {
            Log-Warning "$ServiceName did not become ready after $MaxAttempts attempts"
            return $false
        }
        
        Write-Host "." -NoNewline -ForegroundColor $Yellow
        Start-Sleep $DelaySeconds
    }
    
    return $false
}

# Function to start infrastructure services
function Start-Infrastructure {
    Log-Info "Starting infrastructure services..."
    
    # Check if Docker is running
    try {
        docker version | Out-Null
    }
    catch {
        Log-Error "Docker is not running. Please start Docker first."
        exit 1
    }
    
    # Start infrastructure with Docker Compose
    if (Test-Path "tools/build/docker-compose.yml") {
        Push-Location tools/build
        
        try {
            Log-Info "Starting PostgreSQL, Redis, and other infrastructure..."
            docker-compose up -d
            
            # Wait for PostgreSQL
            $postgresReady = $false
            for ($i = 1; $i -le 30; $i++) {
                try {
                    docker exec fullstack-postgres pg_isready -U postgres | Out-Null
                    $postgresReady = $true
                    break
                }
                catch {
                    Start-Sleep 2
                }
            }
            
            if ($postgresReady) {
                Log-Success "PostgreSQL is ready"
            } else {
                Log-Warning "PostgreSQL may not be ready"
            }
            
            # Wait for Redis
            $redisReady = $false
            for ($i = 1; $i -le 30; $i++) {
                try {
                    $result = docker exec fullstack-redis redis-cli ping
                    if ($result -eq "PONG") {
                        $redisReady = $true
                        break
                    }
                }
                catch {
                    Start-Sleep 2
                }
            }
            
            if ($redisReady) {
                Log-Success "Redis is ready"
            } else {
                Log-Warning "Redis may not be ready"
            }
        }
        finally {
            Pop-Location
        }
    }
    else {
        Log-Warning "Docker Compose file not found at tools/build/docker-compose.yml"
    }
}

# Function to start API service
function Start-ApiService {
    Log-Service "API" "Starting API server..."
    
    if (-not (Test-Path "apps/api")) {
        Log-Error "API application not found at apps/api"
        return $false
    }
    
    # Check if port 3000 is available
    if (-not (Test-Port 3000)) {
        Log-Warning "Port 3000 is already in use. API may already be running."
        return $false
    }
    
    # Create log directory
    $logDir = "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Start API in background
    Push-Location apps/api
    
    try {
        $logFile = "../../logs/api.log"
        $global:logFiles["api"] = $logFile
        
        if ($Detached) {
            # Start as background job
            $job = Start-Job -ScriptBlock {
                param($apiPath, $logFile)
                Set-Location $apiPath
                pnpm run dev 2>&1 | Tee-Object -FilePath $logFile
            } -ArgumentList (Get-Location), $logFile
            
            $global:processes["api"] = $job
            Log-Service "API" "Started as background job (ID: $($job.Id))"
        }
        else {
            # Start as process
            $process = Start-Process -FilePath "pnpm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile
            $global:processes["api"] = $process
            Log-Service "API" "Started as process (PID: $($process.Id))"
        }
        
        # Wait for API to be ready
        Start-Sleep 5
        $ready = Wait-ForService "API" "http://localhost:3000/health"
        
        if ($ready) {
            Log-Success "API server is running at http://localhost:3000"
        }
        
        return $ready
    }
    finally {
        Pop-Location
    }
}

# Function to start Web service
function Start-WebService {
    Log-Service "WEB" "Starting web development server..."
    
    if (-not (Test-Path "apps/web")) {
        Log-Error "Web application not found at apps/web"
        return $false
    }
    
    # Check if port 3001 is available
    if (-not (Test-Port 3001)) {
        Log-Warning "Port 3001 is already in use. Web server may already be running."
        return $false
    }
    
    # Create log directory
    $logDir = "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Start Web in background
    Push-Location apps/web
    
    try {
        $logFile = "../../logs/web.log"
        $global:logFiles["web"] = $logFile
        
        if ($Detached) {
            # Start as background job
            $job = Start-Job -ScriptBlock {
                param($webPath, $logFile)
                Set-Location $webPath
                $env:PORT = "3001"
                pnpm run dev 2>&1 | Tee-Object -FilePath $logFile
            } -ArgumentList (Get-Location), $logFile
            
            $global:processes["web"] = $job
            Log-Service "WEB" "Started as background job (ID: $($job.Id))"
        }
        else {
            # Start as process
            $env:PORT = "3001"
            $process = Start-Process -FilePath "pnpm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile
            $global:processes["web"] = $process
            Log-Service "WEB" "Started as process (PID: $($process.Id))"
        }
        
        # Wait for Web to be ready
        Start-Sleep 8
        $ready = Wait-ForService "Web" "http://localhost:3001"
        
        if ($ready) {
            Log-Success "Web server is running at http://localhost:3001"
        }
        
        return $ready
    }
    finally {
        Pop-Location
    }
}

# Function to start Mobile service
function Start-MobileService {
    Log-Service "MOBILE" "Starting mobile development server..."
    
    if (-not (Test-Path "apps/mobile")) {
        Log-Error "Mobile application not found at apps/mobile"
        return $false
    }
    
    # Check if port 8081 is available (React Native Metro bundler default)
    if (-not (Test-Port 8081)) {
        Log-Warning "Port 8081 is already in use. Mobile server may already be running."
        return $false
    }
    
    # Create log directory
    $logDir = "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Start Mobile in background
    Push-Location apps/mobile
    
    try {
        $logFile = "../../logs/mobile.log"
        $global:logFiles["mobile"] = $logFile
        
        if ($Detached) {
            # Start as background job
            $job = Start-Job -ScriptBlock {
                param($mobilePath, $logFile)
                Set-Location $mobilePath
                pnpm run start 2>&1 | Tee-Object -FilePath $logFile
            } -ArgumentList (Get-Location), $logFile
            
            $global:processes["mobile"] = $job
            Log-Service "MOBILE" "Started as background job (ID: $($job.Id))"
        }
        else {
            # Start as process
            $process = Start-Process -FilePath "pnpm" -ArgumentList "run", "start" -NoNewWindow -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile
            $global:processes["mobile"] = $process
            Log-Service "MOBILE" "Started as process (PID: $($process.Id))"
        }
        
        # Wait for Mobile to be ready
        Start-Sleep 5
        $ready = Wait-ForService "Mobile Metro" "http://localhost:8081/status"
        
        if ($ready) {
            Log-Success "Mobile development server is running at http://localhost:8081"
        }
        
        return $ready
    }
    finally {
        Pop-Location
    }
}

# Function to start all services
function Start-AllServices {
    Log-Info "Starting all development services..."
    
    # Start infrastructure first
    Start-Infrastructure
    
    # Start application services
    $apiStarted = Start-ApiService
    $webStarted = Start-WebService
    $mobileStarted = Start-MobileService
    
    # Summary
    Write-Host ""
    Log-Info "=== Development Services Status ==="
    
    if ($apiStarted) {
        Log-Success "✓ API Server: http://localhost:3000"
    } else {
        Log-Error "✗ API Server: Failed to start"
    }
    
    if ($webStarted) {
        Log-Success "✓ Web Server: http://localhost:3001"
    } else {
        Log-Error "✗ Web Server: Failed to start"
    }
    
    if ($mobileStarted) {
        Log-Success "✓ Mobile Server: http://localhost:8081"
    } else {
        Log-Error "✗ Mobile Server: Failed to start"
    }
    
    Write-Host ""
    Log-Info "Infrastructure Services:"
    Log-Info "  PostgreSQL: localhost:5432"
    Log-Info "  Redis: localhost:6379"
    Log-Info "  Mailhog UI: http://localhost:8025"
    
    Write-Host ""
    Log-Info "Log files are available in the 'logs' directory"
    Log-Info "Use 'Ctrl+C' to stop all services or run with -Detached flag"
    
    if (-not $Detached) {
        Log-Info "Press Ctrl+C to stop all services..."
        try {
            # Keep script running
            while ($true) {
                Start-Sleep 1
            }
        }
        finally {
            Stop-AllServices
        }
    }
}

# Function to stop all services
function Stop-AllServices {
    Log-Info "Stopping all services..."
    
    # Stop application processes
    foreach ($serviceName in $global:processes.Keys) {
        $process = $global:processes[$serviceName]
        
        if ($process -is [System.Management.Automation.Job]) {
            Log-Service $serviceName.ToUpper() "Stopping background job..."
            Stop-Job $process -ErrorAction SilentlyContinue
            Remove-Job $process -ErrorAction SilentlyContinue
        }
        elseif ($process -is [System.Diagnostics.Process]) {
            Log-Service $serviceName.ToUpper() "Stopping process..."
            if (-not $process.HasExited) {
                $process.Kill()
            }
        }
    }
    
    # Stop infrastructure
    if (Test-Path "tools/build/docker-compose.yml") {
        Push-Location tools/build
        try {
            Log-Info "Stopping infrastructure services..."
            docker-compose stop
        }
        finally {
            Pop-Location
        }
    }
    
    Log-Success "All services stopped."
}

# Function to show service status
function Show-Status {
    Log-Info "=== Service Status ==="
    
    # Check infrastructure
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "fullstack"
        if ($containers) {
            Log-Info "Infrastructure Services:"
            $containers | ForEach-Object { Log-Info "  $_" }
        } else {
            Log-Warning "No infrastructure services running"
        }
    }
    catch {
        Log-Warning "Could not check Docker containers"
    }
    
    # Check application services
    Log-Info "Application Services:"
    
    # Check API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Log-Success "  ✓ API: Running (http://localhost:3000)"
    }
    catch {
        Log-Error "  ✗ API: Not running"
    }
    
    # Check Web
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Log-Success "  ✓ Web: Running (http://localhost:3001)"
    }
    catch {
        Log-Error "  ✗ Web: Not running"
    }
    
    # Check Mobile
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Log-Success "  ✓ Mobile: Running (http://localhost:8081)"
    }
    catch {
        Log-Error "  ✗ Mobile: Not running"
    }
}

# Function to show logs
function Show-Logs {
    param([string]$ServiceName = "")
    
    if ($ServiceName -eq "") {
        Log-Info "Available log files:"
        Get-ChildItem -Path "logs" -Filter "*.log" | ForEach-Object {
            Log-Info "  $($_.Name)"
        }
        Log-Info ""
        Log-Info "Use: .\dev-services.ps1 logs <service-name>"
        return
    }
    
    $logFile = "logs/$ServiceName.log"
    if (Test-Path $logFile) {
        Log-Info "Showing logs for $ServiceName (press Ctrl+C to exit):"
        Get-Content $logFile -Wait
    } else {
        Log-Error "Log file not found: $logFile"
    }
}

# Main execution
switch ($Command.ToLower()) {
    "start" {
        if ($Service -ne "") {
            switch ($Service.ToLower()) {
                "api" { Start-ApiService }
                "web" { Start-WebService }
                "mobile" { Start-MobileService }
                "infrastructure" { Start-Infrastructure }
                default { Log-Error "Unknown service: $Service" }
            }
        } else {
            Start-AllServices
        }
    }
    "stop" {
        Stop-AllServices
    }
    "restart" {
        Stop-AllServices
        Start-Sleep 3
        Start-AllServices
    }
    "status" {
        Show-Status
    }
    "logs" {
        if ($Logs) {
            Show-Logs $Service
        } else {
            Show-Logs
        }
    }
    default {
        Write-Host "Development Services Management Script"
        Write-Host ""
        Write-Host "Usage: .\dev-services.ps1 [command] [options]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  start                    - Start all services (default)"
        Write-Host "  stop                     - Stop all services"
        Write-Host "  restart                  - Restart all services"
        Write-Host "  status                   - Show service status"
        Write-Host "  logs                     - Show available logs"
        Write-Host ""
        Write-Host "Options:"
        Write-Host "  -Service <name>          - Target specific service (api|web|mobile|infrastructure)"
        Write-Host "  -Detached               - Run services in background"
        Write-Host "  -Logs                   - Show logs for specific service"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\dev-services.ps1 start"
        Write-Host "  .\dev-services.ps1 start -Service api"
        Write-Host "  .\dev-services.ps1 start -Detached"
        Write-Host "  .\dev-services.ps1 logs -Service api -Logs"
        Write-Host "  .\dev-services.ps1 status"
    }
}