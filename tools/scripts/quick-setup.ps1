# Quick Setup Script for New Developers (PowerShell)
# One-command setup for the entire fullstack monolith

param(
    [string]$Mode = "full",
    [switch]$SkipDocker = $false,
    [switch]$SkipDatabase = $false,
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$Magenta = "Magenta"

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

function Log-Step {
    param([string]$Step, [string]$Message)
    Write-Host "[$Step] $Message" -ForegroundColor $Cyan
}

function Log-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $Magenta
    Write-Host $Message -ForegroundColor $Magenta
    Write-Host "=" * 60 -ForegroundColor $Magenta
    Write-Host ""
}

# Global variables
$script:setupStartTime = Get-Date
$script:errors = @()
$script:warnings = @()

# Function to add error
function Add-Error {
    param([string]$Message)
    $script:errors += $Message
    Log-Error $Message
}

# Function to add warning
function Add-Warning {
    param([string]$Message)
    $script:warnings += $Message
    Log-Warning $Message
}

# Function to check prerequisites
function Test-Prerequisites {
    Log-Header "CHECKING PREREQUISITES"
    
    $allGood = $true
    
    # Check Node.js
    Log-Step "NODE" "Checking Node.js installation..."
    try {
        $nodeVersion = node --version
        $nodeVersionNumber = [version]($nodeVersion -replace "v", "")
        
        if ($nodeVersionNumber -ge [version]"18.0.0") {
            Log-Success "Node.js $nodeVersion is installed"
        } else {
            Add-Error "Node.js version $nodeVersion is too old. Please install Node.js 18 or higher."
            $allGood = $false
        }
    }
    catch {
        Add-Error "Node.js is not installed. Please install Node.js 18 or higher."
        $allGood = $false
    }
    
    # Check pnpm
    Log-Step "PNPM" "Checking pnpm installation..."
    try {
        $pnpmVersion = pnpm --version
        Log-Success "pnpm $pnpmVersion is installed"
    }
    catch {
        Log-Warning "pnpm is not installed. Installing pnpm..."
        try {
            npm install -g pnpm
            $pnpmVersion = pnpm --version
            Log-Success "pnpm $pnpmVersion installed successfully"
        }
        catch {
            Add-Error "Failed to install pnpm. Please install it manually: npm install -g pnpm"
            $allGood = $false
        }
    }
    
    # Check Git
    Log-Step "GIT" "Checking Git installation..."
    try {
        $gitVersion = git --version
        Log-Success "$gitVersion is installed"
    }
    catch {
        Add-Error "Git is not installed. Please install Git."
        $allGood = $false
    }
    
    # Check Docker (if not skipped)
    if (-not $SkipDocker) {
        Log-Step "DOCKER" "Checking Docker installation..."
        try {
            $dockerVersion = docker --version
            Log-Success "$dockerVersion is installed"
            
            # Check if Docker is running
            try {
                docker ps | Out-Null
                Log-Success "Docker daemon is running"
            }
            catch {
                Add-Warning "Docker is installed but not running. Please start Docker."
                $allGood = $false
            }
        }
        catch {
            Add-Error "Docker is not installed. Please install Docker Desktop."
            $allGood = $false
        }
        
        # Check Docker Compose
        Log-Step "COMPOSE" "Checking Docker Compose..."
        try {
            docker-compose --version | Out-Null
            Log-Success "Docker Compose is available"
        }
        catch {
            try {
                docker compose version | Out-Null
                Log-Success "Docker Compose (v2) is available"
            }
            catch {
                Add-Error "Docker Compose is not available. Please install Docker Compose."
                $allGood = $false
            }
        }
    }
    
    # Check available disk space
    Log-Step "DISK" "Checking available disk space..."
    $drive = Get-PSDrive -Name (Get-Location).Drive.Name
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    
    if ($freeSpaceGB -gt 5) {
        Log-Success "Available disk space: ${freeSpaceGB}GB"
    } else {
        Add-Warning "Low disk space: ${freeSpaceGB}GB. Recommend at least 5GB free space."
    }
    
    return $allGood
}

