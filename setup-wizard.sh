#!/bin/bash

# 🚀 TELEGRAM TRADING BOT - SUPER EASY SETUP WIZARD
# This script does EVERYTHING automatically for you!
# Just answer the questions and copy-paste when done.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🚀 TELEGRAM TRADING BOT - CODEMAGIC SETUP WIZARD 🚀        ║"
echo "║                                                                ║"
echo "║  This script will generate EVERYTHING you need automatically  ║"
echo "║  Just answer the questions and follow the instructions        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Step 1: Verify prerequisites
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

if ! command -v keytool &> /dev/null; then
    echo -e "${RED}❌ keytool not found. Install Java Development Kit (JDK)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites found${NC}"
echo ""

# Step 2: Collect user information
echo -e "${YELLOW}🔐 Step 2: Android Keystore Setup${NC}"
echo "We'll create a signing certificate for your APK"
echo ""

read -p "Enter a secure keystore password (save this!): " -s KEYSTORE_PASS
echo ""
read -p "Confirm keystore password: " -s KEYSTORE_PASS_CONFIRM
echo ""

if [ "$KEYSTORE_PASS" != "$KEYSTORE_PASS_CONFIRM" ]; then
    echo -e "${RED}❌ Passwords don't match!${NC}"
    exit 1
fi

read -p "Enter key password (same as above is fine): " -s KEY_PASS
echo ""

read -p "Enter your full name: " FULL_NAME
read -p "Enter your organization/company: " ORG_NAME
read -p "Enter your city: " CITY
read -p "Enter your state/province: " STATE
read -p "Enter your country code (US, UK, etc): " COUNTRY

echo ""
echo -e "${YELLOW}🔑 Generating Android keystore...${NC}"

# Generate keystore
mkdir -p mobile
keytool -genkey -v -keystore mobile/trading-bot.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias trading-bot-key \
    -storepass "$KEYSTORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=$FULL_NAME,O=$ORG_NAME,L=$CITY,ST=$STATE,C=$COUNTRY" > /dev/null 2>&1

echo -e "${GREEN}✅ Keystore generated!${NC}"
echo ""

# Step 3: Encode keystore to base64
echo -e "${YELLOW}🔄 Step 3: Encoding keystore to base64...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    KEYSTORE_B64=$(base64 < mobile/trading-bot.keystore)
else
    # Linux
    KEYSTORE_B64=$(base64 mobile/trading-bot.keystore)
fi

echo -e "${GREEN}✅ Keystore encoded${NC}"
echo ""

# Step 4: Setup Expo
echo -e "${YELLOW}👤 Step 4: Expo Account Setup${NC}"
echo "We need your Expo credentials (from https://expo.dev)"
echo ""

read -p "Enter your Expo username: " EXPO_USERNAME
read -p "Enter your Expo password: " -s EXPO_PASSWORD
echo ""

echo -e "${YELLOW}🔑 Logging into Expo...${NC}"

# Install global tools
npm install -g eas-cli expo-cli > /dev/null 2>&1

# Try to login and get token
if eas login --non-interactive --username "$EXPO_USERNAME" --password "$EXPO_PASSWORD" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Expo login successful${NC}"
    
    echo ""
    echo -e "${YELLOW}📋 Step 5: Getting EAS token...${NC}"
    echo "This shows your authentication token"
    echo ""
    
    EAS_TOKEN_OUTPUT=$(eas credentials show --platform android 2>/dev/null || echo "ERROR")
    
    if [ "$EAS_TOKEN_OUTPUT" = "ERROR" ]; then
        echo -e "${RED}⚠️  Could not retrieve EAS token automatically${NC}"
        echo "You can get it manually by running: eas credentials show --platform android"
        EAS_TOKEN="<run: eas credentials show --platform android>"
    else
        EAS_TOKEN="$EAS_TOKEN_OUTPUT"
    fi
else
    echo -e "${YELLOW}⚠️  Expo login failed. Using provided credentials.${NC}"
    EAS_TOKEN="<run: eas credentials show --platform android>"
