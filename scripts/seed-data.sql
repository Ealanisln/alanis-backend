-- Script SQL para insertar datos iniciales (seed)

-- Insertar tenants
INSERT INTO "tenants" (
    "id", 
    "name", 
    "slug", 
    "type", 
    "domain", 
    "settings",
    "isActive"
) VALUES
(
    'cm123456789012345678',
    'Alanis Web Dev',
    'alanis-web-dev',
    'ALANIS_WEB_DEV',
    'alaniswebdev.com',
    '{"theme": "default", "currency": "USD", "timezone": "America/New_York"}',
    true
),
(
    'cm987654321098765432',
    'Cherry Pop Design',
    'cherry-pop-design',
    'CHERRY_POP_DESIGN',
    'cherrypopdesign.com',
    '{"theme": "creative", "currency": "USD", "timezone": "America/New_York"}',
    true
)
ON CONFLICT ("id") DO NOTHING;

-- Insertar usuarios admin para cada tenant
INSERT INTO "users" (
    "id",
    "email",
    "password",
    "firstName",
    "lastName",
    "role",
    "isActive",
    "tenantId"
) VALUES
(
    'usr_alanis_admin_001',
    'admin@alaniswebdev.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMaeBjCsLKdKXbFc8DEKwdNQqCnv3RlmHXK', -- password123
    'Emmanuel',
    'Alanis',
    'SUPER_ADMIN',
    true,
    'cm123456789012345678'
),
(
    'usr_cherry_admin_001',
    'admin@cherrypopdesign.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMaeBjCsLKdKXbFc8DEKwdNQqCnv3RlmHXK', -- password123
    'Cherry',
    'Pop',
    'SUPER_ADMIN',
    true,
    'cm987654321098765432'
)
ON CONFLICT ("email") DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO "clients" (
    "id",
    "name",
    "email",
    "phone",
    "company",
    "address",
    "notes",
    "isActive",
    "tenantId"
) VALUES
(
    'client_001_alanis',
    'John Smith',
    'john.smith@techstartup.com',
    '+1-555-0123',
    'Tech Startup Inc.',
    '{"street": "123 Innovation Drive", "city": "San Francisco", "state": "CA", "zipCode": "94105", "country": "USA"}',
    'Early adopter, interested in modern web solutions',
    true,
    'cm123456789012345678'
),
(
    'client_002_alanis',
    'Sarah Johnson',
    'sarah@creativeboutique.com',
    '+1-555-0456',
    'Creative Boutique',
    '{"street": "456 Design Street", "city": "New York", "state": "NY", "zipCode": "10001", "country": "USA"}',
    'Focus on branding and visual identity',
    true,
    'cm123456789012345678'
),
(
    'client_001_cherry',
    'Mike Rodriguez',
    'mike@localrestaurant.com',
    '+1-555-0789',
    'Local Restaurant Group',
    '{"street": "789 Food Avenue", "city": "Chicago", "state": "IL", "zipCode": "60601", "country": "USA"}',
    'Restaurant chain looking for digital presence',
    true,
    'cm987654321098765432'
)
ON CONFLICT ("id") DO NOTHING;

-- Insertar proyectos de ejemplo
INSERT INTO "projects" (
    "id",
    "name",
    "description",
    "status",
    "quotedHours",
    "usedHours",
    "hourlyRate",
    "startDate",
    "endDate",
    "clientId",
    "tenantId",
    "quotationData"
) VALUES
(
    'proj_001_alanis',
    'E-commerce Platform Development',
    'Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard',
    'IN_PROGRESS',
    120.0,
    45.5,
    150.00,
    '2024-01-15 09:00:00',
    '2024-03-15 17:00:00',
    'client_001_alanis',
    'cm123456789012345678',
    '{"features": ["User Authentication", "Product Catalog", "Shopping Cart", "Payment Gateway", "Admin Panel"], "technologies": ["Next.js", "TypeScript", "PostgreSQL", "Stripe"]}'
),
(
    'proj_002_alanis',
    'Brand Identity & Website',
    'Complete brand redesign with new logo, color palette, and modern website',
    'QUOTED',
    80.0,
    0.0,
    125.00,
    null,
    null,
    'client_002_alanis',
    'cm123456789012345678',
    '{"deliverables": ["Logo Design", "Brand Guidelines", "Website Design", "Website Development"], "timeline": "6-8 weeks"}'
),
(
    'proj_001_cherry',
    'Restaurant Website & Online Ordering',
    'Modern website with online ordering system and table reservation functionality',
    'APPROVED',
    95.0,
    12.0,
    135.00,
    '2024-02-01 09:00:00',
    '2024-04-01 17:00:00',
    'client_001_cherry',
    'cm987654321098765432',
    '{"features": ["Online Menu", "Order System", "Table Reservations", "Location Finder"], "integrations": ["POS System", "Payment Gateway"]}'
)
ON CONFLICT ("id") DO NOTHING;

