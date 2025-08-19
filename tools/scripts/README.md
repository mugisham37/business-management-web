# Automation Scripts

This directory contains comprehensive automation scripts for the fullstack
monolith project. These scripts handle development workflow, database
management, production builds, and deployment automation.

## Quick Start

### For New Developers

```powershell
# Complete setup (one command)
.\tools\scripts\quick-setup.ps1 full

# Start all development services
.\tools\scripts\dev-services.ps1 start
```

### Using Makefile (Cross-platform)

```bash
# Complete setup and start services
make start-all

# Start development services
make dev-services

# Stop all services
make stop-all
```

## Available Scripts

### 1. Development Services (`dev-services.ps1`)

Manages all development services (API, web, mobile) simultaneously.

**Usage:**

```powershell
# Start all services
.\tools\scripts\dev-services.ps1 start

# Start specific service
.\tools\scripts\dev-services.ps1 start -Service api

# Start in background
.\tools\scripts\dev-services.ps1 start -Detached

# Stop all services
.\tools\scripts\dev-services.ps1 stop

# Check status
.\tools\scripts\dev-services.ps1 status

# View logs
.\tools\scripts\dev-services.ps1 logs -Service api -Logs
```

**Services managed:**

- API Server (http://localhost:3000)
- Web Server (http://localhost:3001)
- Mobile Metro Server (http://localhost:8081)
- Infrastructure (PostgreSQL, Redis, Mailhog)

### 2. Database Management (`database.ps1`)

Comprehensive database operations including migrations, seeding, backups, and
restoration.

**Usage:**

```powershell
# Run migrations
.\tools\scripts\database.ps1 migrate

# Create migration
.\tools\scripts\database.ps1 migrate-create -Name "add_user_preferences"

# Seed database
.\tools\scripts\database.ps1 seed

# Create backup
.\tools\scripts\database.ps1 backup

# Restore from backup
.\tools\scripts\database.ps1 restore -Name "backup_20241201_143022"

# Check status
.\tools\scripts\database.ps1 status

# Cleanup old backups
.\tools\scripts\database.ps1 cleanup -RetentionDays 7
```

**Features:**

- Dual ORM support (Prisma + Drizzle)
- Automated backups with metadata
- Safe restore with pre-restore backups
- Migration status tracking
- Configurable backup retention

### 3. Quick Setup (`quick-setup.ps1`)

One-command setup for new developers with different modes.

**Usage:**

```powershell
# Full setup (recommended)
.\tools\scripts\quick-setup.ps1 full

# Quick setup (no build)
.\tools\scripts\quick-setup.ps1 quick

# Minimal setup (dependencies only)
.\tools\scripts\quick-setup.ps1 minimal

# Strict mode (fail on any error)
.\tools\scripts\quick-setup.ps1 strict

# Skip specific steps
.\tools\scripts\quick-setup.ps1 full -SkipDocker -SkipDatabase
```

**Setup steps:**

1. Prerequisites check (Node.js, pnpm, Docker, Git)
2. Environment file creation
3. Dependency installation
4. Infrastructure startup (Docker services)
5. Database setup (migrations + seeding)
6. Package building
7. Setup validation

### 4. Production Build (`production-build.ps1`)

Production build, optimization, and deployment automation.

**Usage:**

```powershell
# Full production build
.\tools\scripts\production-build.ps1 build

# Build specific target
.\tools\scripts\production-build.ps1 build -Target web

# Build and deploy
.\tools\scripts\production-build.ps1 build -Deploy -Environment production

# Build Docker images
.\tools\scripts\production-build.ps1 docker -Push

# Skip quality checks (not recommended)
.\tools\scripts\production-build.ps1 build -SkipTests -SkipLinting
```

**Features:**

- Quality checks (linting, type checking, tests, security audit)
- Multi-target builds (API, web, mobile)
- Docker image creation and pushing
- Production deployment integration
- Build artifact tracking and reporting

### 5. Automation Hub (`automation-hub.ps1`)

Central hub for managing all automation scripts and workflows.

**Usage:**

```powershell
# Show available workflows
.\tools\scripts\automation-hub.ps1 workflows

# Show available scripts
.\tools\scripts\automation-hub.ps1 scripts

# Run workflow
.\tools\scripts\automation-hub.ps1 workflow new-developer

# Run specific script
.\tools\scripts\automation-hub.ps1 run dev-services start
```

## Predefined Workflows

### Development Workflows

- `new-developer` - Complete setup for new developers
- `start-development` - Start all development services
- `stop-development` - Stop all development services
- `restart-development` - Restart all development services
- `development-status` - Check development environment status

### Database Workflows

- `setup-database` - Initialize database with migrations and seeds
- `backup-database` - Create database backup
- `restore-database` - Restore database from backup
- `database-status` - Check database status

### Production Workflows

- `build-production` - Build all applications for production
- `deploy-staging` - Deploy to staging environment
- `deploy-production` - Deploy to production environment
- `build-docker` - Build Docker images
- `push-docker` - Build and push Docker images

### Maintenance Workflows

- `cleanup-old-backups` - Remove old database backups
- `health-check` - Check all services health

## Cross-Platform Support

### Windows (PowerShell)

All scripts are primarily designed for PowerShell and work best on Windows.

### Linux/macOS (Bash)

- Use the provided shell script versions (`.sh` files)
- Use the Makefile for common operations
- Some advanced features may require PowerShell Core

### Makefile Commands

The Makefile provides cross-platform access to common operations:

```bash
# Development
make dev-services          # Start all services
make dev-services-stop     # Stop all services
make dev-services-status   # Check status

# Setup
make quick-setup           # Full setup
make quick-setup-minimal   # Minimal setup

# Production
make production-build      # Build for production
make production-build-deploy # Build and deploy

# Database
make db-backup            # Create backup
make db-status            # Check status
make database-ops         # Show database help

# All-in-one
make start-all            # Setup and start everything
make stop-all             # Stop everything
```

## Configuration

### Environment Variables

Scripts respect these environment variables:

- `NODE_ENV` - Environment (development/staging/production)
- `DATABASE_URL` - Database connection string
- `REDIS_URL` - Redis connection string
- `DOCKER_REGISTRY` - Docker registry for images
- `PROJECT_NAME` - Project name for Docker images

### Script Configuration

Each script has configurable parameters:

- Retention policies for backups
- Port configurations for services
- Build targets and optimization levels
- Deployment environments and strategies

## Logging and Monitoring

### Log Files

All scripts create log files in the `logs/` directory:

- `api.log` - API server logs
- `web.log` - Web server logs
- `mobile.log` - Mobile server logs
- Build and deployment logs with timestamps

### Status Monitoring

- Health check endpoints for all services
- Database connection monitoring
- Infrastructure service status
- Build artifact tracking

## Troubleshooting

### Common Issues

1. **Port conflicts**: Scripts check for port availability and warn about
   conflicts
2. **Docker not running**: Scripts verify Docker daemon status
3. **Database connection**: Scripts test database connectivity before operations
4. **Permission issues**: Ensure PowerShell execution policy allows script
   execution

### Getting Help

```powershell
# Script-specific help
.\tools\scripts\dev-services.ps1 help
.\tools\scripts\database.ps1 help
.\tools\scripts\quick-setup.ps1 help
.\tools\scripts\production-build.ps1 help

# Automation hub help
.\tools\scripts\automation-hub.ps1 help
.\tools\scripts\automation-hub.ps1 workflows
.\tools\scripts\automation-hub.ps1 scripts
```

### Debug Mode

Most scripts support verbose output:

```powershell
.\tools\scripts\quick-setup.ps1 full -Verbose
.\tools\scripts\production-build.ps1 build -Verbose
```

## Best Practices

1. **Always use the automation scripts** instead of manual commands
2. **Run `quick-setup.ps1` for new environments** to ensure consistency
3. **Use the automation hub** for complex workflows
4. **Regular database backups** before major changes
5. **Test in staging** before production deployment
6. **Monitor logs** during development and deployment
7. **Use version control** for configuration changes

## Contributing

When adding new automation scripts:

1. Follow the existing PowerShell script patterns
2. Include comprehensive help and error handling
3. Add logging with consistent formatting
4. Update this README with new script documentation
5. Add Makefile targets for cross-platform access
6. Test on both Windows and Unix-like systems
