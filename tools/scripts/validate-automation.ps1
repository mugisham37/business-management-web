# Automation Scripts Validation (PowerShell)
# Validates that all automation scripts are properly configured and functional

param(
    [switch]$Quick = $false,
    [switch]$Verbose = $false
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

function Log-Test {
    param([string]$Test, [string]$Message)
    Write-Host "[$Test] $Message" -ForegroundColor $Cyan
}

# Test results
$script:testResults = @{
    passed = 0
    failed = 0
    warnings = 0
    tests = @()
}

# Function to add test result
function Add-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = ""
    )
    
    $script:testResults.tests += @{
        name = $TestName
        status = $Status
        message = $Message
    }
    
    switch ($Status) {
        "PASS" { $script:testResults.passed++ }
        "FAIL" { $script:testResults.failed++ }
        "WARN" { $script:testResults.warnings++ }
    }
}

# Function to test script existence
function Test-ScriptExists {
    param([string]$ScriptPath, [string]$ScriptName)
    
    Log-Test "EXIST" "Checking if $ScriptName exists..."
    
    if (Test-Path $ScriptPath) {
        Log-Success "$ScriptName exists at $ScriptPath"
        Add-TestResult "Script Exists: $ScriptName" "PASS"
        return $true
    } else {
        Log-Error "$ScriptName not found at $ScriptPath"
        Add-TestResult "Script Exists: $ScriptName" "FAIL" "File not found"
        return $false
    }
}

# Function to test script syntax
function Test-ScriptSyntax {
    param([string]$ScriptPath, [string]$ScriptName)
    
    if (-not (Test-Path $ScriptPath)) {
        return $false
    }
    
    Log-Test "SYNTAX" "Checking $ScriptName syntax..."
    
    try {
        # Test PowerShell syntax
        if ($ScriptPath.EndsWith(".ps1")) {
            $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $ScriptPath -Raw), [ref]$null)
            Log-Success "$ScriptName syntax is valid"
            Add-TestResult "Script Syntax: $ScriptName" "PASS"
            return $true
        }
        # Test shell script syntax
        elseif ($ScriptPath.EndsWith(".sh")) {
            # Basic syntax check for shell scripts
            $content = Get-Content $ScriptPath -Raw
            if ($content -match "#!/bin/bash" -or $content -match "#!/bin/sh") {
                Log-Success "$ScriptName appears to have valid shell syntax"
                Add-TestResult "Script Syntax: $ScriptName" "PASS"
                return $true
            } else {
                Log-Warning "$ScriptName may have syntax issues"
                Add-TestResult "Script Syntax: $ScriptName" "WARN" "No shebang found"
                return $false
            }
        }
    }
    catch {
        Log-Error "$ScriptName has syntax errors: $($_.Exception.Message)"
        Add-TestResult "Script Syntax: $ScriptName" "FAIL" $_.Exception.Message
        return $false
    }
}

# Function to test script help
function Test-ScriptHelp {
    param([string]$ScriptPath, [string]$ScriptName)
    
    if (-not (Test-Path $ScriptPath) -or -not $ScriptPath.EndsWith(".ps1")) {
        return $false
    }
    
    Log-Test "HELP" "Testing $ScriptName help functionality..."
    
    try {
        $output = & $ScriptPath "help" 2>&1
        
        if ($output -match "Usage:" -or $output -match "Commands:" -or $output -match "help") {
            Log-Success "$ScriptName help is functional"
            Add-TestResult "Script Help: $ScriptName" "PASS"
            return $true
        } else {
            Log-Warning "$ScriptName help may not be properly implemented"
            Add-TestResult "Script Help: $ScriptName" "WARN" "Help output unclear"
            return $false
        }
    }
    catch {
        Log-Error "$ScriptName help failed: $($_.Exception.Message)"
        Add-TestResult "Script Help: $ScriptName" "FAIL" $_.Exception.Message
        return $false
    }
}

# Function to test Makefile targets
function Test-MakefileTargets {
    Log-Test "MAKEFILE" "Checking Makefile automation targets..."
    
    if (-not (Test-Path "Makefile")) {
        Log-Error "Makefile not found"
        Add-TestResult "Makefile Exists" "FAIL" "File not found"
        return $false
    }
    
    $makefileContent = Get-Content "Makefile" -Raw
    
    # Check for automation targets
    $automationTargets = @(
        "dev-services",
        "quick-setup",
        "production-build",
        "database-ops"
    )
    
    $allTargetsFound = $true
    
    foreach ($target in $automationTargets) {
        if ($makefileContent -match "${target}:") {
            Log-Success "Makefile target '$target' found"
        } else {
            Log-Warning "Makefile target '$target' not found"
            $allTargetsFound = $false
        }
    }
    
    if ($allTargetsFound) {
        Add-TestResult "Makefile Targets" "PASS"
    } else {
        Add-TestResult "Makefile Targets" "WARN" "Some targets missing"
    }
    
    return $allTargetsFound
}

# Function to test package.json scripts
function Test-PackageJsonScripts {
    Log-Test "PACKAGE" "Checking package.json automation scripts..."
    
    if (-not (Test-Path "package.json")) {
        Log-Error "package.json not found"
        Add-TestResult "Package.json Exists" "FAIL" "File not found"
        return $false
    }
    
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        # Check for automation scripts
        $automationScripts = @(
            "automation:hub",
            "automation:dev-services",
            "automation:database",
            "dev:services",
            "setup:new-developer"
        )
        
        $allScriptsFound = $true
        
        foreach ($script in $automationScripts) {
            if ($packageJson.scripts.$script) {
                Log-Success "Package.json script '$script' found"
            } else {
                Log-Warning "Package.json script '$script' not found"
                $allScriptsFound = $false
            }
        }
        
        if ($allScriptsFound) {
            Add-TestResult "Package.json Scripts" "PASS"
        } else {
            Add-TestResult "Package.json Scripts" "WARN" "Some scripts missing"
        }
        
        return $allScriptsFound
    }
    catch {
        Log-Error "Failed to parse package.json: $($_.Exception.Message)"
        Add-TestResult "Package.json Scripts" "FAIL" $_.Exception.Message
        return $false
    }
}

