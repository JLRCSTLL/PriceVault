Build a full-stack web application called “Price Vault” for storing, tracking, requesting, and predicting equipment prices.

Context:
Our company has an Admin/Purchasing team that provides prices for equipment requests. These prices are only valid for one month. Since Admin handles many departments, it takes time to get updated prices. I want a system where we can store prices per equipment, brand, model, and inventory category, automatically track expiry, upload Admin Excel files, and generate price request forms for expired or missing items.

Design Style:
Use a minimal, clean dashboard style similar to the uploaded reference image:
- Light background
- Dark teal left sidebar
- Rounded cards
- Clean table layout
- Simple search and filter bars
- Status badges for Active, Expiring Soon, Expired, No Offer, EOL
- Minimal icons
- Professional business UI
- Responsive design for desktop first

Recommended Stack:
Use:
- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Backend: Next.js API routes or Express
- Database: PostgreSQL
- ORM: Prisma
- Excel Upload/Export: SheetJS or ExcelJS
- Authentication: NextAuth/Auth.js
- File Storage: local storage for MVP, S3-compatible storage for production

Main Users:
1. Sales / Technical User
   - Search prices
   - View valid and expired prices
   - Add expired/missing items to request cart
   - Generate Excel request form
   - Upload Admin-provided Excel files
   - View price history

2. Admin / Super Admin
   - Manage users
   - Review imported price data
   - Edit price records
   - Approve corrections
   - View audit logs

Core Features:

1. Dashboard
Create a dashboard showing:
- Total stored price records
- Active prices
- Expired prices
- Expiring within 7 days
- No Offer items
- EOL items
- Recent Admin uploads
- Most requested brands/items

2. Price List Screen
Create a searchable and filterable price list table with these fields:
- Item No.
- Inventory
- Brand
- Model
- Description
- Category
- UOM
- Order Quantity
- Buying Price / VAR per Unit
- SRP per Unit
- LP per Unit
- Stock Availability
- Warranty Information
- Remarks
- Admin Quote Date
- Expiry Date
- Price Status

The price status should automatically be:
- Active if current date is within 30 days from Admin Quote Date
- Expiring Soon if expiry is within 7 days
- Expired if more than 30 days old
- No Offer if prices are 0 and remarks contain “NO OFFER”
- EOL if remarks contain “EOL”

3. Price Validity Logic
When an Admin Excel file is uploaded, the system should store the quote/upload date.
Expiry Date = Quote Date + 30 days.
The system should not delete expired prices. Instead, keep them for historical reference and mark them as expired.

4. Excel Upload from Admin
Allow users to upload Admin-provided Excel files.

The uploaded Admin Excel may contain columns similar to:
- Item No.
- Inventory
- Description
- Order Qty.
- UOM
- VAR/PER UNIT
- SRP/PER UNIT
- LP/PER UNIT
- Stock Availability
- Warranty Information
- Remarks

The system should:
- Parse the Excel file
- Detect the header row automatically
- Extract all line items
- Save each item as a price record
- Store the original uploaded file name
- Store the quote/client name if available
- Store the upload date
- Auto-calculate expiry date
- Avoid duplicate records by comparing Inventory + Description + Brand + Model + Quote Date
- Allow user review before final import

5. Brand and Model Extraction
Since some descriptions contain brand and model inside the description field, create a simple extraction helper:
- Brand may be detected from first known brand keyword such as Epson, Panasonic, Canon, Sony, DJI, ATEN, Ugreen, Sandisk, etc.
- Model may be detected from model-like codes such as EB-L210W, PT-MZ682B, ET-ELW20, L3250, L15150, VE7832A, etc.
- Allow users to manually correct Brand and Model after import.

6. Request Cart
Users should be able to add items to a Request Cart when:
- Price is expired
- Price is missing
- Item has no offer
- User wants an updated quotation

The Request Cart should contain:
- Inventory
- Description
- UOM
- Order Quantity
- Estimated Unit Cost
- Estimated Extended Cost
- Required Date
- Promised Date
- Issue Status
- Canceled
- Project ID

7. Generate Excel Request Form
Create an export feature that generates an Excel request form based on the uploaded request template.

The generated Excel should have columns:
- Inventory
- Description
- UOM
- Order Qty.
- Est. Unit Cost
- Est. Ext. Cost
- Required Date
- Promised Date
- Issue Status
- Canceled
- Project ID

Default values:
- Issue Status = Requested
- Canceled = False
- Project ID = user input or default “X”
- Est. Unit Cost = latest known price or 0 if missing
- Est. Ext. Cost = Order Qty × Est. Unit Cost
- Promised Date = user-selected date or blank
- Required Date = user-selected date or blank