-- Insertar cotizaciones de ejemplo
INSERT INTO "quotes" (
    "id",
    "quoteNumber",
    "clientName",
    "clientEmail",
    "clientPhone",
    "clientCompany",
    "projectName",
    "projectType",
    "description",
    "services",
    "subtotal",
    "tax",
    "discount",
    "total",
    "estimatedHours",
    "deliveryDays",
    "status",
    "validUntil",
    "notes",
    "projectId",
    "tenantId",
    "metadata"
) VALUES
(
    'quote_001_alanis',
    'ALN-2024-001',
    'John Smith',
    'john.smith@techstartup.com',
    '+1-555-0123',
    'Tech Startup Inc.',
    'E-commerce Platform Development',
    'Web Development',
    'Complete e-commerce solution with modern features',
    '[
        {"name": "Frontend Development", "description": "React/Next.js frontend with responsive design", "hours": 40, "rate": 150, "total": 6000},
        {"name": "Backend Development", "description": "Node.js API with PostgreSQL database", "hours": 45, "rate": 150, "total": 6750},
        {"name": "Payment Integration", "description": "Stripe payment gateway implementation", "hours": 15, "rate": 150, "total": 2250},
        {"name": "Admin Dashboard", "description": "Content management and analytics dashboard", "hours": 20, "rate": 150, "total": 3000}
    ]',
    18000.00,
    1440.00,
    0.00,
    19440.00,
    120.0,
    60,
    'CONVERTED',
    '2024-02-15 23:59:59',
    'Includes 3 months of free maintenance and support',
    'proj_001_alanis',
    'cm123456789012345678',
    '{"conversion_date": "2024-01-20", "signed_by": "John Smith"}'
),
(
    'quote_002_alanis',
    'ALN-2024-002',
    'Sarah Johnson',
    'sarah@creativeboutique.com',
    '+1-555-0456',
    'Creative Boutique',
    'Brand Identity & Website',
    'Design & Development',
    'Complete brand redesign with website development',
    '[
        {"name": "Logo Design", "description": "Custom logo design with 3 concepts", "hours": 20, "rate": 125, "total": 2500},
        {"name": "Brand Guidelines", "description": "Complete brand style guide", "hours": 15, "rate": 125, "total": 1875},
        {"name": "Website Design", "description": "Custom website design (5 pages)", "hours": 25, "rate": 125, "total": 3125},
        {"name": "Website Development", "description": "Responsive website development", "hours": 20, "rate": 125, "total": 2500}
    ]',
    10000.00,
    800.00,
    500.00,
    10300.00,
    80.0,
    45,
    'SENT',
    '2024-07-30 23:59:59',
    'Early bird discount applied. Rush delivery available for additional fee.',
    null,
    'cm123456789012345678',
    '{"sent_date": "2024-06-15", "viewed": true, "view_count": 3}'
),
(
    'quote_001_cherry',
    'CPD-2024-001',
    'Mike Rodriguez',
    'mike@localrestaurant.com',
    '+1-555-0789',
    'Local Restaurant Group',
    'Restaurant Website & Online Ordering',
    'Web Development',
    'Modern restaurant website with online ordering capabilities',
    '[
        {"name": "Website Design", "description": "Custom restaurant website design", "hours": 25, "rate": 135, "total": 3375},
        {"name": "Online Ordering System", "description": "Custom ordering system with payment processing", "hours": 35, "rate": 135, "total": 4725},
        {"name": "Menu Management", "description": "Dynamic menu management system", "hours": 20, "rate": 135, "total": 2700},
        {"name": "Table Reservations", "description": "Online reservation system", "hours": 15, "rate": 135, "total": 2025}
    ]',
    12825.00,
    1026.00,
    0.00,
    13851.00,
    95.0,
    42,
    'APPROVED',
    '2024-03-01 23:59:59',
    'Includes training and 6 months support',
    'proj_001_cherry',
    'cm987654321098765432',
    '{"approved_date": "2024-01-25", "approved_by": "Mike Rodriguez"}'
)
ON CONFLICT ("quoteNumber") DO NOTHING;

-- Insertar formularios de contacto de ejemplo
INSERT INTO "contact_forms" (
    "id",
    "name",
    "email",
    "message",
    "phone",
    "company",
    "subject",
    "userAgent",
    "ipAddress",
    "source",
    "status",
    "response",
    "respondedAt",
    "respondedBy",
    "tenantId"
) VALUES
(
    'contact_001_alanis',
    'Alex Thompson',
    'alex@newstartup.com',
    'Hi, I''m looking for a web development team to build a SaaS platform. Can we schedule a call to discuss the project requirements and timeline?',
    '+1-555-1234',
    'New Startup LLC',
    'SaaS Platform Development Inquiry',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    '192.168.1.100',
    'website_contact_form',
    'RESPONDED',
    'Hi Alex, thank you for your interest! I''ve sent you an email with our availability for a discovery call. Looking forward to discussing your SaaS platform project.',
    '2024-06-20 14:30:00',
    'usr_alanis_admin_001',
    'cm123456789012345678'
),
(
    'contact_002_alanis',
    'Maria Garcia',
    'maria@localshop.com',
    'We need an e-commerce website for our local retail business. We have about 200 products and need inventory management.',
    '+1-555-5678',
    'Local Shop',
    'E-commerce Website Request',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    '192.168.1.101',
    'website_contact_form',
    'PENDING',
    null,
    null,
    null,
    'cm123456789012345678'
),
(
    'contact_001_cherry',
    'David Kim',
    'david@artgallery.com',
    'Looking for a creative team to redesign our art gallery website. We need something modern and visually stunning.',
    '+1-555-9012',
    'Modern Art Gallery',
    'Website Redesign Project',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    '192.168.1.102',
    'website_contact_form',
    'RESPONDED',
    'Hi David, we''d love to work on your art gallery website! I''ll send you our portfolio of similar projects and schedule a consultation.',
    '2024-06-18 11:15:00',
    'usr_cherry_admin_001',
    'cm987654321098765432'
)
ON CONFLICT ("id") DO NOTHING;

SELECT 'Seed data inserted successfully!' as result; 