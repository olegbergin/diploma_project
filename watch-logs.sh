#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Log Viewer for Diploma Project${NC}"
echo ""

# Check if log files exist
if [ ! -f "logs/backend.log" ] && [ ! -f "logs/frontend.log" ]; then
    echo -e "${RED}❌ No log files found. Start the servers first with ./start.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}Available options:${NC}"
echo "1. Watch backend logs only"
echo "2. Watch frontend logs only" 
echo "3. Watch both logs (interleaved)"
echo "4. Show last 50 lines of backend logs"
echo "5. Show last 50 lines of frontend logs"
echo ""

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}🔍 Watching backend logs (Ctrl+C to exit)...${NC}"
        tail -f logs/backend.log
        ;;
    2)
        echo -e "${GREEN}🔍 Watching frontend logs (Ctrl+C to exit)...${NC}"
        tail -f logs/frontend.log
        ;;
    3)
        echo -e "${GREEN}🔍 Watching both logs (Ctrl+C to exit)...${NC}"
        tail -f logs/*.log
        ;;
    4)
        echo -e "${GREEN}📄 Last 50 lines of backend logs:${NC}"
        echo ""
        tail -n 50 logs/backend.log
        ;;
    5)
        echo -e "${GREEN}📄 Last 50 lines of frontend logs:${NC}"
        echo ""
        tail -n 50 logs/frontend.log
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac