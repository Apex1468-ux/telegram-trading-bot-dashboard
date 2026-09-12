import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from app import app, db, Trade, Signal, Alert, RobotSettings
import sys
sys.path.insert(0, '..')  # Access bot.py from parent directory

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | BOT-INTEGRATION | %(message)s",
)
log = logging.getLogger("BOT-INTEGRATION")

class BotIntegration:
    """Bridges the Monster bot with the Flask dashboard database"""
    
    def __init__(self, user_id):
        self.user_id = user_id
        self.app = app
    
    def log_signal(self, signal_data):
        """Log parsed signal to database"""
        with self.app.app_context():
            try:
                sig = Signal(
                    user_id=self.user_id,
                    symbol=signal_data['symbol'],
                    direction=signal_data['direction'],
                    entry=signal_data['entry'],
                    targets=signal_data['targets'],
                    stop_loss=signal_data['sl'],
                    leverage=signal_data.get('leverage', 1),
                    channel=signal_data.get('channel', 'UNKNOWN'),
                    status='PENDING'
                )
                db.session.add(sig)
                db.session.commit()
                log.info(f"Signal logged: {signal_data['symbol']} {signal_data['direction']}")
                return sig.id
            except Exception as e:
                log.error(f"Signal log error: {e}")
                return None
    
    def log_trade(self, signal_data, order_info):
        """Log opened trade to database"""
        with self.app.app_context():
            try:
                trade = Trade(
                    user_id=self.user_id,
                    symbol=signal_data['symbol'],
                    direction=signal_data['direction'],
                    entry_price=order_info['entry_price'],
                    quantity=order_info['quantity'],
                    leverage=signal_data.get('leverage', 1),
                    channel=signal_data.get('channel', 'UNKNOWN'),
                    targets=signal_data['targets'],
                    stop_loss=signal_data['sl'],
                    order_id=order_info.get('order_id'),
                    entry_mode=signal_data.get('entry_mode', 'UNKNOWN'),
                    status='OPEN'
                )
                db.session.add(trade)
                db.session.commit()
                
                # Create alert
                alert = Alert(
                    user_id=self.user_id,
                    type='TRADE_OPENED',
                    title=f"Trade Opened: {signal_data['symbol']}",
                    message=f"{signal_data['direction']} {signal_data['symbol']} @ {order_info['entry_price']}",
                    related_trade_id=trade.id
                )
                db.session.add(alert)
                db.session.commit()
                
                log.info(f"Trade logged: {signal_data['symbol']} {signal_data['direction']}")
                return trade.id
            except Exception as e:
                log.error(f"Trade log error: {e}")
                return None
    
    def update_trade_tp(self, trade_id, tp_index, close_price, pnl):
        """Update trade when take profit is hit"""
        with self.app.app_context():
            try:
                trade = Trade.query.get(trade_id)
                if not trade:
                    return False
                
                if not trade.take_profits_hit:
                    trade.take_profits_hit = []
                
                trade.take_profits_hit.append({
                    'tp_index': tp_index,
                    'close_price': close_price,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })
                
                db.session.commit()
                
                # Create alert
                alert = Alert(
                    user_id=self.user_id,
                    type='TP_HIT',
                    title=f"TP{tp_index + 1} Hit: {trade.symbol}",
                    message=f"Take Profit {tp_index + 1} hit at {close_price}. P/L: ${pnl:.6f}",
                    related_trade_id=trade.id
                )
                db.session.add(alert)
                db.session.commit()
                
                log.info(f"TP{tp_index + 1} logged for trade {trade_id}")
                return True
            except Exception as e:
                log.error(f"TP update error: {e}")
                return False
    
    def close_trade(self, trade_id, exit_price, reason):
        """Close trade and calculate PnL"""
        with self.app.app_context():
            try:
                trade = Trade.query.get(trade_id)
                if not trade:
                    return False
                
                trade.exit_price = exit_price
                trade.exit_time = datetime.now(timezone.utc)
                trade.status = 'CLOSED'
                
                if trade.direction == 'LONG':
                    trade.pnl = (exit_price - trade.entry_price) * trade.quantity
                else:
                    trade.pnl = (trade.entry_price - exit_price) * trade.quantity
                
                trade.pnl_percent = (trade.pnl / (trade.entry_price * trade.quantity)) * 100 if trade.entry_price * trade.quantity != 0 else 0
                
                db.session.commit()
                
                # Create alert
                alert = Alert(
                    user_id=self.user_id,
                    type='TRADE_CLOSED',
                    title=f"Trade Closed: {trade.symbol}",
                    message=f"Trade closed. Reason: {reason}. P/L: ${trade.pnl:.6f} ({trade.pnl_percent:.2f}%)",
                    related_trade_id=trade.id
                )
                db.session.add(alert)
                db.session.commit()
                
                log.info(f"Trade {trade_id} closed with P/L: {trade.pnl}")
                return True
            except Exception as e:
                log.error(f"Trade close error: {e}")
                return False
    
    def get_robot_settings(self):
        """Fetch robot settings from database"""
        with self.app.app_context():
            try:
                settings = RobotSettings.query.filter_by(user_id=self.user_id).first()
                if settings:
                    return {
                        'is_active': settings.is_active,
                        'trade_notional': settings.trade_notional,
                        'default_leverage': settings.default_leverage,
                        'max_simultaneous_trades': settings.max_simultaneous_trades,
                        'max_hold_hours': settings.max_hold_hours,
                        'signal_expiry_hours': settings.signal_expiry_hours,
                        'tp_percentages': settings.tp_percentages,
                        'trailing_stop_enabled': settings.trailing_stop_enabled,
                        'breakeven_after_tp1': settings.breakeven_after_tp1,
                        'compounding_enabled': settings.compounding_enabled,
                        'channels': settings.channels
                    }
            except Exception as e:
                log.error(f"Settings fetch error: {e}")
            return None
