# Deployment Guide

## Production Checklist

- [ ] Change all default credentials
- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Update database to PostgreSQL
- [ ] Enable HTTPS
- [ ] Set up SSL certificates
- [ ] Configure CORS for your domain
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Set up CI/CD pipeline

## Backend Deployment (Heroku)

```bash
cd backend
heroku create your-app-name
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

## Frontend Deployment (Vercel)

```bash
cd frontend
npm install -g vercel
vercel
```

## Docker Deployment (AWS, GCP, Azure)

```bash
# Push to Docker Hub
docker login
docker-compose build
docker tag telegram-trading-bot-dashboard:latest your-username/trading-bot:latest
docker push your-username/trading-bot:latest

# Deploy to your server
ssh your-server
docker pull your-username/trading-bot:latest
docker-compose up -d
```

## Mobile App Deployment

### Google Play Store

1. Build signed APK:
   ```bash
   cd mobile
   eas build --platform android --auto-submit
   ```

2. Set up Google Play Console account

3. Upload to Play Store via EAS

### Firebase Hosting (Web)

```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

## Environment Configuration

### Production .env

```
FLASK_ENV=production
SECRET_KEY=generate-with-secrets.token_urlsafe(32)
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET_KEY=generate-with-secrets.token_urlsafe(32)
TELEGRAM_API_ID=your_id
TELEGRAM_API_HASH=your_hash
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret
SECURE_COOKIES=True
CORS_ORIGINS=https://yourdomain.com
```

## Monitoring

- Set up error tracking (Sentry)
- Enable application monitoring (New Relic)
- Configure log aggregation (LogRocket)
- Set up uptime monitoring (StatusPage)

## Scaling

- Use load balancer (nginx, HAProxy)
- Implement caching (Redis)
- Use CDN for static files (Cloudflare)
- Configure auto-scaling based on CPU/memory

## Backup Strategy

```bash
# Daily database backups
0 2 * * * pg_dump trading_bot > /backups/backup-$(date +\%Y-\%m-\%d).sql

# Keep 30-day retention
find /backups -mtime +30 -delete
```
