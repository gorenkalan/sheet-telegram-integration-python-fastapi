# ShopEasy - E-commerce with Google Sheets & Telegram Integration

A modern e-commerce website that processes orders through Google Sheets and sends notifications via Telegram Bot.

## 🚀 Features

- **Beautiful E-commerce UI** - Professional product catalog with shopping cart
- **Google Sheets Integration** - Orders automatically saved to Google Sheets
- **Telegram Notifications** - Owner gets instant notifications for new orders
- **Spam Protection** - Honeypot fields and rate limiting
- **Order Management** - Complete order tracking and customer management
- **Mobile Responsive** - Works perfectly on all devices

## 🏗️ Architecture

```
[React Frontend] → [FastAPI Backend] → [Google Sheets] 
                                    → [Telegram Bot]
                                    → [MongoDB Backup]
```

## 📋 Prerequisites

### Required Services & Credentials

1. **Google Service Account** (for Google Sheets access)
2. **Telegram Bot Token** (for notifications)
3. **Google Sheet** (for storing orders)

## 🔧 Setup Instructions

### 1. Google Cloud Setup

#### Create Service Account:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `shopeasy-sheets-integration`
   - Role: `Basic > Editor`
5. Generate Key:
   - Click on created service account
   - Go to "Keys" tab → "Add Key" → "Create New Key"
   - Choose JSON format
   - Download as `credentials.json`

#### Setup Google Sheet:
1. Create new Google Sheet
2. Name it appropriately (e.g., "ShopEasy Orders")
3. Share with service account email:
   - Click "Share" button
   - Add the service account email (from credentials.json)
   - Give "Editor" permissions
4. Copy Sheet ID from URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### 2. Telegram Bot Setup

#### Create Bot:
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions:
   - Choose bot name (e.g., "ShopEasy Orders Bot")
   - Choose username (e.g., "shopeasy_orders_bot")
4. Save the Bot Token provided

#### Get Chat ID:
1. Start a chat with your bot
2. Send any message to the bot
3. Open: `https://api.telegram.org/bot{BOT_TOKEN}/getUpdates`
4. Find your chat ID in the response

### 3. Backend Configuration

#### Environment Variables:
Create `/app/backend/.env` file:

```env
# MongoDB (existing)
MONGO_URL=mongodb://localhost:27017/
DB_NAME=shopeasy_db

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SHEET_NAME=Sheet1

# Telegram Configuration  
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

#### Credentials File:
Place your `credentials.json` file in `/app/backend/` directory.

⚠️ **IMPORTANT**: Never commit `credentials.json` to version control!

### 4. Installation & Deployment

#### Install Dependencies:
```bash
# Backend
cd /app/backend
pip install -r requirements.txt

# Frontend (if needed)
cd /app/frontend  
yarn install
```

#### Start Services:
```bash
# Restart all services
sudo supervisorctl restart all

# Or individually
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

#### Test Configuration:
Visit: `http://your-domain/api/test-connections`

This will test:
- Google Sheets connectivity
- Telegram bot connectivity  
- Service account email verification

## 📝 Configuration Files

### Backend Files Location:
```
/app/backend/
├── credentials.json          # Google Service Account credentials
├── .env                     # Environment variables
├── server.py                # Main FastAPI application
├── google_sheets_service.py # Google Sheets integration
├── telegram_service.py      # Telegram bot integration
└── requirements.txt         # Python dependencies
```

### Key Configuration Points:

1. **Google Sheets Service** (`google_sheets_service.py`):
   - Handles authentication with Google Sheets API
   - Manages order data writing to spreadsheet
   - Creates header rows automatically

2. **Telegram Service** (`telegram_service.py`):
   - Sends formatted order notifications
   - Handles error notifications
   - Manages bot communication

3. **Main Server** (`server.py`):
   - Order processing endpoint: `/api/orders`
   - Rate limiting and spam protection
   - Error handling and logging

## 🔄 Order Flow

1. **Customer places order** on website
2. **Frontend** sends order data to `/api/orders` endpoint
3. **Backend** processes order:
   - Validates data & checks rate limits
   - Adds order to Google Sheets
   - Sends Telegram notification to owner
   - Stores backup in MongoDB
   - Returns success/error response
4. **Customer** sees confirmation message
5. **Owner** receives Telegram notification with order details

## 🛡️ Security Features

- **Rate Limiting**: 5 orders per 5 minutes per IP
- **Honeypot Protection**: Hidden fields to catch bots
- **Input Validation**: Strict validation on all fields
- **Error Handling**: Graceful error handling with notifications
- **Credentials Security**: Service account authentication

## 🚨 Troubleshooting

### Common Issues:

1. **Google Sheets Permission Denied**:
   - Check if service account email is shared with the sheet
   - Verify service account has "Editor" permissions

2. **Telegram Bot Not Working**:
   - Verify bot token is correct
   - Check if chat ID is correct
   - Ensure you've started a chat with the bot

3. **Orders Not Appearing in Sheet**:
   - Check Sheet ID is correct in environment variables
   - Verify credentials.json file is in correct location
   - Check API logs: `tail -f /var/log/supervisor/backend.*.log`

4. **Backend Not Starting**:
   - Check if all dependencies are installed: `pip install -r requirements.txt`
   - Verify environment variables in `.env` file
   - Check supervisor logs for detailed errors

### Testing Endpoints:

- **Health Check**: `GET /api/health`
- **Test Connections**: `GET /api/test-connections`
- **Recent Orders**: `GET /api/orders`

## 📊 Monitoring

### Logs Location:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# All supervisor logs
sudo supervisorctl status
```

### Google Sheets Monitoring:
- Check your Google Sheet for new orders
- Order data appears as new rows automatically
- Headers are created automatically if sheet is empty

### Telegram Monitoring:
- Check your Telegram chat for order notifications
- Error notifications are sent for any processing failures

## 🔧 Customization

### Adding New Product Fields:
1. Update order model in `server.py`
2. Modify sheet headers in `google_sheets_service.py`
3. Update Telegram message format in `telegram_service.py`

### Changing Notification Format:
Edit the `_format_order_message()` method in `telegram_service.py`

### Rate Limiting Adjustment:
Modify the `check_rate_limit()` function parameters in `server.py`

## 🚀 Production Deployment

### Security Checklist:
- [ ] Store `credentials.json` in secure secret manager
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS for all endpoints
- [ ] Implement proper logging and monitoring
- [ ] Set up backup strategies for Google Sheets
- [ ] Configure proper CORS origins
- [ ] Implement database connection pooling

### Performance Optimization:
- [ ] Implement proper caching strategies
- [ ] Add database indexes for order queries
- [ ] Set up CDN for static assets
- [ ] Configure load balancing if needed

---

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs for detailed error messages
3. Verify all credentials and configurations
4. Test individual components using the provided endpoints

---

**Built with ❤️ using FastAPI, React, Google Sheets API, and Telegram Bot API**
