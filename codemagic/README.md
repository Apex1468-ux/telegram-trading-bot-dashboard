# Codemagic Build Configuration

This directory contains configuration for automated builds and deployment via Codemagic CI/CD.

## Quick Start

```bash
# 1. Run setup script (generates keystore, configures Expo)
chmod +x setup-codemagic.sh
./setup-codemagic.sh

# 2. Generate environment variables for Codemagic
chmod +x build-codemagic-env.sh
./build-codemagic-env.sh

# 3. Get Google Play service account
# Follow CODEMAGIC_SETUP.md → Step 2

# 4. Add variables to Codemagic Dashboard
# https://codemagic.io/teams/{team_id}/integrations

# 5. Start first build
# Codemagic Dashboard → Apps → telegram-trading-bot-dashboard → Start build
```

## Files

- **codemagic.yaml** - Main CI/CD workflow configuration
  - Builds APK using EAS
  - Signs with Android keystore
  - Deploys to Google Play Internal Testing
  - Sends notifications

- **mobile/app.json** - Expo app metadata
  - Package name: `com.tradingbot.monster`
  - Version: 1.0.0
  - Permissions and plugins

- **mobile/eas.json** - EAS build profiles
  - Preview, preview2, preview3, production
  - Android APK configuration
  - Google Play submission config

- **CODEMAGIC_SETUP.md** - Complete setup guide
  - Step-by-step instructions
  - Environment variable reference
  - Troubleshooting

- **setup-codemagic.sh** - Automated setup script
  - Generates Android keystore
  - Sets up Expo/EAS
  - Creates environment template

- **build-codemagic-env.sh** - Generates base64 variables

## Workflow Overview

```
Push to main/develop
        ↓
Codemagic detects codemagic.yaml
        ↓
Install dependencies
        ↓
Setup Android signing
        ↓
Build APK (EAS)
        ↓
Verify APK
        ↓
Deploy to Google Play Internal Testing
        ↓
Send notifications (Email + Slack)
```

## Supported Triggers

- Push to `main` branch
- Push to `develop` branch
- Pull requests to `develop` branch

## Notifications

Builds are automatically reported to:
- **Email**: Your configured admin email
- **Slack**: Your configured channel (optional)

## Build Artifacts

- `app.apk` - Signed Android APK
- `build/outputs/apk/**/*.apk` - Alternative location

## For More Information

See **CODEMAGIC_SETUP.md** for:
- Detailed setup instructions
- Environment variable guide
- Troubleshooting
- Google Play integration
- Custom build scripts

