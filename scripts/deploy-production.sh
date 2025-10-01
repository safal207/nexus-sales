#!/bin/bash

# 🚀 Nexus Sales - Production Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

echo "🚀 Starting Nexus Sales Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
        echo "   Please set it with: export DATABASE_URL='your-database-url'"
        exit 1
    fi

    if [ -z "$DIRECT_URL" ]; then
        echo -e "${YELLOW}⚠️  WARNING: DIRECT_URL not set, using DATABASE_URL${NC}"
        export DIRECT_URL=$DATABASE_URL
    fi

    if [ -z "$JWT_SECRET" ]; then
        echo -e "${YELLOW}⚠️  WARNING: JWT_SECRET not set, generating random one${NC}"
        export JWT_SECRET=$(openssl rand -base64 32)
        echo "   Generated JWT_SECRET: $JWT_SECRET"
        echo "   Please save this for future use!"
    fi

    echo -e "${GREEN}✅ Environment variables OK${NC}"
    echo ""
}

# Test database connection
test_database() {
    echo "🔌 Testing database connection..."

    cd apps/web

    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ ERROR: Cannot connect to database${NC}"
        echo "   Please check your DATABASE_URL"
        exit 1
    fi

    cd ../..
    echo ""
}

# Apply database migrations
apply_migrations() {
    echo "📦 Applying database migrations..."

    cd apps/web

    if npx prisma migrate deploy; then
        echo -e "${GREEN}✅ Migrations applied successfully${NC}"
    else
        echo -e "${RED}❌ ERROR: Failed to apply migrations${NC}"
        exit 1
    fi

    cd ../..
    echo ""
}

# Generate Prisma Client
generate_prisma() {
    echo "🔧 Generating Prisma Client..."

    cd apps/web

    if npx prisma generate; then
        echo -e "${GREEN}✅ Prisma Client generated${NC}"
    else
        echo -e "${RED}❌ ERROR: Failed to generate Prisma Client${NC}"
        exit 1
    fi

    cd ../..
    echo ""
}

# Deploy to Vercel
deploy_vercel() {
    echo "🚀 Deploying to Vercel..."

    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Set environment variables for Vercel
    echo "🔐 Setting Vercel environment variables..."

    vercel env add DATABASE_URL production <<< "$DATABASE_URL" || true
    vercel env add DIRECT_URL production <<< "$DIRECT_URL" || true
    vercel env add JWT_SECRET production <<< "$JWT_SECRET" || true
    vercel env add NODE_ENV production <<< "production" || true

    # Deploy
    echo "📤 Deploying to production..."

    if vercel --prod --yes; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
    else
        echo -e "${RED}❌ ERROR: Deployment failed${NC}"
        exit 1
    fi

    echo ""
}

# Get deployment URL
get_deployment_url() {
    echo "🌐 Getting deployment URL..."

    DEPLOYMENT_URL=$(vercel ls --prod | head -n 2 | tail -n 1 | awk '{print $2}')

    if [ -n "$DEPLOYMENT_URL" ]; then
        echo -e "${GREEN}✅ Deployment URL: https://$DEPLOYMENT_URL${NC}"
        echo ""
        echo "🎉 Your application is live at: https://$DEPLOYMENT_URL"
    else
        echo -e "${YELLOW}⚠️  Could not retrieve deployment URL${NC}"
        echo "   Check Vercel dashboard: https://vercel.com/dashboard"
    fi

    echo ""
}

# Run smoke tests
smoke_tests() {
    echo "🧪 Running smoke tests..."

    if [ -n "$DEPLOYMENT_URL" ]; then
        BASE_URL="https://$DEPLOYMENT_URL"
    else
        read -p "Enter your deployment URL (e.g., nexus-sales.vercel.app): " INPUT_URL
        BASE_URL="https://$INPUT_URL"
    fi

    echo "Testing: $BASE_URL"

    # Test health endpoint
    if curl -s -f "$BASE_URL/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
    fi

    # Test home page
    if curl -s -f "$BASE_URL/" > /dev/null; then
        echo -e "${GREEN}✅ Home page accessible${NC}"
    else
        echo -e "${RED}❌ Home page failed${NC}"
    fi

    echo ""
}

# Main deployment flow
main() {
    echo "════════════════════════════════════════════"
    echo "   Nexus Sales Production Deployment"
    echo "════════════════════════════════════════════"
    echo ""

    check_env_vars
    test_database
    apply_migrations
    generate_prisma
    deploy_vercel
    get_deployment_url
    smoke_tests

    echo "════════════════════════════════════════════"
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo "════════════════════════════════════════════"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Visit your application"
    echo "   2. Test user registration and login"
    echo "   3. Create a product and order"
    echo "   4. Check analytics dashboard"
    echo ""
    echo "📊 Monitor your deployment:"
    echo "   - Vercel Dashboard: https://vercel.com/dashboard"
    echo "   - Supabase Dashboard: https://supabase.com/dashboard"
    echo ""
}

# Run main function
main
