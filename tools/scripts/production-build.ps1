# Production Build and Deployment Script (PowerShell)
# Comprehensive production build, optimization, and deployment automation

param(
    [string]$Command = "build",
    [string]$Environment = "production",
    [string]$Target = "all",
    [switch]$SkipTests = $false,
    [switch]$SkipLinting = $false,
    [switch]$SkipSecurity = $false,
    [switch]$Verbose = $false,
    [string]$Version = "",
    [string]$Registry = "",
    [switch]$Push = $false,
    [switch]$Deploy = $false
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

# Configuration
$script:buildStartTime = Get-Date
$script:errors = @()
$script:warnings = @()
$script:buildArtifacts = @{}

# Get version from git or parameter
function Get-BuildVersion {
    if ($Version) {
        return $Version
    }
    
    try {
        $gitCommit = git rev-parse --short HEAD
        $gitTag = git describe --tags --exact-match HEAD 2>$null
        
        if ($gitTag) {
            return $gitTag
        } else {
            return "dev-$gitCommit"
        }
    }
    catch {
        return "unknown"
    }
}

# Function to validate environment
function Test-BuildEnvironment {
    Log-Header "VALIDATING BUILD ENVIRONMENT"
    
    $allGood = $true
    
    # Check Node.js
    Log-Step "NODE" "Checking Node.js version..."
    try {
        $nodeVersion = node --version
        Log-Success "Node.js $nodeVersion"
    }
    catch {
        Log-Error "Node.js not found"
        $allGood = $false
    }
    
    # Check pnpm
    Log-Step "PNPM" "Checking pnpm..."
    try {
        $pnpmVersion = pnpm --version
        Log-Success "pnpm $pnpmVersion"
    }
    catch {
        Log-Error "pnpm not found"
        $allGood = $false
    }
    
    # Check Docker (for containerized builds)
    Log-Step "DOCKER" "Checking Docker..."
    try {
        $dockerVersion = docker --version
        Log-Success "$dockerVersion"
    }
    catch {
        Log-Warning "Docker not found (required for containerized builds)"
    }
    
    # Check disk space
    Log-Step "DISK" "Checking disk space..."
    $drive = Get-PSDrive -Name (Get-Location).Drive.Name
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    
    if ($freeSpaceGB -gt 10) {
        Log-Success "Available disk space: ${freeSpaceGB}GB"
    } else {
        Log-Warning "Low disk space: ${freeSpaceGB}GB"
    }
    
    # Check environment variables
    Log-Step "ENV" "Checking environment variables..."
    $requiredEnvVars = @("NODE_ENV")
    
    foreach ($envVar in $requiredEnvVars) {
        if ([Environment]::GetEnvironmentVariable($envVar)) {
            Log-Success "$envVar is set"
        } else {
            Log-Warning "$envVar is not set"
        }
    }
    
    return $allGood
}

# Function to clean previous builds
function Clear-BuildArtifacts {
    Log-Header "CLEANING BUILD ARTIFACTS"
    
    Log-Step "CLEAN" "Removing previous build artifacts..."
    
    # Clean workspace
    try {
        pnpm run clean
        Log-Success "Workspace cleaned"
    }
    catch {
        Log-Warning "Could not clean workspace"
    }
    
    # Clean specific directories
    $cleanDirs = @(
        "dist",
        "build",
        ".next",
        "out",
        "coverage",
        "node_modules/.cache"
    )
    
    foreach ($dir in $cleanDirs) {
        if (Test-Path $dir) {
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            Log-Info "Removed $dir"
        }
    }
    
    # Clean application-specific build directories
    $apps = @("api", "web", "mobile")
    foreach ($app in $apps) {
        $appPath = "apps/$app"
        if (Test-Path $appPath) {
            Push-Location $appPath
            try {
                # Clean app-specific artifacts
                $appCleanDirs = @("dist", "build", ".next", "out", "coverage")
                foreach ($dir in $appCleanDirs) {
                    if (Test-Path $dir) {
                        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
                        Log-Info "Cleaned $app/$dir"
                    }
                }
            }
            finally {
                Pop-Location
            }
        }
    }
}

# Function to run quality checks
function Invoke-QualityChecks {
    if ($SkipLinting -and $SkipTests -and $SkipSecurity) {
        Log-Warning "All quality checks skipped"
        return $true
    }
    
    Log-Header "RUNNING QUALITY CHECKS"
    
    $allPassed = $true
    
    # Linting
    if (-not $SkipLinting) {
        Log-Step "LINT" "Running linting checks..."
        try {
            pnpm run lint
            if ($LASTEXITCODE -eq 0) {
                Log-Success "Linting passed"
            } else {
                Log-Error "Linting failed"
                $allPassed = $false
            }
        }
        catch {
            Log-Error "Linting check failed: $($_.Exception.Message)"
            $allPassed = $false
        }
    }
    
    # Type checking
    Log-Step "TYPE" "Running TypeScript type checking..."
    try {
        pnpm run type-check
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Type checking passed"
        } else {
            Log-Error "Type checking failed"
            $allPassed = $false
        }
    }
    catch {
        Log-Error "Type checking failed: $($_.Exception.Message)"
        $allPassed = $false
    }
    
    # Tests
    if (-not $SkipTests) {
        Log-Step "TEST" "Running test suite..."
        try {
            pnpm run test
            if ($LASTEXITCODE -eq 0) {
                Log-Success "Tests passed"
            } else {
                Log-Error "Tests failed"
                $allPassed = $false
            }
        }
        catch {
            Log-Error "Test execution failed: $($_.Exception.Message)"
            $allPassed = $false
        }
    }
    
    # Security audit
    if (-not $SkipSecurity) {
        Log-Step "SECURITY" "Running security audit..."
        try {
            pnpm audit --audit-level moderate
            if ($LASTEXITCODE -eq 0) {
                Log-Success "Security audit passed"
            } else {
                Log-Warning "Security audit found issues"
            }
        }
        catch {
            Log-Warning "Security audit failed: $($_.Exception.Message)"
        }
    }
    
    return $allPassed
}

