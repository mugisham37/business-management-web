# Fullstack Monolith Makefile
# Comprehensive commands for development, testing, and deployment

.PHONY: help setup install build dev test lint clean deploy docker-build docker-up docker-down db-migrate db-seed db-reset db-studio format type-check dev-services quick-setup production-build database-ops

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup and Installation
setup: ## Complete project setup for new developers
	@echo "🚀 Setting up the project..."
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "🏗️  Building packages..."
	pnpm run build
	@echo "🗄️  Setting up database..."
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo "✅ Setup complete! Run 'make dev' to start development."

install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	pnpm install

# Development
dev: ## Start development servers for all applications
	@echo "🚀 Starting development servers..."
	pnpm run dev

dev-api: ## Start only the API development server
	@echo "🚀 Starting API development server..."
	pnpm --filter @company/api run dev

dev-web: ## Start only the web development server
	@echo "🚀 Starting web development server..."
	pnpm --filter @company/web run dev

dev-mobile: ## Start only the mobile development server
	@echo "🚀 Starting mobile development server..."
	pnpm --filter @company/mobile run dev

# Building
build: ## Build all applications and packages
	@echo "🏗️  Building all applications and packages..."
	pnpm run build

build-affected: ## Build only affected packages since last commit
	@echo "🏗️  Building affected packages..."
	pnpm run build:affected

# Testing
test: ## Run all tests
	@echo "🧪 Running all tests..."
	pnpm run test

test-watch: ## Run tests in watch mode
	@echo "🧪 Running tests in watch mode..."
	pnpm run test:watch

test-coverage: ## Run tests with coverage report
	@echo "🧪 Running tests with coverage..."
	pnpm run test:coverage

test-e2e: ## Run end-to-end tests
	@echo "🧪 Running end-to-end tests..."
	pnpm run test:e2e

# Code Quality
lint: ## Run linting on all packages
	@echo "🔍 Running linting..."
	pnpm run lint

lint-fix: ## Fix linting issues automatically
	@echo "🔧 Fixing linting issues..."
	pnpm run lint:fix

format: ## Format code with Prettier
	@echo "💅 Formatting code..."
	pnpm run format

format-check: ## Check code formatting
	@echo "💅 Checking code formatting..."
	pnpm run format:check

type-check: ## Run TypeScript type checking
	@echo "📝 Running type check..."
	pnpm run type-check

# Database Operations
db-migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	pnpm run db:migrate

db-seed: ## Seed database with initial data
	@echo "🌱 Seeding database..."
	pnpm run db:seed

db-reset: ## Reset database (drop and recreate)
	@echo "🔄 Resetting database..."
	pnpm run db:reset

db-studio: ## Open database studio
	@echo "🎨 Opening database studio..."
	pnpm run db:studio

# Cleanup
clean: ## Clean build artifacts and node_modules
	@echo "🧹 Cleaning build artifacts..."
	pnpm run clean
	@echo "🧹 Removing node_modules..."
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@echo "✅ Cleanup complete!"

clean-cache: ## Clean only build cache
	@echo "🧹 Cleaning build cache..."
	pnpm run clean:cache

# Production
start: ## Start production servers
	@echo "🚀 Starting production servers..."
	pnpm run start

start-prod: ## Start production servers with optimizations
	@echo "🚀 Starting production servers with optimizations..."
	pnpm run start:prod

# Docker Operations
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	pnpm run docker:build

docker-up: ## Start Docker containers
	@echo "🐳 Starting Docker containers..."
	pnpm run docker:up

docker-down: ## Stop Docker containers
	@echo "🐳 Stopping Docker containers..."
	pnpm run docker:down

docker-logs: ## View Docker container logs
	@echo "📋 Viewing Docker logs..."
	docker-compose logs -f

# Deployment
deploy: ## Deploy to production
	@echo "🚀 Deploying to production..."
	pnpm run deploy

deploy-staging: ## Deploy to staging environment
	@echo "🚀 Deploying to staging..."
	NODE_ENV=staging pnpm run deploy

# Utilities
check-deps: ## Check for outdated dependencies
	@echo "🔍 Checking for outdated dependencies..."
	pnpm outdated

update-deps: ## Update dependencies
	@echo "📦 Updating dependencies..."
	pnpm update

security-audit: ## Run security audit
	@echo "🔒 Running security audit..."
	pnpm audit