fi

echo ""

# Step 5: Install mobile dependencies
echo -e "${YELLOW}📦 Step 6: Installing mobile dependencies...${NC}"

cd mobile
npm install > /dev/null 2>&1
cd ..

echo -e "${GREEN}✅ Mobile dependencies installed${NC}"
echo ""

# Step 6: Collect Codemagic info
echo -e "${YELLOW}📝 Step 7: Codemagic Account Info${NC}"
echo ""

read -p "Enter your email (for build notifications): " ADMIN_EMAIL
read -p "Enter Slack channel (e.g., #builds) or press Enter to skip: " SLACK_CHANNEL

if [ -z "$SLACK_CHANNEL" ]; then
    SLACK_CHANNEL="#builds"
fi

echo ""

# Step 7: Google Play info (optional for now)
echo -e "${YELLOW}ℹ️  Step 8: Google Play Service Account${NC}"
echo ""
echo "You'll need to download the service account JSON from Google Cloud Console"
echo "For now, just save the path or have it ready"
echo ""

read -p "Have you already created service-account.json? (y/n): " HAS_SERVICE_ACCOUNT

if [ "$HAS_SERVICE_ACCOUNT" = "y" ] || [ "$HAS_SERVICE_ACCOUNT" = "Y" ]; then
    if [ -f "service-account.json" ]; then
        echo -e "${GREEN}✅ Found service-account.json${NC}"
        
        # Convert to single line
        if [[ "$OSTYPE" == "darwin"* ]]; then
            SERVICE_ACCOUNT_JSON=$(cat service-account.json | tr '\n' ' ')
        else
            SERVICE_ACCOUNT_JSON=$(cat service-account.json | tr '\n' ' ')
        fi
    else
        echo -e "${RED}❌ service-account.json not found in repo root${NC}"
        SERVICE_ACCOUNT_JSON="<paste your service-account.json here>"
    fi
else
    echo "You'll download this after creating Google Play app"
    SERVICE_ACCOUNT_JSON="<download from Google Cloud Console>"
fi

echo ""

# Create the summary document
echo -e "${YELLOW}📄 Step 9: Creating setup summary...${NC}"

cat > CODEMAGIC_CREDENTIALS.md << EOF
# 🔐 Your Codemagic Credentials - DO NOT SHARE!

Generated: $(date)

## 🔑 Keystore Information
- **File**: mobile/trading-bot.keystore
- **Password**: $KEYSTORE_PASS
- **Key Alias**: trading-bot-key
- **Key Password**: $KEY_PASS

## 👤 Expo Credentials
- **Username**: $EXPO_USERNAME
- **Password**: (your password)

## 📋 Codemagic Environment Variables

Copy and paste these into Codemagic Dashboard → Settings → Environment variables