8. Markup Prediction
Add a markup prediction feature.

The user may input or upload a buying price. The system should compare buying price against Admin-provided prices:
- VAR Markup % = (VAR Price - Buying Price) / Buying Price × 100
- SRP Markup % = (SRP Price - Buying Price) / Buying Price × 100
- LP Markup % = (LP Price - Buying Price) / Buying Price × 100

The system should learn historical markup patterns by:
- Brand
- Category
- Inventory group
- Similar description/model

For prediction:
- Use historical median markup percentage for the same brand/category
- If no exact brand match, use category average
- If no category match, use overall average
- Show predicted VAR, SRP, and LP based on buying price
- Show confidence level: High, Medium, Low
- Allow user override before saving

9. Price History
Each item should have a history page showing:
- Previous Admin quote dates
- Previous VAR, SRP, LP prices
- Price changes over time
- Expiry dates
- Uploaded source file
- Remarks
- Stock availability changes

10. Search and Filters
Add search and filtering by:
- Brand
- Model
- Inventory
- Description keyword
- Status: Active, Expiring Soon, Expired, No Offer, EOL
- Date range
- Client / Project
- Uploaded file
- Stock availability

11. Notifications
Add visual alerts:
- Prices expiring within 7 days
- Expired price count
- Items with no offer
- Items marked EOL
- Items with missing brand/model

12. Database Schema
Create database tables for:

users:
- id
- name
- email
- role
- password_hash or auth_provider
- created_at
- updated_at

price_records:
- id
- item_no
- inventory
- brand
- model
- description
- category
- uom
- order_qty
- var_price
- srp_price
- lp_price
- buying_price
- stock_availability
- warranty_information
- remarks
- client_name
- project_name
- quote_date
- expiry_date
- status
- source_file_id
- created_by
- created_at
- updated_at

uploaded_files:
- id
- file_name
- file_type
- uploaded_by
- uploaded_at
- parsed_status
- notes

request_cart_items:
- id
- user_id
- price_record_id
- inventory
- description
- uom
- order_qty
- estimated_unit_cost
- estimated_ext_cost
- required_date
- promised_date
- issue_status
- canceled
- project_id
- created_at

generated_requests:
- id
- request_number
- generated_by
- generated_at
- file_path
- status

markup_predictions:
- id
- brand
- category
- inventory
- buying_price
- predicted_var_price
- predicted_srp_price
- predicted_lp_price
- var_markup_percent
- srp_markup_percent
- lp_markup_percent
- confidence_level
- created_at

audit_logs:
- id
- user_id
- action
- entity_type
- entity_id
- old_value
- new_value
- created_at

13. Pages to Build
Build these pages:

/login
- User authentication

/dashboard
- Summary cards and recent activity

/prices
- Main price list table
- Search, filters, status badges
- Add to request cart button

/prices/upload
- Upload Admin Excel
- Preview parsed rows
- Confirm import

/prices/[id]
- Item detail page
- Price history
- Markup prediction panel

/request-cart
- List selected expired/missing items
- Edit quantities, dates, project ID
- Generate Excel request form

/requests
- List generated request forms
- Download previous Excel files

/settings
- Manage brands, categories, users, default validity period

14. UI Requirements
Use a sidebar menu with:
- Dashboard
- Price List
- Upload Admin Prices
- Request Cart
- Generated Requests
- Reports
- Settings
- Logout

Use a table layout similar to the sample image:
- Search bar at top
- Date filter
- Tabs: All Prices, Active, Expiring Soon, Expired, No Offer, EOL
- Pagination
- Sortable columns
- Status color coding:
  - Active = green
  - Expiring Soon = orange
  - Expired = red
  - No Offer = gray
  - EOL = purple

15. Reports
Create reports for:
- Expired prices by brand
- Most requested items
- Average markup by brand
- Average markup by category
- Price increase/decrease history
- Items without updated price

16. Acceptance Criteria
The app is complete when:
- User can upload an Admin Excel file
- System can parse and save price records
- System auto-calculates 30-day expiry
- User can search and filter prices
- Expired prices are clearly marked
- User can add expired/missing items to cart
- User can generate an Excel request form matching the template
- System can compute markup from buying price
- System can predict estimated Admin prices based on historical markup
- UI looks clean, minimal, and similar to the uploaded reference image
- Data is stored persistently in PostgreSQL
- App has basic authentication and role-based access

Build the MVP first, then keep the code clean and scalable.