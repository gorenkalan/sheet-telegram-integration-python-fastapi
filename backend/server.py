from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import logging
import uuid
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Import our services
import sys
sys.path.append('/app/backend')
from google_sheets_service import sheets_service
from telegram_service import telegram_service

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'shopeasy_db')]

# Create the main app
app = FastAPI(title="ShopEasy API", description="E-commerce API with Google Sheets and Telegram integration")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Rate limiting storage (simple in-memory for MVP)
rate_limit_storage = {}

# Pydantic Models
class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    customer_phone: str = Field(..., min_length=10, max_length=15)
    customer_address: str = Field(..., min_length=10, max_length=500)
    product_id: int
    product_name: str
    product_category: str
    product_price: str
    selected_color: str
    selected_size: str
    quantity: int = Field(default=1, ge=1, le=100)
    notes: Optional[str] = Field(default="", max_length=500)
    honeypot: str = Field(default="")  # Spam protection
    timestamp: Optional[str] = None

    @validator('honeypot')
    def honeypot_must_be_empty(cls, v):
        if v and v.strip():
            raise ValueError('Spam detected')
        return v

class OrderResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str
    message: str
    order_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class TestConnectionResponse(BaseModel):
    google_sheets: Dict[str, Any]
    telegram: Dict[str, Any]
    service_account_email: str

# Rate limiting function
async def check_rate_limit(client_ip: str, limit: int = 5, window: int = 300) -> bool:
    """Simple rate limiting - 5 requests per 5 minutes per IP"""
    current_time = datetime.now().timestamp()
    
    if client_ip not in rate_limit_storage:
        rate_limit_storage[client_ip] = []
    
    # Clean old entries
    rate_limit_storage[client_ip] = [
        timestamp for timestamp in rate_limit_storage[client_ip]
        if current_time - timestamp < window
    ]
    
    # Check if limit exceeded
    if len(rate_limit_storage[client_ip]) >= limit:
        return False
    
    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    return True

# API Routes
@api_router.get("/")
async def root():
    return {"message": "ShopEasy API - Google Sheets & Telegram Integration"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "google_sheets": "configured" if sheets_service.service else "not_configured",
            "telegram": "configured" if telegram_service.bot_token != 'YOUR_BOT_TOKEN_PLACEHOLDER' else "not_configured"
        }
    }

@api_router.get("/test-connections", response_model=TestConnectionResponse)
async def test_connections():
    """Test Google Sheets and Telegram connections"""
    
    # Test Google Sheets
    try:
        sheets_result = await sheets_service.create_header_row()
        google_status = sheets_result
    except Exception as e:
        google_status = {"success": False, "error": str(e)}
    
    # Test Telegram
    telegram_status = await telegram_service.test_connection()
    
    # Get service account email
    service_email = sheets_service.get_service_account_email()
    
    return TestConnectionResponse(
        google_sheets=google_status,
        telegram=telegram_status,
        service_account_email=service_email
    )

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate, request: Request):
    """Create a new order and send to Google Sheets + Telegram"""
    
    # Get client IP for rate limiting
    client_ip = request.client.host
    
    # Check rate limiting
    if not await check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait before placing another order."
        )
    
    try:
        # Generate order ID
        order_id = str(uuid.uuid4())
        current_timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        
        # Prepare order data for Google Sheets
        order_data = {
            'order_id': order_id,
            'timestamp': current_timestamp,
            'customer_name': order.customer_name,
            'customer_email': order.customer_email,
            'customer_phone': order.customer_phone,
            'customer_address': order.customer_address,
            'product_id': order.product_id,
            'product_name': order.product_name,
            'product_category': order.product_category,
            'product_price': order.product_price,
            'selected_color': order.selected_color,
            'selected_size': order.selected_size,
            'quantity': order.quantity,
            'notes': order.notes
        }
        
        # Add to Google Sheets
        sheets_result = await sheets_service.add_order_to_sheet(order_data)
        
        if not sheets_result.get('success', False):
            # If Google Sheets fails, send error notification
            await telegram_service.send_error_notification(
                f"Failed to add order to Google Sheets: {sheets_result.get('error', 'Unknown error')}",
                order_data
            )
            
            raise HTTPException(
                status_code=500,
                detail="Failed to process order. Please try again or contact support."
            )
        
        # Send Telegram notification to owner
        telegram_result = await telegram_service.send_order_notification(order_data)
        
        if not telegram_result.get('success', False):
            logger.warning(f"Failed to send Telegram notification: {telegram_result.get('error', 'Unknown error')}")
            # Don't fail the order if Telegram fails, just log it
        
        # Store order in MongoDB as backup
        order_doc = {
            **order_data,
            'sheets_result': sheets_result,
            'telegram_result': telegram_result,
            'created_at': datetime.utcnow()
        }
        
        await db.orders.insert_one(order_doc)
        
        logger.info(f"Order {order_id} processed successfully")
        
        return OrderResponse(
            id=order_id,
            status="success",
            message="Order placed successfully! You will receive a confirmation email shortly.",
            order_id=order_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process order: {str(e)}")
        
        # Send error notification to owner
        try:
            await telegram_service.send_error_notification(
                f"Order processing failed: {str(e)}",
                order.dict() if hasattr(order, 'dict') else {}
            )
        except:
            pass  # Don't fail if error notification fails
        
        raise HTTPException(
            status_code=500,
            detail="Failed to process order. Please try again or contact support."
        )

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    """Legacy endpoint for status checks"""
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    """Legacy endpoint for getting status checks"""
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.get("/orders")
async def get_orders(limit: int = 50):
    """Get recent orders from MongoDB"""
    try:
        orders = await db.orders.find().sort("created_at", -1).limit(limit).to_list(limit)
        # Convert ObjectId to string for JSON serialization
        for order in orders:
            order['_id'] = str(order['_id'])
        return {"orders": orders}
    except Exception as e:
        logger.error(f"Failed to get orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orders")

# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status": "error"}
    )

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("ShopEasy API starting up...")
    logger.info(f"Google Sheets configured: {sheets_service.service is not None}")
    logger.info(f"Telegram configured: {telegram_service.bot_token != 'YOUR_BOT_TOKEN_PLACEHOLDER'}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("ShopEasy API shutting down...")
