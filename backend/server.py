from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class Appliance(BaseModel):
    type: str  # boiler, heater, cooker, etc.
    location: str
    make_model: str
    condition: str  # Pass, Fail, At Risk

class SafetyChecks(BaseModel):
    gas_tightness: str
    flue_condition: str
    ventilation: str
    gas_pressure: str
    burner_operation: str
    safety_devices: str

class CP12Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    serial_number: str
    
    # Property details
    property_address: str
    landlord_name: str
    landlord_contact: str
    
    # Engineer details
    engineer_name: str
    gas_safe_id: str
    engineer_signature: Optional[str] = None  # Base64 encoded image
    
    # Inspection details
    inspection_date: str
    next_inspection_due: str
    
    # Appliances
    appliances: List[Appliance]
    
    # Safety checks
    safety_checks: SafetyChecks
    
    # Additional info
    defects_actions: Optional[str] = None
    compliance_statement: str = "This inspection complies with the Gas Safety (Installation and Use) Regulations 1998"
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CP12CertificateCreate(BaseModel):
    property_address: str
    landlord_name: str
    landlord_contact: str
    engineer_name: str
    gas_safe_id: str
    engineer_signature: Optional[str] = None
    inspection_date: str
    next_inspection_due: str
    appliances: List[Appliance]
    safety_checks: SafetyChecks
    defects_actions: Optional[str] = None

class CP12CertificateUpdate(BaseModel):
    property_address: Optional[str] = None
    landlord_name: Optional[str] = None
    landlord_contact: Optional[str] = None
    engineer_name: Optional[str] = None
    gas_safe_id: Optional[str] = None
    engineer_signature: Optional[str] = None
    inspection_date: Optional[str] = None
    next_inspection_due: Optional[str] = None
    appliances: Optional[List[Appliance]] = None
    safety_checks: Optional[SafetyChecks] = None
    defects_actions: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "CP12 Certificate System API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# CP12 Certificate Routes

@api_router.get("/certificates/next-serial")
async def get_next_serial():
    """Get the next available serial number for the current year"""
    current_year = datetime.now().year
    
    # Find the latest certificate for this year
    latest = await db.certificates.find_one(
        {"serial_number": {"$regex": f"^{current_year}-"}},
        sort=[("serial_number", -1)]
    )
    
    if latest:
        # Extract the number part and increment
        parts = latest['serial_number'].split('-')
        next_num = int(parts[1]) + 1
    else:
        # First certificate of the year
        next_num = 1
    
    serial_number = f"{current_year}-{next_num:03d}"
    return {"serial_number": serial_number}

@api_router.post("/certificates", response_model=CP12Certificate)
async def create_certificate(certificate_data: CP12CertificateCreate):
    """Create a new CP12 certificate"""
    # Get next serial number
    serial_response = await get_next_serial()
    serial_number = serial_response['serial_number']
    
    # Create certificate object
    cert_dict = certificate_data.model_dump()
    cert_obj = CP12Certificate(**cert_dict, serial_number=serial_number)
    
    # Convert to dict for MongoDB
    doc = cert_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    # Insert into database
    await db.certificates.insert_one(doc)
    
    return cert_obj

@api_router.get("/certificates", response_model=List[CP12Certificate])
async def get_certificates():
    """Get all certificates"""
    certificates = await db.certificates.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for cert in certificates:
        if isinstance(cert['created_at'], str):
            cert['created_at'] = datetime.fromisoformat(cert['created_at'])
        if isinstance(cert['updated_at'], str):
            cert['updated_at'] = datetime.fromisoformat(cert['updated_at'])
    
    return certificates

@api_router.get("/certificates/{certificate_id}", response_model=CP12Certificate)
async def get_certificate(certificate_id: str):
    """Get a specific certificate by ID"""
    certificate = await db.certificates.find_one({"id": certificate_id}, {"_id": 0})
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Convert ISO string timestamps back to datetime objects
    if isinstance(certificate['created_at'], str):
        certificate['created_at'] = datetime.fromisoformat(certificate['created_at'])
    if isinstance(certificate['updated_at'], str):
        certificate['updated_at'] = datetime.fromisoformat(certificate['updated_at'])
    
    return certificate

@api_router.put("/certificates/{certificate_id}", response_model=CP12Certificate)
async def update_certificate(certificate_id: str, update_data: CP12CertificateUpdate):
    """Update an existing certificate"""
    # Check if certificate exists
    existing = await db.certificates.find_one({"id": certificate_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Update in database
    await db.certificates.update_one(
        {"id": certificate_id},
        {"$set": update_dict}
    )
    
    # Fetch and return updated certificate
    updated_cert = await db.certificates.find_one({"id": certificate_id}, {"_id": 0})
    
    # Convert ISO string timestamps back to datetime objects
    if isinstance(updated_cert['created_at'], str):
        updated_cert['created_at'] = datetime.fromisoformat(updated_cert['created_at'])
    if isinstance(updated_cert['updated_at'], str):
        updated_cert['updated_at'] = datetime.fromisoformat(updated_cert['updated_at'])
    
    return updated_cert

@api_router.delete("/certificates/{certificate_id}")
async def delete_certificate(certificate_id: str):
    """Delete a certificate"""
    result = await db.certificates.delete_one({"id": certificate_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return {"message": "Certificate deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()