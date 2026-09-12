# Professional Telegram Trading Bot Dashboard

A complete full-stack solution for managing your MONSTER Telegram trading bot with a professional dashboard, mobile app, and REST API.

## Features

### 🤖 Bot Management
- **3 Channel Support**: BTR (breakout), Elite (instant market), Premium (range-based)
- **Automated Trading**: Signal parsing and instant execution
- **Risk Management**: Configurable leverage, stop loss, take profits
- **Trade History**: Complete tracking of all trades with P/L calculations

### 📊 Professional Dashboard
- **Live Statistics**: Real-time P/L, win rate, active trades
- **Trade Management**: Open/close positions, monitor active trades
- **Robot Settings**: Configure bot parameters from UI (Cornix/3commas style)
- **Market Indicators**: Real-time market data and technical indicators
- **Alert Inbox**: Message center for trade notifications
- **Referral System**: Track referrals and commissions

### 📱 Mobile App (APK)
- **Cross-Platform**: React Native with Expo
- **Full Features**: Dashboard, trades, settings, alerts on mobile
- **Push Notifications**: Real-time trading alerts
- **Offline Support**: View cached data offline

### 🔐 Security
- **JWT Authentication**: Secure API endpoints
- **Password Hashing**: Werkzeug security
- **API Key Management**: Encrypted credential storage
- **Role-Based Access**: User isolation

## Project Structure

```
.
├── backend/                 # Flask REST API
│   ├── app.py              # Main Flask app with all routes
│   ├── bot_integration.py   # Bot-Dashboard bridge
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/                # React Web Dashboard
│   ├── src/
│   │   ├── pages/          # Dashboard, Trades, Settings
│   │   ├── stores/         # Zustand state management
│   │   └── App.jsx         # Main app component
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
│
├── mobile/                  # React Native Mobile App
│   ├── App.js              # App navigator
│   ├── screens/            # Mobile screens (4 tabs)
│   ├── stores/             # Zustand stores for mobile
│   ├── app.json            # Expo app config
│   └── package.json        # React Native dependencies
│
├── docker/                  # Docker configurations
│   ├── Dockerfile.backend   # Python backend container
│   └── Dockerfile.frontend  # Node frontend container
│
├── docker-compose.yml       # Full stack orchestration
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)
- Expo CLI (for mobile: `npm install -g expo-cli`)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Mobile App Setup

```bash
cd mobile
npm install
npm start
```

Then choose:
- `android` - Run on Android emulator/device
- `ios` - Run on iOS simulator (macOS only)
- `web` - Run in browser

### Generate APK

```bash
cd mobile
npm run build:apk
```

APK will be generated in `./dist/` directory

### Docker Deployment

```bash
# Copy and edit environment file
cp backend/.env.example backend/.env

# Start full stack
docker-compose up --build
```

Services:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Database: `localhost:5432`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard/summary` - Dashboard statistics
- `GET /api/trades` - List trades (filters: status, limit)
- `POST /api/trades/{id}/close` - Close trade

### Settings
- `GET /api/settings/robot` - Get robot settings
- `PUT /api/settings/robot` - Update robot settings

### Alerts
- `GET /api/alerts` - Get alerts (filters: unread, limit)
- `PUT /api/alerts/{id}/read` - Mark alert as read
- `PUT /api/alerts/read-all` - Mark all alerts as read

### Referral
- `GET /api/referral` - Get referral info

### Market
- `GET /api/market/indicators` - Get market indicators

## Robot Settings Available

✅ Trade notional (USDT)
✅ Default leverage (1-125x)
✅ Max simultaneous trades
✅ Max hold hours
✅ Signal expiry hours
✅ Take profit distribution
✅ Trailing stop
✅ Breakeven after TP1
✅ Compounding mode
✅ Active channels selection
✅ TP percentages (4 TPs configurable)
✅ Trailing callback percent

## Database Models

### User
- id, username, email, password_hash
- api_key, is_active
- created_at, updated_at

### Trade
- id, symbol, direction, entry_price, exit_price
- quantity, leverage, status (OPEN/CLOSED/CANCELLED)
- pnl, pnl_percent, channel, entry_mode
- targets, stop_loss, take_profits_hit
- created_at, updated_at

### Signal
- id, symbol, direction, entry, targets
- leverage, channel, status (PENDING/EXECUTED/EXPIRED/CANCELLED)
- created_at, expires_at

### RobotSettings
- id, user_id, is_active
- All configurable bot parameters
- created_at, updated_at

### Alert
- id, type, title, message
- is_read, related_trade_id
- created_at

### Referral
- id, referral_code, referred_users
- commission_earned, is_active
- created_at, updated_at

### MarketIndicator
- id, symbol, price, market_cap
- volume_24h, change_24h, rsi, macd
- bollinger_upper, bollinger_lower

## Integration with bot.py

The dashboard integrates with your existing bot.py via `bot_integration.py`:

```python
from bot_integration import BotIntegration

# Initialize with user ID
integration = BotIntegration(user_id=1)

# Log signals
integration.log_signal(signal_data)

# Log trades
integration.log_trade(signal_data, order_info)

# Update take profits
integration.update_trade_tp(trade_id, tp_index, close_price, pnl)

# Close trades
integration.close_trade(trade_id, exit_price, "Manual close")

# Fetch settings
settings = integration.get_robot_settings()
```

## Mobile App Features

### Dashboard Tab
- Total P/L with color coding
- Win rate percentage
- Open trades count
- Closed trades count
- Active trades list with entry prices

### Trades Tab
- Filter by status (All/Open/Closed)
- Trade details with P/L
- Close trade button for open positions

### Alerts Tab
- Real-time trading alerts
- Filter by read status
- Mark individual or all alerts as read
- Color-coded alert types

### Settings Tab
- User profile info
- Trading configuration
- Feature toggles
- Save settings
- Logout

## Environment Variables

### Backend (.env)
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///trading_bot.db
JWT_SECRET_KEY=your-jwt-secret
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Building for Production

### Web Dashboard
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting
```

### Android APK
```bash
cd mobile
npm run build:apk
# APK ready in dist/
```

### Docker
```bash
docker-compose up --build
```

## Features Coming Soon

- 📊 Advanced charting
- 🔔 Push notifications
- 📈 Performance analytics
- 🎯 Signal backtesting
- 💰 Portfolio diversification
- 🌙 Dark/Light mode toggle
- 🔐 2FA authentication
- 📱 iOS app (TestFlight)

## Troubleshooting

### Backend won't start
```bash
# Clear database and restart
rm trading_bot.db
python app.py
```

### CORS errors
Update `VITE_API_URL` in frontend .env to match your backend URL

### Mobile app not connecting
Update `API_URL` in `mobile/stores/*.js` to your backend IP

### Docker issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build --remove-orphans
```

## Support

For issues with the bot.py integration, refer to the Monster Bot documentation.

## License

MIT License - See LICENSE file for details

## Security Notes

⚠️ **IMPORTANT**:
1. Change all default credentials before deployment
2. Use strong JWT_SECRET_KEY
3. Never commit .env files with real credentials
4. Use HTTPS in production
5. Rotate API keys regularly
6. Enable database backups

## Support Channels

- 📧 Email: support@example.com
- 🐛 Issues: GitHub Issues
- 💬 Discord: Join our community