# Function to build API application
function Build-ApiApplication {
    Log-Step "API" "Building API application..."
    
    if (-not (Test-Path "apps/api")) {
        Log-Warning "API application not found"
        return $false
    }
    
    Push-Location "apps/api"
    
    try {
        # Set production environment
        $env:NODE_ENV = $Environment
        
        # Build API
        pnpm run build
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "API build completed"
            
            # Store build info
            $script:buildArtifacts["api"] = @{
                path = "apps/api/dist"
                size = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
                files = (Get-ChildItem "dist" -Recurse -File).Count
            }
            
            return $true
        } else {
            Log-Error "API build failed"
            return $false
        }
    }
    finally {
        Pop-Location
        Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
    }
}

# Function to build Web application
function Build-WebApplication {
    Log-Step "WEB" "Building Web application..."
    
    if (-not (Test-Path "apps/web")) {
        Log-Warning "Web application not found"
        return $false
    }
    
    Push-Location "apps/web"
    
    try {
        # Set production environment
        $env:NODE_ENV = $Environment
        
        # Build Web app
        pnpm run build
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Web build completed"
            
            # Store build info
            $buildPath = if (Test-Path ".next") { ".next" } else { "out" }
            $script:buildArtifacts["web"] = @{
                path = "apps/web/$buildPath"
                size = (Get-ChildItem $buildPath -Recurse | Measure-Object -Property Length -Sum).Sum
                files = (Get-ChildItem $buildPath -Recurse -File).Count
            }
            
            return $true
        } else {
            Log-Error "Web build failed"
            return $false
        }
    }
    finally {
        Pop-Location
        Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
    }
}

# Function to build Mobile application
function Build-MobileApplication {
    Log-Step "MOBILE" "Building Mobile application..."
    
    if (-not (Test-Path "apps/mobile")) {
        Log-Warning "Mobile application not found"
        return $false
    }
    
    Push-Location "apps/mobile"
    
    try {
        # Set production environment
        $env:NODE_ENV = $Environment
        
        # Build Android bundle
        Log-Info "Building Android bundle..."
        pnpm run bundle:android
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Android bundle created"
        } else {
            Log-Warning "Android bundle creation failed"
        }
        
        # Build iOS bundle
        Log-Info "Building iOS bundle..."
        pnpm run bundle:ios
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "iOS bundle created"
        } else {
            Log-Warning "iOS bundle creation failed"
        }
        
        # Store build info
        $script:buildArtifacts["mobile"] = @{
            path = "apps/mobile"
            android_bundle = Test-Path "android/app/src/main/assets/index.android.bundle"
            ios_bundle = Test-Path "ios/main.jsbundle"
        }
        
        return $true
    }
    finally {
        Pop-Location
        Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
    }
}

