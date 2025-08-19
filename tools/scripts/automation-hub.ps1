# Automation Hub Script (PowerShell)
# Central hub for all automation scripts and workflows

param(
    [string]$Command = "help",
    [string]$Target = "",
    [hashtable]$Options = @{}
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

function Log-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $Magenta
    Write-Host $Message -ForegroundColor $Magenta
    Write-Host "=" * 60 -ForegroundColor $Magenta
    Write-Host ""
}

# Available automation scripts
$AutomationScripts = @{
    "dev-services" = @{
        script = "tools/scripts/dev-services.ps1"
        description = "Manage development services (API, web, mobile)"
        commands = @("start", "stop", "restart", "status", "logs")
    }
    "database" = @{
        script = "tools/scripts/database.ps1"
        description = "Database operations (migrate, seed, backup, restore)"
        commands = @("migrate", "seed", "backup", "restore", "status", "cleanup")
    }
    "quick-setup" = @{
        script = "tools/scripts/quick-setup.ps1"
        description = "One-command setup for new developers"
        commands = @("full", "minimal", "quick", "strict")
    }
    "production-build" = @{
        script = "tools/scripts/production-build.ps1"
        description = "Production build and deployment"
        commands = @("build", "docker", "deploy", "clean", "check")
    }
}

# Function to check if script exists
function Test-AutomationScript {
    param([string]$ScriptName)
    
    if (-not $AutomationScripts.ContainsKey($ScriptName)) {
        return $false
    }
    
    $scriptPath = $AutomationScripts[$ScriptName].script
    return Test-Path $scriptPath
}

# Function to execute automation script
function Invoke-AutomationScript {
    param(
        [string]$ScriptName,
        [string]$Command,
        [hashtable]$Parameters = @{}
    )
    
    if (-not (Test-AutomationScript $ScriptName)) {
        Log-Error "Automation script not found: $ScriptName"
        return $false
    }
    
    $scriptPath = $AutomationScripts[$ScriptName].script
    Log-Info "Executing: $scriptPath $Command"
    
    # Build parameter string
    $paramString = ""
    foreach ($key in $Parameters.Keys) {
        $value = $Parameters[$key]
        if ($value -is [switch] -or $value -eq $true) {
            $paramString += " -$key"
        } else {
            $paramString += " -$key `"$value`""
        }
    }
    
    # Execute script
    try {
        $fullCommand = "& `"$scriptPath`" $Command $paramString"
        Invoke-Expression $fullCommand
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Automation script completed successfully"
            return $true
        } else {
            Log-Error "Automation script failed with exit code: $LASTEXITCODE"
            return $false
        }
    }
    catch {
        Log-Error "Failed to execute automation script: $($_.Exception.Message)"
        return $false
    }
}

# Function to show available workflows
function Show-Workflows {
    Log-Header "AVAILABLE AUTOMATION WORKFLOWS"
    
    Write-Host "Development Workflows:" -ForegroundColor $Cyan
    Write-Host "  new-developer        - Complete setup for new developers"
    Write-Host "  start-development    - Start all development services"
    Write-Host "  stop-development     - Stop all development services"
    Write-Host "  restart-development  - Restart all development services"
    Write-Host "  development-status   - Check development environment status"
    Write-Host ""
    
    Write-Host "Database Workflows:" -ForegroundColor $Cyan
    Write-Host "  setup-database       - Initialize database with migrations and seeds"
    Write-Host "  backup-database      - Create database backup"
    Write-Host "  restore-database     - Restore database from backup"
    Write-Host "  reset-database       - Reset database (destructive)"
    Write-Host "  database-status      - Check database status"
    Write-Host ""
    
    Write-Host "Production Workflows:" -ForegroundColor $Cyan
    Write-Host "  build-production     - Build all applications for production"
    Write-Host "  deploy-staging       - Deploy to staging environment"
    Write-Host "  deploy-production    - Deploy to production environment"
    Write-Host "  build-docker         - Build Docker images"
    Write-Host "  push-docker          - Build and push Docker images"
    Write-Host ""
    
    Write-Host "Maintenance Workflows:" -ForegroundColor $Cyan
    Write-Host "  cleanup-old-backups  - Remove old database backups"
    Write-Host "  health-check         - Check all services health"
    Write-Host "  update-dependencies  - Update all dependencies"
    Write-Host "  security-audit       - Run security audit"
    Write-Host ""
}

# Function to show available scripts
function Show-Scripts {
    Log-Header "AVAILABLE AUTOMATION SCRIPTS"
    
    foreach ($scriptName in $AutomationScripts.Keys) {
        $script = $AutomationScripts[$scriptName]
        $exists = Test-AutomationScript $scriptName
        $status = if ($exists) { "✓" } else { "✗" }
        
        Write-Host "$status $scriptName" -ForegroundColor $(if ($exists) { $Green } else { $Red })
        Write-Host "    Description: $($script.description)" -ForegroundColor $Blue
        Write-Host "    Commands: $($script.commands -join ', ')" -ForegroundColor $Yellow
        Write-Host "    Script: $($script.script)" -ForegroundColor $Cyan
        Write-Host ""
    }
}

# Workflow implementations
function Invoke-NewDeveloperWorkflow {
    Log-Header "NEW DEVELOPER SETUP WORKFLOW"
    
    Log-Info "This workflow will set up the complete development environment"
    Log-Info "Steps: Prerequisites → Dependencies → Infrastructure → Database → Build → Services"
    
    $success = Invoke-AutomationScript "quick-setup" "full" @{}
    
    if ($success) {
        Log-Success "New developer setup completed successfully!"
        Log-Info "Next steps:"
        Log-Info "  1. Run: .\tools\scripts\automation-hub.ps1 start-development"
        Log-Info "  2. Open: http://localhost:3001 (Web App)"
        Log-Info "  3. Open: http://localhost:3000/docs (API Docs)"
    } else {
        Log-Error "New developer setup failed. Please check the logs above."
    }
}

