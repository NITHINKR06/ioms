-- V2__seed.sql  (passwords are BCrypt of Admin@123, Manager@123, Staff@123)
-- roles
INSERT INTO roles (name) VALUES 
('ROLE_ADMIN'),('ROLE_MANAGER'),('ROLE_STAFF')
  ON DUPLICATE KEY UPDATE name = name;

-- users  
INSERT INTO users (username, email, password, full_name) VALUES
('admin',   'admin@inventory.com',   '$2b$12$8pZDMTrxmRP5yYC1O5pvw.trQhlY0ecdebFpA6JNgEAjxbvsqOn46', 'Admin User'),
('manager', 'manager@inventory.com', '$2b$12$gQ5ggXBwjEctXG.80A0Mtu9A68XAeV1Vpfu5P0OVh1U9TDyAR/Dza', 'Manager User'),
('staff',   'staff@inventory.com',   '$2b$12$YBoXbZWuT2WXcrt260xSlelpRbMYkDEgiDyqHv80hic4zvhGv7fjy', 'Staff User')
  ON DUPLICATE KEY UPDATE username = username;

INSERT INTO user_roles (user_id, role_id) VALUES (1,1),(2,2),(3,3);

INSERT INTO categories (name, description) VALUES
('Electronics',  'Electronic gadgets and accessories'),
('Clothing',     'Apparel and fashion items'),
('Food & Drink', 'Packaged food and beverages'),
('Office',       'Office supplies and stationery'),
('Tools',        'Hardware and workshop tools');

INSERT INTO suppliers (name, contact_person, email, phone, address, status) VALUES
('TechSupply Co',   'Ravi Kumar',  'ravi@techsupply.com',   '9876543210', 'Mumbai, Maharashtra',  'ACTIVE'),
('FashionHub',      'Priya Sharma','priya@fashionhub.com',  '9876543211', 'Delhi, NCR',            'ACTIVE'),
('FoodDistributors','Arjun Singh', 'arjun@fooddist.com',    '9876543212', 'Chennai, Tamil Nadu',   'ACTIVE');

INSERT INTO products (sku, name, description, price, cost_price, quantity_in_stock, reorder_level, status, category_id, supplier_id, created_by) VALUES
('PRD-ELEC-0001','Wireless Earbuds','Premium Bluetooth 5.0 earbuds with noise cancellation',2499.00,1400.00,45,10,'ACTIVE',1,1,1),
('PRD-ELEC-0002','USB-C Hub 7-in-1','Multiport USB hub with HDMI and SD card reader',1899.00,900.00,30,8,'ACTIVE',1,1,1),
('PRD-ELEC-0003','Mechanical Keyboard','TKL mechanical keyboard with RGB backlight',3999.00,2200.00,20,5,'ACTIVE',1,1,1),
('PRD-ELEC-0004','27" Monitor','Full HD IPS panel 75Hz monitor',18999.00,13000.00,8,3,'ACTIVE',1,1,1),
('PRD-ELEC-0005','Laptop Stand','Adjustable aluminium laptop stand',999.00,450.00,5,10,'ACTIVE',1,1,1),
('PRD-CLTH-0001','Cotton T-Shirt','Premium 100% cotton round neck t-shirt',599.00,200.00,100,20,'ACTIVE',2,2,1),
('PRD-CLTH-0002','Formal Trousers','Slim fit formal trousers',1499.00,700.00,60,15,'ACTIVE',2,2,1),
('PRD-CLTH-0003','Hooded Sweatshirt','Fleece-lined pullover hoodie',1299.00,550.00,7,15,'ACTIVE',2,2,1),
('PRD-FOOD-0001','Green Tea 100 Bags','Premium Darjeeling green tea',349.00,160.00,200,30,'ACTIVE',3,3,1),
('PRD-FOOD-0002','Instant Coffee 200g','Arabica blend instant coffee',499.00,220.00,150,25,'ACTIVE',3,3,1),
('PRD-FOOD-0003','Mixed Nuts 500g','Unsalted premium mixed nuts',899.00,450.00,6,20,'ACTIVE',3,3,1),
('PRD-OFFC-0001','Ballpoint Pens 12pk','Smooth-write blue ballpoint pens',149.00,60.00,300,50,'ACTIVE',4,1,1),
('PRD-OFFC-0002','A4 Notebooks 3pk','Hardcover ruled notebooks 200 pages each',399.00,180.00,80,20,'ACTIVE',4,1,1),
('PRD-OFFC-0003','Desk Organizer','Bamboo desktop organizer with phone stand',799.00,350.00,4,10,'ACTIVE',4,1,1),
('PRD-TOOL-0001','Cordless Drill','18V Li-Ion cordless drill with 2 batteries',4999.00,3000.00,15,5,'ACTIVE',5,1,1),
('PRD-TOOL-0002','Screwdriver Set','40-piece precision screwdriver set',1299.00,600.00,25,8,'ACTIVE',5,1,1),
('PRD-TOOL-0003','Measuring Tape 5m','Stainless steel measuring tape',299.00,120.00,9,15,'ACTIVE',5,1,1),
('PRD-ELEC-0006','Webcam 1080p','Full HD USB webcam with built-in mic',2199.00,1200.00,18,5,'ACTIVE',1,1,1),
('PRD-CLTH-0004','Denim Jacket','Classic washed denim jacket',2499.00,1100.00,22,10,'ACTIVE',2,2,1),
('PRD-OFFC-0004','Whiteboard Markers','Pack of 12 assorted colour markers',299.00,120.00,3,20,'ACTIVE',4,1,1);