generate: ## Run code generators
	@echo "⚡ Running code generators..."
	pnpm --filter @company/tools run generate

# Development Tools
storybook: ## Start Storybook for UI components
	@echo "📚 Starting Storybook..."
	pnpm --filter @company/ui run storybook

docs: ## Generate documentation
	@echo "📖 Generating documentation..."
	pnpm run docs

# Health Checks
health-check: ## Run health checks on all services
	@echo "🏥 Running health checks..."
	@curl -f http://localhost:3000/health || echo "API health check failed"
	@curl -f http://localhost:3001/health || echo "Web health check failed"

# Environment Setup
env-setup: ## Setup environment files
	@echo "⚙️  Setting up environment files..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file"; fi
	@if [ ! -f apps/api/.env ]; then cp apps/api/.env.example apps/api/.env; echo "Created API .env file"; fi
	@if [ ! -f apps/web/.env.local ]; then cp apps/web/.env.example apps/web/.env.local; echo "Created Web .env file"; fi

# Monitoring
logs: ## View application logs
	@echo "📋 Viewing application logs..."
	tail -f logs/*.log

monitor: ## Start monitoring dashboard
	@echo "📊 Starting monitoring dashboard..."
	docker-compose -f infrastructure/monitoring/docker-compose.yml up -d

# Backup
backup-db: ## Backup database
	@echo "💾 Backing up database..."
	@mkdir -p backups
	@pg_dump $(DATABASE_URL) > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup completed"

# New Automation Scripts
dev-services: ## Start all development services simultaneously
	@echo "🚀 Starting all development services..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/dev-services.ps1 start
else
	@./tools/scripts/dev-services.sh start
endif

dev-services-stop: ## Stop all development services
	@echo "🛑 Stopping all development services..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/dev-services.ps1 stop
else
	@./tools/scripts/dev-services.sh stop
endif

dev-services-status: ## Show development services status
	@echo "📊 Checking development services status..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/dev-services.ps1 status
else
	@./tools/scripts/dev-services.sh status
endif

quick-setup: ## One-command setup for new developers
	@echo "⚡ Running quick setup for new developers..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/quick-setup.ps1 full
else
	@echo "Please run: ./tools/scripts/quick-setup.ps1 full (PowerShell required)"
endif

quick-setup-minimal: ## Minimal setup (dependencies only)
	@echo "⚡ Running minimal setup..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/quick-setup.ps1 minimal
else
	@echo "Please run: ./tools/scripts/quick-setup.ps1 minimal (PowerShell required)"
endif

production-build: ## Build for production
	@echo "🏗️ Building for production..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/production-build.ps1 build
else
	@echo "Please run: ./tools/scripts/production-build.ps1 build (PowerShell required)"
endif

production-build-deploy: ## Build and deploy to production
	@echo "🚀 Building and deploying to production..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/production-build.ps1 build -Deploy -Environment production
else
	@echo "Please run: ./tools/scripts/production-build.ps1 build -Deploy -Environment production (PowerShell required)"
endif

# Database Operations
database-ops: ## Show database operations help
	@echo "🗄️ Database operations:"
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/database.ps1 help
else
	@echo "Please run: ./tools/scripts/database.ps1 help (PowerShell required)"
endif

db-backup: ## Create database backup
	@echo "💾 Creating database backup..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/database.ps1 backup
else
	@echo "Please run: ./tools/scripts/database.ps1 backup (PowerShell required)"
endif

db-restore: ## Restore database from backup (requires BACKUP_NAME)
	@echo "🔄 Restoring database..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/database.ps1 restore -Name $(BACKUP_NAME)
else
	@echo "Please run: ./tools/scripts/database.ps1 restore -Name <backup-name> (PowerShell required)"
endif

db-status: ## Show database status
	@echo "📊 Checking database status..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File ./tools/scripts/database.ps1 status
else
	@echo "Please run: ./tools/scripts/database.ps1 status (PowerShell required)"
endif

# Quick Commands
quick-start: install build db-migrate db-seed dev ## Quick start for new developers

full-check: lint type-check test ## Run all quality checks

ci-check: install build lint type-check test ## CI pipeline checks

# All-in-one commands
start-all: quick-setup dev-services ## Complete setup and start all services

stop-all: dev-services-stop docker-down ## Stop all services and infrastructure