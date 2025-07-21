#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Initializing Diploma Project...${NC}"

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo -e "${RED}❌ MySQL is not running. Please start MySQL first:${NC}"
    echo "sudo systemctl start mysql"
    exit 1
fi

# Check if database exists
if ! mysql -u root -e "USE project_db;" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Database 'project_db' not found. Please create it first.${NC}"
    echo "mysql -u root -e 'CREATE DATABASE project_db;'"
    echo "mysql -u root project_db < project_db_dump.sql"
    exit 1
fi

echo -e "${GREEN}✅ MySQL and database check passed${NC}"

# Install dependencies if needed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

cd ..

echo -e "${GREEN}✅ Dependencies ready${NC}"

# Start backend on port 3030
echo -e "${BLUE}🔧 Starting Backend on port 3030...${NC}"
cd backend
PORT=3030 npm start &
BACKEND_PID=$!
echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"

# Wait a moment for backend to start
sleep 2

cd ../frontend
echo -e "${BLUE}🎨 Starting Frontend on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}🎉 Both servers are running!${NC}"
echo -e "${YELLOW}Backend:${NC}  http://localhost:3030"
echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT
wait