from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
import jwt
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

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "breckland-heating-secret-key-2025")
ALGORITHM = "HS256"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # admin or staff
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "staff"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_number: str
    name: str
    address: str
    phone: str
    email: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    address: str
    phone: str
    email: Optional[str] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class InvoiceItem(BaseModel):
    service_id: str
    service_name: str
    description: Optional[str] = None
    quantity: float
    price: float
    total: float

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    customer_id: str
    customer_name: str
    customer_address: str
    customer_phone: str
    customer_email: Optional[str] = None
    items: List[InvoiceItem]
    subtotal: float
    vat_rate: float = 20.0
    vat_amount: float
    total: float
    status: str = "unpaid"  # unpaid, paid
    issue_date: datetime
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    customer_id: str
    items: List[InvoiceItem]
    issue_date: datetime
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    vat_rate: float = 20.0

class Estimate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    estimate_number: str
    customer_id: str
    customer_name: str
    customer_address: str
    customer_phone: str
    customer_email: Optional[str] = None
    items: List[InvoiceItem]
    subtotal: float
    vat_rate: float = 20.0
    vat_amount: float
    total: float
    status: str = "pending"  # pending, accepted, rejected, converted
    issue_date: datetime
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EstimateCreate(BaseModel):
    customer_id: str
    items: List[InvoiceItem]
    issue_date: datetime
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    vat_rate: float = 20.0

class CompanySettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "company_settings"
    company_name: str = "Breckland Heating Limited"
    address: str = ""
    phone: str = ""
    email: str = ""
    registration_number: str = ""
    vat_number: str = ""
    bank_name: str = ""
    account_number: str = ""
    sort_code: str = ""
    logo: Optional[str] = None  # base64 encoded image
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanySettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    registration_number: Optional[str] = None
    vat_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    sort_code: Optional[str] = None

class ApplianceCheck(BaseModel):
    appliance_type: str
    make_model: str
    installation_area: str
    to_be_inspected: bool = True
    flue_type: str  # Open, Balanced, Fan assisted
    operating_pressure: Optional[str] = None  # mb or kWh
    safety_devices_ok: bool = True
    ventilation_satisfactory: bool = True
    flue_condition_satisfactory: bool = True
    flue_operation_ok: bool = True
    co_reading: Optional[str] = None  # XX.XXXX format
    co2_reading: Optional[str] = None  # XX.XXXX format
    fan_pressure_reading: Optional[str] = None  # -XXX.X mb
    defects: Optional[str] = None

class GasSafetyCertificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    certificate_type: str  # CP12, CD11, CD10, TI133D, BENCHMARK
    certificate_number: str
    # Landlord/Customer details
    landlord_customer_name: str
    landlord_customer_address: str
    landlord_customer_phone: str
    landlord_customer_email: Optional[str] = None
    # Work/Inspection address
    inspection_address: str
    
    # CP12 - Landlord Gas Safety Certificate fields
    let_by_tightness_test: Optional[bool] = None
    equipotential_bonding: Optional[bool] = None
    ecv_accessible: Optional[bool] = None
    pipework_visual_inspection: Optional[bool] = None
    co_alarm_working: Optional[bool] = None
    smoke_alarm_working: Optional[bool] = None
    appliances: Optional[List[ApplianceCheck]] = None
    compliance_statement: Optional[str] = None
    
    # CD11 - OFTEC Oil Service Certificate fields
    oil_service_work: Optional[str] = None
    smoke_number: Optional[str] = None
    co_ppm: Optional[str] = None
    excess_air_percent: Optional[str] = None
    co2_percent: Optional[str] = None
    oil_flow_rate: Optional[str] = None
    flue_gas_temp: Optional[str] = None
    appliance_make_model: Optional[str] = None
    burner_type: Optional[str] = None
    burner_cleaned: Optional[bool] = None
    nozzle_replaced: Optional[bool] = None
    filter_checked: Optional[bool] = None
    controls_tested: Optional[bool] = None
    safety_devices_tested: Optional[bool] = None
    flue_inspected: Optional[bool] = None
    pump_pressure: Optional[str] = None
    nozzle_size: Optional[str] = None
    nozzle_angle: Optional[str] = None
    net_efficiency: Optional[str] = None
    gross_efficiency: Optional[str] = None
    parts_replaced: Optional[str] = None
    
    # GWN - Gas Warning Notice fields
    risk_classification: Optional[str] = None  # ID or AR
    defect_description: Optional[str] = None
    action_taken: Optional[str] = None
    warning_label_attached: Optional[bool] = None
    appliance_isolated: Optional[bool] = None
    
    # CD10 - Oil Installation Certificate fields
    tank_type: Optional[str] = None
    tank_capacity: Optional[str] = None
    tank_material: Optional[str] = None
    base_support_type: Optional[str] = None
    pipework_material: Optional[str] = None
    fire_valve_fitted: Optional[bool] = None
    building_control_notified: Optional[bool] = None
    installation_date: Optional[datetime] = None
    work_type: Optional[str] = None
    appliance_serial_number: Optional[str] = None
    output_rating: Optional[str] = None
    fuel_type: Optional[str] = None
    tank_pressure_tested: Optional[bool] = None
    pressure_test_result: Optional[str] = None
    complies_with_standards: Optional[bool] = None
    customer_signature: Optional[str] = None
    
    # TI133D - Oil Tank Risk Assessment fields
    tank_construction: Optional[str] = None  # Single wall or Bunded
    spillage_risk_level: Optional[str] = None
    fire_risk_level: Optional[str] = None
    distance_to_building: Optional[str] = None
    secondary_containment_adequate: Optional[bool] = None
    tank_age: Optional[str] = None
    tank_location: Optional[str] = None
    tank_condition_good: Optional[bool] = None
    tank_positioned_correctly: Optional[bool] = None
    adequate_ventilation: Optional[bool] = None
    fire_valve_present: Optional[bool] = None
    distance_adequate: Optional[bool] = None
    away_from_ignition_sources: Optional[bool] = None
    away_from_drains: Optional[bool] = None
    pipework_secure: Optional[bool] = None
    no_visible_leaks: Optional[bool] = None
    vent_pipe_correct: Optional[bool] = None
    fill_line_correct: Optional[bool] = None
    environmental_hazards: Optional[str] = None
    actions_required: Optional[str] = None
    urgent_attention_needed: Optional[bool] = None
    
    # BENCHMARK - Gas Boiler Commissioning Certificate fields
    boiler_make: Optional[str] = None
    boiler_model: Optional[str] = None
    boiler_serial_number: Optional[str] = None
    boiler_type: Optional[str] = None
    gas_rate: Optional[str] = None
    gas_inlet_pressure_max: Optional[str] = None
    burner_gas_pressure: Optional[str] = None
    burner_pressure_na: Optional[bool] = None
    co_max_rate: Optional[str] = None
    co_min_rate: Optional[str] = None
    co2_max_rate: Optional[str] = None
    co2_min_rate: Optional[str] = None
    co_co2_ratio_max: Optional[str] = None
    co_co2_ratio_min: Optional[str] = None
    flue_integrity_checked: Optional[bool] = None
    gas_tightness_tested: Optional[bool] = None
    spillage_test_passed: Optional[bool] = None
    cold_water_inlet_temp: Optional[str] = None
    hot_water_outlets_tested: Optional[bool] = None
    heating_controls_tested: Optional[bool] = None
    hot_water_controls_tested: Optional[bool] = None
    interlock_tested: Optional[bool] = None
    condensate_installed_correctly: Optional[bool] = None
    condensate_termination: Optional[str] = None
    condensate_disposal_method: Optional[str] = None
    complies_with_manufacturer_instructions: Optional[bool] = None
    clearances_met: Optional[bool] = None
    gas_supply_purged: Optional[bool] = None
    operation_demonstrated: Optional[bool] = None
    literature_provided: Optional[bool] = None
    benchmark_explained: Optional[bool] = None
    notification_method: Optional[str] = None
    compliance_certificate_issued: Optional[bool] = None
    
    # Common bottom section
    inspection_date: datetime
    next_inspection_due: Optional[datetime] = None
    engineer_name: str
    gas_safe_number: Optional[str] = None
    oftec_number: Optional[str] = None
    responsible_person_signature: Optional[str] = None
    engineer_signature: Optional[str] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CertificateCreate(BaseModel):
    certificate_type: str
    landlord_customer_name: str
    landlord_customer_address: str
    landlord_customer_phone: str
    landlord_customer_email: Optional[str] = None
    inspection_address: str
    
    # CP12 fields
    let_by_tightness_test: Optional[bool] = None
    equipotential_bonding: Optional[bool] = None
    ecv_accessible: Optional[bool] = None
    pipework_visual_inspection: Optional[bool] = None
    co_alarm_working: Optional[bool] = None
    smoke_alarm_working: Optional[bool] = None
    appliances: Optional[List[ApplianceCheck]] = None
    compliance_statement: Optional[str] = None
    
    # CD11 fields
    oil_service_work: Optional[str] = None
    smoke_number: Optional[str] = None
    co_ppm: Optional[str] = None
    excess_air_percent: Optional[str] = None
    co2_percent: Optional[str] = None
    oil_flow_rate: Optional[str] = None
    flue_gas_temp: Optional[str] = None
    appliance_make_model: Optional[str] = None
    burner_type: Optional[str] = None
    burner_cleaned: Optional[bool] = None
    nozzle_replaced: Optional[bool] = None
    filter_checked: Optional[bool] = None
    controls_tested: Optional[bool] = None
    safety_devices_tested: Optional[bool] = None
    flue_inspected: Optional[bool] = None
    pump_pressure: Optional[str] = None
    nozzle_size: Optional[str] = None
    nozzle_angle: Optional[str] = None
    net_efficiency: Optional[str] = None
    gross_efficiency: Optional[str] = None
    parts_replaced: Optional[str] = None
    
    # GWN fields
    risk_classification: Optional[str] = None
    defect_description: Optional[str] = None
    action_taken: Optional[str] = None
    warning_label_attached: Optional[bool] = None
    appliance_isolated: Optional[bool] = None
    
    # CD10 fields
    tank_type: Optional[str] = None
    tank_capacity: Optional[str] = None
    tank_material: Optional[str] = None
    base_support_type: Optional[str] = None
    pipework_material: Optional[str] = None
    fire_valve_fitted: Optional[bool] = None
    building_control_notified: Optional[bool] = None
    installation_date: Optional[datetime] = None
    work_type: Optional[str] = None
    appliance_serial_number: Optional[str] = None
    output_rating: Optional[str] = None
    fuel_type: Optional[str] = None
    tank_pressure_tested: Optional[bool] = None
    pressure_test_result: Optional[str] = None
    complies_with_standards: Optional[bool] = None
    customer_signature: Optional[str] = None
    
    # TI133D fields
    tank_construction: Optional[str] = None
    spillage_risk_level: Optional[str] = None
    fire_risk_level: Optional[str] = None
    distance_to_building: Optional[str] = None
    secondary_containment_adequate: Optional[bool] = None
    tank_age: Optional[str] = None
    tank_location: Optional[str] = None
    tank_condition_good: Optional[bool] = None
    tank_positioned_correctly: Optional[bool] = None
    adequate_ventilation: Optional[bool] = None
    fire_valve_present: Optional[bool] = None
    distance_adequate: Optional[bool] = None
    away_from_ignition_sources: Optional[bool] = None
    away_from_drains: Optional[bool] = None
    pipework_secure: Optional[bool] = None
    no_visible_leaks: Optional[bool] = None
    vent_pipe_correct: Optional[bool] = None
    fill_line_correct: Optional[bool] = None
    environmental_hazards: Optional[str] = None
    actions_required: Optional[str] = None
    urgent_attention_needed: Optional[bool] = None
    
    # BENCHMARK fields
    boiler_make: Optional[str] = None
    boiler_model: Optional[str] = None
    boiler_serial_number: Optional[str] = None
    boiler_type: Optional[str] = None
    gas_rate: Optional[str] = None
    gas_inlet_pressure_max: Optional[str] = None
    burner_gas_pressure: Optional[str] = None
    burner_pressure_na: Optional[bool] = None
    co_max_rate: Optional[str] = None
    co_min_rate: Optional[str] = None
    co2_max_rate: Optional[str] = None
    co2_min_rate: Optional[str] = None
    co_co2_ratio_max: Optional[str] = None
    co_co2_ratio_min: Optional[str] = None
    flue_integrity_checked: Optional[bool] = None
    gas_tightness_tested: Optional[bool] = None
    spillage_test_passed: Optional[bool] = None
    cold_water_inlet_temp: Optional[str] = None
    hot_water_outlets_tested: Optional[bool] = None
    heating_controls_tested: Optional[bool] = None
    hot_water_controls_tested: Optional[bool] = None
    interlock_tested: Optional[bool] = None
    condensate_installed_correctly: Optional[bool] = None
    condensate_termination: Optional[str] = None
    condensate_disposal_method: Optional[str] = None
    complies_with_manufacturer_instructions: Optional[bool] = None
    clearances_met: Optional[bool] = None
    gas_supply_purged: Optional[bool] = None
    operation_demonstrated: Optional[bool] = None
    literature_provided: Optional[bool] = None
    benchmark_explained: Optional[bool] = None
    notification_method: Optional[str] = None
    compliance_certificate_issued: Optional[bool] = None
    
    # Common fields
    inspection_date: datetime
    next_inspection_due: Optional[datetime] = None
    engineer_name: str
    gas_safe_number: Optional[str] = None
    oftec_number: Optional[str] = None
    responsible_person_signature: Optional[str] = None
    engineer_signature: Optional[str] = None
    notes: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_next_customer_number() -> str:
    last_customer = await db.customers.find_one(sort=[("customer_number", -1)])
    if last_customer:
        last_num = int(last_customer["customer_number"].replace("C", ""))
        return f"C{str(last_num + 1).zfill(5)}"
    return "C00001"

