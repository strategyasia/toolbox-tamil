#!/bin/bash

# ToolBox Tamil - Quick Start Script
# This script starts a local web server to test the website

echo "🚀 Starting ToolBox Tamil local server..."
echo ""
echo "Choose your preferred server:"
echo "1) Python 3 (Recommended)"
echo "2) Python 2"
echo "3) Node.js (requires http-server: npm install -g http-server)"
echo ""
read -p "Enter choice (1-3): " choice

PORT=8000

case $choice in
    1)
        echo "Starting Python 3 server on port $PORT..."
        python3 -m http.server $PORT
        ;;
    2)
        echo "Starting Python 2 server on port $PORT..."
        python -m SimpleHTTPServer $PORT
        ;;
    3)
        echo "Starting Node.js server on port $PORT..."
        http-server -p $PORT
        ;;
    *)
        echo "Invalid choice. Starting with Python 3..."
        python3 -m http.server $PORT
        ;;
esac

echo ""
echo "Server started! Open your browser and visit:"
echo "http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
