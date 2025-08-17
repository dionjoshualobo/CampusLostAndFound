#!/bin/bash

# Deployment Script for Campus Lost and Found
# This script prepares the application for deployment

echo "🚀 Campus Lost and Found - Deployment Preparation"
echo "================================================="

# Build the client
echo "📦 Building client application..."
cd src/client
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Client build successful!"
else
    echo "❌ Client build failed!"
    exit 1
fi

cd ../..

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Deployment files:"
echo "  📁 src/client/dist/ - Frontend build"
echo ""
echo "Next steps:"
echo "  1. Deploy frontend to Vercel (automatic from git)"
echo "  2. Deploy backend to Railway/Render/Heroku"
echo "  3. Update environment variables"
echo ""
echo "🌐 Ready for deployment!"
