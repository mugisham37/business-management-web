# Database Management Script (PowerShell)
# Comprehensive database operations: migrations, rollbacks, seeding, backups

param(
    [string]$Command = "help",
    [string]$Name = "",
    [string]$Environment = "development",
    [switch]$Force = $false,
    [switch]$Confirm = $false,
    [string]$BackupFile = "",
    [int]$RetentionDays = 7
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

function Log-Database {
    param([string]$Operation, [string]$Message)
    Write-Host "[$Operation] $Message" -ForegroundColor $Cyan
}

# Configuration
$DatabasePackagePath = "packages/database"
$BackupDirectory = "backups/database"
$LogDirectory = "logs"

# Ensure required directories exist
function Initialize-Directories {
    @($BackupDirectory, $LogDirectory) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Log-Info "Created directory: $_"
        }
    }
}

# Function to check if database package exists
function Test-DatabasePackage {
    if (-not (Test-Path $DatabasePackagePath)) {
        Log-Error "Database package not found at $DatabasePackagePath"
        return $false
    }
    
    if (-not (Test-Path "$DatabasePackagePath/package.json")) {
        Log-Error "package.json not found in database package"
        return $false
    }
    
    return $true
}

# Function to check database connectivity
function Test-DatabaseConnection {
    param([string]$DatabaseUrl = $env:DATABASE_URL)
    
    if (-not $DatabaseUrl) {
        Log-Error "DATABASE_URL environment variable not set"
        return $false
    }
    
    Log-Info "Testing database connection..."
    
    try {
        # Use psql to test connection
        $testQuery = "SELECT 1 as test;"
        $result = & psql $DatabaseUrl -c $testQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Database connection successful"
            return $true
        } else {
            Log-Error "Database connection failed: $result"
            return $false
        }
    }
    catch {
        Log-Error "Failed to test database connection: $($_.Exception.Message)"
        return $false
    }
}