async def get_next_invoice_number() -> str:
    last_invoice = await db.invoices.find_one(sort=[("invoice_number", -1)])
    if last_invoice:
        last_num = int(last_invoice["invoice_number"].replace("INV", ""))
        return f"INV{str(last_num + 1).zfill(5)}"
    return "INV00001"

async def get_next_estimate_number() -> str:
    last_estimate = await db.estimates.find_one(sort=[("estimate_number", -1)])
    if last_estimate:
        last_num = int(last_estimate["estimate_number"].replace("EST", ""))
        return f"EST{str(last_num + 1).zfill(5)}"
    return "EST00001"

async def get_next_certificate_number(cert_type: str) -> str:
    # Map certificate types to prefixes
    prefix_map = {
        "CP12": "CP12",
        "CD11": "CD11",
        "GWN": "GWN",
        "CD10": "CD10",
        "TI133D": "TI133D"
    }
    
    prefix = prefix_map.get(cert_type, "CERT")
    
    # Find last certificate of this type
    last_cert = await db.certificates.find_one(
        {"certificate_type": cert_type},
        sort=[("certificate_number", -1)]
    )
    
    if last_cert:
        # Extract number from certificate number
        cert_num = last_cert["certificate_number"].replace(prefix + "-", "")
        last_num = int(cert_num)
        return f"{prefix}-{str(last_num + 1).zfill(5)}"
    
    return f"{prefix}-00001"

