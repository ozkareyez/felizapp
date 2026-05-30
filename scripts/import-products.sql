-- ============================================================
-- Importar catálogo "Feliz Gardens" a la tabla products
-- Compañía: FELIZ ENTERPRISE
-- ============================================================
-- INSTRUCCIONES:
-- 1. Abre Supabase Dashboard → SQL Editor
-- 2. Pega todo este archivo
-- 3. Ejecuta (debe mostrar 31 filas insertadas)
-- ============================================================

BEGIN;

-- 1. Eliminar todos los productos existentes de esta compañía
DELETE FROM products WHERE company_id = '2b58cc88-82a4-444b-86d3-e5b952320d5a';

-- 2. Insertar nuevos productos del catálogo
INSERT INTO products (company_id, name, description, precio_dia, categoria, cantidad_total, is_active) VALUES

-- COMBO
('2b58cc88-82a4-444b-86d3-e5b952320d5a', '3 in 1 Combo',     '5 mesas redondas, 35 sillas, 1 inflable por 3 horas',              450.00, 'Combo',             0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Combo 1',           '3 mesas rectangulares, 30 sillas',                                 110.00, 'Combo',             0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Combo 2',           '6 mesas redondas, 50 sillas',                                      155.00, 'Combo',             0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Combo 3',           '4 mesas redondas, 30 sillas, inflable mediano',                     320.00, 'Combo',             0, true),

-- INFLABLE SECO
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Castle Jump',   'Inflable mediano con doble deslizador 2 horas',                     190.00, 'Inflable Seco',     0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Snowie Jump',   'Inflable mediano con deslizador 2 horas',                           200.00, 'Inflable Seco',     0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Spidey Jump',   'Inflable grande Spiderman 2 horas',                                240.00, 'Inflable Seco',     0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Frozen Jump',   'Inflable grande Frozen 2 horas',                                   240.00, 'Inflable Seco',     0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Poolpo Dry Jump','Inflable Poolpo seco 2 horas',                                     240.00, 'Inflable Seco',     0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Everest Dry Jump','Inflable Everest extra grande 3 horas',                            385.00, 'Inflable Seco',     0, true),

-- INFLABLE ACUÁTICO
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Starkfin Splash','Inflable acuático para niños 3+ horas',                             325.00, 'Inflable Acuático', 0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Poolpo Wet Jump','Inflable acuático Poolpo 3+ horas',                                385.00, 'Inflable Acuático', 0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'The Everest Wet Jump','Inflable acuático Everest XL 3+ horas',                            485.00, 'Inflable Acuático', 0, true),

-- SNACK
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Popcorn 30 pcs',    'Palomitas para 30 personas',                                       85.00,  'Snack',             0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Cotton Candy 30 pcs','Algodón de azúcar para 30 personas',                               85.00,  'Snack',             0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Snow Cones 30 pcs',  'Raspados para 30 personas',                                        95.00,  'Snack',             0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Hotdogs 30 pcs',     'Hot dogs para 30 personas',                                        175.00, 'Snack',             0, true),

-- MOBILIARIO
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Silla plástica',     'Precio por unidad',                                                1.00,   'Mobiliario',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Silla plegable blanca','Precio por unidad',                                               4.25,   'Mobiliario',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Mesa rectangular 6ft','Capacidad 6-8 personas',                                          14.00,  'Mobiliario',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Mesa redonda 48in',  'Capacidad 4-6 personas',                                           12.00,  'Mobiliario',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Mesa coctel',        'Precio por unidad',                                                13.00,  'Mobiliario',        0, true),

-- DECORACIÓN
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Topper rectangular', 'Cubierta para mesa rectangular',                                   12.00,  'Decoración',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Spandex mesa rectangular','Blanco, negro o beige',                                         16.00,  'Decoración',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Topper redondo',     'Cubierta para mesa redonda',                                       12.00,  'Decoración',        0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Spandex mesa redonda','Blanco o negro',                                                  16.00,  'Decoración',        0, true),

-- LED
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Mesa coctel LED',    'Mesa iluminada',                                                   45.00,  'LED',               0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Número LED',         'Precio por número',                                                60.00,  'LED',               0, true),

-- ENTRETENIMIENTO
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Animación y juegos 2 horas','Música, globoflexia y 8 juegos',                               275.00, 'Entretenimiento',   0, true),
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Animación y juegos 3 horas','Música, globoflexia y 12 juegos',                              350.00, 'Entretenimiento',   0, true),

-- SERVICIOS
('2b58cc88-82a4-444b-86d3-e5b952320d5a', 'Servidor de eventos','Precio por hora, mínimo 3 horas',                                  23.75,  'Servicios',         0, true);

COMMIT;
