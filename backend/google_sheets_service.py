import os
import json
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self):
        self.SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        self.credentials_file = 'credentials.json'
        self.spreadsheet_id = os.getenv('GOOGLE_SHEET_ID', 'YOUR_SHEET_ID_PLACEHOLDER')
        self.sheet_name = os.getenv('GOOGLE_SHEET_NAME', 'Sheet1')
        self.service = self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Sheets service with credentials"""
        try:
            # Check if credentials file exists
            if not os.path.exists(self.credentials_file):
                logger.warning(f"Credentials file {self.credentials_file} not found. Using placeholder.")
                return None
            
            # Load credentials from service account file
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_file, 
                scopes=self.SCOPES
            )
            
            # Build the service
            service = build('sheets', 'v4', credentials=credentials)
            logger.info("Google Sheets service initialized successfully")
            return service.spreadsheets()
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets service: {str(e)}")
            return None
    
    def get_service_account_email(self) -> str:
        """Get the service account email from credentials file"""
        try:
            if os.path.exists(self.credentials_file):
                with open(self.credentials_file, 'r') as f:
                    creds_data = json.load(f)
                    return creds_data.get('client_email', 'SERVICE_ACCOUNT_EMAIL_PLACEHOLDER')
            else:
                return 'SERVICE_ACCOUNT_EMAIL_PLACEHOLDER'
        except Exception as e:
            logger.error(f"Failed to get service account email: {str(e)}")
            return 'SERVICE_ACCOUNT_EMAIL_PLACEHOLDER'
    
    async def add_order_to_sheet(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new order row to Google Sheets"""
        try:
            if not self.service:
                raise Exception("Google Sheets service not initialized. Please check credentials.json file.")
            
            # Prepare the row data
            row_data = [
                order_data.get('timestamp', ''),
                order_data.get('customer_name', ''),
                order_data.get('customer_email', ''),
                order_data.get('customer_phone', ''),
                order_data.get('customer_address', ''),
                order_data.get('product_name', ''),
                order_data.get('product_category', ''),
                order_data.get('product_price', ''),
                order_data.get('selected_color', ''),
                order_data.get('selected_size', ''),
                str(order_data.get('quantity', 1)),
                order_data.get('notes', ''),
                'New Order'  # Status column
            ]
            
            # Define the range to append data
            range_name = f"{self.sheet_name}!A:M"
            
            # Prepare the request body
            body = {
                'values': [row_data]
            }
            
            # Execute the request
            result = self.service.values().append(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            # Get updated range info
            updated_range = result.get('updates', {}).get('updatedRange', '')
            updated_rows = result.get('updates', {}).get('updatedRows', 0)
            
            logger.info(f"Successfully added order to sheet. Updated range: {updated_range}")
            
            return {
                'success': True,
                'updated_range': updated_range,
                'updated_rows': updated_rows,
                'row_data': row_data
            }
            
        except HttpError as error:
            logger.error(f"Google Sheets API error: {error}")
            return {
                'success': False,
                'error': f"Google Sheets API error: {str(error)}"
            }
        except Exception as error:
            logger.error(f"Failed to add order to sheet: {error}")
            return {
                'success': False,
                'error': f"Failed to add order to sheet: {str(error)}"
            }
    
    async def create_header_row(self):
        """Create header row if sheet is empty"""
        try:
            if not self.service:
                return {'success': False, 'error': 'Service not initialized'}
            
            # Check if sheet has data
            range_name = f"{self.sheet_name}!A1:M1"
            result = self.service.values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            
            # If no header row, create one
            if not values:
                headers = [
                    'Timestamp',
                    'Customer Name',
                    'Customer Email',
                    'Customer Phone',
                    'Customer Address',
                    'Product Name',
                    'Product Category',
                    'Product Price',
                    'Selected Color',
                    'Selected Size',
                    'Quantity',
                    'Notes',
                    'Status'
                ]
                
                body = {'values': [headers]}
                
                self.service.values().update(
                    spreadsheetId=self.spreadsheet_id,
                    range=f"{self.sheet_name}!A1:M1",
                    valueInputOption='USER_ENTERED',
                    body=body
                ).execute()
                
                logger.info("Header row created successfully")
                return {'success': True, 'message': 'Header row created'}
            
            return {'success': True, 'message': 'Header row already exists'}
            
        except Exception as e:
            logger.error(f"Failed to create header row: {str(e)}")
            return {'success': False, 'error': str(e)}

# Initialize the service
sheets_service = GoogleSheetsService()