# Routes
@api_router.get("/")
async def root():
    return {"message": "Breckland Heating Limited - Invoicing API"}

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    
    doc = user.model_dump()
    doc["password"] = hash_password(user_data.password)
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    user_obj = User(**{k: v for k, v in user.items() if k != "password"})
    token = create_access_token({"user_id": user_obj.id, "email": user_obj.email, "role": user_obj.role})
    
    return {"token": token, "user": user_obj}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Customer Routes
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    customer_number = await get_next_customer_number()
    customer = Customer(
        customer_number=customer_number,
        **customer_data.model_dump()
    )
    
    doc = customer.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.customers.insert_one(doc)
    return customer

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user)):
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    
    for customer in customers:
        if isinstance(customer['created_at'], str):
            customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if isinstance(customer['created_at'], str):
        customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    
    return Customer(**customer)

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer_data.model_dump()
    await db.customers.update_one({"id": customer_id}, {"$set": update_data})
    
    updated_customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if isinstance(updated_customer['created_at'], str):
        updated_customer['created_at'] = datetime.fromisoformat(updated_customer['created_at'])
    
    return Customer(**updated_customer)

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete customers")
    
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer deleted successfully"}

# Service Routes
@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate, current_user: User = Depends(get_current_user)):
    service = Service(**service_data.model_dump())
    
    doc = service.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.services.insert_one(doc)
    return service

