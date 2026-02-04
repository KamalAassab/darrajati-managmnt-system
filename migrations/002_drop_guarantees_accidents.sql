-- Drop Accidents Table
DROP TABLE IF EXISTS accidents;

-- Remove Guarantee Columns from Rentals
ALTER TABLE rentals DROP COLUMN IF EXISTS guarantee_amount;
ALTER TABLE rentals DROP COLUMN IF EXISTS guarantee_status;

-- Remove Guarantee Status from Clients
ALTER TABLE clients DROP COLUMN IF EXISTS guarantee_status;
