# Database Seed Scripts

This directory contains scripts to initialize your Breckland Heating database with test data.

## Seed Database Script

The `seed_database.py` script populates your database with:

- **Company Settings** (including logo)
- **9 Test Customers**
- **9 Test Services**
- **4 Test Certificates** (CP12, BENCHMARK, CD10, TI133D)
- **11 Test Invoices**
- **6 Test Estimates**

### Usage

```bash
# From the /app directory
python scripts/seed_database.py
```

### When to Use

- **First time setup**: After cloning the repository
- **After database reset**: If you need to restore test data
- **Development**: When you need consistent test data

### Seed Data Files

All seed data is stored in JSON format in `/app/scripts/seed_data/`:

- `company_settings.json` - Company information and logo
- `customers.json` - Test customer data
- `services.json` - Service catalog
- `certificates.json` - Sample certificates
- `invoices.json` - Test invoices
- `estimates.json` - Test estimates

### Important Notes

1. **Logo is permanent**: The company logo is stored in `company_settings.json` and will be restored whenever you run the seed script
2. **Data will be replaced**: Running the script will delete existing data and replace it with seed data
3. **Production warning**: Do NOT run this script on a production database with real customer data

### Customizing Seed Data

To modify the seed data:

1. Edit the JSON files in `/app/scripts/seed_data/`
2. Maintain the same data structure
3. Run the seed script to apply changes

### Your Company Settings

Current company settings include:
- Company: Breckland Heating Limited
- Address: 32, Paynes Lane, Feltwell. Norfolk. IP26 4BA
- Phone: 01842879585
- Email: info@brecklandheating.com
- Logo: Embedded (59KB)
