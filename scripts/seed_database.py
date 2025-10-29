#!/usr/bin/env python3
"""
Database Seed Script for Breckland Heating Application
This script populates the database with initial data including:
- Company settings and logo
- Test customers
- Test services
- Test certificates
- Test invoices and estimates

Usage: python scripts/seed_database.py
"""

from pymongo import MongoClient
import os
from pathlib import Path
from dotenv import load_dotenv
import json
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment
ROOT_DIR = Path(__file__).parent.parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

def seed_database():
    """Seed the database with initial data"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    if not mongo_url:
        print("❌ MONGO_URL environment variable not set")
        return False
    
    client = MongoClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'breckland_heating')]
    
    print("🌱 Seeding Breckland Heating database...")
    print(f"   Database: {os.environ.get('DB_NAME', 'breckland_heating')}")
    print()
    
    # Load seed data from JSON files
    data_dir = Path(__file__).parent.parent / 'scripts' / 'seed_data'
    
    try:
        # Import customers
        customers_file = data_dir / 'customers.json'
        if customers_file.exists():
            customers = json.load(open(customers_file))
            if customers:
                db.customers.delete_many({})
                db.customers.insert_many(customers)
                print(f"✅ Seeded {len(customers)} customers")
        
        # Import services
        services_file = data_dir / 'services.json'
        if services_file.exists():
            services = json.load(open(services_file))
            if services:
                db.services.delete_many({})
                db.services.insert_many(services)
                print(f"✅ Seeded {len(services)} services")
        
        # Import certificates
        certificates_file = data_dir / 'certificates.json'
        if certificates_file.exists():
            certificates = json.load(open(certificates_file))
            if certificates:
                db.certificates.delete_many({})
                db.certificates.insert_many(certificates)
                print(f"✅ Seeded {len(certificates)} certificates")
        
        # Import invoices
        invoices_file = data_dir / 'invoices.json'
        if invoices_file.exists():
            invoices = json.load(open(invoices_file))
            if invoices:
                db.invoices.delete_many({})
                db.invoices.insert_many(invoices)
                print(f"✅ Seeded {len(invoices)} invoices")
        
        # Import estimates
        estimates_file = data_dir / 'estimates.json'
        if estimates_file.exists():
            estimates = json.load(open(estimates_file))
            if estimates:
                db.estimates.delete_many({})
                db.estimates.insert_many(estimates)
                print(f"✅ Seeded {len(estimates)} estimates")
        
        # Import company settings
        settings_file = data_dir / 'company_settings.json'
        if settings_file.exists():
            settings = json.load(open(settings_file))
            if settings:
                settings['id'] = 'company_settings'
                db.company_settings.delete_many({})
                db.company_settings.insert_one(settings)
                print(f"✅ Seeded company settings")
                print(f"   Company: {settings.get('company_name')}")
                print(f"   Logo: {'Yes' if settings.get('logo') else 'No'}")
        
        print()
        print("🎉 Database seeding completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error seeding database: {str(e)}")
        return False

if __name__ == '__main__':
    success = seed_database()
    sys.exit(0 if success else 1)
