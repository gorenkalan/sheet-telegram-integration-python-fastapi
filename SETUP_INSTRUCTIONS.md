# 🚀 ShopEasy Setup Instructions

## Overview
ShopEasy is an e-commerce website that automatically saves orders to Google Sheets and sends notifications via Telegram. This guide will walk you through setting up all the required integrations.

## 📋 Prerequisites
- Google Account
- Telegram Account
- Basic understanding of copying/pasting files

---

## 🔧 Part 1: Google Sheets Integration Setup

### Step 1: Create Google Cloud Project & Service Account

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project (or select existing)**
   - Click "Select a project" → "New Project"
   - Name: `ShopEasy Integration`
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable these APIs:
     - **Google Sheets API** ✅
     - **Google Drive API** ✅

4. **Create Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Service account name: `shopeasy-sheets`
   - Click "Create and Continue"
   - Role: Select "Basic" → "Editor"
   - Click "Continue" → "Done"

5. **Generate Credentials File**
   - Click on the created service account email
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Choose "JSON" format
   - Click "Create" - This downloads `credentials.json`

### Step 2: Setup Google Sheet

1. **Create New Google Sheet**
   - Go to: https://sheets.google.com/
   - Click "Create" → "Blank spreadsheet"
   - Name it: `ShopEasy Orders`

2. **Share Sheet with Service Account**
   - Open your spreadsheet
   - Click "Share" button (top right)
   - In "Add people and groups":
     - Paste the service account email from `credentials.json` file
     - (It looks like: `shopeasy-sheets@...gserviceaccount.com`)
   - Set permission to "Editor"
   - **UNCHECK** "Notify people" 
   - Click "Share"

3. **Get Sheet ID**
   - Copy the Sheet ID from your browser URL
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1ABC123xyz789/edit`
   - Then Sheet ID is: `1ABC123xyz789`

---

## 📱 Part 2: Telegram Bot Setup

### Step 1: Create Telegram Bot

1. **Open Telegram App**
   - Search for `@BotFather`
   - Start a chat with BotFather

2. **Create New Bot**
   - Send command: `/newbot`
   - Choose bot name: `ShopEasy Orders Bot`
   - Choose username: `shopeasy_orders_bot` (must end with 'bot')
   - **Save the Bot Token** provided (format: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 2: Get Your Chat ID

1. **Start Chat with Your Bot**
   - Click the link provided by BotFather
   - Send any message to your bot (e.g., "Hello")

2. **Get Chat ID**
   - Open this URL in browser (replace BOT_TOKEN with your actual token):
   - `https://api.telegram.org/bot{BOT_TOKEN}/getUpdates`
   - Look for "chat":{"id": number
   - **Save this Chat ID** (example: `123456789`)

---

## ⚙️ Part 3: Configure Backend

### Step 1: Upload Credentials File

1. **Upload credentials.json**
   - Place the downloaded `credentials.json` file in `/app/backend/` directory
   - File location should be: `/app/backend/credentials.json`

### Step 2: Update Environment Variables

1. **Edit `/app/backend/.env` file:**

```env
# MongoDB (keep existing)
MONGO_URL=mongodb://localhost:27017/
DB_NAME=shopeasy_db

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_actual_sheet_id_here
GOOGLE_SHEET_NAME=Sheet1

# Telegram Configuration  
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
TELEGRAM_CHAT_ID=your_actual_chat_id_here
```

2. **Replace the placeholders:**
   - `your_actual_sheet_id_here` → Your Google Sheet ID from Step 2.3
   - `your_actual_bot_token_here` → Your Telegram Bot Token from Step 1.2
   - `your_actual_chat_id_here` → Your Chat ID from Step 2.2

### Step 3: Restart Services

```bash
sudo supervisorctl restart backend
```

---

## ✅ Part 4: Verify Setup

### Test Backend Configuration

1. **Test API Health:**
```bash
curl -X GET http://localhost:8001/api/health
```
Expected: `"google_sheets":"configured"` and `"telegram":"configured"`

2. **Test Connections:**
```bash
curl -X GET http://localhost:8001/api/test-connections
```
Expected: Both Google Sheets and Telegram should return `"success": true`

### Test Complete Flow

1. **Visit the website** (frontend URL)
2. **Click on any product** → "Order Now"
3. **Fill out the order form** with test data
4. **Submit the order**
5. **Check your Google Sheet** - new row should appear with order data
6. **Check your Telegram** - you should receive order notification

---

## 🛠️ Troubleshooting

### Google Sheets Issues

**❌ "Permission denied" error:**
- Verify service account email is shared with the sheet
- Check the service account has "Editor" permissions
- Ensure credentials.json is in correct location

**❌ "Spreadsheet not found" error:**
- Double-check the Sheet ID in .env file
- Make sure the sheet is shared with service account

### Telegram Issues

**❌ "Bot token invalid" error:**
- Verify bot token is correct in .env file
- Make sure there are no extra spaces in the token

**❌ "Chat not found" error:**
- Ensure you've sent at least one message to your bot
- Double-check the Chat ID is correct

### Backend Issues

**❌ Backend not starting:**
```bash
# Check logs
tail -f /var/log/supervisor/backend.*.log

# Restart services
sudo supervisorctl restart all
```

---

## 📋 Configuration Checklist

- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled  
- [ ] Service account created with Editor role
- [ ] credentials.json downloaded and placed in `/app/backend/`
- [ ] Google Sheet created and shared with service account
- [ ] Sheet ID copied to .env file
- [ ] Telegram bot created via BotFather
- [ ] Bot token saved to .env file
- [ ] Chat ID obtained and saved to .env file
- [ ] Backend restarted
- [ ] Health check shows services as "configured"
- [ ] Test connections endpoint returns success
- [ ] End-to-end test completed successfully

---

## 🔐 Security Notes

- **Never commit credentials.json** to version control
- **Keep bot tokens secure** - treat them like passwords
- **Use environment variables** for all sensitive data
- **Regularly rotate tokens** for production use

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs:** `tail -f /var/log/supervisor/backend.*.log`
2. **Verify API endpoints:** `/api/health` and `/api/test-connections`
3. **Test individual components** before the full integration
4. **Double-check all credentials** are correctly copied

---

**🎉 Once everything is configured, your ShopEasy store will automatically:**
- Save all orders to Google Sheets
- Send instant Telegram notifications for new orders
- Provide spam protection and rate limiting
- Offer a beautiful shopping experience for customers