@api_router.get("/services", response_model=List[Service])
async def get_services(current_user: User = Depends(get_current_user)):
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    
    return services

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str, current_user: User = Depends(get_current_user)):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if isinstance(service['created_at'], str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    
    return Service(**service)

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service_data: ServiceCreate, current_user: User = Depends(get_current_user)):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_data.model_dump()
    await db.services.update_one({"id": service_id}, {"$set": update_data})
    
    updated_service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if isinstance(updated_service['created_at'], str):
        updated_service['created_at'] = datetime.fromisoformat(updated_service['created_at'])
    
    return Service(**updated_service)

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete services")
    
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service deleted successfully"}

# Invoice Routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate, current_user: User = Depends(get_current_user)):
    # Get customer
    customer = await db.customers.find_one({"id": invoice_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Calculate totals
    subtotal = sum(item.total for item in invoice_data.items)
    vat_amount = subtotal * (invoice_data.vat_rate / 100)
    total = subtotal + vat_amount
    
    invoice_number = await get_next_invoice_number()
    
    invoice = Invoice(
        invoice_number=invoice_number,
        customer_id=invoice_data.customer_id,
        customer_name=customer["name"],
        customer_address=customer["address"],
        customer_phone=customer["phone"],
        customer_email=customer.get("email"),
        items=invoice_data.items,
        subtotal=subtotal,
        vat_rate=invoice_data.vat_rate,
        vat_amount=vat_amount,
        total=total,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        notes=invoice_data.notes,
        created_by=current_user.id
    )
    
    doc = invoice.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["issue_date"] = doc["issue_date"].isoformat()
    if doc["due_date"]:
        doc["due_date"] = doc["due_date"].isoformat()
    
    await db.invoices.insert_one(doc)
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).sort("invoice_number", -1).to_list(1000)
    
    for invoice in invoices:
        if isinstance(invoice['created_at'], str):
            invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
        if isinstance(invoice['issue_date'], str):
            invoice['issue_date'] = datetime.fromisoformat(invoice['issue_date'])
        if invoice.get('due_date') and isinstance(invoice['due_date'], str):
            invoice['due_date'] = datetime.fromisoformat(invoice['due_date'])
    
    return invoices

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if isinstance(invoice['created_at'], str):
        invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
    if isinstance(invoice['issue_date'], str):
        invoice['issue_date'] = datetime.fromisoformat(invoice['issue_date'])
    if invoice.get('due_date') and isinstance(invoice['due_date'], str):
        invoice['due_date'] = datetime.fromisoformat(invoice['due_date'])
    
    return Invoice(**invoice)

@api_router.patch("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, status: str, current_user: User = Depends(get_current_user)):
    if status not in ["paid", "unpaid"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.invoices.update_one({"id": invoice_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {"message": "Invoice status updated successfully"}

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete invoices")
    
    result = await db.invoices.delete_one({"id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {"message": "Invoice deleted successfully"}

# Estimate Routes
@api_router.post("/estimates", response_model=Estimate)
async def create_estimate(estimate_data: EstimateCreate, current_user: User = Depends(get_current_user)):
    # Get customer
    customer = await db.customers.find_one({"id": estimate_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Calculate totals
    subtotal = sum(item.total for item in estimate_data.items)
    vat_amount = subtotal * (estimate_data.vat_rate / 100)
    total = subtotal + vat_amount
    
    estimate_number = await get_next_estimate_number()
    
    estimate = Estimate(
        estimate_number=estimate_number,
        customer_id=estimate_data.customer_id,
        customer_name=customer["name"],
        customer_address=customer["address"],
        customer_phone=customer["phone"],
        customer_email=customer.get("email"),
        items=estimate_data.items,
        subtotal=subtotal,
        vat_rate=estimate_data.vat_rate,
        vat_amount=vat_amount,
        total=total,
        issue_date=estimate_data.issue_date,
        valid_until=estimate_data.valid_until,
        notes=estimate_data.notes,
        created_by=current_user.id
    )
    
    doc = estimate.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["issue_date"] = doc["issue_date"].isoformat()
    if doc["valid_until"]:
        doc["valid_until"] = doc["valid_until"].isoformat()
    
    await db.estimates.insert_one(doc)
    return estimate

@api_router.get("/estimates", response_model=List[Estimate])
async def get_estimates(current_user: User = Depends(get_current_user)):
    estimates = await db.estimates.find({}, {"_id": 0}).sort("estimate_number", -1).to_list(1000)
    
    for estimate in estimates:
        if isinstance(estimate['created_at'], str):
            estimate['created_at'] = datetime.fromisoformat(estimate['created_at'])
        if isinstance(estimate['issue_date'], str):
            estimate['issue_date'] = datetime.fromisoformat(estimate['issue_date'])
        if estimate.get('valid_until') and isinstance(estimate['valid_until'], str):
            estimate['valid_until'] = datetime.fromisoformat(estimate['valid_until'])
    
    return estimates

@api_router.get("/estimates/{estimate_id}", response_model=Estimate)
async def get_estimate(estimate_id: str, current_user: User = Depends(get_current_user)):
    estimate = await db.estimates.find_one({"id": estimate_id}, {"_id": 0})
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    if isinstance(estimate['created_at'], str):
        estimate['created_at'] = datetime.fromisoformat(estimate['created_at'])
    if isinstance(estimate['issue_date'], str):
        estimate['issue_date'] = datetime.fromisoformat(estimate['issue_date'])
    if estimate.get('valid_until') and isinstance(estimate['valid_until'], str):
        estimate['valid_until'] = datetime.fromisoformat(estimate['valid_until'])
    
    return Estimate(**estimate)

@api_router.post("/estimates/{estimate_id}/convert", response_model=Invoice)
async def convert_estimate_to_invoice(estimate_id: str, current_user: User = Depends(get_current_user)):
    # Get estimate
    estimate = await db.estimates.find_one({"id": estimate_id}, {"_id": 0})
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    if estimate["status"] == "converted":
        raise HTTPException(status_code=400, detail="Estimate already converted")
    
    # Create invoice from estimate
    invoice_number = await get_next_invoice_number()
    
    invoice = Invoice(
        invoice_number=invoice_number,
        customer_id=estimate["customer_id"],
        customer_name=estimate["customer_name"],
        customer_address=estimate["customer_address"],
        customer_phone=estimate["customer_phone"],
        customer_email=estimate.get("customer_email"),
        items=[InvoiceItem(**item) for item in estimate["items"]],
        subtotal=estimate["subtotal"],
        vat_rate=estimate["vat_rate"],
        vat_amount=estimate["vat_amount"],
        total=estimate["total"],
        issue_date=datetime.now(timezone.utc),
        notes=estimate.get("notes"),
        created_by=current_user.id
    )
    
    doc = invoice.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["issue_date"] = doc["issue_date"].isoformat()
    if doc.get("due_date"):
        doc["due_date"] = doc["due_date"].isoformat()
    
    await db.invoices.insert_one(doc)
    
    # Update estimate status
    await db.estimates.update_one({"id": estimate_id}, {"$set": {"status": "converted"}})
    
    return invoice

@api_router.delete("/estimates/{estimate_id}")
async def delete_estimate(estimate_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete estimates")
    
    result = await db.estimates.delete_one({"id": estimate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    return {"message": "Estimate deleted successfully"}

# Gas Safety Certificate Routes
@api_router.post("/certificates", response_model=GasSafetyCertificate)
async def create_certificate(cert_data: CertificateCreate, current_user: User = Depends(get_current_user)):
    certificate_number = await get_next_certificate_number(cert_data.certificate_type)
    
    certificate = GasSafetyCertificate(
        certificate_type=cert_data.certificate_type,
        certificate_number=certificate_number,
        **cert_data.model_dump(exclude={'certificate_type'}),
        created_by=current_user.id
    )
    
    doc = certificate.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["inspection_date"] = doc["inspection_date"].isoformat()
    if doc.get("next_inspection_due"):
        doc["next_inspection_due"] = doc["next_inspection_due"].isoformat()
    
    await db.certificates.insert_one(doc)
    return certificate

@api_router.get("/certificates", response_model=List[GasSafetyCertificate])
async def get_certificates(current_user: User = Depends(get_current_user)):
    certificates = await db.certificates.find({}, {"_id": 0}).sort("certificate_number", -1).to_list(1000)
    
    for cert in certificates:
        if isinstance(cert['created_at'], str):
            cert['created_at'] = datetime.fromisoformat(cert['created_at'])
        if isinstance(cert['inspection_date'], str):
            cert['inspection_date'] = datetime.fromisoformat(cert['inspection_date'])
        if isinstance(cert['next_inspection_due'], str):
            cert['next_inspection_due'] = datetime.fromisoformat(cert['next_inspection_due'])
    
    return certificates

@api_router.get("/certificates/{certificate_id}", response_model=GasSafetyCertificate)
async def get_certificate(certificate_id: str, current_user: User = Depends(get_current_user)):
    certificate = await db.certificates.find_one({"id": certificate_id}, {"_id": 0})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    if isinstance(certificate['created_at'], str):
        certificate['created_at'] = datetime.fromisoformat(certificate['created_at'])
    if isinstance(certificate['inspection_date'], str):
        certificate['inspection_date'] = datetime.fromisoformat(certificate['inspection_date'])
    if isinstance(certificate['next_inspection_due'], str):
        certificate['next_inspection_due'] = datetime.fromisoformat(certificate['next_inspection_due'])
    
    return GasSafetyCertificate(**certificate)

@api_router.put("/certificates/{certificate_id}", response_model=GasSafetyCertificate)
async def update_certificate(certificate_id: str, cert_data: CertificateCreate, current_user: User = Depends(get_current_user)):
    certificate = await db.certificates.find_one({"id": certificate_id})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    update_data = cert_data.model_dump(exclude_unset=True)
    update_data["inspection_date"] = cert_data.inspection_date.isoformat()
    if cert_data.next_inspection_due:
        update_data["next_inspection_due"] = cert_data.next_inspection_due.isoformat()
    
    if cert_data.appliances:
        update_data["appliances"] = [app.model_dump() for app in cert_data.appliances]
    
    await db.certificates.update_one({"id": certificate_id}, {"$set": update_data})
    
    updated_cert = await db.certificates.find_one({"id": certificate_id}, {"_id": 0})
    if isinstance(updated_cert['created_at'], str):
        updated_cert['created_at'] = datetime.fromisoformat(updated_cert['created_at'])
    if isinstance(updated_cert['inspection_date'], str):
        updated_cert['inspection_date'] = datetime.fromisoformat(updated_cert['inspection_date'])
    if updated_cert.get('next_inspection_due') and isinstance(updated_cert['next_inspection_due'], str):
        updated_cert['next_inspection_due'] = datetime.fromisoformat(updated_cert['next_inspection_due'])
    
    return GasSafetyCertificate(**updated_cert)

@api_router.delete("/certificates/{certificate_id}")
async def delete_certificate(certificate_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete certificates")
    
    result = await db.certificates.delete_one({"id": certificate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return {"message": "Certificate deleted successfully"}

# Company Settings Routes
@api_router.get("/settings", response_model=CompanySettings)
async def get_settings(current_user: User = Depends(get_current_user)):
    settings = await db.company_settings.find_one({"id": "company_settings"}, {"_id": 0})
    
    if not settings:
        # Create default settings
        default_settings = CompanySettings()
        doc = default_settings.model_dump()
        doc["updated_at"] = doc["updated_at"].isoformat()
        await db.company_settings.insert_one(doc)
        return default_settings
    
    if isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    
    return CompanySettings(**settings)

@api_router.put("/settings", response_model=CompanySettings)
async def update_settings(settings_data: CompanySettingsUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update settings")
    
    update_data = settings_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.company_settings.update_one(
        {"id": "company_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.company_settings.find_one({"id": "company_settings"}, {"_id": 0})
    if isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    
    return CompanySettings(**settings)

@api_router.post("/settings/logo")
async def upload_logo(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload logo")
    
    # Read file and encode to base64
    contents = await file.read()
    base64_encoded = base64.b64encode(contents).decode('utf-8')
    logo_data = f"data:{file.content_type};base64,{base64_encoded}"
    
    # Update settings
    await db.company_settings.update_one(
        {"id": "company_settings"},
        {"$set": {"logo": logo_data, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Logo uploaded successfully", "logo": logo_data}

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