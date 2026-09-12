#!/bin/bash

echo "🚀 Building Trading Bot Dashboard..."
echo ""

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node -v)
echo "Node.js: $node_version"

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version)
echo "Python: $python_version"

echo ""
echo "📦 Building Backend..."
cd backend
pip install -q -r requirements.txt
echo "✅ Backend ready"

echo ""
echo "📦 Building Frontend..."
cd ../frontend
npm install -q
npm run build
echo "✅ Frontend built: dist/"

echo ""
echo "📦 Building Mobile APK..."
cd ../mobile
npm install -q
npm run build:apk
echo "✅ APK ready: dist/app.apk"

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Artifacts:"
echo "  • Backend: backend/app.py"
echo "  • Frontend: frontend/dist/"
echo "  • Mobile APK: mobile/dist/app.apk"