function Invoke-StartDevelopmentWorkflow {
    Log-Header "START DEVELOPMENT WORKFLOW"
    
    $success = Invoke-AutomationScript "dev-services" "start" @{}
    
    if ($success) {
        Log-Success "Development services started successfully!"
    } else {
        Log-Error "Failed to start development services."
    }
}

function Invoke-StopDevelopmentWorkflow {
    Log-Header "STOP DEVELOPMENT WORKFLOW"
    
    $success = Invoke-AutomationScript "dev-services" "stop" @{}
    
    if ($success) {
        Log-Success "Development services stopped successfully!"
    } else {
        Log-Error "Failed to stop development services."
    }
}

function Invoke-DatabaseSetupWorkflow {
    Log-Header "DATABASE SETUP WORKFLOW"
    
    Log-Info "Setting up database with migrations and seeds..."
    
    # Run migrations
    $migrateSuccess = Invoke-AutomationScript "database" "migrate" @{}
    
    if ($migrateSuccess) {
        # Run seeds
        $seedSuccess = Invoke-AutomationScript "database" "seed" @{}
        
        if ($seedSuccess) {
            Log-Success "Database setup completed successfully!"
        } else {
            Log-Warning "Database migrations completed, but seeding failed."
        }
    } else {
        Log-Error "Database setup failed during migrations."
    }
}

function Invoke-ProductionBuildWorkflow {
    Log-Header "PRODUCTION BUILD WORKFLOW"
    
    $success = Invoke-AutomationScript "production-build" "build" @{
        Environment = "production"
        Target = "all"
    }
    
    if ($success) {
        Log-Success "Production build completed successfully!"
    } else {
        Log-Error "Production build failed."
    }
}

function Invoke-HealthCheckWorkflow {
    Log-Header "HEALTH CHECK WORKFLOW"
    
    Log-Info "Checking development services status..."
    Invoke-AutomationScript "dev-services" "status" @{}
    
    Log-Info "Checking database status..."
    Invoke-AutomationScript "database" "status" @{}
    
    Log-Success "Health check completed."
}

# Main execution
switch ($Command.ToLower()) {
    "help" {
        Write-Host "Automation Hub - Central automation script manager"
        Write-Host ""
        Write-Host "Usage: .\automation-hub.ps1 [command] [target] [options]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  help                 - Show this help message"
        Write-Host "  workflows            - Show available workflows"
        Write-Host "  scripts              - Show available automation scripts"
        Write-Host "  run                  - Run specific automation script"
        Write-Host "  workflow             - Run predefined workflow"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\automation-hub.ps1 workflows"
        Write-Host "  .\automation-hub.ps1 scripts"
        Write-Host "  .\automation-hub.ps1 run dev-services start"
        Write-Host "  .\automation-hub.ps1 workflow new-developer"
        Write-Host ""
    }
    "workflows" {
        Show-Workflows
    }
    "scripts" {
        Show-Scripts
    }
    "run" {
        if (-not $Target) {
            Log-Error "Script name required. Use: .\automation-hub.ps1 run <script-name> <command>"
            Show-Scripts
            exit 1
        }
        
        $scriptCommand = if ($Options.Count -gt 0) { $Options.Keys[0] } else { "help" }
        $scriptParams = if ($Options.Count -gt 1) { 
            $Options.Clone()
            $Options.Remove($Options.Keys[0])
            $Options
        } else { @{} }
        
        Invoke-AutomationScript $Target $scriptCommand $scriptParams
    }
    "workflow" {
        switch ($Target.ToLower()) {
            "new-developer" {
                Invoke-NewDeveloperWorkflow
            }
            "start-development" {
                Invoke-StartDevelopmentWorkflow
            }
            "stop-development" {
                Invoke-StopDevelopmentWorkflow
            }
            "restart-development" {
                Invoke-StopDevelopmentWorkflow
                Start-Sleep 3
                Invoke-StartDevelopmentWorkflow
            }
            "development-status" {
                Invoke-AutomationScript "dev-services" "status" @{}
            }
            "setup-database" {
                Invoke-DatabaseSetupWorkflow
            }
            "backup-database" {
                Invoke-AutomationScript "database" "backup" @{}
            }
            "database-status" {
                Invoke-AutomationScript "database" "status" @{}
            }
            "build-production" {
                Invoke-ProductionBuildWorkflow
            }
            "deploy-staging" {
                Invoke-AutomationScript "production-build" "build" @{
                    Environment = "staging"
                    Deploy = $true
                }
            }
            "deploy-production" {
                Invoke-AutomationScript "production-build" "build" @{
                    Environment = "production"
                    Deploy = $true
                }
            }
            "build-docker" {
                Invoke-AutomationScript "production-build" "docker" @{}
            }
            "push-docker" {
                Invoke-AutomationScript "production-build" "docker" @{
                    Push = $true
                }
            }
            "cleanup-old-backups" {
                Invoke-AutomationScript "database" "cleanup" @{}
            }
            "health-check" {
                Invoke-HealthCheckWorkflow
            }
            default {
                Log-Error "Unknown workflow: $Target"
                Show-Workflows
                exit 1
            }
        }
    }
    default {
        Log-Error "Unknown command: $Command"
        Log-Info "Use '.\automation-hub.ps1 help' for usage information"
        exit 1
    }
}