# Function to build packages
function Build-Packages {
    Log-Step "PACKAGES" "Building shared packages..."
    
    try {
        # Build all packages
        pnpm run build --filter="./packages/*"
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Packages build completed"
            return $true
        } else {
            Log-Error "Packages build failed"
            return $false
        }
    }
    catch {
        Log-Error "Packages build failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to create Docker images
function Build-DockerImages {
    param([string]$BuildVersion)
    
    Log-Header "BUILDING DOCKER IMAGES"
    
    $dockerRegistry = if ($Registry) { $Registry } else { "your-registry.com" }
    $projectName = "fullstack-monolith"
    
    # Build API image
    if (Test-Path "apps/api/Dockerfile") {
        Log-Step "DOCKER" "Building API Docker image..."
        
        $apiImage = "$dockerRegistry/$projectName-api:$BuildVersion"
        $apiLatest = "$dockerRegistry/$projectName-api:latest"
        
        docker build -f apps/api/Dockerfile -t $apiImage -t $apiLatest .
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "API Docker image built: $apiImage"
            $script:buildArtifacts["api-docker"] = $apiImage
        } else {
            Log-Error "API Docker image build failed"
        }
    }
    
    # Build Web image
    if (Test-Path "apps/web/Dockerfile") {
        Log-Step "DOCKER" "Building Web Docker image..."
        
        $webImage = "$dockerRegistry/$projectName-web:$BuildVersion"
        $webLatest = "$dockerRegistry/$projectName-web:latest"
        
        docker build -f apps/web/Dockerfile -t $webImage -t $webLatest .
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Web Docker image built: $webImage"
            $script:buildArtifacts["web-docker"] = $webImage
        } else {
            Log-Error "Web Docker image build failed"
        }
    }
    
    # Build Mobile build image (for CI/CD)
    if (Test-Path "apps/mobile/Dockerfile") {
        Log-Step "DOCKER" "Building Mobile build image..."
        
        $mobileImage = "$dockerRegistry/$projectName-mobile:$BuildVersion"
        $mobileLatest = "$dockerRegistry/$projectName-mobile:latest"
        
        docker build -f apps/mobile/Dockerfile -t $mobileImage -t $mobileLatest .
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Mobile Docker image built: $mobileImage"
            $script:buildArtifacts["mobile-docker"] = $mobileImage
        } else {
            Log-Error "Mobile Docker image build failed"
        }
    }
}

# Function to push Docker images
function Push-DockerImages {
    Log-Header "PUSHING DOCKER IMAGES"
    
    foreach ($key in $script:buildArtifacts.Keys) {
        if ($key.EndsWith("-docker")) {
            $image = $script:buildArtifacts[$key]
            Log-Step "PUSH" "Pushing $image..."
            
            docker push $image
            
            if ($LASTEXITCODE -eq 0) {
                Log-Success "Pushed $image"
            } else {
                Log-Error "Failed to push $image"
            }
            
            # Also push latest tag
            $latestImage = $image -replace ":.*", ":latest"
            docker push $latestImage
            
            if ($LASTEXITCODE -eq 0) {
                Log-Success "Pushed $latestImage"
            } else {
                Log-Error "Failed to push $latestImage"
            }
        }
    }
}

# Function to run deployment
function Invoke-Deployment {
    param([string]$BuildVersion)
    
    Log-Header "DEPLOYING TO $Environment"
    
    # Use existing deployment script
    if (Test-Path "tools/scripts/deploy.sh") {
        Log-Step "DEPLOY" "Running deployment script..."
        
        $env:VERSION = $BuildVersion
        
        switch ($Environment) {
            "staging" {
                & bash "tools/scripts/deploy.sh" staging
            }
            "production" {
                & bash "tools/scripts/deploy.sh" production
            }
            default {
                Log-Error "Unknown deployment environment: $Environment"
                return $false
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Deployment completed successfully"
            return $true
        } else {
            Log-Error "Deployment failed"
            return $false
        }
    } else {
        Log-Error "Deployment script not found"
        return $false
    }
}

# Function to generate build report
function New-BuildReport {
    param([string]$BuildVersion)
    
    $buildEndTime = Get-Date
    $buildDuration = $buildEndTime - $script:buildStartTime
    
    Log-Header "BUILD REPORT"
    
    Log-Info "Build Version: $BuildVersion"
    Log-Info "Environment: $Environment"
    Log-Info "Target: $Target"
    Log-Info "Duration: $([math]::Round($buildDuration.TotalMinutes, 2)) minutes"
    
    Write-Host ""
    Log-Info "Build Artifacts:"
    
    foreach ($key in $script:buildArtifacts.Keys) {
        $artifact = $script:buildArtifacts[$key]
        
        if ($artifact -is [hashtable]) {
            if ($artifact.ContainsKey("size")) {
                $sizeMB = [math]::Round($artifact.size / 1MB, 2)
                Log-Info "  $key: $($artifact.path) (${sizeMB}MB, $($artifact.files) files)"
            } else {
                Log-Info "  $key: $($artifact | ConvertTo-Json -Compress)"
            }
        } else {
            Log-Info "  $key: $artifact"
        }
    }
    
    if ($script:errors.Count -gt 0) {
        Write-Host ""
        Log-Error "Errors encountered:"
        foreach ($error in $script:errors) {
            Log-Error "  - $error"
        }
    }
    
    if ($script:warnings.Count -gt 0) {
        Write-Host ""
        Log-Warning "Warnings:"
        foreach ($warning in $script:warnings) {
            Log-Warning "  - $warning"
        }
    }
    
    # Save report to file
    $reportPath = "build-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $report = @{
        version = $BuildVersion
        environment = $Environment
        target = $Target
        startTime = $script:buildStartTime
        endTime = $buildEndTime
        duration = $buildDuration.TotalMinutes
        artifacts = $script:buildArtifacts
        errors = $script:errors
        warnings = $script:warnings
    }
    
    $report | ConvertTo-Json -Depth 10 | Set-Content $reportPath
    Log-Info "Build report saved to: $reportPath"
}

