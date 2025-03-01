#!/bin/bash

# Check container health
check_containers() {
    echo "Checking container status..."
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"
}

# Check disk usage
check_disk() {
    echo -e "\nChecking disk usage..."
    df -h /
}

# Check memory usage
check_memory() {
    echo -e "\nChecking memory usage..."
    free -h
}

# Check logs for errors
check_logs() {
    echo -e "\nChecking for errors in logs..."
    docker-compose -f docker-compose.prod.yml logs --tail=100 | grep -i "error"
}

# Run all checks
check_containers
check_disk
check_memory
check_logs