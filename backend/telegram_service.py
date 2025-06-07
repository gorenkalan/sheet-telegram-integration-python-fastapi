import os
import asyncio
import logging
from typing import Dict, Any
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_PLACEHOLDER')
        self.chat_id = os.getenv('TELEGRAM_CHAT_ID', 'YOUR_CHAT_ID_PLACEHOLDER')
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}"
    
    def _escape_markdown(self, text: str) -> str:
        """Escape special characters for MarkdownV2"""
        special_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
        for char in special_chars:
            text = text.replace(char, f'\\{char}')
        return text
    
    async def send_order_notification(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send new order notification to Telegram"""
        try:
            # Format the message
            message = self._format_order_message(order_data)
            
            # Send message via Telegram API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/sendMessage",
                    json={
                        "chat_id": self.chat_id,
                        "text": message,
                        "parse_mode": "MarkdownV2"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info("Order notification sent successfully to Telegram")
                    return {
                        'success': True,
                        'message': 'Notification sent successfully'
                    }
                else:
                    logger.error(f"Failed to send Telegram message. Status: {response.status_code}")
                    return {
                        'success': False,
                        'error': f"Telegram API error: {response.status_code}"
                    }
                    
        except Exception as e:
            logger.error(f"Failed to send Telegram notification: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to send notification: {str(e)}"
            }
    
    def _format_order_message(self, order_data: Dict[str, Any]) -> str:
        """Format order data into a readable Telegram message"""
        # Escape special characters for MarkdownV2
        customer_name = self._escape_markdown(order_data.get('customer_name', 'N/A'))
        customer_phone = self._escape_markdown(order_data.get('customer_phone', 'N/A'))
        customer_email = self._escape_markdown(order_data.get('customer_email', 'N/A'))
        customer_address = self._escape_markdown(order_data.get('customer_address', 'N/A'))
        product_name = self._escape_markdown(order_data.get('product_name', 'N/A'))
        product_category = self._escape_markdown(order_data.get('product_category', 'N/A'))
        product_price = self._escape_markdown(order_data.get('product_price', 'N/A'))
        selected_color = self._escape_markdown(order_data.get('selected_color', 'N/A'))
        selected_size = self._escape_markdown(order_data.get('selected_size', 'N/A'))
        quantity = self._escape_markdown(str(order_data.get('quantity', 1)))
        notes = self._escape_markdown(order_data.get('notes', 'None'))
        timestamp = self._escape_markdown(order_data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        message = f"""🛒 *NEW ORDER RECEIVED\\!*

📋 *Order Details:*
• *Customer:* {customer_name}
• *Phone:* {customer_phone}  
• *Email:* {customer_email}
• *Address:* {customer_address}

🛍️ *Product Information:*
• *Product:* {product_name}
• *Category:* {product_category}
• *Price:* {product_price}
• *Color:* {selected_color}
• *Size:* {selected_size}
• *Quantity:* {quantity}

📝 *Notes:* {notes}

⏰ *Timestamp:* {timestamp}

Please contact the customer to confirm the order\\."""
        
        return message
    
    async def send_error_notification(self, error_message: str, order_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send error notification to Telegram"""
        try:
            # Format error message
            customer_name = order_data.get('customer_name', 'Unknown') if order_data else 'Unknown'
            escaped_error = self._escape_markdown(error_message)
            escaped_customer = self._escape_markdown(customer_name)
            timestamp = self._escape_markdown(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            
            message = f"""⚠️ *ORDER PROCESSING ERROR\\!*

*Error Details:*
• *Customer:* {escaped_customer}
• *Error:* {escaped_error}
• *Timestamp:* {timestamp}

Please check the system and contact the customer if needed\\."""
            
            # Send message via Telegram API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/sendMessage",
                    json={
                        "chat_id": self.chat_id,
                        "text": message,
                        "parse_mode": "MarkdownV2"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info("Error notification sent successfully to Telegram")
                    return {
                        'success': True,
                        'message': 'Error notification sent successfully'
                    }
                else:
                    logger.error(f"Failed to send Telegram error message. Status: {response.status_code}")
                    return {
                        'success': False,
                        'error': f"Telegram API error: {response.status_code}"
                    }
                    
        except Exception as e:
            logger.error(f"Failed to send Telegram error notification: {str(e)}")
            return {
                'success': False,
                'error': f"Failed to send error notification: {str(e)}"
            }
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test Telegram bot connection"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/getMe",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    bot_info = response.json()
                    return {
                        'success': True,
                        'bot_info': bot_info.get('result', {}),
                        'message': 'Telegram bot connection successful'
                    }
                else:
                    return {
                        'success': False,
                        'error': f"Telegram API error: {response.status_code}"
                    }
                    
        except Exception as e:
            logger.error(f"Failed to test Telegram connection: {str(e)}")
            return {
                'success': False,
                'error': f"Connection test failed: {str(e)}"
            }

# Initialize the service
telegram_service = TelegramService()
