# 🚀 SUPER SIMPLE - JUST COPY & PASTE!

**Time needed: 15 minutes**

---

## 🎯 PART 1: Run the Wizard (3 minutes)

Open your terminal in your repo folder and paste this:

```bash
chmod +x setup-wizard.sh
./setup-wizard.sh
```

**Answer the questions it asks.** Save your keystore password somewhere safe!

When it finishes, you'll have 2 new files:
- `CODEMAGIC_COPYPASTE.txt` - Keep this open!
- `CODEMAGIC_CREDENTIALS.md` - Don't share this!

---

## 🌐 PART 2: Create Google Play App (3 minutes)

1. Go to: **https://play.google.com/console**
2. Click **Create App**
3. Fill in:
   - Name: `Trading Bot Monster`
   - Category: `Finance`
4. Click **Create**
5. Go to **Testing** → **Internal testing** (leave this open)

✅ Done with this part!

---

## 🔑 PART 3: Create Service Account (5 minutes)

### 3A: Create Service Account

1. In Google Play Console: **Settings** → **API Access**
2. Click **Create new service account**
3. Click the link to **Google Cloud Console**
4. Click **Create Service Account**
5. Fill in:
   - Name: `codemagic-build`
6. Click **Create and continue**
7. Choose Role: Type `Editor` and select it
8. Click **Continue** then **Done**

### 3B: Download JSON Key

1. Back in Google Cloud Console
2. Click on your service account (`codemagic-build`)
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key** → **JSON**
5. A JSON file downloads
6. **Save it as `service-account.json` in your repo root folder**

### 3C: Grant Permissions

1. Back in **Google Play Console** → **Settings** → **API Access**
2. Click on your service account email
3. Check these boxes:
   - ✅ App Signing
   - ✅ Release Management
   - ✅ Edit store listing
4. Click **Invite**

✅ Done with this part!

---

## 🔐 PART 4: Add to Codemagic (4 minutes)

### 4A: Create Codemagic Account

1. Go to: **https://codemagic.io**
2. Click **Sign up**
3. Click **Sign up with GitHub**
4. Click **Authorize**
5. Complete your profile

### 4B: Connect Your Repository

1. Click **New app**
2. Click **GitHub**
3. Click **Authorize** (if needed)
4. Find **Apex1468-ux/telegram-trading-bot-dashboard**
5. Click it
6. Click **Finish**

### 4C: Add Environment Variables (The Important Part!)

1. Click your app
2. Click **Settings** (⚙️)
3. Click **Environment variables**
4. Click **Manage variables**

Now copy-paste from your `CODEMAGIC_COPYPASTE.txt` file:

#### **Add GROUP 1: `eas_credentials`**

Click **+ Add group**
- Group name: `eas_credentials`
- Click in the form
- Paste this (fill in YOUR Expo username/password):

```
EAS_USERNAME=your_expo_username
EAS_PASSWORD=your_expo_password
EAS_TOKEN=PASTE_OUTPUT_FROM_SETUP_WIZARD
```

Click **Save group**

#### **Add GROUP 2: `codemagic_credentials`**

Click **+ Add group**
- Group name: `codemagic_credentials`
- Paste this:

```
ANDROID_KEYSTORE_B64=PASTE_OUTPUT_FROM_SETUP_WIZARD
ANDROID_KEYSTORE_PASSWORD=YOUR_KEYSTORE_PASSWORD_FROM_WIZARD
ANDROID_KEY_ALIAS=trading-bot-key
ANDROID_KEY_PASSWORD=YOUR_KEY_PASSWORD_FROM_WIZARD
ADMIN_EMAIL=your_email@gmail.com
SLACK_CHANNEL=#builds
```

Click **Save group**

#### **Add GROUP 3: `google_play_credentials`**

Click **+ Add group**
- Group name: `google_play_credentials`
- Paste this:

```
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=PASTE_ENTIRE_CONTENTS_OF_SERVICE_ACCOUNT.JSON
```

*Open your `service-account.json` file, copy everything, paste it here (should be one long line)*

Click **Save group**

✅ Done with this part!

---

## 🚀 PART 5: START YOUR FIRST BUILD! (1 minute)

1. In Codemagic Dashboard
2. Click your app
3. Click **Start new build**
4. Select: `telegram-trading-bot-apk`
5. Click **Build**

**Wait 5-7 minutes.** You should see:
- ✅ Install dependencies
- ✅ Setup credentials
- ✅ Build APK
- ✅ Sign APK
- ✅ Deploy to Google Play
- ✅ Email notification

---

## ✅ VERIFY IT WORKED

1. Check your email - you should get a build notification
2. Go to **Google Play Console**
3. Go to **Internal testing**
4. You should see a new build listed!
5. Download the APK and test it

---

## 🎉 YOU'RE DONE!

From now on, every time you push to `main`:
- Codemagic automatically builds your APK ✅
- Signs it ✅
- Deploys to Google Play ✅
- Sends you a notification ✅

**No more manual builds needed!**

---

## ❓ Need Help?

**Error during setup?** Run the wizard again:
```bash
./setup-wizard.sh
```

**Can't find values?** Check:
```bash
# Get EAS token
eas credentials show --platform android

# Get keystore base64
base64 mobile/trading-bot.keystore
```

**Build failed?** Check the Codemagic build logs - it shows exactly what went wrong.

---

**Questions? Ask and I'll help!** 🚀