### Group 1: \`eas_credentials\`
\`\`\`
EAS_USERNAME=$EXPO_USERNAME
EAS_PASSWORD=$EXPO_PASSWORD
EAS_TOKEN=$(echo "$EAS_TOKEN_OUTPUT" | head -c 80)...
\`\`\`

### Group 2: \`codemagic_credentials\`
\`\`\`
ANDROID_KEYSTORE_B64=$(echo "$KEYSTORE_B64" | head -c 80)...
ANDROID_KEYSTORE_PASSWORD=$KEYSTORE_PASS
ANDROID_KEY_ALIAS=trading-bot-key
ANDROID_KEY_PASSWORD=$KEY_PASS
ADMIN_EMAIL=$ADMIN_EMAIL
SLACK_CHANNEL=$SLACK_CHANNEL
\`\`\`

### Group 3: \`google_play_credentials\`
\`\`\`
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=$SERVICE_ACCOUNT_JSON
\`\`\`

## 🔗 Links to Use
- Codemagic: https://codemagic.io
- Google Play Console: https://play.google.com/console
- Expo: https://expo.dev

## ⚠️ IMPORTANT
- Save this file securely
- Do NOT commit this to Git
- The .gitignore already excludes it
EOF

echo -e "${GREEN}✅ Summary created${NC}"
echo ""

# Create copy-paste ready file
cat > CODEMAGIC_COPYPASTE.txt << EOF
===============================================
🚀 CODEMAGIC SETUP - COPY & PASTE INSTRUCTIONS
===============================================

STEP 1: Create Google Play App
=============================
1. Go to: https://play.google.com/console
2. Click "Create App"
3. Name: Trading Bot Monster
4. Category: Finance
5. Click "Create App"
6. Go to Testing → Internal testing (leave open)

STEP 2: Create Service Account
==============================
1. In Play Console → Settings → API Access
2. Click "Create new service account"
3. Click link to Google Cloud Console
4. Click "Create Service Account"
5. Name: codemagic-build
6. Click "Create and continue"
7. Role: Editor (search for it)
8. Click "Continue" → "Done"
9. Click the service account email
10. Go to "Keys" tab
11. "Add Key" → "Create new key" → "JSON"
12. Download and save as "service-account.json" in your repo root
13. Back in Play Console → Settings → API Access
14. Select the service account
15. Check: ✅ App Signing, ✅ Release Management, ✅ Edit store listing

STEP 3: Add to Codemagic
=======================
1. Go to: https://codemagic.io
2. Sign up with GitHub
3. Click "New app" → Select your repo
4. Go to Settings → Environment variables → Manage variables

GROUP 1: eas_credentials
------------------------
Add these variables:

Name: EAS_USERNAME
Value: $EXPO_USERNAME

Name: EAS_PASSWORD
Value: (your Expo password)

Name: EAS_TOKEN
Value: Run this command in terminal:
       eas credentials show --platform android
       Paste the output here

Click "Save group"

GROUP 2: codemagic_credentials
-------------------------------
Add these variables:

Name: ANDROID_KEYSTORE_B64
Value: Run this command in terminal:
       base64 mobile/trading-bot.keystore
       Paste the output here

Name: ANDROID_KEYSTORE_PASSWORD
Value: $KEYSTORE_PASS

Name: ANDROID_KEY_ALIAS
Value: trading-bot-key

Name: ANDROID_KEY_PASSWORD
Value: $KEY_PASS

Name: ADMIN_EMAIL
Value: $ADMIN_EMAIL

Name: SLACK_CHANNEL
Value: $SLACK_CHANNEL

Click "Save group"

GROUP 3: google_play_credentials
---------------------------------
Add this variable:

Name: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
Value: Open service-account.json file
       Copy ENTIRE contents
       Paste here (should be one long line)

Click "Save group"

STEP 4: START FIRST BUILD!
==========================
1. In Codemagic Dashboard → Click your app
2. Click "Start new build"
3. Select workflow: telegram-trading-bot-apk
4. Click "Build"
5. Wait 5-7 minutes
6. Should show ✅ Success!
7. Check email for build notification

DONE! 🎉
EOF

echo -e "${GREEN}✅ Copy-paste instructions created${NC}"
echo ""

# Display final summary
clear
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════���═══╗"
echo "║                  ✅ SETUP COMPLETE! ✅                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📁 Generated Files:${NC}"
echo "  1. mobile/trading-bot.keystore (Android signing certificate)"
echo "  2. CODEMAGIC_CREDENTIALS.md (your credentials - DON'T SHARE!)"
echo "  3. CODEMAGIC_COPYPASTE.txt (step-by-step instructions)"
echo ""
echo -e "${BLUE}📋 What to do next:${NC}"
echo ""
echo "  1. Open: CODEMAGIC_COPYPASTE.txt"
echo "  2. Follow each step carefully"
echo "  3. Copy-paste the values exactly as shown"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  - Save your passwords: $KEYSTORE_PASS"
echo "  - Don't commit CODEMAGIC_CREDENTIALS.md to Git"
echo "  - Keep service-account.json secret"
echo ""
echo -e "${GREEN}✨ Happy building! Once you follow the steps in"
echo "   CODEMAGIC_COPYPASTE.txt, your APK will build automatically!${NC}"
echo ""
