# Install dependencies
cd backend
pip install -r requirements.txt

cd ../frontend
npm install

cd ../mobile
npm install

echo "✅ All dependencies installed!"
echo ""
echo "Quick Start:"
echo "  Backend: cd backend && python app.py"
echo "  Frontend: cd frontend && npm run dev"
echo "  Mobile: cd mobile && npm start"
echo ""
echo "Docker: docker-compose up --build"