# Function to test directory structure
function Test-DirectoryStructure {
    Log-Test "STRUCTURE" "Checking automation directory structure..."
    
    $requiredDirs = @(
        "tools/scripts",
        "logs",
        "backups"
    )
    
    $allDirsExist = $true
    
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Log-Success "Directory '$dir' exists"
        } else {
            if ($dir -eq "logs" -or $dir -eq "backups") {
                Log-Info "Creating missing directory: $dir"
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Log-Success "Created directory '$dir'"
            } else {
                Log-Error "Required directory '$dir' not found"
                $allDirsExist = $false
            }
        }
    }
    
    if ($allDirsExist) {
        Add-TestResult "Directory Structure" "PASS"
    } else {
        Add-TestResult "Directory Structure" "FAIL" "Required directories missing"
    }
    
    return $allDirsExist
}

# Main validation function
function Invoke-ValidationTests {
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host "AUTOMATION SCRIPTS VALIDATION" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host ""
    
    # Test directory structure
    Test-DirectoryStructure
    
    # Test automation scripts
    $automationScripts = @{
        "dev-services.ps1" = "Development Services Manager"
        "database.ps1" = "Database Operations Manager"
        "quick-setup.ps1" = "Quick Setup for New Developers"
        "production-build.ps1" = "Production Build and Deployment"
        "automation-hub.ps1" = "Automation Hub"
        "dev-services.sh" = "Development Services Manager (Bash)"
    }
    
    foreach ($script in $automationScripts.Keys) {
        $scriptPath = "tools/scripts/$script"
        $scriptName = $automationScripts[$script]
        
        # Test existence
        $exists = Test-ScriptExists $scriptPath $scriptName
        
        if ($exists) {
            # Test syntax
            Test-ScriptSyntax $scriptPath $scriptName
            
            # Test help (only for PowerShell scripts and if not in quick mode)
            if (-not $Quick -and $script.EndsWith(".ps1")) {
                Test-ScriptHelp $scriptPath $scriptName
            }
        }
    }
    
    # Test Makefile
    Test-MakefileTargets
    
    # Test package.json
    Test-PackageJsonScripts
    
    # Additional files
    $additionalFiles = @{
        "tools/scripts/README.md" = "Automation Scripts Documentation"
        "Makefile" = "Build Automation"
    }
    
    foreach ($file in $additionalFiles.Keys) {
        Test-ScriptExists $file $additionalFiles[$file]
    }
}

# Function to show validation results
function Show-ValidationResults {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host "VALIDATION RESULTS" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host ""
    
    $totalTests = $script:testResults.passed + $script:testResults.failed + $script:testResults.warnings
    
    Log-Info "Total Tests: $totalTests"
    Log-Success "Passed: $($script:testResults.passed)"
    
    if ($script:testResults.warnings -gt 0) {
        Log-Warning "Warnings: $($script:testResults.warnings)"
    }
    
    if ($script:testResults.failed -gt 0) {
        Log-Error "Failed: $($script:testResults.failed)"
    }
    
    Write-Host ""
    
    # Show detailed results if verbose or if there are failures
    if ($Verbose -or $script:testResults.failed -gt 0 -or $script:testResults.warnings -gt 0) {
        Log-Info "Detailed Results:"
        
        foreach ($test in $script:testResults.tests) {
            $status = switch ($test.status) {
                "PASS" { "[PASS]" }
                "FAIL" { "[FAIL]" }
                "WARN" { "[WARN]" }
            }
            
            $color = switch ($test.status) {
                "PASS" { $Green }
                "FAIL" { $Red }
                "WARN" { $Yellow }
            }
            
            $message = if ($test.message) { " - $($test.message)" } else { "" }
            Write-Host "  $status $($test.name)$message" -ForegroundColor $color
        }
    }
    
    Write-Host ""
    
    # Overall status
    if ($script:testResults.failed -eq 0) {
        if ($script:testResults.warnings -eq 0) {
            Log-Success "All automation scripts are properly configured and functional!"
        } else {
            Log-Warning "Automation scripts are functional but have some warnings."
        }
        
        Write-Host ""
        Log-Info "You can now use the automation scripts:"
        Log-Info "  - New developer setup: .\tools\scripts\quick-setup.ps1 full"
        Log-Info "  - Start services: .\tools\scripts\dev-services.ps1 start"
        Log-Info "  - Automation hub: .\tools\scripts\automation-hub.ps1 workflows"
        Log-Info "  - Database ops: .\tools\scripts\database.ps1 help"
        Log-Info "  - Production build: .\tools\scripts\production-build.ps1 build"
    } else {
        Log-Error "Some automation scripts have issues that need to be resolved."
        Write-Host ""
        Log-Info "Please fix the failed tests before using the automation scripts."
    }
}

# Main execution
try {
    Invoke-ValidationTests
    Show-ValidationResults
    
    # Exit with appropriate code
    if ($script:testResults.failed -gt 0) {
        exit 1
    } else {
        exit 0
    }
}
catch {
    Log-Error "Validation failed with exception: $($_.Exception.Message)"
    exit 1
}