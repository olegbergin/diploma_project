#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Clearing log files...${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Clear log files
> logs/backend.log
> logs/frontend.log

echo -e "${GREEN}✅ Log files cleared${NC}"
echo -e "${YELLOW}Files cleared:${NC}"
echo "  - logs/backend.log"
echo "  - logs/frontend.log"