INSERT INTO customers (name, email, phone, address, type) VALUES
('Rahul Sharma',    'rahul@email.com',    '9900000001', 'Bangalore, KA',    'RETAIL'),
('Priya Patel',     'priya@email.com',    '9900000002', 'Ahmedabad, GJ',    'RETAIL'),
('Amit Technologies','amit@amittech.com', '9900000003', 'Pune, MH',         'WHOLESALE'),
('Sneha Reddy',     'sneha@email.com',    '9900000004', 'Hyderabad, TS',    'RETAIL'),
('Global Traders',  'buy@globaltr.com',   '9900000005', 'Chennai, TN',      'WHOLESALE'),
('Vikram Joshi',    'vikram@email.com',   '9900000006', 'Mumbai, MH',       'RETAIL'),
('Ananya Singh',    'ananya@email.com',   '9900000007', 'Delhi, DL',        'RETAIL'),
('NextGen Retail',  'orders@nextgen.com', '9900000008', 'Kolkata, WB',      'WHOLESALE'),
('Karan Mehta',     'karan@email.com',    '9900000009', 'Jaipur, RJ',       'RETAIL'),
('Meera Iyer',      'meera@email.com',    '9900000010', 'Coimbatore, TN',   'RETAIL');

INSERT INTO orders (order_number, customer_id, status, subtotal, discount, tax, total_amount, payment_status, payment_method, created_by) VALUES
('ORD-20260501-0001',1,'DELIVERED',3498.00,0,629.64,4127.64,'PAID','UPI',1),
('ORD-20260502-0002',2,'DELIVERED',2499.00,100,431.82,2830.82,'PAID','CARD',2),
('ORD-20260503-0003',3,'SHIPPED',23996.00,500,4229.28,27725.28,'PAID','BANK_TRANSFER',2),
('ORD-20260504-0004',4,'PROCESSING',1048.00,0,188.64,1236.64,'UNPAID','CASH',3),
('ORD-20260505-0005',5,'CONFIRMED',8997.00,500,1529.46,10026.46,'PAID','BANK_TRANSFER',1),
('ORD-20260506-0006',6,'PENDING',4798.00,0,863.64,5661.64,'UNPAID','UPI',3),
('ORD-20260507-0007',7,'DELIVERED',1897.00,50,331.86,2178.86,'PAID','CARD',2),
('ORD-20260508-0008',8,'CANCELLED',5997.00,0,1079.46,7076.46,'REFUNDED','BANK_TRANSFER',1),
('ORD-20260509-0009',9,'DELIVERED',798.00,0,143.64,941.64,'PAID','UPI',3),
('ORD-20260510-0010',10,'PENDING',2199.00,0,395.82,2594.82,'UNPAID','CASH',3),
('ORD-20260511-0011',1,'SHIPPED',5997.00,200,1043.46,6840.46,'PAID','CARD',2),
('ORD-20260512-0012',2,'DELIVERED',1498.00,0,269.64,1767.64,'PAID','UPI',1),
('ORD-20260513-0013',3,'PROCESSING',9998.00,1000,1619.64,10617.64,'PARTIAL','BANK_TRANSFER',2),
('ORD-20260514-0014',4,'CONFIRMED',3997.00,0,719.46,4716.46,'UNPAID','CASH',3),
('ORD-20260515-0015',5,'PENDING',14997.00,500,2609.46,17106.46,'UNPAID','BANK_TRANSFER',1);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1,1,1,2499.00,2499.00),(1,12,2,149.00,298.00),(1,17,1,299.00,299.00),(1,13,1,399.00,399.00),
(2,1,1,2499.00,2499.00),
(3,4,1,18999.00,18999.00),(3,3,1,3999.00,3999.00),
(4,12,3,149.00,447.00),(4,13,1,399.00,399.00),(4,20,1,299.00,299.00),
(5,7,2,1499.00,2998.00),(5,6,5,599.00,2995.00),(5,8,1,1299.00,1299.00),
(6,3,1,3999.00,3999.00),(6,2,1,1899.00,1899.00),
(7,12,5,149.00,745.00),(7,13,2,399.00,798.00),(7,17,1,299.00,299.00),
(8,9,5,349.00,1745.00),(8,10,3,499.00,1497.00),(8,11,3,899.00,2697.00),
(9,17,1,299.00,299.00),(9,12,1,149.00,149.00),(9,16,1,299.00,299.00),
(10,18,1,2199.00,2199.00),
(11,15,1,4999.00,4999.00),(11,16,1,1299.00,1299.00),(11,17,2,299.00,598.00),
(12,6,1,599.00,599.00),(12,7,1,1499.00,1499.00),(12,13,1,399.00,399.00),
(13,4,1,18999.00,18999.00),(13,18,1,2199.00,2199.00),(13,2,1,1899.00,1899.00),
(14,7,1,1499.00,1499.00),(14,19,1,2499.00,2499.00),(14,13,1,399.00,399.00),
(15,4,1,18999.00,18999.00),(15,3,1,3999.00,3999.00);
