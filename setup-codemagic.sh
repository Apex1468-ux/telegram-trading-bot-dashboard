#!/bin/bash

# Codemagic Build Environment Setup Script
# Run this locally BEFORE pushing to Codemagic

set -e

echo "🚀 Setting up Telegram Trading Bot - Codemagic Configuration"
echo ""

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Install from https://nodejs.org"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found."
        exit 1
    fi
    
    if ! command -v keytool &> /dev/null; then
        echo "⚠️  keytool not found. Will be needed for keystore generation."
    fi
    
    echo "✅ Prerequisites OK"
    echo ""
}

# Generate keystore
generate_keystore() {
    echo "🔐 Generating Android Keystore..."
    
    if [ -f "mobile/trading-bot.keystore" ]; then
        echo "⚠️  Keystore already exists. Skipping..."
        return
    fi
    
    read -p "Enter keystore password: " -s KEYSTORE_PASS
    echo ""
    read -p "Enter key password: " -s KEY_PASS
    echo ""
    read -p "Enter your full name: " FULL_NAME
    read -p "Enter your organization: " ORG_NAME
    read -p "Enter your city: " CITY
    read -p "Enter your state: " STATE
    read -p "Enter your country (2 letters): " COUNTRY
    
    keytool -genkey -v -keystore mobile/trading-bot.keystore \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias trading-bot-key \
        -storepass "$KEYSTORE_PASS" \
        -keypass "$KEY_PASS" \
        -dname "CN=$FULL_NAME,O=$ORG_NAME,L=$CITY,ST=$STATE,C=$COUNTRY"
    
    echo "✅ Keystore generated: mobile/trading-bot.keystore"
    echo ""
    echo "📝 Save these values for Codemagic:"
    echo "   Keystore Password: $KEYSTORE_PASS"
    echo "   Key Alias: trading-bot-key"
    echo "   Key Password: $KEY_PASS"
    echo ""
}

# Generate base64 keystore
encode_keystore() {
    echo "🔄 Encoding keystore to base64..."
    
    if [ ! -f "mobile/trading-bot.keystore" ]; then
        echo "❌ Keystore not found at mobile/trading-bot.keystore"
        exit 1
    fi
    
    if command -v base64 &> /dev/null; then
        base64 mobile/trading-bot.keystore > mobile/.keystore.b64
        echo "✅ Base64 keystore saved to mobile/.keystore.b64"
        echo ""
        echo "📋 Base64 content (copy to ANDROID_KEYSTORE_B64):"
        head -c 100 mobile/.keystore.b64
        echo "..."
        echo ""
    fi
}

# Setup Expo
setup_expo() {
    echo "🦙 Setting up Expo..."
    
    npm install -g eas-cli expo-cli
    
    read -p "Expo username: " EXPO_USER
    read -p "Expo password: " -s EXPO_PASS
    echo ""
    
    eas login --non-interactive --username "$EXPO_USER" --password "$EXPO_PASS"
    
    echo "✅ Expo login successful"
    echo ""
    
    echo "📝 Save EAS token:"
    eas credentials show --platform android
    echo ""
}

# Setup mobile dependencies
setup_mobile() {
    echo "📦 Installing mobile dependencies..."
    
    cd mobile
    npm install
    
    echo "✅ Mobile dependencies installed"
    echo ""
    
    cd ..
}

# Create Codemagic environment file
create_env_file() {
    echo "📝 Creating Codemagic environment template..."
    
    cat > .codemagic.env.example << 'EOF'
# Codemagic Environment Variables Template
# Copy and fill these values in Codemagic Dashboard

# EAS Credentials
EAS_USERNAME=your_expo_username
EAS_PASSWORD=your_expo_password
EAS_TOKEN=your_eas_token_here

# Android Keystore (base64 encoded)
ANDROID_KEYSTORE_B64=your_base64_keystore_here
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=trading-bot-key
ANDROID_KEY_PASSWORD=your_key_password

# Google Play Credentials (full service account JSON)
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Notifications
ADMIN_EMAIL=your_email@gmail.com
SLACK_CHANNEL=#builds
EOF
    
    echo "✅ Environment file template created: .codemagic.env.example"
    echo ""
}

# Validate configuration
validate_config() {
    echo "✅ Validating configuration..."
    
    if [ ! -f "codemagic.yaml" ]; then
        echo "❌ codemagic.yaml not found"
        exit 1
    fi
    
    if [ ! -f "mobile/app.json" ]; then
        echo "❌ mobile/app.json not found"
        exit 1
    fi
    
    if [ ! -f "mobile/eas.json" ]; then
        echo "❌ mobile/eas.json not found"
        exit 1
    fi
    
    echo "✅ All configuration files present"
    echo ""
}

# Main flow
main() {
    check_prerequisites
    generate_keystore
    encode_keystore
    setup_mobile
    setup_expo
    create_env_file
    validate_config
    
    echo "🎉 Setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://codemagic.io and create an account"
    echo "2. Connect your GitHub repository"
    echo "3. In Codemagic Dashboard, add these environment variable groups:"
    echo "   - eas_credentials (EAS_USERNAME, EAS_PASSWORD, EAS_TOKEN)"
    echo "   - codemagic_credentials (Keystore + Admin email)"
    echo "   - google_play_credentials (Service account JSON)"
    echo "4. View .codemagic.env.example for all required variables"
    echo "5. Start your first build from Codemagic Dashboard"
    echo ""
    echo "📖 Full setup guide: CODEMAGIC_SETUP.md"
}

main
