from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from dotenv import load_dotenv
import os
from datetime import datetime, timezone, timedelta
import asyncio
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///trading_bot.db')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# ============================================================
# DATABASE MODELS
# ============================================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    api_key = db.Column(db.String(255), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    trades = db.relationship('Trade', backref='user', lazy=True, cascade='all, delete-orphan')
    settings = db.relationship('RobotSettings', backref='user', lazy=True, cascade='all, delete-orphan')
    referrals = db.relationship('Referral', backref='user', lazy=True, cascade='all, delete-orphan')

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    direction = db.Column(db.String(10), nullable=False)  # LONG or SHORT
    entry_price = db.Column(db.Float, nullable=False)
    entry_time = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    exit_price = db.Column(db.Float)
    exit_time = db.Column(db.DateTime)
    quantity = db.Column(db.Float, nullable=False)
    leverage = db.Column(db.Integer, default=1)
    status = db.Column(db.String(20), default='OPEN')  # OPEN, CLOSED, CANCELLED
    pnl = db.Column(db.Float, default=0.0)
    pnl_percent = db.Column(db.Float, default=0.0)
    channel = db.Column(db.String(20))  # BTR, ELITE, PREMIUM
    targets = db.Column(db.JSON, default=[])
    stop_loss = db.Column(db.Float)
    take_profits_hit = db.Column(db.JSON, default=[])
    order_id = db.Column(db.String(100))
    entry_mode = db.Column(db.String(50))  # BREAKOUT, INSTANT_MARKET, etc
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

class Signal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    direction = db.Column(db.String(10), nullable=False)
    entry = db.Column(db.Float, nullable=False)
    targets = db.Column(db.JSON, default=[])
    stop_loss = db.Column(db.Float)
    leverage = db.Column(db.Integer)
    channel = db.Column(db.String(20))
    status = db.Column(db.String(20), default='PENDING')  # PENDING, EXECUTED, EXPIRED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime)
    executed_trade_id = db.Column(db.Integer, db.ForeignKey('trade.id'))

class RobotSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    trade_notional = db.Column(db.Float, default=6.0)
    default_leverage = db.Column(db.Integer, default=10)
    max_simultaneous_trades = db.Column(db.Integer, default=5)
    max_hold_hours = db.Column(db.Integer, default=24)
    signal_expiry_hours = db.Column(db.Integer, default=24)
    tp_percentages = db.Column(db.JSON, default=[25.0, 25.0, 25.0, 25.0])
    trailing_stop_enabled = db.Column(db.Boolean, default=True)
    trailing_callback_percent = db.Column(db.Float, default=0.8)
    breakeven_after_tp1 = db.Column(db.Boolean, default=True)
    compounding_enabled = db.Column(db.Boolean, default=False)
    compound_percent = db.Column(db.Float, default=10.0)
    channels = db.Column(db.JSON, default=['BTR', 'ELITE', 'PREMIUM'])
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # TRADE_OPENED, TP_HIT, SL_HIT, etc
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    related_trade_id = db.Column(db.Integer, db.ForeignKey('trade.id'))

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    referral_code = db.Column(db.String(50), unique=True, nullable=False)
    referred_users = db.Column(db.Integer, default=0)
    commission_earned = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

class MarketIndicator(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), nullable=False, unique=True)
    price = db.Column(db.Float)
    market_cap = db.Column(db.Float)
    volume_24h = db.Column(db.Float)
    change_24h = db.Column(db.Float)
    rsi = db.Column(db.Float)
    macd = db.Column(db.Float)
    bollinger_upper = db.Column(db.Float)
    bollinger_lower = db.Column(db.Float)
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

# ============================================================
# AUTHENTICATION ROUTES
# ============================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    from werkzeug.security import generate_password_hash
    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create default settings
    settings = RobotSettings(user_id=user.id)
    db.session.add(settings)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not all([username, password]):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    from werkzeug.security import check_password_hash
    if not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

# ============================================================
# DASHBOARD ROUTES
# ============================================================

@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def dashboard_summary():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate statistics
    open_trades = Trade.query.filter_by(user_id=user_id, status='OPEN').all()
    closed_trades = Trade.query.filter_by(user_id=user_id, status='CLOSED').all()
    
    total_pnl = sum(t.pnl for t in closed_trades)
    win_count = len([t for t in closed_trades if t.pnl > 0])
    lose_count = len([t for t in closed_trades if t.pnl < 0])
    win_rate = (win_count / (win_count + lose_count) * 100) if (win_count + lose_count) > 0 else 0
    
    total_volume = sum(t.quantity * t.entry_price for t in closed_trades)
    
    return jsonify({
        'open_trades': len(open_trades),
        'closed_trades': len(closed_trades),
        'total_pnl': total_pnl,
        'win_rate': win_rate,
        'win_count': win_count,
        'lose_count': lose_count,
        'total_volume': total_volume,
        'open_trades_data': [
            {
                'id': t.id,
                'symbol': t.symbol,
                'direction': t.direction,
                'entry_price': t.entry_price,
                'quantity': t.quantity,
                'leverage': t.leverage,
                'entry_time': t.entry_time.isoformat(),
                'channel': t.channel
            } for t in open_trades
        ]
    }), 200

