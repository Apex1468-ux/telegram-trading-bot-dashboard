#!/bin/bash

# Build Codemagic environment variables from local files
# Usage: ./build-codemagic-env.sh

set -e

echo "📋 Building Codemagic Environment Variables"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check keystore
if [ ! -f "mobile/trading-bot.keystore" ]; then
    echo -e "${RED}❌ Keystore not found at mobile/trading-bot.keystore${NC}"
    echo "Run: ./setup-codemagic.sh first"
    exit 1
fi

# Generate base64
echo -e "${YELLOW}🔄 Encoding keystore...${NC}"
KEYSTORE_B64=$(base64 < mobile/trading-bot.keystore)

# Check for service account
if [ ! -f "service-account.json" ]; then
    echo -e "${RED}❌ service-account.json not found${NC}"
    echo "Download from Google Play Console → Settings → API Access"
    exit 1
fi

SERVICE_ACCOUNT=$(cat service-account.json | tr '\n' ' ')

echo ""
echo -e "${GREEN}✅ Generated Codemagic environment variables:${NC}"
echo ""
echo "Copy the following to Codemagic Dashboard → Settings → Integrations → Manage Variables"
echo ""

echo -e "${YELLOW}Group: eas_credentials${NC}"
echo "EAS_USERNAME=<your_expo_username>"
echo "EAS_PASSWORD=<your_expo_password>"
echo "EAS_TOKEN=<run: eas credentials show>"
echo ""

echo -e "${YELLOW}Group: codemagic_credentials${NC}"
echo "ANDROID_KEYSTORE_B64=$KEYSTORE_B64"
echo "ANDROID_KEYSTORE_PASSWORD=<your_keystore_password>"
echo "ANDROID_KEY_ALIAS=trading-bot-key"
echo "ANDROID_KEY_PASSWORD=<your_key_password>"
echo "ADMIN_EMAIL=<your_email>"
echo "SLACK_CHANNEL=#builds"
echo ""

echo -e "${YELLOW}Group: google_play_credentials${NC}"
echo "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=$SERVICE_ACCOUNT"
echo ""

echo -e "${GREEN}✅ All variables ready for Codemagic${NC}"
