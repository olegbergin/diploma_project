#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}======================================${NC}"
echo -e "${PURPLE}  DIPLOMA PROJECT INITIALIZATION     ${NC}"
echo -e "${PURPLE}======================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo -e "${BLUE}🔍 Checking Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check npm
echo -e "${BLUE}🔍 Checking npm...${NC}"
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi

# Check MySQL
echo -e "${BLUE}🔍 Checking MySQL...${NC}"
if command_exists mysql; then
    MYSQL_VERSION=$(mysql --version | head -n1)
    echo -e "${GREEN}✅ MySQL found: $MYSQL_VERSION${NC}"
else
    echo -e "${RED}❌ MySQL not found. Please install MySQL first.${NC}"
    exit 1
fi

# Check if MySQL service is running
echo -e "${BLUE}🔍 Checking MySQL service...${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL service is running${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL service is not running. Starting...${NC}"
    sudo systemctl start mysql
    if systemctl is-active --quiet mysql; then
        echo -e "${GREEN}✅ MySQL service started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start MySQL service${NC}"
        exit 1
    fi
fi

# Create database if it doesn't exist
echo -e "${BLUE}🗄️  Setting up database...${NC}"
if mysql -u root -e "USE project_db;" 2>/dev/null; then
    echo -e "${GREEN}✅ Database 'project_db' already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating database 'project_db'...${NC}"
    mysql -u root -e "CREATE DATABASE project_db;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    fi
fi

# Import database dump if exists
if [ -f "project_db_dump.sql" ]; then
    echo -e "${BLUE}📥 Importing database dump...${NC}"
    mysql -u root project_db < project_db_dump.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database dump imported successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Failed to import database dump${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No database dump found (project_db_dump.sql)${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Backend package.json not found${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

cd ..

# Make start.sh executable
chmod +x start.sh

echo ""
echo -e "${GREEN}🎉 INITIALIZATION COMPLETE! 🎉${NC}"
echo ""
echo -e "${PURPLE}======================================${NC}"
echo -e "${PURPLE}  READY TO START THE PROJECT         ${NC}"
echo -e "${PURPLE}======================================${NC}"
echo ""
echo -e "${BLUE}To start the application, run:${NC}"
echo -e "${YELLOW}  ./start.sh${NC}"
echo ""
echo -e "${BLUE}This will start:${NC}"
echo -e "${YELLOW}  • Backend on http://localhost:3030${NC}"
echo -e "${YELLOW}  • Frontend on http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"