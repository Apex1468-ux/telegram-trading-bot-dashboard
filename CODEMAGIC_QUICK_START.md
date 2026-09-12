# Codemagic Quick Start Checklist

## 🚀 Quick Setup (15 minutes)

Follow these steps in order:

### 1. ✅ Run Local Setup
```bash
chmod +x setup-codemagic.sh
./setup-codemagic.sh
```

**What it does:**
- Generates Android keystore
- Installs Expo/EAS CLI
- Authenticates with Expo
- Creates environment template

### 2. ✅ Create Google Play App
1. Go to https://play.google.com/console
2. Click **Create App**
3. Name: `Trading Bot Monster`, Category: `Finance`
4. Go to **Testing** → **Internal testing**

### 3. ✅ Generate Service Account
1. In Play Console: **Settings** → **API Access**
2. Click **Create new service account**
3. Follow Google Cloud Console flow
4. Download JSON key
5. Save as `service-account.json` in repo root

### 4. ✅ Get Credentials
```bash
# Generate environment variables
chmod +x build-codemagic-env.sh
./build-codemagic-env.sh

# Get EAS token
eas credentials show --platform android
```

### 5. ✅ Add to Codemagic
1. Go to https://codemagic.io
2. Sign up/Login
3. Click **New app** → **GitHub**
4. Select `Apex1468-ux/telegram-trading-bot-dashboard`
5. Go to **Settings** → **Environment variables**
6. Add these groups:

**eas_credentials**
```
EAS_USERNAME=your_expo_username
EAS_PASSWORD=your_expo_password
EAS_TOKEN=<from step 4>
```

**codemagic_credentials**
```
ANDROID_KEYSTORE_B64=<from step 4>
ANDROID_KEYSTORE_PASSWORD=<keystore_password>
ANDROID_KEY_ALIAS=trading-bot-key
ANDROID_KEY_PASSWORD=<key_password>
ADMIN_EMAIL=your_email@gmail.com
SLACK_CHANNEL=#builds
```

**google_play_credentials**
```
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<full JSON from service-account.json>
```

### 6. ✅ Start First Build
1. In Codemagic: **Apps** → **telegram-trading-bot-dashboard**
2. Click **Start new build**
3. Select workflow: `telegram-trading-bot-apk`
4. Click **Build**

**Expected output:**
- ✅ Install dependencies
- ✅ Setup credentials
- ✅ Build APK
- ✅ Deploy to Google Play
- ✅ Email notification

---

## 🎯 Verification

**Build Succeeded?**
```
✅ APK built successfully
✅ Deployed to Google Play Internal Testing
✅ Email notification sent
```

**Check in Google Play Console:**
1. Go to **Internal testing** track
2. Should see new build listed
3. Download APK for manual testing

---

## 🔄 Automated Builds

Builds now trigger automatically on:
- **Push to `main` branch**
- **Pull requests to `develop` branch**

No manual action needed!

---

## 📱 Next: Manual Testing

1. Download APK from Codemagic or Google Play Internal Testing
2. Install on Android device/emulator: `adb install app.apk`
3. Test all features
4. Report issues on GitHub

---

## ❌ Troubleshooting

**Build fails?** Check:
1. All environment variables set correctly
2. Service account JSON is valid
3. Expo credentials work: `eas login`
4. keystore password correct

**See full guide:** `CODEMAGIC_SETUP.md`

---

## 📞 Support

- Codemagic Issues: https://github.com/codemagic-io/issues
- Expo Issues: https://github.com/expo/expo/issues
- Google Play: https://support.google.com/googleplay
