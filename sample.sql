USE mern_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ratings;
TRUNCATE TABLE product_images;
TRUNCATE TABLE additional_info;
TRUNCATE TABLE products;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users (3 sellers, 5 buyers)
INSERT INTO users (colony_name, email, password, role) VALUES
-- Sellers
('Golden Hive Co.', 'golden.hive@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'seller'),
('Sweet Nectar Farm', 'nectar.farm@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'seller'),
('Buzzing Artisans', 'buzzing.art@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'seller'),
-- Buyers
('Honey Lover', 'honey.lover@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'buyer'),
('Bee Enthusiast', 'bee.fan@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'buyer'),
('Sweet Tooth', 'sweet.tooth@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'buyer'),
('Nature Explorer', 'nature.explorer@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'buyer'),
('Organic Seeker', 'organic.seeker@beehive.com', '$2b$10$rZ8qX9YvH2kL3pN4mW6tXeJ5fK8gH2pQ7vN9mL3xR4yS5tU6vW7zA', 'buyer');

-- Products from Seller 1 (Golden Hive Co.)
INSERT INTO products (seller_id, name, description, price, category, is_limited, in_stock, rate_score, rate_count) VALUES
(1, 'Wildflower Honey 500g', 'Pure organic wildflower honey harvested from local meadows. Rich, amber color with a complex floral taste profile.', 18.99, 'Food', FALSE, TRUE, 4.67, 3),
(1, 'Raw Honeycomb', 'Authentic honeycomb straight from the hive. Perfect for cheese boards and natural sweetness.', 24.99, 'Food', TRUE, TRUE, 5.00, 2),
(1, 'Honey & Lavender Tea', 'Artisan blend of honey-infused black tea with dried lavender flowers. Calming and delicious.', 12.50, 'Drinks', FALSE, TRUE, 4.33, 3),
(1, 'Beeswax Candle Set', 'Hand-rolled pure beeswax candles. Burns clean and fills your home with natural honey scent.', 32.00, 'Accessories', FALSE, TRUE, 4.50, 2),
(1, 'Bee Logo T-Shirt', 'Organic cotton t-shirt featuring our signature golden bee logo. Comfortable and sustainable.', 28.00, 'Clothes', FALSE, TRUE, 0, 0);

-- Products from Seller 2 (Sweet Nectar Farm)
INSERT INTO products (seller_id, name, description, price, category, is_limited, in_stock, rate_score, rate_count) VALUES
(2, 'Manuka Honey 250g', 'Premium MGO 400+ Manuka honey from New Zealand. Known for unique antibacterial properties.', 45.00, 'Food', TRUE, TRUE, 5.00, 1),
(2, 'Honeyed Almonds', 'Roasted almonds glazed with organic honey and a hint of sea salt. Addictively crunchy.', 15.99, 'Food', FALSE, TRUE, 4.00, 1),
(2, 'Honey Lemon Kombucha', 'Probiotic-rich kombucha sweetened naturally with raw honey and fresh lemon juice.', 6.99, 'Drinks', FALSE, TRUE, 0, 0),
(2, 'Propolis Tincture', 'Concentrated bee propolis extract. Natural immune support in a convenient dropper bottle.', 22.50, 'Other', FALSE, TRUE, 4.50, 2);

-- Products from Seller 3 (Buzzing Artisans)
INSERT INTO products (seller_id, name, description, price, category, is_limited, in_stock, rate_score, rate_count) VALUES
(3, 'Honey Mustard Sauce', 'Gourmet honey mustard made with whole grain mustard and local clover honey. Perfect condiment.', 9.99, 'Food', FALSE, TRUE, 4.00, 2),
(3, 'Mead (Honey Wine) 750ml', 'Traditional honey wine fermented with champagne yeast. Semi-sweet with 12% ABV.', 28.50, 'Drinks', FALSE, FALSE, 5.00, 1),
(3, 'Beekeeper Hat', 'Professional beekeeper hat with protective veil. Essential for any apiarist.', 35.00, 'Accessories', FALSE, TRUE, 0, 0),
(3, 'Honeybee Enamel Pin', 'Cute enamel pin featuring a detailed honeybee design. Perfect for jackets and bags.', 8.00, 'Accessories', FALSE, TRUE, 4.67, 3),
(3, 'Honey Face Mask', 'Natural skincare mask with honey, oats, and chamomile. Moisturizing and soothing.', 16.99, 'Other', FALSE, TRUE, 4.00, 1);

-- Product Images
INSERT INTO product_images (product_id, image_url) VALUES
-- Wildflower Honey
(1, 'https://plus.unsplash.com/premium_photo-1663851330122-32e1c17b9334?q=80&w=400'),
(1, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),
-- Raw Honeycomb
(2, 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400'),
(2, 'https://images.unsplash.com/photo-1533630654995-e16f4ed2a29b?w=400'),
(2, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400'),
-- Honey & Lavender Tea
(3, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'),
(3, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
-- Beeswax Candles
(4, 'https://images.unsplash.com/photo-1668086682339-f14262879c18?q=80&w=400'),
(4, 'https://images.unsplash.com/photo-1590190537798-4db559287bba?q=80&w=400'),
-- Bee T-Shirt
(5, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
(5, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'),
-- Manuka Honey
(6, 'https://images.unsplash.com/photo-1613548058193-1cd24c1bebcf?w=400'),
-- Honeyed Almonds
(7, 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400'),
(7, 'https://images.unsplash.com/photo-1580076853943-2d29d20d4959?w=400'),
-- Honey Lemon Kombucha
(8, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'),
-- Propolis Tincture
(9, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400'),
(9, 'https://images.unsplash.com/photo-1620231374498-e696fc404e97?w=400'),
-- Honey Mustard
(10, 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400'),
-- Mead
(11, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'),
(11, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'),
-- Beekeeper Hat
(12, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'),
-- Enamel Pin
(13, 'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=400'),
(13, 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=400'),
-- Face Mask
(14, 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400');

-- Additional Info
INSERT INTO additional_info (product_id, title, description) VALUES
-- Wildflower Honey
(1, 'Origin', 'Harvested from diverse wildflower meadows in Oregon'),
(1, 'Nutritional Benefits', 'Rich in antioxidants, vitamins, and minerals'),
(1, 'Storage', 'Store at room temperature. Crystallization is natural and reversible'),
-- Raw Honeycomb
(2, 'How to Eat', 'Chew the comb to release honey, then spit out or swallow the wax'),
(2, 'Purity', '100% pure, never heated or filtered'),
(2, 'Limited Edition', 'Only available during peak harvest season (May-July)'),
-- Honey & Lavender Tea
(3, 'Brewing Instructions', 'Steep 1 teaspoon in hot water for 4-5 minutes'),
(3, 'Caffeine', 'Contains moderate caffeine from black tea base'),
(3, 'Ingredients', 'Organic black tea, honey crystals, dried lavender flowers'),
-- Beeswax Candles
(4, 'Burn Time', 'Each candle burns for approximately 8-10 hours'),
(4, 'Care Instructions', 'Trim wick to 1/4 inch before each use'),
-- Manuka Honey
(6, 'MGO Rating', 'MGO 400+ certified for guaranteed quality'),
(6, 'Health Properties', 'Known for antibacterial and wound-healing properties'),
(6, 'Authenticity', 'Certified UMF (Unique Manuka Factor) product'),
(6, 'Usage', 'Take 1 teaspoon daily or use topically'),
-- Honeyed Almonds
(7, 'Allergen Info', 'Contains tree nuts. Made in facility that processes peanuts'),
(7, 'Serving Size', 'About 20 almonds per 1oz serving'),
-- Propolis Tincture
(9, 'Dosage', 'Adults: 10-15 drops in water, 2-3 times daily'),
(9, 'What is Propolis?', 'Resinous mixture bees use to seal their hives'),
(9, 'Benefits', 'Supports immune system and has antimicrobial properties'),
-- Mead
(11, 'Aging', 'Aged 6 months in oak barrels'),
(11, 'Serving Suggestion', 'Serve chilled or at room temperature'),
(11, 'Limited Batch', 'Only 200 bottles produced this season'),
-- Enamel Pin
(13, 'Dimensions', '1 inch tall with secure butterfly clasp'),
(13, 'Design', 'Features anatomically accurate honeybee illustration'),
-- Face Mask
(14, 'Application', 'Apply to clean face, leave for 15 minutes, rinse with warm water'),
(14, 'Frequency', 'Use 2-3 times per week for best results'),
(14, 'Skin Types', 'Suitable for all skin types, especially dry and sensitive');

-- Ratings (buyers rating various products)
INSERT INTO ratings (product_id, user_id, score) VALUES
-- Product 1 (Wildflower Honey) ratings
(1, 4, 5),
(1, 5, 4),
(1, 6, 5),
-- Product 2 (Raw Honeycomb) ratings
(2, 4, 5),
(2, 7, 5),
-- Product 3 (Honey & Lavender Tea) ratings
(3, 5, 4),
(3, 6, 5),
(3, 8, 4),
-- Product 4 (Beeswax Candles) ratings
(4, 4, 5),
(4, 7, 4),
-- Product 6 (Manuka Honey) rating
(6, 5, 5),
-- Product 7 (Honeyed Almonds) rating
(7, 6, 4),
-- Product 9 (Propolis Tincture) ratings
(9, 7, 5),
(9, 8, 4),
-- Product 10 (Honey Mustard) ratings
(10, 4, 4),
(10, 5, 4),
-- Product 11 (Mead) rating
(11, 8, 5),
-- Product 13 (Enamel Pin) ratings
(13, 4, 5),
(13, 6, 4),
(13, 7, 5),
-- Product 14 (Face Mask) rating
(14, 5, 4);

-- -- Verify data
-- SELECT 'Users:' as Info, COUNT(*) as Count FROM users
-- UNION ALL
-- SELECT 'Products:', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'Product Images:', COUNT(*) FROM product_images
-- UNION ALL
-- SELECT 'Additional Info:', COUNT(*) FROM additional_info
-- UNION ALL
-- SELECT 'Ratings:', COUNT(*) FROM ratings;