# Function to setup environment files
function Initialize-Environment {
    Log-Header "SETTING UP ENVIRONMENT"
    
    Log-Step "ENV" "Creating environment files..."
    
    # Root .env file
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Log-Success "Created .env from .env.example"
        } else {
            Log-Warning ".env.example not found, creating basic .env file"
            @"
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fullstack_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
"@ | Set-Content ".env"
            Log-Success "Created basic .env file"
        }
    } else {
        Log-Info ".env file already exists"
    }
    
    # Application-specific environment files
    $apps = @("api", "web", "mobile")
    
    foreach ($app in $apps) {
        $appPath = "apps/$app"
        if (Test-Path $appPath) {
            $envExample = "$appPath/.env.example"
            $envFile = "$appPath/.env"
            $envLocal = "$appPath/.env.local"
            
            # For web app, use .env.local
            $targetEnv = if ($app -eq "web") { $envLocal } else { $envFile }
            
            if (-not (Test-Path $targetEnv)) {
                if (Test-Path $envExample) {
                    Copy-Item $envExample $targetEnv
                    Log-Success "Created environment file for $app"
                } else {
                    Log-Warning "No .env.example found for $app"
                }
            } else {
                Log-Info "Environment file already exists for $app"
            }
        }
    }
}

# Function to install dependencies
function Install-Dependencies {
    Log-Header "INSTALLING DEPENDENCIES"
    
    Log-Step "DEPS" "Installing workspace dependencies..."
    
    try {
        if ($Verbose) {
            pnpm install
        } else {
            pnpm install --silent
        }
        
        Log-Success "Dependencies installed successfully"
        
        # Show workspace info
        Log-Info "Workspace packages:"
        $workspaces = pnpm list --depth=0 --json | ConvertFrom-Json
        foreach ($workspace in $workspaces) {
            if ($workspace.name) {
                Log-Info "  - $($workspace.name)@$($workspace.version)"
            }
        }
    }
    catch {
        Add-Error "Failed to install dependencies: $($_.Exception.Message)"
        return $false
    }
    
    return $true
}

# Function to start infrastructure services
function Start-Infrastructure {
    if ($SkipDocker) {
        Log-Warning "Skipping Docker infrastructure setup"
        return $true
    }
    
    Log-Header "STARTING INFRASTRUCTURE"
    
    Log-Step "INFRA" "Starting Docker services..."
    
    if (-not (Test-Path "tools/build/docker-compose.yml")) {
        Add-Warning "Docker Compose file not found at tools/build/docker-compose.yml"
        return $false
    }
    
    Push-Location "tools/build"
    
    try {
        # Start services
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            docker-compose up -d
        } else {
            docker compose up -d
        }
        
        if ($LASTEXITCODE -ne 0) {
            Add-Error "Failed to start Docker services"
            return $false
        }
        
        Log-Success "Docker services started"
        
        # Wait for services to be ready
        Log-Step "WAIT" "Waiting for services to be ready..."
        
        # Wait for PostgreSQL
        $maxAttempts = 30
        $attempt = 1
        $postgresReady = $false
        
        while ($attempt -le $maxAttempts -and -not $postgresReady) {
            try {
                docker exec fullstack-postgres pg_isready -U postgres | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    $postgresReady = $true
                    Log-Success "PostgreSQL is ready"
                }
            }
            catch {
                # Still waiting
            }
            
            if (-not $postgresReady) {
                Write-Host "." -NoNewline -ForegroundColor $Yellow
                Start-Sleep 2
                $attempt++
            }
        }
        
        if (-not $postgresReady) {
            Add-Warning "PostgreSQL may not be ready after $maxAttempts attempts"
        }
        
        # Wait for Redis
        $attempt = 1
        $redisReady = $false
        
        while ($attempt -le $maxAttempts -and -not $redisReady) {
            try {
                $result = docker exec fullstack-redis redis-cli ping
                if ($result -eq "PONG") {
                    $redisReady = $true
                    Log-Success "Redis is ready"
                }
            }
            catch {
                # Still waiting
            }
            
            if (-not $redisReady) {
                Write-Host "." -NoNewline -ForegroundColor $Yellow
                Start-Sleep 2
                $attempt++
            }
        }
        
        if (-not $redisReady) {
            Add-Warning "Redis may not be ready after $maxAttempts attempts"
        }
        
        Write-Host ""  # New line after dots
        
        return $true
    }
    finally {
        Pop-Location
    }
}

