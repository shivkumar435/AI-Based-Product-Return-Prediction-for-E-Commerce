# ReturnSense Product Seeding & Catalog Diagnostic Guide

This document describes the safe, non-destructive, and idempotent product seeding system created for ReturnSense (`AI-Based Product Return Prediction for E-Commerce`).

---

## 1. Overview & Guarantees

Unlike the legacy `server/seed.js` script (which aggressively wiped all collections with `deleteMany()`), `server/scripts/seedProducts.js` is strictly designed for **safe production catalog initialization**:

* **Non-Destructive:** NEVER calls `deleteMany()`, `dropCollection()`, or `dropDatabase()`.
* **Collection Isolation:** Touches ONLY the `products` collection. Does NOT modify, delete, or create records in `users`, `orders`, `predictions`, `cart`, `wishlist`, or `reviews`.
* **Idempotent:** Every product is compared against existing records by its unique `sku` (e.g. `SKU-ELEC-001`) and case-insensitive `name`.
  * If a product already exists, it is **skipped**.
  * If a product is missing, it is **inserted**.
  * Running the script multiple times results in 0 duplicate insertions.
* **Dry-Run by Default:** If executed without write authorization, the script performs a 100% read-only inspection and reports projected changes without writing a single record.
* **Production Guard:** If the database host is identified as a cloud instance (`.mongodb.net`) or `NODE_ENV=production`, the script requires explicit production confirmation (`--confirm-production` or `ALLOW_PRODUCTION_SEED=true`).

---

## 2. Product Catalog Contents

The dataset contains **55 realistic, curated e-commerce products** across all 7 categories supported by ReturnSense:

| Category | Product Count | Price Range | Example Items |
| :--- | :--- | :--- | :--- |
| **Electronics** | 8 items | $27.99 – $149.99 | Wireless Headphones, Smart Fitness Watch, Mechanical Keyboard, 4K Webcam |
| **Clothing** | 8 items | $24.99 – $189.99 | Classic Oxford Shirt, Summer Dress, Heavyweight Hoodie, Winter Parka |
| **Shoes** | 8 items | $29.99 – $159.99 | Running Shoes, Leather Chelsea Boots, Hiking Boots, Minimalist Sneakers |
| **Home & Kitchen** | 8 items | $24.99 – $279.99 | Robot Vacuum & Mop, Ceramic Cookware Set, Espresso Machine, Air Fryer |
| **Beauty** | 8 items | $22.99 – $89.99 | Botanical Moisturizer, Argan Hair Oil, Vitamin C Serum, Eau de Parfum Set |
| **Sports** | 8 items | $16.99 – $119.99 | Eco Yoga Mat, 20kg Dumbbells, Tennis Racket, Deep Tissue Massage Gun |
| **Books** | 7 items | $18.99 – $49.99 | JavaScript Definitive Guide, Hands-On Machine Learning, Designing Data-Intensive Apps |

Every product includes:
* Schema-compliant categories (matching the enum in `server/models/Product.js`)
* Working, high-resolution Unsplash product imagery
* Realistic ratings, review counts, stock quantities, and descriptions
* Schema-compliant `specifications` array (`[{ key: '...', value: '...' }]`)
* Deterministic SKUs for reliable duplicate prevention

---

## 3. How the Target Database is Selected

The script uses `server/config/db.js` to resolve the database connection:
1. It inspects environment variables in this order: `MONGO_URI`, `MONGODB_URI`, `DATABASE_URL`.
2. If none is present, it defaults locally to `mongodb://127.0.0.1:27017/return-prediction`.
3. The database name is parsed directly from the connection string path (e.g. `...mongodb.net/return-prediction?...`).

> **Safety Notice:**
> The script outputs the target database name and sanitized host at the beginning of each run. It **never logs passwords or credentials**.

---

## 4. Commands & Step-by-Step Workflow

All commands should be executed from the `server/` directory:

### Step 1: Check Current Database & Product Count (Read-Only)
Inspect total products, active/inactive counts, category distribution, and sample items without making changes:

```bash
npm run products:count
```
*Or directly:*
```bash
node scripts/checkProducts.js
```

### Step 2: Run a Dry Run (Read-Only)
Preview how many products would be inserted and how many would be skipped:

```bash
npm run products:dry-run
```
*Or directly:*
```bash
node scripts/seedProducts.js --dry-run
```

### Step 3: Seed Products to Local Database
Insert missing products into your local development MongoDB:

```bash
npm run products:seed
```
*Or directly:*
```bash
node scripts/seedProducts.js --confirm-write
```

### Step 4: Seed Products to Production MongoDB Atlas
When ready to populate the live production database on MongoDB Atlas:

> **Production Safety Invariants:**
> - Production database name MUST be strictly `returnprediction` (as configured on Render).
> - Production host MUST be an Atlas cluster (`*.mongodb.net`).
> - Script requires BOTH `--confirm-write` AND `--confirm-production`.

#### Option A: Interactive Zero-Exposure Prompt (Recommended on Windows)
This prompts for your MongoDB Atlas connection URI at runtime in memory only. It **never writes the URI to disk, `.env`, or PowerShell command history**:

**1. Dry Run against Atlas (Zero Writes):**
```bash
node scripts/seedProducts.js --prompt-uri --dry-run
```
*(Paste your MongoDB Atlas connection string when prompted)*

**2. Confirmed Production Write to Atlas:**
```bash
node scripts/seedProducts.js --prompt-uri --confirm-write --confirm-production
```

#### Option B: Windows PowerShell In-Memory Session Variable
```powershell
# Set URI in temporary process memory
$uri = Read-Host -Prompt "Enter MongoDB Atlas URI" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($uri)
$env:MONGO_URI = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

# Run Dry Run
node scripts/seedProducts.js --dry-run

# Run Production Seed (when authorized)
node scripts/seedProducts.js --confirm-write --confirm-production

# Clear environment variable immediately
Remove-Item Env:MONGO_URI
```

### Step 5: Verify Final Catalog Count
Confirm that the products are now present in the database:

**Via Diagnostic Script with Prompt:**
```bash
node scripts/checkProducts.js --prompt-uri
```

**Via Production Health Endpoint:**
```bash
curl https://ai-based-product-return-prediction-for-e.onrender.com/api/health
```

---

## 5. Troubleshooting & FAQ

* **Q: What happens if I run the seed script twice?**
  * It detects that all 55 items already exist and skips all of them. Exactly 0 duplicate records will be created.
* **Q: Will this delete my existing users or orders?**
  * No. The script contains zero delete or drop commands and touches only the `Product` model.
* **Q: Why was the deployed Products page showing 0 products?**
  * In MongoDB Atlas, when a cluster is initially deployed, it contains no product documents until populated. Because `server/seed.js` was destructive, the production database had never been initialized with products.
