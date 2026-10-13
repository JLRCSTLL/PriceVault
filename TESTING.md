# Sales Status (2026-10-13)

The `/sales` page follows the sales tracker columns: reporting month, account executive, date, PO number, sales type, account, scope of work, and amount in PHP. Reporting year/month are stored independently of the optional date. The page includes monthly and grand totals, combined filters, Excel export, and administrator record management.

## Setup

1. Apply `supabase/migrations/20260930_user_management_security.sql` if it has not already been applied.
2. Apply `supabase/migrations/20261013_sales_records.sql` to the target Supabase project. Fresh installations can use the updated `supabase/schema.sql`.
3. Deploy the application and open **Sales Status**. Approved users can view and export; approved administrators can add, edit, delete, and import sales.
4. To load an existing tracker, choose **Import Excel**, select its reporting year, and review the preview before importing. An optional `YEAR` column overrides the selected year for individual rows. The source workbook is never uploaded to storage; only the reviewed sales records are saved.

Use these headers: `MONTH`, `AE`, `Date`, `P.O. No.`, `SALES TYPE`, `ACCOUNT NAME`, `TYPE / SCOPE OF WORK`, and `AMOUNT (PHP)`. Excel date cells and `YYYY-MM-DD` text are supported; a blank date or PO is allowed. Imports accept `.xlsx` and `.xls`, up to 5 MB and 1,000 sales per file. Correct any reported invalid rows before importing.

Subtotal and grand-total rows are skipped and totals are recalculated. Exact matching sales are skipped in the preview, including duplicates within the file. A unique import fingerprint also protects retries after a lost response. An imported record retains its source fingerprint when edited, so importing the original file again will not overwrite the edit. Distinct projects sharing a PO remain separate. Names and scope text are preserved; spelling variants are not automatically merged.

The new migration creates the sales table and restricts it with row-level security. It has been exercised in an isolated PostgreSQL-compatible PGlite database, including repeated application, invalid amounts/months, duplicate imports, administrator CRUD, approved-user reads, and denied anonymous/pending/rejected access. It has **not** been applied to the live Supabase project. Existing policies on unrelated tables are unchanged.

## Validation

- `pnpm typecheck` and `pnpm build` pass. The existing Vite configuration and bundle-size warnings remain.
- `pnpm test` covers the sales parser, date systems, reporting-period preservation, validation, duplicate matching, combined filters, currency totals, and Excel export/reimport, alongside existing price tests.
- The supplied workbook is checked locally without being committed. It produces 10 sales, skips four subtotal rows, preserves one missing date, and reconciles to the workbook's cached monthly subtotals.
- Browser checks use an isolated backend with synthetic data: navigation, combined filters, create/edit, failed-write retry, import preview, repeat import, export, approved-viewer controls, 1,001-row loading, empty/missing-table states, and a 390px mobile layout. The new sidebar collapses to icons on small screens and wide registers scroll horizontally.

```powershell
pnpm typecheck
pnpm build
pnpm test
# Optional local reconciliation against the supplied tracker:
$env:PRICEVAULT_SALES_SAMPLE = 'C:/path/to/AV project.xlsx'
pnpm test
```

Before production use, apply the migration and verify sign-in, role enforcement, and sales persistence against the actual target project. No live sales were inserted or changed during development.

# Verification on 2026-09-29

## Completed

- TypeScript strict check: passed.
- Vite production build: passed. Existing configuration deprecation and bundle-size warnings remain.
- Node regression suite: 10 tests passed when run with the supplied sample directory.
- Browser: application renders, login and signup navigation work. Authenticated testing requires a signed-in, approved test account.

| Supplied workbook | Parsed inventory records | Zero-price records |
| --- | ---: | ---: |
| REQST003056.xlsx | 1 | 0 |
| REQST002598.xlsx | 1 | 0 |
| REQST002450.xlsx | 14 | 8 |
| REQST002450 (1).xlsx | 14 | 8 |

The supplied workbooks were read without modification. Their sales-form instructions were treated as document content. Footer sections are excluded. The two REQST002450 files contain equivalent inventory data; importing both will create duplicate records because imports are additive.

Tests cover physical source row numbers, quantities including zero, warranty/remarks preservation, No Offer status, formatted currency, request-number normalization, invalid numeric input, cover/multiple-sheet handling, footer exclusion and expiry-derived status. EWS Total Price is not mapped to per-unit SRP.

## Running checks

Use Node 24 or later and install dependencies with `pnpm install`.

```powershell
pnpm typecheck
pnpm build
pnpm test
$env:PRICEVAULT_SAMPLE_DIR = 'C:/Users/casti/Downloads'
pnpm test
```

Without `PRICEVAULT_SAMPLE_DIR`, the private workbook tests are omitted. They are not copied into the repository.

## Database prerequisite and remaining verification

Apply these migrations in order to the target database:

1. `supabase/migrations/20260929_inventory_compatibility.sql` adds the request number column, settings table and saved request item data, and enables deleting one's own generated requests.
2. `supabase/migrations/20260930_user_management_security.sql` restricts profile reads and registration to the user's own account, and allows only approved administrators to manage profiles. Apply it before using user-management role or status controls.

Neither migration has been verified against the live service.

After signing in with an approved test account, verify:

1. Upload each sample separately and inspect the preview. Confirm row counts above; verify Yamaha quantity 6 and the zero-quantity DVDO item.
2. Import into a disposable test database. Refresh Price List and confirm quantities, prices, warranty, remarks, request group and No Offer status survived persistence.
3. Exercise search, status filters, brand/request grouping, detail links and deletion of test records.
4. Add records to the cart, edit quantities and request fields, generate Excel, reload request history and download the saved request. Compare numeric quantities and extended costs.
5. Save settings, reload them and verify the configured validity period on the next import.
6. Verify signup/email confirmation, pending/rejected account gating, admin approval/rejection, sign-out, theme switching and reports against actual test data.
7. Force a database write failure and verify upload retains failed rows without retrying successful rows.

These authenticated and database-dependent checks have not yet been completed. No live inventory was inserted or deleted. Historical markup prediction is not implemented; the UI now states that limitation instead of presenting fabricated confidence. The new migration secures profile policies, but other tables retain their existing public policies. Production authorization policies need separate validation before claiming access control is working end to end.