# Function to setup database
function Initialize-Database {
    if ($SkipDatabase) {
        Log-Warning "Skipping database setup"
        return $true
    }
    
    Log-Header "SETTING UP DATABASE"
    
    # Run migrations
    Log-Step "MIGRATE" "Running database migrations..."
    try {
        & ".\tools\scripts\database.ps1" migrate
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Database migrations completed"
        } else {
            Add-Error "Database migrations failed"
            return $false
        }
    }
    catch {
        Add-Error "Failed to run database migrations: $($_.Exception.Message)"
        return $false
    }
    
    # Seed database
    Log-Step "SEED" "Seeding database..."
    try {
        & ".\tools\scripts\database.ps1" seed
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Database seeding completed"
        } else {
            Add-Warning "Database seeding failed or no seed data available"
        }
    }
    catch {
        Add-Warning "Failed to seed database: $($_.Exception.Message)"
    }
    
    return $true
}

# Function to build packages
function Build-Packages {
    if ($SkipBuild) {
        Log-Warning "Skipping package build"
        return $true
    }
    
    Log-Header "BUILDING PACKAGES"
    
    Log-Step "BUILD" "Building all packages and applications..."
    
    try {
        if ($Verbose) {
            pnpm run build
        } else {
            pnpm run build --silent
        }
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "All packages built successfully"
            return $true
        } else {
            Add-Error "Package build failed"
            return $false
        }
    }
    catch {
        Add-Error "Failed to build packages: $($_.Exception.Message)"
        return $false
    }
}

# Function to run tests
function Test-Setup {
    Log-Header "RUNNING SETUP TESTS"
    
    Log-Step "TEST" "Running basic tests to verify setup..."
    
    # Test database connection
    try {
        & ".\tools\scripts\database.ps1" test
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Database connection test passed"
        } else {
            Add-Warning "Database connection test failed"
        }
    }
    catch {
        Add-Warning "Could not test database connection"
    }
    
    # Test package imports
    Log-Step "IMPORT" "Testing package imports..."
    try {
        # Simple TypeScript compilation test
        pnpm run type-check --silent
        if ($LASTEXITCODE -eq 0) {
            Log-Success "TypeScript compilation test passed"
        } else {
            Add-Warning "TypeScript compilation issues detected"
        }
    }
    catch {
        Add-Warning "Could not run TypeScript compilation test"
    }
}

