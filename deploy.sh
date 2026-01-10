#!/bin/bash

# 🚀 Gogamee Deployment Script
# Run this script to deploy updates to your VPS

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Step 1: Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main || git pull origin master

# Step 2: Install/Update dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Step 3: Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Please check the errors above.${NC}"
    exit 1
fi

# Step 4: Restart PM2 process
echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart gogamee || pm2 start ecosystem.config.js

# Step 5: Show status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}📊 Application status:${NC}"
pm2 status

echo -e "${GREEN}🎉 Your application is now updated and running!${NC}"

