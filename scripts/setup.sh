#!/bin/bash

# Development Setup Script for Campus Lost and Found
# This script sets up the development environment

echo "🏫 Campus Lost and Found - Development Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd src/client
npm install
cd ../..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd src/server
npm install
cd ../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start both client and server"
echo "  npm run dev:client   - Start only client (React)"
echo "  npm run dev:server   - Start only server (Express)"
echo "  npm run build        - Build client for production"
echo ""
echo "📝 Don't forget to:"
echo "  1. Set up your environment variables in src/server/.env"
echo "  2. Configure your database connection"
echo "  3. Review the documentation in docs/"
echo ""
echo "🚀 Happy coding!"