# Main build function
function Invoke-ProductionBuild {
    $buildVersion = Get-BuildVersion
    
    Log-Header "PRODUCTION BUILD - VERSION $buildVersion"
    
    # Step 1: Validate environment
    $envOk = Test-BuildEnvironment
    if (-not $envOk) {
        Log-Error "Environment validation failed"
        exit 1
    }
    
    # Step 2: Clean previous builds
    Clear-BuildArtifacts
    
    # Step 3: Run quality checks
    $qualityOk = Invoke-QualityChecks
    if (-not $qualityOk) {
        Log-Error "Quality checks failed"
        exit 1
    }
    
    # Step 4: Build packages first
    $packagesOk = Build-Packages
    if (-not $packagesOk) {
        Log-Error "Package build failed"
        exit 1
    }
    
    # Step 5: Build applications
    $buildSuccess = $true
    
    if ($Target -eq "all" -or $Target -eq "api") {
        $buildSuccess = $buildSuccess -and (Build-ApiApplication)
    }
    
    if ($Target -eq "all" -or $Target -eq "web") {
        $buildSuccess = $buildSuccess -and (Build-WebApplication)
    }
    
    if ($Target -eq "all" -or $Target -eq "mobile") {
        $buildSuccess = $buildSuccess -and (Build-MobileApplication)
    }
    
    if (-not $buildSuccess) {
        Log-Error "Application build failed"
        exit 1
    }
    
    # Step 6: Build Docker images (if Docker available)
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Build-DockerImages $buildVersion
        
        # Step 7: Push images if requested
        if ($Push) {
            Push-DockerImages
        }
    }
    
    # Step 8: Deploy if requested
    if ($Deploy) {
        $deployOk = Invoke-Deployment $buildVersion
        if (-not $deployOk) {
            Log-Error "Deployment failed"
            exit 1
        }
    }
    
    # Step 9: Generate report
    New-BuildReport $buildVersion
    
    Log-Success "Production build completed successfully!"
}

# Main execution
switch ($Command.ToLower()) {
    "build" {
        Invoke-ProductionBuild
    }
    "docker" {
        $buildVersion = Get-BuildVersion
        Build-DockerImages $buildVersion
        if ($Push) {
            Push-DockerImages
        }
    }
    "deploy" {
        $buildVersion = Get-BuildVersion
        Invoke-Deployment $buildVersion
    }
    "clean" {
        Clear-BuildArtifacts
    }
    "check" {
        Test-BuildEnvironment
        Invoke-QualityChecks
    }
    default {
        Write-Host "Production Build and Deployment Script"
        Write-Host ""
        Write-Host "Usage: .\production-build.ps1 [command] [options]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  build                    - Full production build (default)"
        Write-Host "  docker                   - Build Docker images only"
        Write-Host "  deploy                   - Deploy to environment"
        Write-Host "  clean                    - Clean build artifacts"
        Write-Host "  check                    - Run quality checks only"
        Write-Host ""
        Write-Host "Options:"
        Write-Host "  -Environment <env>       - Target environment (staging|production)"
        Write-Host "  -Target <target>         - Build target (all|api|web|mobile)"
        Write-Host "  -Version <version>       - Build version (default: git-based)"
        Write-Host "  -Registry <registry>     - Docker registry URL"
        Write-Host "  -SkipTests              - Skip test execution"
        Write-Host "  -SkipLinting            - Skip linting checks"
        Write-Host "  -SkipSecurity           - Skip security audit"
        Write-Host "  -Push                   - Push Docker images to registry"
        Write-Host "  -Deploy                 - Deploy after build"
        Write-Host "  -Verbose                - Verbose output"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\production-build.ps1 build"
        Write-Host "  .\production-build.ps1 build -Environment staging -Target web"
        Write-Host "  .\production-build.ps1 docker -Version v1.2.3 -Push"
        Write-Host "  .\production-build.ps1 build -Deploy -Environment production"
    }
}