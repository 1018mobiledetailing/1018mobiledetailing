-- HomeHQ Seed Data — Sample Family
-- Run AFTER schema.sql and rls-policies.sql
-- NOTE: This seed uses placeholder UUIDs and bypasses RLS.
-- In production, data is created through the app UI.

-- Use service-role key in Supabase SQL Editor to run this as superuser.

DO $$
DECLARE
  family_id   UUID := gen_random_uuid();
  mom_id      UUID := gen_random_uuid();
  dad_id      UUID := gen_random_uuid();
  kid1_id     UUID := gen_random_uuid();
  kid2_id     UUID := gen_random_uuid();
  vehicle1_id UUID := gen_random_uuid();
  vehicle2_id UUID := gen_random_uuid();
BEGIN

  -- Family
  INSERT INTO families (id, name, invite_code, created_by)
  VALUES (family_id, 'The Johnson Family', 'jns0n123', NULL);

  -- Members (no auth users linked — demo data)
  INSERT INTO family_members (id, family_id, user_id, display_name, role, avatar_color)
  VALUES
    (mom_id,   family_id, NULL, 'Sarah',   'admin', '#2563EB'),
    (dad_id,   family_id, NULL, 'Mike',    'adult', '#16A34A'),
    (kid1_id,  family_id, NULL, 'Emma',    'child', '#9333EA'),
    (kid2_id,  family_id, NULL, 'Liam',    'child', '#EA580C');

  -- Grocery items
  INSERT INTO grocery_items (family_id, name, quantity, category, priority, assigned_store, added_by, completed)
  VALUES
    (family_id, 'Whole milk', '1 gallon', 'groceries', 'high', 'Walmart', mom_id, false),
    (family_id, 'Eggs', '2 dozen', 'groceries', 'high', 'Walmart', mom_id, false),
    (family_id, 'Bananas', '1 bunch', 'groceries', 'medium', 'Walmart', dad_id, false),
    (family_id, 'Chicken breast', '3 lbs', 'groceries', 'medium', 'Costco', mom_id, false),
    (family_id, 'Pasta', '2 boxes', 'groceries', 'low', 'Walmart', dad_id, false),
    (family_id, 'Tomato sauce', '3 jars', 'groceries', 'low', 'Walmart', mom_id, false),
    (family_id, 'Laundry detergent', '1 bottle', 'home', 'medium', 'Costco', mom_id, false),
    (family_id, 'Dog food', '1 bag', 'pets', 'high', 'Walmart', dad_id, false),
    (family_id, 'Bread', '2 loaves', 'groceries', 'medium', '', mom_id, true);

  -- Reminders
  INSERT INTO reminders (family_id, title, assigned_to, due_date, repeat_frequency, priority, category, notes, completed)
  VALUES
    (family_id, 'Pay electric bill', mom_id, NOW() + INTERVAL '5 days', 'monthly', 'high', 'bills', 'Auto-drafted from checking account', false),
    (family_id, 'Dentist appointment — Emma', mom_id, NOW() + INTERVAL '3 days', 'none', 'high', 'medical', 'Dr. Chen at 9am', false),
    (family_id, 'Soccer practice pickup', dad_id, NOW() + INTERVAL '2 days', 'weekly', 'medium', 'school', 'Liam — 4:30pm at Riverside Park', false),
    (family_id, 'Renew car insurance', mom_id, NOW() + INTERVAL '30 days', 'yearly', 'medium', 'vehicles', NULL, false),
    (family_id, 'Change AC filter', dad_id, NOW() + INTERVAL '14 days', 'monthly', 'low', 'home', '20x25x1 filter', false),
    (family_id, 'Pay water bill', mom_id, NOW() - INTERVAL '1 day', 'monthly', 'urgent', 'bills', 'Due yesterday!', false),
    (family_id, 'Book summer camp', mom_id, NOW() + INTERVAL '60 days', 'none', 'medium', 'school', 'Camp Whispering Pines', false),
    (family_id, 'Take recycling out', dad_id, NOW(), 'weekly', 'low', 'home', NULL, false);

  -- Bills
  INSERT INTO bills (family_id, title, due_date, amount, autopay, paid, notes)
  VALUES
    (family_id, 'Electric', CURRENT_DATE + 5, 124.50, true, false, 'Average $110-130/mo'),
    (family_id, 'Internet', CURRENT_DATE + 12, 79.99, true, false, 'Xfinity 400mbps'),
    (family_id, 'Water & Sewer', CURRENT_DATE - 1, 67.00, false, false, 'Pay online at city website'),
    (family_id, 'Mortgage', CURRENT_DATE + 1, 1895.00, true, false, NULL),
    (family_id, 'Car insurance', CURRENT_DATE + 22, 218.00, false, false, 'Both vehicles on one policy'),
    (family_id, 'Netflix', CURRENT_DATE + 8, 15.49, true, true, NULL),
    (family_id, 'Gym membership', CURRENT_DATE + 15, 49.00, true, false, NULL),
    (family_id, 'Phone bill', CURRENT_DATE + 18, 145.00, true, false, '3 lines'),
    (family_id, 'HOA fee', CURRENT_DATE + 1, 250.00, false, true, 'Quarterly payment');

  -- Vehicles
  INSERT INTO vehicles (id, family_id, name, make, model, year, mileage, insurance_expiry, inspection_expiry, registration_expiry)
  VALUES
    (vehicle1_id, family_id, 'Sarah''s Minivan', 'Honda', 'Odyssey', 2021, 38420, CURRENT_DATE + 180, CURRENT_DATE + 45, CURRENT_DATE + 270),
    (vehicle2_id, family_id, 'Mike''s Truck', 'Ford', 'F-150', 2019, 72100, CURRENT_DATE + 90, CURRENT_DATE - 5, CURRENT_DATE + 120);

  -- Vehicle maintenance
  INSERT INTO vehicle_maintenance (vehicle_id, family_id, title, due_mileage, due_date, completed)
  VALUES
    (vehicle1_id, family_id, 'Oil change', 40000, NULL, false),
    (vehicle1_id, family_id, 'Tire rotation', 42000, NULL, false),
    (vehicle1_id, family_id, 'Cabin air filter', NULL, CURRENT_DATE + 60, false),
    (vehicle2_id, family_id, 'Oil change', 75000, NULL, false),
    (vehicle2_id, family_id, 'New brake pads', 80000, NULL, false),
    (vehicle2_id, family_id, 'State inspection', NULL, CURRENT_DATE + 7, false);

  -- Home projects
  INSERT INTO home_projects (family_id, title, priority, status, notes, due_date, assigned_to)
  VALUES
    (family_id, 'Fix leaky bathroom faucet', 'high', 'in_progress', 'Guest bathroom, dripping at base. Need new O-ring.', CURRENT_DATE + 7, dad_id),
    (family_id, 'Paint living room', 'medium', 'planned', 'Color: Sherwin-Williams Accessible Beige SW 7036', CURRENT_DATE + 60, NULL),
    (family_id, 'Clean out garage', 'low', 'planned', 'Donate old bikes and boxes to Goodwill', NULL, dad_id),
    (family_id, 'Replace back door screen', 'medium', 'planned', '32x80 screen door', NULL, dad_id),
    (family_id, 'Power wash driveway', 'low', 'completed', NULL, NULL, dad_id),
    (family_id, 'Install new ceiling fan in master bedroom', 'medium', 'planned', 'Hunter 52" fan, white', CURRENT_DATE + 90, NULL);

  -- Meal plans (current week)
  INSERT INTO meal_plans (family_id, plan_date, meal_type, title, notes)
  VALUES
    (family_id, CURRENT_DATE, 'breakfast', 'Scrambled eggs and toast', NULL),
    (family_id, CURRENT_DATE, 'lunch', 'Turkey sandwiches', NULL),
    (family_id, CURRENT_DATE, 'dinner', 'Spaghetti bolognese', 'Double batch — freeze half'),
    (family_id, CURRENT_DATE + 1, 'breakfast', 'Oatmeal with berries', NULL),
    (family_id, CURRENT_DATE + 1, 'dinner', 'Grilled chicken and vegetables', NULL),
    (family_id, CURRENT_DATE + 2, 'dinner', 'Taco Tuesday', 'Ground beef and chicken options'),
    (family_id, CURRENT_DATE + 3, 'dinner', 'Homemade pizza', 'Kids pick their toppings'),
    (family_id, CURRENT_DATE + 4, 'dinner', 'Leftovers / Fend for yourself', NULL),
    (family_id, CURRENT_DATE + 5, 'dinner', 'BBQ burgers on the grill', NULL),
    (family_id, CURRENT_DATE + 6, 'dinner', 'Sunday roast chicken', NULL);

END $$;