@app.route('/api/trades', methods=['GET'])
@jwt_required()
def get_trades():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    status = request.args.get('status', 'all')
    limit = int(request.args.get('limit', 50))
    
    query = Trade.query.filter_by(user_id=user_id)
    if status != 'all':
        query = query.filter_by(status=status)
    
    trades = query.order_by(Trade.created_at.desc()).limit(limit).all()
    
    return jsonify([
        {
            'id': t.id,
            'symbol': t.symbol,
            'direction': t.direction,
            'entry_price': t.entry_price,
            'exit_price': t.exit_price,
            'quantity': t.quantity,
            'leverage': t.leverage,
            'status': t.status,
            'pnl': t.pnl,
            'pnl_percent': t.pnl_percent,
            'entry_time': t.entry_time.isoformat(),
            'exit_time': t.exit_time.isoformat() if t.exit_time else None,
            'channel': t.channel,
            'entry_mode': t.entry_mode
        } for t in trades
    ]), 200

@app.route('/api/trades/<int:trade_id>/close', methods=['POST'])
@jwt_required()
def close_trade(trade_id):
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    trade = Trade.query.filter_by(id=trade_id, user_id=user_id).first()
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    data = request.get_json()
    exit_price = data.get('exit_price')
    
    trade.exit_price = exit_price
    trade.exit_time = datetime.now(timezone.utc)
    trade.status = 'CLOSED'
    
    if trade.direction == 'LONG':
        trade.pnl = (exit_price - trade.entry_price) * trade.quantity
    else:
        trade.pnl = (trade.entry_price - exit_price) * trade.quantity
    
    trade.pnl_percent = (trade.pnl / (trade.entry_price * trade.quantity)) * 100 if trade.entry_price * trade.quantity != 0 else 0
    
    db.session.commit()
    
    return jsonify({
        'message': 'Trade closed successfully',
        'trade': {
            'id': trade.id,
            'pnl': trade.pnl,
            'pnl_percent': trade.pnl_percent
        }
    }), 200

# ============================================================
# ROBOT SETTINGS ROUTES
# ============================================================

@app.route('/api/settings/robot', methods=['GET'])
@jwt_required()
def get_robot_settings():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    settings = RobotSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    return jsonify({
        'id': settings.id,
        'is_active': settings.is_active,
        'trade_notional': settings.trade_notional,
        'default_leverage': settings.default_leverage,
        'max_simultaneous_trades': settings.max_simultaneous_trades,
        'max_hold_hours': settings.max_hold_hours,
        'signal_expiry_hours': settings.signal_expiry_hours,
        'tp_percentages': settings.tp_percentages,
        'trailing_stop_enabled': settings.trailing_stop_enabled,
        'trailing_callback_percent': settings.trailing_callback_percent,
        'breakeven_after_tp1': settings.breakeven_after_tp1,
        'compounding_enabled': settings.compounding_enabled,
        'compound_percent': settings.compound_percent,
        'channels': settings.channels
    }), 200

@app.route('/api/settings/robot', methods=['PUT'])
@jwt_required()
def update_robot_settings():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    settings = RobotSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    data = request.get_json()
    
    for key, value in data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
    
    settings.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    
    return jsonify({
        'message': 'Settings updated successfully',
        'settings': {
            'is_active': settings.is_active,
            'trade_notional': settings.trade_notional,
            'default_leverage': settings.default_leverage,
            'max_simultaneous_trades': settings.max_simultaneous_trades
        }
    }), 200

# ============================================================
# ALERTS/INBOX ROUTES
# ============================================================

@app.route('/api/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    limit = int(request.args.get('limit', 50))
    unread_only = request.args.get('unread', 'false').lower() == 'true'
    
    query = Alert.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    
    return jsonify([
        {
            'id': a.id,
            'type': a.type,
            'title': a.title,
            'message': a.message,
            'is_read': a.is_read,
            'created_at': a.created_at.isoformat(),
            'related_trade_id': a.related_trade_id
        } for a in alerts
    ]), 200

@app.route('/api/alerts/<int:alert_id>/read', methods=['PUT'])
@jwt_required()
def mark_alert_read(alert_id):
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    alert = Alert.query.filter_by(id=alert_id, user_id=user_id).first()
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    alert.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Alert marked as read'}), 200

@app.route('/api/alerts/read-all', methods=['PUT'])
@jwt_required()
def mark_all_alerts_read():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    Alert.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    
    return jsonify({'message': 'All alerts marked as read'}), 200

# ============================================================
# REFERRAL ROUTES
# ============================================================

@app.route('/api/referral', methods=['GET'])
@jwt_required()
def get_referral():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    
    referral = Referral.query.filter_by(user_id=user_id).first()
    if not referral:
        # Create new referral code
        import uuid
        referral_code = str(uuid.uuid4())[:8].upper()
        referral = Referral(user_id=user_id, referral_code=referral_code)
        db.session.add(referral)
        db.session.commit()
    
    return jsonify({
        'referral_code': referral.referral_code,
        'referred_users': referral.referred_users,
        'commission_earned': referral.commission_earned,
        'is_active': referral.is_active
    }), 200

# ============================================================
# MARKET INDICATORS ROUTES
# ============================================================

@app.route('/api/market/indicators', methods=['GET'])
def get_market_indicators():
    limit = int(request.args.get('limit', 20))
    indicators = MarketIndicator.query.order_by(MarketIndicator.updated_at.desc()).limit(limit).all()
    
    return jsonify([
        {
            'symbol': ind.symbol,
            'price': ind.price,
            'market_cap': ind.market_cap,
            'volume_24h': ind.volume_24h,
            'change_24h': ind.change_24h,
            'rsi': ind.rsi,
            'macd': ind.macd,
            'bollinger_upper': ind.bollinger_upper,
            'bollinger_lower': ind.bollinger_lower,
            'updated_at': ind.updated_at.isoformat()
        } for ind in indicators
    ]), 200

# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