# Function to show final summary
function Show-Summary {
    $setupEndTime = Get-Date
    $setupDuration = $setupEndTime - $script:setupStartTime
    
    Log-Header "SETUP COMPLETE"
    
    Log-Info "Setup completed in $([math]::Round($setupDuration.TotalMinutes, 2)) minutes"
    
    if ($script:errors.Count -eq 0) {
        Log-Success "✓ Setup completed successfully with no errors!"
    } else {
        Log-Error "✗ Setup completed with $($script:errors.Count) error(s):"
        foreach ($error in $script:errors) {
            Log-Error "  - $error"
        }
    }
    
    if ($script:warnings.Count -gt 0) {
        Log-Warning "⚠ $($script:warnings.Count) warning(s) encountered:"
        foreach ($warning in $script:warnings) {
            Log-Warning "  - $warning"
        }
    }
    
    Write-Host ""
    Log-Info "🚀 Next Steps:"
    Log-Info "  1. Start development servers: .\tools\scripts\dev-services.ps1 start"
    Log-Info "  2. Open web app: http://localhost:3001"
    Log-Info "  3. Open API docs: http://localhost:3000/docs"
    Log-Info "  4. View logs: Get-Content logs\*.log -Wait"
    
    Write-Host ""
    Log-Info "📚 Useful Commands:"
    Log-Info "  - Start all services: pnpm run dev"
    Log-Info "  - Run tests: pnpm run test"
    Log-Info "  - Database operations: .\tools\scripts\database.ps1 help"
    Log-Info "  - Build for production: pnpm run build"
    
    Write-Host ""
    Log-Info "🔧 Infrastructure Services:"
    Log-Info "  - PostgreSQL: localhost:5432"
    Log-Info "  - Redis: localhost:6379"
    Log-Info "  - Mailhog UI: http://localhost:8025"
    
    if ($script:errors.Count -eq 0) {
        Write-Host ""
        Write-Host "Welcome to the Fullstack Monolith! Happy coding!" -ForegroundColor $Green
    }
}

# Main setup function
function Invoke-QuickSetup {
    Log-Header "FULLSTACK MONOLITH QUICK SETUP"
    
    Log-Info "Setup mode: $Mode"
    Log-Info "Skip Docker: $SkipDocker"
    Log-Info "Skip Database: $SkipDatabase"
    Log-Info "Skip Build: $SkipBuild"
    Log-Info "Verbose: $Verbose"
    
    # Step 1: Check prerequisites
    $prereqsOk = Test-Prerequisites
    if (-not $prereqsOk -and $Mode -eq "strict") {
        Log-Error "Prerequisites check failed. Cannot continue in strict mode."
        exit 1
    }
    
    # Step 2: Setup environment
    Initialize-Environment
    
    # Step 3: Install dependencies
    $depsOk = Install-Dependencies
    if (-not $depsOk -and $Mode -eq "strict") {
        Log-Error "Dependency installation failed. Cannot continue in strict mode."
        exit 1
    }
    
    # Step 4: Start infrastructure
    $infraOk = Start-Infrastructure
    if (-not $infraOk -and $Mode -eq "strict") {
        Log-Error "Infrastructure setup failed. Cannot continue in strict mode."
        exit 1
    }
    
    # Step 5: Setup database
    $dbOk = Initialize-Database
    if (-not $dbOk -and $Mode -eq "strict") {
        Log-Error "Database setup failed. Cannot continue in strict mode."
        exit 1
    }
    
    # Step 6: Build packages
    $buildOk = Build-Packages
    if (-not $buildOk -and $Mode -eq "strict") {
        Log-Error "Package build failed. Cannot continue in strict mode."
        exit 1
    }
    
    # Step 7: Run tests
    if ($Mode -eq "full") {
        Test-Setup
    }
    
    # Step 8: Show summary
    Show-Summary
}

# Handle different modes
switch ($Mode.ToLower()) {
    "minimal" {
        $SkipDocker = $true
        $SkipDatabase = $true
        $SkipBuild = $true
        Log-Info "Running minimal setup (dependencies only)"
    }
    "quick" {
        $SkipBuild = $true
        Log-Info "Running quick setup (no build step)"
    }
    "full" {
        Log-Info "Running full setup with all steps"
    }
    "strict" {
        Log-Info "Running strict setup (fail on any error)"
    }
    default {
        Log-Info "Running default full setup"
    }
}

# Main execution
try {
    Invoke-QuickSetup
}
catch {
    Log-Error "Setup failed with exception: $($_.Exception.Message)"
    exit 1
}

# Exit with appropriate code
if ($script:errors.Count -gt 0) {
    exit 1
} else {
    exit 0
}