# 🚀 Nexus Sales - Production Deployment Script (PowerShell)
# This script automates the deployment process to Vercel

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$DirectUrl = $env:DIRECT_URL,
    [string]$JwtSecret = $env:JWT_SECRET
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Nexus Sales Production Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check environment variables
function Check-EnvVars {
    Write-Host "📋 Checking environment variables..." -ForegroundColor Yellow

    if ([string]::IsNullOrEmpty($script:DatabaseUrl)) {
        Write-Host "❌ ERROR: DATABASE_URL not set" -ForegroundColor Red
        Write-Host "   Please set it with: `$env:DATABASE_URL='your-database-url'" -ForegroundColor Red
        exit 1
    }

    if ([string]::IsNullOrEmpty($script:DirectUrl)) {
        Write-Host "⚠️  WARNING: DIRECT_URL not set, using DATABASE_URL" -ForegroundColor Yellow
        $script:DirectUrl = $script:DatabaseUrl
    }

    if ([string]::IsNullOrEmpty($script:JwtSecret)) {
        Write-Host "⚠️  WARNING: JWT_SECRET not set, generating random one" -ForegroundColor Yellow
        $bytes = New-Object byte[] 32
        [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
        $script:JwtSecret = [Convert]::ToBase64String($bytes)
        Write-Host "   Generated JWT_SECRET: $($script:JwtSecret)" -ForegroundColor Yellow
        Write-Host "   Please save this for future use!" -ForegroundColor Yellow
    }

    Write-Host "✅ Environment variables OK" -ForegroundColor Green
    Write-Host ""
}

# Test database connection
function Test-Database {
    Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow

    Push-Location apps\web

    try {
        $env:DATABASE_URL = $script:DatabaseUrl
        npx prisma db execute --stdin --schema=prisma/schema.prisma "SELECT 1;" 2>&1 | Out-Null
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERROR: Cannot connect to database" -ForegroundColor Red
        Write-Host "   Please check your DATABASE_URL" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Pop-Location
    Write-Host ""
}

# Apply database migrations
function Apply-Migrations {
    Write-Host "📦 Applying database migrations..." -ForegroundColor Yellow

    Push-Location apps\web

    try {
        $env:DATABASE_URL = $script:DatabaseUrl
        npx prisma migrate deploy --schema=prisma/schema.prisma
        Write-Host "✅ Migrations applied successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERROR: Failed to apply migrations" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Pop-Location
    Write-Host ""
}

# Generate Prisma Client
function Generate-Prisma {
    Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow

    Push-Location apps\web

    try {
        npx prisma generate --schema=prisma/schema.prisma
        Write-Host "✅ Prisma Client generated" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERROR: Failed to generate Prisma Client" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Pop-Location
    Write-Host ""
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow

    # Check if vercel CLI is installed
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }

    Write-Host "🔐 Setting Vercel environment variables..." -ForegroundColor Yellow

    # Set environment variables
    try {
        echo $script:DatabaseUrl | vercel env add DATABASE_URL production 2>&1 | Out-Null
        echo $script:DirectUrl | vercel env add DIRECT_URL production 2>&1 | Out-Null
        echo $script:JwtSecret | vercel env add JWT_SECRET production 2>&1 | Out-Null
        echo "production" | vercel env add NODE_ENV production 2>&1 | Out-Null
    }
    catch {
        Write-Host "⚠️  Some environment variables may already exist" -ForegroundColor Yellow
    }

    Write-Host "📤 Deploying to production..." -ForegroundColor Yellow

    try {
        vercel --prod --yes
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERROR: Deployment failed" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }

    Write-Host ""
}

# Get deployment URL
function Get-DeploymentUrl {
    Write-Host "🌐 Getting deployment URL..." -ForegroundColor Yellow

    try {
        $output = vercel ls --prod 2>&1
        $lines = $output -split "`n"
        if ($lines.Length -gt 1) {
            $urlLine = $lines[1].Trim() -split '\s+'
            $script:DeploymentUrl = $urlLine[1]
            Write-Host "✅ Deployment URL: https://$($script:DeploymentUrl)" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Your application is live at: https://$($script:DeploymentUrl)" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "⚠️  Could not retrieve deployment URL" -ForegroundColor Yellow
        Write-Host "   Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Yellow
    }

    Write-Host ""
}

# Run smoke tests
function Run-SmokeTests {
    Write-Host "🧪 Running smoke tests..." -ForegroundColor Yellow

    if ([string]::IsNullOrEmpty($script:DeploymentUrl)) {
        $inputUrl = Read-Host "Enter your deployment URL (e.g., nexus-sales.vercel.app)"
        $baseUrl = "https://$inputUrl"
    }
    else {
        $baseUrl = "https://$($script:DeploymentUrl)"
    }

    Write-Host "Testing: $baseUrl" -ForegroundColor Cyan

    # Test health endpoint
    try {
        Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Host "✅ Health check passed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Health check failed" -ForegroundColor Red
    }

    # Test home page
    try {
        Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Host "✅ Home page accessible" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Home page failed" -ForegroundColor Red
    }

    Write-Host ""
}

# Main deployment flow
function Main {
    Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   Nexus Sales Production Deployment" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    Check-EnvVars
    Test-Database
    Apply-Migrations
    Generate-Prisma
    Deploy-Vercel
    Get-DeploymentUrl
    Run-SmokeTests

    Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Visit your application" -ForegroundColor White
    Write-Host "   2. Test user registration and login" -ForegroundColor White
    Write-Host "   3. Create a product and order" -ForegroundColor White
    Write-Host "   4. Check analytics dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Monitor your deployment:" -ForegroundColor Yellow
    Write-Host "   - Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   - Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host ""
}

# Run main function
Main