# Function to run Prisma migrations
function Invoke-PrismaMigrations {
    param(
        [string]$Action = "dev",
        [string]$MigrationName = ""
    )
    
    if (-not (Test-DatabasePackage)) {
        return $false
    }
    
    Push-Location $DatabasePackagePath
    
    try {
        $packageContent = Get-Content "package.json" | ConvertFrom-Json
        
        if (-not ($packageContent.dependencies.prisma -or $packageContent.devDependencies.prisma)) {
            Log-Warning "Prisma not found in database package dependencies"
            return $false
        }
        
        Log-Database "PRISMA" "Running Prisma $Action..."
        
        switch ($Action) {
            "dev" {
                if ($MigrationName) {
                    pnpm prisma migrate dev --name $MigrationName
                } else {
                    pnpm prisma migrate dev
                }
            }
            "deploy" {
                pnpm prisma migrate deploy
            }
            "reset" {
                if ($Force -or $Confirm) {
                    pnpm prisma migrate reset --force
                } else {
                    Log-Warning "Reset requires --Force or --Confirm flag"
                    return $false
                }
            }
            "status" {
                pnpm prisma migrate status
            }
            "create" {
                if (-not $MigrationName) {
                    Log-Error "Migration name required for create action"
                    return $false
                }
                pnpm prisma migrate dev --name $MigrationName --create-only
            }
            "generate" {
                pnpm prisma generate
            }
            default {
                Log-Error "Unknown Prisma action: $Action"
                return $false
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Prisma $Action completed successfully"
            return $true
        } else {
            Log-Error "Prisma $Action failed"
            return $false
        }
    }
    finally {
        Pop-Location
    }
}

# Function to run Drizzle migrations
function Invoke-DrizzleMigrations {
    param(
        [string]$Action = "push"
    )
    
    if (-not (Test-DatabasePackage)) {
        return $false
    }
    
    Push-Location $DatabasePackagePath
    
    try {
        $packageContent = Get-Content "package.json" | ConvertFrom-Json
        
        if (-not ($packageContent.dependencies."drizzle-orm" -or $packageContent.devDependencies."drizzle-kit")) {
            Log-Warning "Drizzle not found in database package dependencies"
            return $false
        }
        
        Log-Database "DRIZZLE" "Running Drizzle $Action..."
        
        switch ($Action) {
            "generate" {
                pnpm drizzle-kit generate:pg
            }
            "push" {
                pnpm drizzle-kit push:pg
            }
            "drop" {
                if ($Force -or $Confirm) {
                    pnpm drizzle-kit drop
                } else {
                    Log-Warning "Drop requires --Force or --Confirm flag"
                    return $false
                }
            }
            "introspect" {
                pnpm drizzle-kit introspect:pg
            }
            default {
                Log-Error "Unknown Drizzle action: $Action"
                return $false
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Drizzle $Action completed successfully"
            return $true
        } else {
            Log-Error "Drizzle $Action failed"
            return $false
        }
    }
    finally {
        Pop-Location
    }
}

# Function to seed database
function Invoke-DatabaseSeed {
    param(
        [string]$SeedType = "all"
    )
    
    if (-not (Test-DatabasePackage)) {
        return $false
    }
    
    Log-Database "SEED" "Seeding database with $SeedType data..."
    
    Push-Location $DatabasePackagePath
    
    try {
        $packageContent = Get-Content "package.json" | ConvertFrom-Json
        
        if ($packageContent.scripts.seed) {
            if ($SeedType -ne "all") {
                $env:SEED_TYPE = $SeedType
            }
            
            pnpm run seed
            
            if ($LASTEXITCODE -eq 0) {
                Log-Success "Database seeding completed successfully"
                return $true
            } else {
                Log-Error "Database seeding failed"
                return $false
            }
        } else {
            Log-Warning "No seed script found in database package"
            return $false
        }
    }
    finally {
        Pop-Location
        Remove-Item Env:SEED_TYPE -ErrorAction SilentlyContinue
    }
}

# Function to create database backup
function New-DatabaseBackup {
    param(
        [string]$BackupType = "full",
        [string]$CustomName = ""
    )
    
    Initialize-Directories
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = if ($CustomName) { 
        "${CustomName}_${timestamp}" 
    } else { 
        "${Environment}_${BackupType}_${timestamp}" 
    }
    
    $backupPath = "$BackupDirectory/${backupName}.sql"
    
    Log-Database "BACKUP" "Creating $BackupType backup: $backupName"
    
    if (-not $env:DATABASE_URL) {
        Log-Error "DATABASE_URL environment variable not set"
        return $false
    }
    
    try {
        switch ($BackupType) {
            "full" {
                & pg_dump $env:DATABASE_URL --verbose --clean --no-acl --no-owner > $backupPath
            }
            "schema" {
                & pg_dump $env:DATABASE_URL --verbose --schema-only --no-acl --no-owner > $backupPath
            }
            "data" {
                & pg_dump $env:DATABASE_URL --verbose --data-only --no-acl --no-owner > $backupPath
            }
            default {
                Log-Error "Unknown backup type: $BackupType"
                return $false
            }
        }
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupPath)) {
            $backupSize = (Get-Item $backupPath).Length
            Log-Success "Backup created successfully: $backupPath ($([math]::Round($backupSize/1MB, 2)) MB)"
            
            # Create backup metadata
            $metadata = @{
                name = $backupName
                type = $BackupType
                environment = $Environment
                timestamp = $timestamp
                size = $backupSize
                path = $backupPath
            }
            
            $metadataPath = "$BackupDirectory/${backupName}.json"
            $metadata | ConvertTo-Json | Set-Content $metadataPath
            
            return $true
        } else {
            Log-Error "Backup creation failed"
            return $false
        }
    }
    catch {
        Log-Error "Backup creation failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to restore database from backup
function Restore-DatabaseBackup {
    param(
        [string]$BackupName = ""
    )
    
    if (-not $BackupName -and -not $BackupFile) {
        Log-Error "Backup name or file path required"
        return $false
    }
    
    $restoreFile = if ($BackupFile) {
        $BackupFile
    } else {
        "$BackupDirectory/${BackupName}.sql"
    }
    
    if (-not (Test-Path $restoreFile)) {
        Log-Error "Backup file not found: $restoreFile"
        return $false
    }
    
    if (-not ($Force -or $Confirm)) {
        Log-Warning "This will overwrite the current database!"
        $response = Read-Host "Are you sure you want to continue? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Log-Info "Restore cancelled"
            return $false
        }
    }
    
    Log-Database "RESTORE" "Restoring database from: $restoreFile"
    
    try {
        # Create a backup before restore
        Log-Info "Creating safety backup before restore..."
        New-DatabaseBackup -BackupType "full" -CustomName "pre_restore_safety"
        
        # Restore database
        & psql $env:DATABASE_URL < $restoreFile
        
        if ($LASTEXITCODE -eq 0) {
            Log-Success "Database restored successfully from: $restoreFile"
            return $true
        } else {
            Log-Error "Database restore failed"
            return $false
        }
    }
    catch {
        Log-Error "Database restore failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to list backups
function Get-DatabaseBackups {
    Initialize-Directories
    
    Log-Info "Available database backups:"
    
    $backups = Get-ChildItem -Path $BackupDirectory -Filter "*.sql" | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Log-Warning "No backups found in $BackupDirectory"
        return
    }
    
    foreach ($backup in $backups) {
        $metadataPath = $backup.FullName -replace "\.sql$", ".json"
        $size = [math]::Round($backup.Length/1MB, 2)
        
        if (Test-Path $metadataPath) {
            $metadata = Get-Content $metadataPath | ConvertFrom-Json
            Write-Host "  $($backup.BaseName) - $($metadata.type) - $($backup.LastWriteTime) - ${size}MB" -ForegroundColor $Green
        } else {
            Write-Host "  $($backup.BaseName) - unknown - $($backup.LastWriteTime) - ${size}MB" -ForegroundColor $Yellow
        }
    }
}

# Function to cleanup old backups
function Remove-OldBackups {
    param([int]$Days = $RetentionDays)
    
    Initialize-Directories
    
    $cutoffDate = (Get-Date).AddDays(-$Days)
    $oldBackups = Get-ChildItem -Path $BackupDirectory -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    if ($oldBackups.Count -eq 0) {
        Log-Info "No old backups to clean up (retention: $Days days)"
        return
    }
    
    Log-Info "Cleaning up $($oldBackups.Count) backups older than $Days days..."
    
    foreach ($backup in $oldBackups) {
        $metadataPath = $backup.FullName -replace "\.sql$", ".json"
        
        Remove-Item $backup.FullName -Force
        if (Test-Path $metadataPath) {
            Remove-Item $metadataPath -Force
        }
        
        Log-Info "Removed: $($backup.Name)"
    }
    
    Log-Success "Cleanup completed. Removed $($oldBackups.Count) old backups."
}

# Function to show database status
function Get-DatabaseStatus {
    Log-Info "=== Database Status ==="
    
    # Test connection
    $connected = Test-DatabaseConnection
    
    if ($connected) {
        # Get database info
        try {
            $dbInfo = & psql $env:DATABASE_URL -c "SELECT current_database(), current_user, version();" -t
            Log-Info "Database: $($dbInfo.Split('|')[0].Trim())"
            Log-Info "User: $($dbInfo.Split('|')[1].Trim())"
            
            # Get table count
            $tableCount = & psql $env:DATABASE_URL -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" -t
            Log-Info "Tables: $($tableCount.Trim())"
            
            # Migration status
            Log-Info ""
            Log-Info "Migration Status:"
            Invoke-PrismaMigrations -Action "status"
        }
        catch {
            Log-Warning "Could not retrieve detailed database information"
        }
    }
    
    # Backup info
    Log-Info ""
    Log-Info "Recent Backups:"
    $recentBackups = Get-ChildItem -Path $BackupDirectory -Filter "*.sql" -ErrorAction SilentlyContinue | 
                     Sort-Object LastWriteTime -Descending | 
                     Select-Object -First 5
    
    if ($recentBackups) {
        foreach ($backup in $recentBackups) {
            $size = [math]::Round($backup.Length/1MB, 2)
            Log-Info "  $($backup.BaseName) - $($backup.LastWriteTime) - ${size}MB"
        }
    } else {
        Log-Warning "  No backups found"
    }
}

# Main execution
switch ($Command.ToLower()) {
    "migrate" {
        $success = Invoke-PrismaMigrations -Action "dev" -MigrationName $Name
        if ($success) {
            Invoke-DrizzleMigrations -Action "push"
        }
    }
    "migrate-deploy" {
        $success = Invoke-PrismaMigrations -Action "deploy"
        if ($success) {
            Invoke-DrizzleMigrations -Action "push"
        }
    }
    "migrate-reset" {
        $success = Invoke-PrismaMigrations -Action "reset"
        if ($success) {
            Invoke-DrizzleMigrations -Action "push"
        }
    }
    "migrate-status" {
        Invoke-PrismaMigrations -Action "status"
    }
    "migrate-create" {
        if (-not $Name) {
            Log-Error "Migration name required. Use -Name parameter."
            exit 1
        }
        Invoke-PrismaMigrations -Action "create" -MigrationName $Name
    }
    "rollback" {
        Log-Warning "Manual rollback required. Please use migration files to rollback."
        Log-Info "Available migrations:"
        if (Test-Path "$DatabasePackagePath/prisma/migrations") {
            Get-ChildItem "$DatabasePackagePath/prisma/migrations" -Directory | ForEach-Object {
                Log-Info "  $($_.Name)"
            }
        }
    }
    "seed" {
        Invoke-DatabaseSeed -SeedType $Name
    }
    "backup" {
        $backupType = if ($Name) { $Name } else { "full" }
        New-DatabaseBackup -BackupType $backupType
    }
    "restore" {
        if ($Name) {
            Restore-DatabaseBackup -BackupName $Name
        } elseif ($BackupFile) {
            Restore-DatabaseBackup
        } else {
            Log-Error "Backup name or file path required"
            Get-DatabaseBackups
        }
    }
    "list-backups" {
        Get-DatabaseBackups
    }
    "cleanup" {
        Remove-OldBackups -Days $RetentionDays
    }
    "status" {
        Get-DatabaseStatus
    }
    "test" {
        Test-DatabaseConnection
    }
    "generate" {
        Invoke-PrismaMigrations -Action "generate"
        Invoke-DrizzleMigrations -Action "generate"
    }
    default {
        Write-Host "Database Management Script"
        Write-Host ""
        Write-Host "Usage: .\database.ps1 [command] [options]"
        Write-Host ""
        Write-Host "Migration Commands:"
        Write-Host "  migrate                  - Run development migrations"
        Write-Host "  migrate-deploy           - Deploy migrations to production"
        Write-Host "  migrate-reset            - Reset database and run all migrations"
        Write-Host "  migrate-status           - Show migration status"
        Write-Host "  migrate-create           - Create new migration (requires -Name)"
        Write-Host "  rollback                 - Show rollback instructions"
        Write-Host "  generate                 - Generate Prisma client and Drizzle schemas"
        Write-Host ""
        Write-Host "Data Commands:"
        Write-Host "  seed                     - Seed database (optional -Name for specific seed)"
        Write-Host ""
        Write-Host "Backup Commands:"
        Write-Host "  backup                   - Create database backup (optional -Name: full|schema|data)"
        Write-Host "  restore                  - Restore from backup (requires -Name or -BackupFile)"
        Write-Host "  list-backups             - List available backups"
        Write-Host "  cleanup                  - Remove old backups (default: 7 days, use -RetentionDays)"
        Write-Host ""
        Write-Host "Utility Commands:"
        Write-Host "  status                   - Show database status"
        Write-Host "  test                     - Test database connection"
        Write-Host ""
        Write-Host "Options:"
        Write-Host "  -Name <string>           - Name for migration, seed type, or backup"
        Write-Host "  -Environment <string>    - Environment (development|staging|production)"
        Write-Host "  -Force                   - Force destructive operations"
        Write-Host "  -Confirm                 - Confirm destructive operations"
        Write-Host "  -BackupFile <path>       - Path to backup file for restore"
        Write-Host "  -RetentionDays <int>     - Days to keep backups (default: 7)"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\database.ps1 migrate"
        Write-Host "  .\database.ps1 migrate-create -Name add_user_preferences"
        Write-Host "  .\database.ps1 seed -Name users"
        Write-Host "  .\database.ps1 backup -Name full"
        Write-Host "  .\database.ps1 restore -Name backup_20241201_143022"
        Write-Host "  .\database.ps1 cleanup -RetentionDays 14"
    }
}