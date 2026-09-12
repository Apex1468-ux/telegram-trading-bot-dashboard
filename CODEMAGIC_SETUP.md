# Codemagic Setup Guide - Complete Configuration

## Prerequisites

1. **Codemagic Account** - Sign up at https://codemagic.io
2. **Expo Account** - Sign up at https://expo.dev
3. **Google Play Console Account** - https://play.google.com/console
4. **GitHub Repository Access** - Already connected

---

## Step 1: Generate Android Keystore

Generate a keystore for signing your APK:

```bash
cd mobile

# Generate keystore (valid for 10000 days)
keytool -genkey -v -keystore trading-bot.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias trading-bot-key \
  -storepass your_store_password \
  -keypass your_key_password \
  -dname "CN=Trading Bot,O=Your Company,L=City,ST=State,C=US"

# Convert to base64 for Codemagic
base64 -i trading-bot.keystore | pbcopy  # macOS
# or
base64 trading-bot.keystore > keystore.b64  # Linux/Windows

# Store the base64 output - you'll need it for Codemagic
cat keystore.b64
```

**Save these values (you'll need them for Codemagic):**
- Store Password: `your_store_password`
- Key Alias: `trading-bot-key`
- Key Password: `your_key_password`
- Base64 Keystore: (output from base64 command)

---

## Step 2: Setup Google Play Console

### 2.1 Create Service Account

1. Go to **Google Play Console** → **Settings** → **API Access**
2. Click **Create new service account**
3. Choose **Google Cloud Console**
4. Click **Create Service Account** in Google Cloud Console
5. Set Name: `codemagic-build`
6. Click **Create and Continue**
7. Grant Role: `Basic` → `Editor`
8. Click **Continue** → **Done**
9. Click the service account email
10. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
11. Save the JSON file - this is your `service-account.json`

### 2.2 Grant Play Store Permissions

1. In Google Play Console → **Settings** → **API Access**
2. Click the service account under **Service Accounts**
3. Check boxes for:
   - ✅ App Signing
   - ✅ Release Management
   - ✅ Edit Store Listing
4. Confirm

### 2.3 Create App on Play Store

1. Go to **Google Play Console**
2. Click **Create App** → Name: `Trading Bot Monster`
3. Choose **Category**: Finance
4. Accept declarations
5. Go to **Testing** → **Internal testing**
6. You're ready to receive builds

---

## Step 3: Setup Expo EAS

### 3.1 Install EAS CLI

```bash
npm install -g eas-cli
```

### 3.2 Login to Expo

```bash
eas login
# Enter your Expo username and password
```

### 3.3 Configure EAS Build

```bash
cd mobile
eas build:configure
# Choose: Android
# Managed Workflow
```

### 3.4 Get EAS Token

```bash
eas login --non-interactive --username your_expo_username --password your_expo_password

# Get token
eas credentials show --platform android
# Copy the full token for Codemagic
```

---

## Step 4: Configure Codemagic Environment Variables

Go to **Codemagic Dashboard** → **Teams** → Your Team → **Integrations** → **Manage Variables**

### Create these groups:

**Group 1: `eas_credentials`**
```
EAS_USERNAME = your_expo_username
EAS_PASSWORD = your_expo_password
EAS_TOKEN = (from eas credentials show)
```

**Group 2: `codemagic_credentials`**
```
ANDROID_KEYSTORE_B64 = (base64 encoded keystore)
ANDROID_KEYSTORE_PASSWORD = your_store_password
ANDROID_KEY_ALIAS = trading-bot-key
ANDROID_KEY_PASSWORD = your_key_password
ADMIN_EMAIL = your_email@gmail.com
SLACK_CHANNEL = #builds  (optional)
```

**Group 3: `google_play_credentials`**
```
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = (paste full JSON from Step 2.1)
```

---

## Step 5: Connect Repository to Codemagic

1. Go to https://codemagic.io/apps
2. Click **New app**
3. Select **GitHub** → Authorize
4. Choose **Apex1468-ux/telegram-trading-bot-dashboard**
5. Click **Finish**
6. Go to **Workflows** tab
7. Make sure the `codemagic.yaml` is detected
8. Click the workflow → **Start new build**

---

## Step 6: Verify Configuration

### 6.1 Test Build Variables

In Codemagic → **App Settings** → **Environment variables**

Verify all variables are set:
- ✅ EAS_USERNAME
- ✅ EAS_PASSWORD
- ✅ EAS_TOKEN
- ✅ ANDROID_KEYSTORE_B64
- ✅ ANDROID_KEYSTORE_PASSWORD
- ✅ ANDROID_KEY_ALIAS
- ✅ ANDROID_KEY_PASSWORD
- ✅ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
- ✅ ADMIN_EMAIL

### 6.2 First Build

Click **Start new build** → Select **telegram-trading-bot-apk** workflow

**Build should:**
1. Install dependencies ✓
2. Setup Android credentials ✓
3. Build APK with EAS ✓
4. Verify APK ✓
5. Deploy to Google Play Internal Testing ✓
6. Send email notification ✓

---

## Troubleshooting

### Build fails at "Setup Android credentials"
- Verify `ANDROID_KEYSTORE_B64` is properly base64 encoded
- Check passwords don't contain special shell characters

### Build fails at "Build APK with EAS"
- Verify EAS token is valid: `eas credentials show`
- Check Expo account has active subscription
- Verify mobile/app.json has correct `package: com.tradingbot.monster`

### Build fails at "Deploy to Google Play"
- Verify service account JSON is valid and complete
- Check service account has Editor role in Google Cloud
- Verify app exists in Google Play Console
- Check internal testing track is active

### APK not uploading to Play Store
- Run build with `ignore_failure: false` to see exact error
- Verify versionCode increments (update in `mobile/app.json`)
- Check Play Store API quotas

---

## Next Steps

1. **Manual Testing:** Download APK from Codemagic build artifacts
2. **Beta Testing:** Share internal testing link from Play Store
3. **Production:** Update track from `internal` to `production` in `codemagic.yaml`
4. **CI/CD Automation:** Builds now trigger automatically on:
   - Push to `main` branch
   - Pull requests to `develop` branch

---

## Useful Commands

```bash
# View build status
eas build:list

# Download APK locally
eas build:view

# Check credentials
eas credentials show --platform android

# Reconfigure EAS
cd mobile && eas build:configure --platform android

# View Codemagic builds
cmtool build status
```

---

## Environment File (.env)

Add to `backend/.env` for production:

```
FLASK_ENV=production
SECRET_KEY=generate-with-secrets.token_urlsafe(32)
DATABASE_URL=postgresql://user:pass@host/trading_bot
JWT_SECRET_KEY=generate-with-secrets.token_urlsafe(32)
SECURE_COOKIES=True
CORS_ORIGINS=https://yourdomain.com
```

---

## Files Modified

- ✅ `codemagic.yaml` - Complete workflow with EAS + Google Play
- ✅ `mobile/eas.json` - EAS build configuration
- ✅ `mobile/app.json` - Expo app metadata
- ✅ `CODEMAGIC_SETUP.md` - This file
- ✅ `setup-codemagic.sh` - Automated setup
- ✅ `build-codemagic-env.sh` - Variable generation

## Support

- Codemagic Docs: https://docs.codemagic.io
- Expo EAS Docs: https://docs.expo.dev/build/introduction
- Google Play Console Docs: https://developer.android.com/google-play
