# Build Instructions

## Android APK Build

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (optional, for cloud builds)

### Local APK Build (Recommended)

```bash
cd mobile
npm install
npm run build:apk
```

The APK will be generated in `./dist/` directory.

### Cloud Build with EAS

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android
```

### Manual Build Steps

1. Configure `eas.json` in mobile directory
2. Generate signing certificate:
   ```bash
   eas credentials
   ```
3. Build APK:
   ```bash
   eas build --platform android
   ```

## Web Build

```bash
cd frontend
npm install
npm run build
# Deploy dist/ folder
```

## Docker Build

```bash
docker-compose build
docker-compose up
```

## Troubleshooting

### APK Build Fails
- Clear cache: `rm -rf node_modules .expo`
- Reinstall: `npm install`
- Check Node version: `node --version` (18+ required)

### Memory Issues During Build
- Increase available RAM
- Use cloud build: `eas build --platform android`

### Signing Certificate Issues
- Regenerate: `eas credentials`
- Check keystore permissions
