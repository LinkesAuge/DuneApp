-- Insert entities data with comprehensive null handling and UPSERT
-- WARNING: Found 3 rows with null names, will use fallback names
-- Total entities to insert: 934
-- Using UPSERT to handle existing entries

INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6721d4e1-1369-4b4d-a3a8-b4233dbbb338',
    'item_79',
    'Mercenary Light Armor Set Variant',
    'A Mercenary customization that can be applied to Light Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9fc04226-c210-4765-8859-9b4b8e7fe249',
    'item_80',
    'Kirab Heavy Armor Set Variant',
    'A Kirab customization that can be applied to Heavy Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8a8cc6e5-8b78-4c48-951d-ab22da1be066',
    'item_81',
    'Harkonnen Traitor Heavy Armor Set Variant',
    'A Harkonnen Traitor customization that can be applied to Heavy Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '53adacf6-37ce-490c-bcd7-eba02f15aa63',
    'item_82',
    'Atreides Deserter Light Armor Set Variant',
    'An Atreides Deserter customization that can be applied to Light Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9e436cf1-0e27-4ca3-a6e7-214469fd74ec',
    'item_83',
    'Harkonnen Scout Armor Set Variant',
    'A Harkonnen customization that can be applied to Light Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9be9b2ad-bbda-4518-bcb9-f8f6238a2e4c',
    'item_84',
    'Harkonnen Heavy Armor Set Variant',
    'A Harkonnen customization that can be applied to Heavy Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bdaa646b-5bf4-4da2-9ecc-b18d949493b3',
    'item_85',
    'Atreides Scout Armor Set Variant',
    'An Atreides customization that can be applied to Light Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6dd868fb-09e2-4f75-a487-7b4f7bc5742b',
    'item_86',
    'Atreides Heavy Armor Set Variant',
    'An Atreides customization that can be applied to Heavy Armors.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Armor Set Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2fad4fdd-02d1-4363-ae4f-be664f2518b4',
    'item_21',
    'Respawn Beacon',
    'Placing this device in an appropriate place adds a site at which your character can be respawned. Only one beacon can be active at a time. Placing a new beacon will replace the existing one.',
    't_ui_iconplacchoamrespawnbeacon01r_d.webp',
    'Utility',
    'Deployables',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd7c9e4b5-5761-4881-b9b2-d63d381f0fb6',
    'item_5',
    'Atreides Bedroom Furniture Set',
    'Atreides Bedroom Furniture
-Bed
-Drawers
-Cabinet
-Side Table
-Couch Modules x 4
-Wardrobe
-Carpet
-Vases x4',
    't_ui_iconplacpropatrebed_d.webp',
    'Furniture',
    'Bedroom',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '107a64b8-1384-49a0-b7af-34884ef511fc',
    'item_9',
    'Harkonnen Bedroom Furniture Set',
    'Harkonnen Bedroom Furniture
-Bed
-Drawers
-Side Table
-Bench Right
-Wardrobe
-Carpet
- Vase x2
- Totem x2',
    't_ui_iconplacharkbed_d.webp',
    'Furniture',
    'Bedroom',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '471b4c6f-2ece-4f24-b5ae-3cd17ee6c9e9',
    'item_13',
    'CHOAM Bedroom Furniture Set',
    'CHOAM Bedroom Furniture Placeables
-Bed
-Drawers
-Side Table
-Couch Modules x 4
-Wardrobe
-Carpet',
    't_ui_iconplacchoambed_d.webp',
    'Furniture',
    'Bedroom',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd5782014-82dd-4336-a520-2674a6cbc992',
    'item_414',
    'Binoculars',
    'Used to view and mark objects at a far distance. The binoculars are linked to the paracompass, thus allowing markers placed using the binoculars to be pinpointed using the compass.',
    't_ui_icontool1hchoambinoculars01r_d.webp',
    'Utility',
    'Cartography Tools',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '593483c3-ae92-43a2-befc-298780fec1f7',
    'item_25',
    'Silicone Block',
    'A block of plastic refined from Flour Sand in a Chemical Refinery. Can be used to create new products that require it.',
    't_ui_iconresourcesiliconer_d.webp',
    'Component',
    'Component',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '29c49524-ef92-4df4-b60e-182a7433b0a2',
    'item_631',
    'Small Blood Sack',
    'An item that can store blood collected with a Blood Extraction Tool. Deposit in a Blood Purifier to make drinkable water. Can be drunk directly to rehydrate, but max health will suffer.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Utility',
    'Consumables',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6fa6c085-dd02-46d4-a2fc-3d2c6d512ec2',
    'item_636',
    'Medium Blood Sack',
    'An item that can store blood collected with a Blood Extraction Tool. Deposit in a Blood Purifier to make drinkable water. Can be drunk directly to rehydrate, but max health will suffer.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Utility',
    'Consumables',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '96b00a67-9175-42de-b09d-e70d5e6ae241',
    'item_637',
    'Large Blood Sack',
    'An item that can store blood collected with a Blood Extraction Tool. Deposit in a Blood Purifier to make drinkable water. Can be drunk directly to rehydrate, but max health will suffer.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Utility',
    'Consumables',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '506ea473-10e8-4449-afc3-234ec1d7c07d',
    'item_641',
    'Massive Blood Sack',
    'An item that can store blood collected with a Blood Extraction Tool. Deposit in a Blood Purifier to make drinkable water. Can be drunk directly to rehydrate, but max health will suffer.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Utility',
    'Consumables',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '38142434-572c-41b7-90c5-e5f922229630',
    'item_257',
    'Omni Static Compactor',
    'Point and shoot at a spice field to compact the spice into a clump of sand that can be picked up. Can be made from Fremen components. Depletes power from a Power Pack on use.',
    't_ui_icontoolchoamstaticcompactortier6r_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '94464f54-6aed-473f-9a4e-d1f95db6723d',
    'item_259',
    'Compact Compactor Mk6',
    'The makers of this Unique static compactor prioritized reducing size, power draw, and most importantly worm attention.',
    't_ui_icontoolstaticcompactor_unique_compact_06r_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '16be0fe3-9c92-44ff-ad91-1b42cead3a79',
    'item_260',
    'Compact Compactor Mk5',
    'The makers of this Unique static compactor prioritized reducing size, power draw, and most importantly worm attention.',
    't_ui_icontoolstaticcompactor_unique_compact_05r_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '04b62660-ee1d-402a-8662-2f5ab399e802',
    'item_261',
    'Compact Compactor Mk4',
    'The makers of this Unique static compactor prioritized reducing size, power draw, and most importantly worm attention.',
    't_ui_icontoolstaticcompactor_unique_compact_04r_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c15a8b6a-012f-4be5-871d-dde188521891',
    'item_262',
    'Compact Compactor Mk3',
    'The makers of this Unique static compactor prioritized reducing size, power draw, and most importantly worm attention.',
    't_ui_icontoolstaticcompactor_unique_compact_03r_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71d7f716-b0a0-4318-9103-980f487cb7a1',
    'item_402',
    'Industrial Static Compactor',
    'Once called the Particle Agglomerator, this device was renamed and remarketed under its new name at twice the price and far outsold the original.',
    't_ui_icontoolchoamheavystaticcompactorr_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '13051840-97ef-4f4c-976a-7ff504085861',
    'item_403',
    'Static Compactor',
    'Point and shoot at flour sand or spice sand to compact it into a clump that can be picked up. Can be made from Fremen components. Depletes power from a Power Pack on use.',
    't_ui_icontoolchoamstaticcompactor01r_d.webp',
    'Utility',
    'Gathering Tools',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c0197dd-0d75-4bca-b184-cfc6ff79ce16',
    'item_27',
    'EMF Generator',
    'A fabrication component found in Fremen areas, such as caves. Used in Cutterays.',
    't_ui_iconresourceemfgeneratorr_d.webp',
    'Resource',
    'Component',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5bb87045-82f6-4f93-a9fc-801e29712196',
    'item_38',
    'Holtzman Actuator',
    'Those who make regular use of suspensor belts and similar technology often leave caches of these replacement parts in places only they can reach.',
    't_ui_iconresourceholtzmanactuatorr_d.webp',
    'Resource',
    'Component',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '52d8313f-386e-41b3-b000-d172a312e4e8',
    'item_65',
    'Improved Holtzman Actuator',
    'A Traversal crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceimprovedholtzmanactuatorr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '898f5568-d8a2-418c-9090-d49ca9a92a9e',
    'item_72',
    'Irradiated Slag',
    'A looted component used in crafting. Found in Radiated Core in the Sheol.',
    't_ui_iconresourceirradiatedslagr_d.webp',
    'Resource',
    'Component',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '41c1a1f1-586e-4402-b8ed-1d20f1e4c5b0',
    'item_109',
    'Experimental Missile Component',
    'The tangled remains of an experimental missile. While it’s unlikely you can reverse-engineer the missile, someone with more resources might manage it.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Resource',
    'Component',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1103603a-48f2-48ca-8799-f40496acebd9',
    'item_137',
    'Charge Amplifier',
    'A technical component bearing multiple warning labels, among them is one reading ''FOR USE WITH AUTHORIZED EQUIPMENT ONLY''',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Resource',
    'Component',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd0bc5812-8449-4faa-a31c-815d1ab65559',
    'item_172',
    'Holtzman Amplifier',
    'The machine seems to be in a useable state, at least to your untrained eye. What exactly it does is a complete mystery to you.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Resource',
    'Component',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd57baa7d-0f71-4037-8c19-0f59d924cc74',
    'item_198',
    'Plasteel Composite Blade Parts',
    'A Melee weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceplasteelcompositebladepartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd1bcad19-c024-40c2-9430-a30a82bbedab',
    'item_199',
    'Carbide blade parts',
    'A melee weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourcecarbidebladepartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a5c45eed-f1eb-4a1c-b421-fe836e07f7dc',
    'item_201',
    'Blade Parts',
    'Even the wide variety of melee weapons tend to use standardized parts for their handful of complex elements. These can often be found on the bodies of those who favor the blade, or in their storage lockers',
    't_ui_iconresourcebladepartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2cbe794f-9fd3-4356-8856-73877afdfe26',
    'item_207',
    'Mechanical Parts',
    'A fabrication component used in firearms. Found in Great House ruins, such as Shipwrecks.',
    't_ui_iconresourceadvancedmechanicalpartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '60b9f983-4b6d-4396-acbc-ecd80db1d7ca',
    'item_208',
    'Plasteel Composite Gun Parts',
    'A Ranged Weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceplasteelcompositegunpartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fb0c15a1-9e6f-461b-b842-b7462229a3fd',
    'item_209',
    'Fluted Light Caliber Compressor',
    'A weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceflutedlightcalibercompressorr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '70ac8ceb-10e6-4ede-864a-d3fe0a319fca',
    'item_211',
    'Gun Parts',
    'Key components for a wide variety of standard ranged weapons, often salvaged from the bodies of those who no longer have need for them.',
    't_ui_iconresourcegunpartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b3d591bc-936c-4858-a3a4-6c99d438161c',
    'item_212',
    'Light Caliber Compressor',
    'The Sandflies often keep stashes of these components in their outposts, as they can be turned to various useful purposes.',
    't_ui_iconresourcelightcalibercompressorr_d.webp',
    'Resource',
    'Component',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bfe04dcc-78f8-4fc7-af88-9bf07573d4ec',
    'item_240',
    'Diamodine blade parts',
    'A melee weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourcediamodinebladepartsr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6f81e269-2c79-4f6f-8347-7a39920129c4',
    'item_266',
    'Heavy Caliber Compressor',
    'The Sandflies often keep stashes of these components in their outposts, as they can be turned to various useful purposes.',
    't_ui_iconresourceheavycalibercompressorr_d.webp',
    'Resource',
    'Component',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0d2c860-50ee-4be5-b0e9-cfdf6f6d3268',
    'item_280',
    'Fluted Heavy Caliber Compressor',
    'A weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceflutedheavycalibercompressorr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '185bc9a1-bcd6-49c6-bcaa-918423dc4e52',
    'item_308',
    'Thermo-Responsive Ray Amplifier',
    'A Utility crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourcethermoresponsiverayamplifierr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f78784fe-17f4-4278-bc96-307d4fd9fe9c',
    'item_310',
    'Ray Amplifier',
    'Industrial production of bulk ores still commonly relies on drilling, but for mining more delicate materials such as crystals, a sophisticated cutteray is worth the investment. This type of equipment was used extensively to mine large parts of the Hagga Rift.',
    't_ui_iconresourcerayamplifierr_d.webp',
    'Resource',
    'Component',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6279e172-ed67-4c8d-b86a-7a2b924a59af',
    'item_366',
    'Glowtube',
    'Can be used to light up dark places. Often used in caves, or even at night, when it is best to go outside.',
    't_ui_icontool1hchoamhandheldtorch01r_d.webp',
    'Resource',
    'Component',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ed299dbe-f8f5-40a4-95db-0d03b9cfbb5a',
    'item_459',
    'Armor Plating',
    'Strengthened plating can be liberated from those who make use of them in their heavy armor, and repurposed to other ends.',
    't_ui_iconresourcearmorplatingr_d.webp',
    'Resource',
    'Component',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b4308057-d10b-4da8-9217-b1accd2573c6',
    'item_463',
    'Plasteel Composite Armor Plating',
    'An Armor crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceplasteelcompositearmorplatingr_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '91e1d4f0-1d19-44b3-acc9-f82a70f418e7',
    'item_37',
    'Particle Capacitor',
    'A fabrication component found in Old Imperial remnants, such as Imperial Testing Stations. Used in Holtzman tech or special constructions, such as Boost modules for vehicles.',
    't_ui_iconresourcesubatomicparticlecapacitorr_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0aad8f89-249f-40e5-8c06-31c701e84c17',
    'item_300',
    'Advanced Servoks',
    'A fabrication component used in vehicles such as Sandbikes. Found in Old Imperial remnants, such as Imperial Testing Stations.',
    't_ui_iconresourceadvancedservoksr_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bb40efc2-d34f-4bd7-bdb1-94d2799bb1e7',
    'item_444',
    'Hydraulic Piston',
    'A component used to craft vehicle engines. The Great Houses have a stranglehold on this type of component on Arrakis and any who possess them must have forcibly wrested them from their control.',
    't_ui_iconresourcehydraulicpistonr_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2f723b37-554e-41c9-85bc-45d62946e724',
    'item_446',
    'Tri-Forged Hydraulic Piston',
    'A vehicle module crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourcetriforgedhydraulicpistonr_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cb1ceb91-d660-456e-af14-0d0e0ea88a65',
    'item_455',
    'Military Power Regulator',
    'A component used to craft vehicle power units. The Great Houses have a stranglehold on this type of component on Arrakis and any who possess them must have forcibly wrested them from their control.',
    't_ui_iconresourcemilitarypowerregulatorr_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fd0a688a-aa31-4025-8cbc-03dbdf94220f',
    'item_457',
    'Overclocked Power Regulator',
    'A vehicle module crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceoverclockedpowerregulatorr_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'acfad50f-7e0c-4589-86cf-f4021053f64f',
    'item_506',
    'Scout Ornithopter Generator Mk4',
    'Defines the power efficiency and manages the heat dissipation for a Scout Ornithopter. Use a Welding Torch to attach the generator to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolpsur_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '120a8b3e-54c6-4d29-b940-2e18e847c7e6',
    'item_507',
    'Scout Ornithopter Generator Mk5',
    'Defines the power efficiency and manages the heat dissipation for a Scout Ornithopter. Use a Welding Torch to attach the generator to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolpsur_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c217c691-d9a2-4917-ab8d-b707cb3b446f',
    'item_508',
    'Scout Ornithopter Generator Mk6',
    'Defines the power efficiency and manages the heat dissipation for a Scout Ornithopter. Use a Welding Torch to attach the generator to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolpsur_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0db3093-1e1c-46cc-8c8c-f1cb2f81c5b5',
    'item_533',
    'Assault Ornithopter Generator Mk5',
    'Defines the power efficiency and manages the heat dissipation for an Assault Ornithopter. Use a Welding Torch to attach the generator to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmopsur_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8e6fc67e-e04a-4e2f-b0cc-2e1bc46dfc01',
    'item_534',
    'Assault Ornithopter Generator Mk6',
    'Defines the power efficiency and manages the heat dissipation for an Assault Ornithopter. Use a Welding Torch to attach the generator to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmopsur_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '038bc92c-ec9a-4c77-81bb-f00e6f5709d0',
    'item_552',
    'Carrier Ornithopter Generator Mk6',
    'Defines the power efficiency and manages the heat dissipation for a Carrier Ornithopter. Use a Welding Torch to attach the generator to a Carrier Ornithopter Chassis.',
    't_ui_iconvehctopsur_d.webp',
    'Vehicle Part',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd7e132d4-62df-47d6-ba0f-c983dbe3985f',
    'item_415',
    'Construction Tool',
    'A Solido Construction Projector. Use this device to build, move, repair or demolish structures. It can only be used on land claimed using a Sub-fief console.',
    't_ui_icontoolchoamsolconprojector01r_d.webp',
    'Utility',
    'Utility Tools',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2c1d9084-3ff0-46f4-a20e-589ad9c37d7c',
    'item_110',
    'Harkonnen Casualty Report',
    'The combination of numbers and three-letter-acronyms makes very little sense to you. Someone with a better understanding of Harkonnen Battle language might be able to decipher it.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c3877a9d-f8c8-49ea-8545-0e59553d24ae',
    'item_111',
    'Broken Crysknife Hilt',
    'Split lengthwise, it is unlikely this hilt will ever hold a blade again. Small shards of sandworm-tooth stuck in the hilt indicate that this was once a legendary crysknife. Someone in Harko Village would be very interested in this.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '43b19ca0-1069-48da-9482-4978658cb2a1',
    'item_113',
    'CHOAM Employee Records',
    'A long list of names and personal information that would be invaluable to anyone trying to impersonate a CHOAM employee. A local CHOAM representative might pay for its retrieval.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '509c42f3-18f4-4741-b32d-27e0e8742743',
    'item_114',
    'Mysterious Vials',
    'The sealed vials all appear empty. It seems like one of the vials is missing. Stark warning labels make it clear that opening these vials would be a bad idea. Someone probably wants this back.',
    't_ui_iconcontractboxvials_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3690aee6-5c8e-4a91-8a63-ea5b109aba7b',
    'item_115',
    'Surveillance Report',
    'A detailed surveillance report mentioning several ships, passing or crashed, in the vicinity, with coordinates marked down. Several sightings match the Kytheria''s description.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '929872c7-18b5-4984-9387-49a0e959cb94',
    'item_117',
    'Courier Package',
    'Wrapped in thick spice-cloth, the contents of this package are a mystery. It seems unlikely you could open it without leaving a trace.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4da39251-f969-4bd5-ba1b-377fa92245f6',
    'item_118',
    'Slaver Records',
    'This long list contains extensive descriptions and measurements of people, although the lack of names makes it of questionable utility if trying to find someone.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4af6f588-47b4-4dcb-8834-09d1f40e40fe',
    'item_119',
    'Spice Field Records',
    'This crude map shows some local landmarks and some vague hints that there might be spice fields nearby. It seems to be in a code you are unlikely to break before sandstorms makes this info obsolete.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '18b6f82f-80be-47d9-b3e7-6ce06696c287',
    'item_127',
    'Slave Shipping Ledger',
    'This long list contains a series of codes coupled with physical descriptions and vocational skills. Beside the code ALDAX804 is the notation ''Transferred to Neo-Carthag.''',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '788a94ae-e5a3-40c9-9015-6c7a9549971b',
    'item_128',
    'Unmarked Package',
    'Wrapped in thick spice-cloth, the contents of this package are a mystery. It seems unlikely that you could open it without leaving a trace.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bc978281-8baa-42be-9a07-85a980770836',
    'item_129',
    'Execution Order',
    'A CHOAM contract for mercenary service.',
    't_ui_iconcontracts_funnel_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c2587514-f08c-46a7-8577-21987014193f',
    'item_130',
    'Imperial Testing Station Records',
    'A box marked as belonging to the record department of Imperial Testing Station No. 2. Someone interested in the history of this facility would probably pay for this.',
    't_ui_iconcontractboxshigawirereels_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f5fa34df-c3f4-4548-9f1d-f36032bf6b7f',
    'item_131',
    'Coded Message',
    'A folded page of spice paper bearing an indecipherable coded message.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a5280103-987e-4274-b5dc-dbf0edb261ab',
    'item_132',
    'Suspicious Message',
    'To the Slaver Scum: Use any means necessary to enslave any Atreides troops you come across. House Harkonnen does not care about what caste they belong to — all will serve the Baron.

Signed, Gregory Harkonnen',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7584f55a-48ed-464e-bb43-1839eee8c874',
    'item_135',
    'Counterfeit Document',
    'A set of official-looking forged documents, describing the alleged wrongdoings of one Anton Tolliver. Only slightly exaggerated.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b31352be-0be4-4e71-9eac-94176b827906',
    'item_136',
    'Atreides Encrypted Report',
    'The dead spy''s report is encrypted with expertise and tech far beyond your ability to decipher. It’s all rather suspicious for something found on such a low-ranking agent. Still, Tolliver or Kazmir may have the means of unlocking its secrets.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1d93a721-a33d-4dcf-9c38-837442be7dda',
    'item_143',
    'Item item_143',
    'Proof of a contract fulfilled, to be handed in at any Tradepost Contracts Board for payment.',
    't_ui_iconconsumcontractr_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4bf4eca9-b71c-4292-b8c4-037f893feb2e',
    'item_145',
    'Sealed Spice Package',
    'A package containing a sizable amount of spice. It is hermetically sealed and marked with the Harkonnen crest. No legitimate spice dealer would buy this.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ad2a9dca-bb63-45cf-bacd-b0dfae12dca2',
    'item_146',
    'Battered Spice Package',
    'A package containing a sizable amount of spice. It is hermetically sealed and marked with the Harkonnen crest. No legitimate spice dealer would buy this.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0e3cb2d-1ec3-4866-8ae4-10c2c9ce6c37',
    'item_149',
    'Business Contract',
    'An agreement between the Sandflies and a carryall pilot named Tripp Yates, hiring him to transport a container from a shipwreck in the Hagga Rift. No mention is made of its contents.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dfbda7bc-083b-43f7-b065-bdee06fe3b4b',
    'item_150',
    'Delivery Report',
    'A report on the successful delivery of several spice shipments to anonymized wealthy customers, several of them in Arrakeen. One shipping canister sent to Desert Testing Station 142 is described as being recovered from "the wreck".',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c555f9e2-219c-4fd9-99b0-5f1f0f453e13',
    'item_152',
    'Spice Residue Sample',
    'A spice sample taken from the canister recovered from the Kytheria wreck. It looks and smells like any other spice melange on Arrakis.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0b5204bd-87db-4991-b327-4e75392c77c3',
    'item_153',
    'Atreides Identification Tag',
    'This Atreides House Trooper identification tag lists a serial number along with the name "Yang, Trenton A". Tiny instrumentation, built into the tag, notes the date and time when this device ceased detecting heartbeat and respiration data from its wearer.',
    't_ui_iconcontractchoamcommuninettransceiver_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a1d61e3e-35cf-42e0-a57b-ed0369583f8a',
    'item_159',
    'Fremen Bloodline Records',
    'A more or less complete listing of every Fremen who has ever passed the Trials of Aql, and who their offspring were.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c609a8bc-2466-4ed6-88fc-49d74ce02b4c',
    'item_162',
    'Syndicate Contract',
    'Kept deliberately away from the formal system of contracts, this note orders its bearer to find, apprehend, or kill ''the rogue Bene Gesserit''. The bearer is then ordered to report to Margot Fenring.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8392c308-9433-4c99-be7a-0d81b59c22f8',
    'item_165',
    'Mobula Gang''s Minimic Film',
    'This minimic film details the Mobula gang''s deals related to slave trade in the Hagga Basin. It is damning evidence, for all parties involved.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'aa2bdf97-f526-4928-ad15-6e9ef3e7a652',
    'item_166',
    'Deserter Tissue Sample',
    'The tissue sample was retrieved from a specific group of Atreides deserters in the Hagga Rift.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '175e5651-3701-42b5-b14d-c5f21e36f1a7',
    'item_167',
    'Zayn''s Minimic Film',
    'The film contains details of the deserters'' operations in the Hagga Rift and is intended for Thufir Hawat''s eyes only.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ab84840-0745-4240-9996-4131401fa033',
    'item_168',
    'Tleilaxu Datapad',
    'If there is any information pertaining to the Bene Tleilax conditioning Zayn de Witte was subjected to, it will be on this datapad.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '95bfc5f1-5cdc-4b96-bc9f-47ba2d406a24',
    'item_181',
    'Atreides Decrypted Report',
    'A decrypted report from a dead spy. It contains data unknown to you, but you recognize the words "Kytheria", "Chloros" and "Skorda". Anton Tolliver will be able to analyze this.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c1d7ff9e-4006-4e3a-bbd1-f32017ce1757',
    'item_185',
    'Coded Manifest',
    'A coded slaver servo-stim shipping manifest, seemingly neatly organized — more insight would require proper deciphering.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7ac0c473-8f40-4ff7-a46d-f3bcc2d8a4fa',
    'item_329',
    'Extravagant Message',
    'A favored weapon of the Smuggler, Esmar Tuek, this Unique Vulcan gun leaves a mess wherever it is fired. Tuek, it is said, is a man who likes to make sure that when he sends a message to his enemies, it is heard.',
    't_ui_iconwpnlmg_unique_rapidfire_05r_d.webp',
    'Contract Quest',
    'Contract Item',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '31b69321-2861-4ed9-bf0d-d63785244943',
    'item_917',
    'Jasmium Crystal',
    'Jasmium Crystal, mined from a Jasmium deposit. Can be refined together with Aluminum Ingots into Duraluminum Ingots at a Medium Ore Refinery to create new products that require it.',
    't_ui_iconresourcejasmiumcrystalr_d.webp',
    'Resource',
    'Raw Resource',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '31383708-a044-4436-aa65-9c384f2c9c58',
    'item_919',
    'Erythrite Crystal',
    'Erythrite Crystal, mined from an Erythrite deposit in the Hagga Rift. Can be refined into Cobalt Paste at a Chemical Refinery to create new products that require it.',
    't_ui_iconresourceerythritecrystalr_d.webp',
    'Resource',
    'Raw Resource',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ac3fcaa3-7617-4ea9-bf10-010807cc94fa',
    'item_307',
    'Kynes''s Cutteray',
    'Pardot Kynes was a driven man and single-minded in his quest to teach the Fremen the language of ecological transformation. He gave them access to the technology of the Imperium — allowing them to greatly expand their catchbasins and windtraps. Pardot was also a very hands-on type and this Unique cutteray was crafted and tuned to his exacting specifications.',
    't_ui_icontoolminingtool_2h_unique_04r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5d03e32e-6627-4b0c-a3e1-3e66894b2c09',
    'item_309',
    'Tarl Cutteray',
    'When Pardot Kynes began his work with the Fremen, he brought them into the Imperial Testing Stations as laborers. He gave them access to the technology and science of the Imperium. Soon enough, cutterays began appearing in Sietchs, sculpting tunnels and windtraps to help with Pardot''s long term plans. This Unique cutteray has been optimized for the ores and rock deposits on the area around Sietch Tarl.',
    't_ui_icontoolminingtool_2h_unique_03r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '696a733c-71a0-4f19-9375-3ba426e90060',
    'item_313',
    'Cutteray Mk3',
    'Heavy cutteray capable of mining aluminum. Depletes power from a Power Pack. Fabricated with Fremen parts.',
    't_ui_icontool2hchoamcutteray01r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a16f0e46-e09d-46d2-af2b-e43dcfd76293',
    'item_314',
    'Cutteray Mk5',
    'Robust cutteray capable of mining titanium and stravidium. Depletes power from a Power Pack. Fabricated from Fremen parts.',
    't_ui_icontools2hchoamcutteray03r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ececa333-4a2e-42cf-8062-9183d11cda0f',
    'item_315',
    'Industrial Cutteray Mk4',
    'Cutteray capable of mining jasmium crystals, which are a necessity to refine duraluminum. Depletes power from a Power Pack. Fabricated from Fremen parts.',
    't_ui_icontool2hchoamcutteray02r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 100/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '200acb91-fbd2-4660-8252-94d6d78dff04',
    'item_316',
    'Cutteray Mk6',
    'Top-of-the-line cutteray capable of mining virtually anything. Depletes power from a Power Pack. Fabricated with Fremen parts.',
    't_ui_icontools2hchoamcutteray04r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b6aef409-a7ff-438e-8336-5c33cc0f1b98',
    'item_319',
    'Improvised Cutteray',
    'Harmless to humans, it is uniquely suited to extracting resources. This version works on granite, copper, metal, and doors. Analysis mode shows weak points. Depletes power from a Power Pack.',
    't_ui_icontoolchoamcutteray01r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ca43b70-d569-4da3-94af-8217cb1b49d9',
    'item_320',
    'Cutteray Mk2',
    'Cutteray capable of mining carbon, which is a necessity to refine steel. Depletes power from a Power Pack. Fabricated from Fremen parts.',
    't_ui_icontool1hchoamcutteray03r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '42d32c79-fd3c-40c6-b672-0931918ef4f2',
    'item_321',
    'Cutteray Mk1',
    'Cutteray capable of mining iron. Depletes power from a Power Pack. Fabricated from Fremen parts.',
    't_ui_icontool1hchoamcutteray02r_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6adffc15-664b-4d20-ac35-41b9d5bbb797',
    'item_486',
    'Buggy Cutteray Mk3',
    'Adds a mining turret to the Buggy. Use a Welding Torch to attach the mining laser to Buggy Rear Hull with an available utility slot. The buggy-mounted mining laser does not allow analysis mode and requires an attached inventory module to hold mined resources.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b6756546-6eeb-4610-8243-c288cebc4c23',
    'item_487',
    'Buggy Cutteray Mk4',
    'Adds a mining turret to the Buggy. Use a Welding Torch to attach the mining laser to Buggy Rear Hull with an available utility slot. The buggy-mounted mining laser does not allow analysis mode and requires an attached inventory module to hold mined resources.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bc93cf07-c5e9-480c-bb79-176a00aff47e',
    'item_488',
    'Buggy Cutteray Mk5',
    'Adds a mining turret to the Buggy. Use a Welding Torch to attach the mining laser to Buggy Rear Hull with an available utility slot. The buggy-mounted mining laser does not allow analysis mode and requires an attached inventory module to hold mined resources.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '511d0367-92b7-41a6-8e71-13e07cd3388b',
    'item_489',
    'Buggy Cutteray Mk6',
    'Adds a mining turret to the Buggy. Use a Welding Torch to attach the mining laser to Buggy Rear Hull with an available utility slot. The buggy-mounted mining laser does not allow analysis mode and requires an attached inventory module to hold mined resources.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd4133a06-6f09-49d2-ae7a-5850b750bdc0',
    'item_490',
    'Focused Buggy Cutteray Mk3',
    'This Unique buggy mining laser boasts increased Carbon and Erythrite yield at the cost of increased heat generation.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2bda7081-8a7b-422c-9f29-b8544ef74f69',
    'item_491',
    'Focused Buggy Cutteray Mk4',
    'This Unique buggy mining laser boasts increased Aluminum yield, albeit at the cost of heat generation.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0db505ee-2a75-41ca-9bbe-fe086fca93d0',
    'item_492',
    'Focused Buggy Cutteray Mk5',
    'This Unique buggy mining laser boasts increased Jasmium yield, albeit at the cost of heat generation.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0941354-1fb0-4390-8dd8-383b409a9ce7',
    'item_493',
    'Focused Buggy Cutteray Mk6',
    'This Unique buggy mining laser boasts increased Titanium and Stravidium Mass yield, albeit at the cost of heat generation.',
    't_ui_iconvehccbmininglaserr_d.webp',
    'Utility',
    'Gathering Tools',
    'Cutteray',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4a97909c-471e-42fc-acee-2ad189214f16',
    'item_355',
    'Heavy Darts',
    'For use in larger and more powerful weapons, Heavy Darts are standard ammunition and can pierce certain types of armor.',
    't_ui_iconresourceheavydartammor_d.webp',
    'Utility',
    'Ammo',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cc557c21-3069-4070-82c0-ddf2544ed219',
    'item_424',
    'Light Darts',
    'When Holtzman shields were introduced the use of lasguns became too dangerous and subsequently, the use of dart projectiles became the standard ammunition of House Troops and other military forces.',
    't_ui_iconresourcelightdartammor_d.webp',
    'Utility',
    'Ammo',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'de213bcc-d06d-4a13-b76a-03d9c14133a8',
    'item_6',
    'Atreides Dining Room Furniture Set',
    'Atreides Dining Room Furniture
-Dining Table
-Chair
-Atreides Banner
-Hologram Projector
-Wall Art
-Bowl
-Carafe
-Spice Jar
-Serving Plate
-Plate
-Cup
-Ceiling Lights x2',
    't_ui_iconplacpropatredinnertable_d.webp',
    'Furniture',
    'Dining',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6f241f0b-5fc0-4656-a15f-e841b541d94e',
    'item_10',
    'Harkonnen Dining Room Furniture Set',
    'Harkonnen Dining Room Furniture
-Dining Table
-Chair
-Harkonnen Banner
-Hologram Projector
-Wall Art
-Bowl
-Carafe
-Spice Jar
-Serving Plate
-Plate
-Cup x 2
-Ceiling Lights x2',
    't_ui_iconplacharkwallart01_d.webp',
    'Furniture',
    'Dining',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3ec1f9a9-e26b-4ca5-b8e9-05d2c211f9fe',
    'item_14',
    'CHOAM Dining Room Furniture Set',
    'CHOAM Dining Room Furniture
-Dining Table
-Chair
-Choam Banner
-Hologram Projector
-Wall Art',
    't_ui_iconplacchoamwallart01_d.webp',
    'Furniture',
    'Dining',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c6383015-ef91-4b2f-b375-d0e7c92bb085',
    'item_369',
    'Regis Dirk',
    'The Harkonnen Dirk is a short dagger used for self-defense. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleeharkdagger01r_d.webp',
    'Weapon',
    'Dirk',
    'Melee',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1c8cd34d-61db-4707-ba9c-94af816f1581',
    'item_370',
    'Adept Dirk',
    'The Harkonnen Dirk is a short dagger used for self-defense. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleeharkdagger01r_d.webp',
    'Weapon',
    'Dirk',
    'Melee',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '43f280ee-9126-459c-8563-1d0f746a842d',
    'item_371',
    'House Dirk',
    'The Harkonnen Dirk is a short dagger used for self-defense. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleeharkdagger01r_d.webp',
    'Weapon',
    'Dirk',
    'Melee',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd6288e0a-4828-4268-b201-a6a2db06705c',
    'item_372',
    'Artisan Dirk',
    'The Harkonnen Dirk is a short dagger used for self-defense. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleeharkdagger01r_d.webp',
    'Weapon',
    'Dirk',
    'Melee',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '89ddbf9c-04ed-467e-afb0-c75e49a153ed',
    'item_30',
    'Spice-infused Aluminum Dust',
    'Truly Unique items often rely on spice-infused metal to enhance their qualities. Such metals are jealously horded by the most powerful groups, locked away in their most secure containers.',
    't_ui_iconresourcespiceinfusedaluminiumingotr_d.webp',
    'Component',
    'Component',
    'Dust',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '365f463d-d653-49ca-b7cc-2bddbf75c003',
    'item_34',
    'Spice-infused Duraluminum Dust',
    'Truly Unique items often rely on spice-infused metal to enhance their qualities. Such metals are jealously horded by the most powerful groups, locked away in their most secure containers.',
    't_ui_iconresourcespiceinfusedduraluminiumingotr_d.webp',
    'Resource',
    'Component',
    'Dust',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '751be222-b3f2-47ff-9d90-ad7a732a96ca',
    'item_49',
    'Spice-infused Copper Dust',
    'Truly Unique items often rely on spice-infused metal to enhance their qualities. Such metals are jealously horded by the most powerful groups, locked away in their most secure containers.',
    't_ui_iconresourcespiceinfusedcopperingotr_d.webp',
    'Resource',
    'Component',
    'Dust',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9795f8af-eca5-4f9b-898e-12d0039b4847',
    'item_59',
    'Spice-infused Iron Dust',
    'Truly Unique items often rely on spice-infused metal to enhance their qualities. Such metals are jealously horded by the most powerful groups, locked away in their most secure containers.',
    't_ui_iconresourcespiceinfusedironingotr_d.webp',
    'Resource',
    'Component',
    'Dust',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f04bec34-7fa9-4b93-bff0-a6fd81fa17f5',
    'item_61',
    'Spice-infused Steel Dust',
    'Truly Unique items often rely on spice-infused metal to enhance their qualities. Such metals are jealously horded by the most powerful groups, locked away in their most secure containers.',
    't_ui_iconresourcespiceinfusedsteelingotr_d.webp',
    'Resource',
    'Component',
    'Dust',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1848dcb6-2584-41e3-b58c-fd4dfc13e463',
    'item_66',
    'Spice-infused Plastanium Dust',
    'Truly Unique items often rely on spice-infused metal to enhance their qualities. Such metals are jealously horded by the most powerful groups, locked away in their most secure containers.',
    't_ui_iconresourcespiceinfuseddeepdesertiumingotr_d.webp',
    'Resource',
    'Component',
    'Dust',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '04f4725b-f617-4550-9deb-50302900150d',
    'item_236',
    'Fluid Efficient Industrial Pump',
    'A utility crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourcefluidefficientindustrialpumpr_d.webp',
    'Resource',
    'Component',
    'Dust',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '34c75759-791c-4cff-8a18-bbc1290578f6',
    'item_238',
    'Industrial Pump',
    'There are few uses for industrial-strength pumps on a planet as dry as Arrakis, but the Sandflies do utilize them in their operations in Sentinel City.',
    't_ui_iconresourceindustrialpumpr_d.webp',
    'Resource',
    'Component',
    'Dust',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd4e4e828-7836-4008-b1a9-a21b1ea8bdba',
    'item_242',
    'Diamondine Dust',
    'This industrial byproduct is closely guarded by the Maas Kharet in their most sacred site. Nobody is entirely sure why.',
    't_ui_iconresourcediamondinedustr_d.webp',
    'Resource',
    'Component',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '73320a57-d62d-48bb-813f-8459ff163ebc',
    'item_378',
    'Industrial Dew Scythe Mk4',
    'Fremen device used on dew bearing primrose flowerfields at dawn to harvest water into a literjon or water tank. Depletes power when used.',
    't_ui_icontool1hchoamdewscythe01r_d.webp',
    'Resource',
    'Component',
    'Dust',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '925bc497-7967-4a0b-9b9d-0e473d5db9ad',
    'item_926',
    'Industrial-grade Lubricant',
    'An industrial quality lubricant required for directional wind turbines to function. Can be refined in a chemical refinery.',
    't_ui_iconresourceindustriallubricantr_d.webp',
    'Resource',
    'Component',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '83fc1023-ed4e-4cf8-a42b-6e6582137261',
    'item_404',
    'Filter Extractor Mk6',
    'This Unique fluid extractor has been modified with a small filter that, upon use, can separate some pure water out of blood and divert it to the appropriate containers. Developed by slavers who did not wish to risk disease but considered their cargo a portable source of water.',
    't_ui_icontoolbodyfluidextractor_unique_water_06r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7de0f4bd-9263-4a70-aa8c-ebc6c3bb7e7b',
    'item_405',
    'Filter Extractor Mk5',
    'This Unique fluid extractor has been modified with a small filter that, upon use, can separate some pure water out of blood and divert it to the appropriate containers. Developed by slavers who did not wish to risk disease but considered their cargo a portable source of water.',
    't_ui_icontoolbodyfluidextractor_unique_water_05r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '34ae3fbc-ac47-4009-a72c-a5f5a046cdcc',
    'item_406',
    'Filter Extractor Mk4',
    'This Unique fluid extractor has been modified with a small filter that, upon use, can separate some pure water out of blood and divert it to the appropriate containers. Developed by slavers who did not wish to risk disease but considered their cargo a portable source of water.',
    't_ui_icontoolbodyfluidextractor_unique_water_04r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd6b048b5-36cf-4508-a05b-d61aeda08eaf',
    'item_407',
    'Filter Extractor Mk3',
    'This Unique fluid extractor has been modified with a small filter that, upon use, can separate some pure water out of blood and divert it to the appropriate containers. Developed by slavers who did not wish to risk disease but considered their cargo a portable source of water.',
    't_ui_icontoolbodyfluidextractor_unique_water_03r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c477742c-b9c2-4f65-b24c-e56211a7da00',
    'item_408',
    'Impure Extractor Mk6',
    'This Unique exsanguination tool liquefies internals of the target, allowing the wielder to extract even more fluids. In addition, any excess fluid is converted to a poison which is applied to the user''s weaponry.',
    't_ui_icontoolbodyfluidextractor_unique_poison_06r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ab40c851-0699-49eb-8cbc-1a573ed3fdba',
    'item_409',
    'Impure Extractor Mk5',
    'This Unique exsanguination tool liquefies internals of the target, allowing the wielder to extract even more fluids. In addition, any excess fluid is converted to a poison which is applied to the user''s weaponry.',
    't_ui_icontoolbodyfluidextractor_unique_poison_05r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fe37cebe-48bc-433a-a83d-acf0bbfa7223',
    'item_410',
    'Blood Extractor Mk6',
    'Equip and use this to extract blood from dead bodies into a Blood Sack. Blood can be processed into water with a Blood Purifier in your base.',
    't_ui_icontool2hchoambloodextractortier6r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dc204480-0879-44f5-88f9-b4991cbf8e75',
    'item_411',
    'Blood Extractor Mk4',
    'Equip and use this to extract blood from dead bodies into a Blood Sack. Blood can be processed into water with a Blood Purifier in your base.',
    't_ui_icontool2hchoambloodextractor01r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f0c45158-2581-46cc-967b-b0d0f636d74c',
    'item_412',
    'Blood Extractor Mk2',
    'Equip and use this to extract blood from dead bodies into a Blood Sack. Blood can be processed into water with a Blood Purifier in your base.',
    't_ui_icontool1hchoambloodextractor01r_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a01e5493-9489-495d-a81c-aff5b519378c',
    'item_413',
    'Improvised Blood Extractor',
    'A crude device for extracting blood from corpses and into a Blood Sack. Blood can be processed into water with a Blood Purifier at a base. It is rumored that the Fremen have perfected a field version of this device.',
    't_ui_icontool1hfremenexsanguinationtoolr_d.webp',
    'Utility',
    'Gathering Tools',
    'Extractor',
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2639992b-f9e7-4485-ab1d-f138b83f4910',
    'item_33',
    'Insulated Fabric',
    'Insulated fabric was one of the cottage industries of the O''odham, before the pyons were displaced from their old villages.',
    't_ui_iconresourceinsulatedfabricr_d.webp',
    'Resource',
    'Raw Resource',
    'Fabric',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'adef2cb9-6fd5-4e7a-8610-257bafba8d87',
    'item_640',
    'Atmospheric Filtered Fabric',
    'A utility crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceatmosphericfilteredfabricr_d.webp',
    'Resource',
    'Raw Resource',
    'Fabric',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd9a8c9de-247b-40d8-850b-16d2d0879551',
    'item_695',
    'Ballistic Weave Fabric',
    'A light armor crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceballisticweavefabricr_d.webp',
    'Resource',
    'Raw Resource',
    'Fabric',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1fc18a66-34ec-4a2c-bf28-d638aea7c09b',
    'item_196',
    'Plasteel Microflora Fiber',
    'A fabrication component used in armor. Found in Great House ruins, such as Shipwrecks.',
    't_ui_iconresourceplasteelmicroflorafiberr_d.webp',
    'Resource',
    'Raw Resource',
    'Fiber',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '45564daf-6154-417c-846a-a6cdd3665c98',
    'item_197',
    'Plant Fiber',
    'Resource that can be picked everywhere in the world where there is solid land for it to take root. Woven to fibers used in armor and bandages.',
    't_ui_iconresourceplantfiberr_d.webp',
    'Resource',
    'Raw Resource',
    'Fiber',
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c48942a1-d5d6-48b4-9fb4-49e93677cb68',
    'item_924',
    'Stravidium Fiber',
    'These fibers are carefully drawn from a chemically-treated stravidium mass, and used in the production of plastanium.',
    't_ui_iconresourcestravidiumfiberr_d.webp',
    'Resource',
    'Raw Resource',
    'Fiber',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a94df63e-5dbd-41af-8b22-10bc8a897f5c',
    'item_298',
    'Fuel Cell',
    'Found throughout the world, fuel cells can generate power for bases directly when loaded into a Fuel Generator. They can be refined at a Chemical Refinery into Vehicle Fuel Cells to power vehicles.',
    't_ui_iconresourcesalvagescrapfuelpickup02r_d.webp',
    'Resource',
    'Component',
    'Fuel Cell',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2c9a3a26-c263-4a04-a785-f43d37616324',
    'item_910',
    'Small Vehicle Fuel Cell',
    'Vehicle Fuel Cell with low capacity. Refined from Fuel Cells at a Chemical Refinery. Used to power vehicles.',
    't_ui_iconresourcesalvageimpurefuelcorer_d.webp',
    'Resource',
    'Component',
    'Fuel Cell',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '288c9987-652b-4ed2-9868-1c9924df22f7',
    'item_912',
    'Medium Sized Vehicle Fuel Cell',
    'Vehicle Fuel Cell with average capacity. Refined from Fuel Cells at a Chemical Refinery. Used to power vehicles.',
    't_ui_iconresourcesalvageimpurefuelcorer_d.webp',
    'Resource',
    'Component',
    'Fuel Cell',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6b4d7ffa-ddd8-4333-9d8b-b47ad77f0ab4',
    'item_913',
    'Large Vehicle Fuel Cell',
    'Vehicle Fuel Cell with high capacity. Refined from Fuel Cells at a Chemical Refinery. Used to power vehicles.',
    't_ui_iconresourcesalvageimpurefuelcorer_d.webp',
    'Resource',
    'Component',
    'Fuel Cell',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1f661818-6536-4125-b896-1ac76fa49fdf',
    'item_931',
    'Spice-infused Fuel Cell',
    'A fuel cell for spice-powered generators. Made from fuel cells and spice residue. Can be refined in a Medium Chemical Refinery.',
    't_ui_iconresourcespiceinfusedfuelcellr_d.webp',
    'Resource',
    'Component',
    'Fuel Cell',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dc09f887-f13a-402e-834f-aecd3c6ec767',
    'item_619',
    'Healkit',
    'A standardized pack of cleansing agents, dermastraps and chemical stimulants, widely used to keep injured troops on their feet and in the fight.',
    't_ui_iconconsumhealthpackr_d.webp',
    'Utility',
    'Consumable',
    'Healkit',
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3600a483-adcd-4d0b-a099-cc9283b718f7',
    'item_633',
    'Healkit Mk2',
    'An improved pack of cleansing agents, dermastraps and chemical stimulants, widely used to keep injured troops on their feet and in the fight.',
    't_ui_iconconsumhealthpack02r_d.webp',
    'Utility',
    'Consumable',
    'Healkit',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4f8e7566-a9c2-4675-8f0f-dbe88746862f',
    'item_634',
    'Healkit Mk4',
    'An advanced pack of cleansing agents, dermastraps and chemical stimulants, widely used to keep injured troops on their feet and in the fight.',
    't_ui_iconconsumhealthpack02r_d.webp',
    'Utility',
    'Consumable',
    'Healkit',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '586c248b-c8e2-4a18-a781-1b1485f36f69',
    'item_642',
    'Healkit Mk6',
    'An exceptional pack of cleansing agents, dermastraps and chemical stimulants, widely used to keep injured troops on their feet and in the fight.',
    't_ui_iconconsumhealthpack02r_d.webp',
    'Utility',
    'Consumable',
    'Healkit',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ef961e0-3a14-4d4c-bd56-b18e702b79de',
    'item_653',
    'Duneman Heavy Boots',
    'Heavy combat boots made of reinforced aluminum providing maximum protection to Great House troops.',
    't_ui_iconclothsandfliesheavybootsr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7e20c73d-d387-4ed1-b296-baa988e30b88',
    'item_654',
    'Duneman Heavy Pants',
    'Heavy combat leg armor made of reinforced aluminum providing maximum protection to Great House troops.',
    't_ui_iconclothsandfliesheavybottomr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0c1670eb-87ae-40b2-bac6-887e6ddd6912',
    'item_655',
    'Duneman Heavy Gloves',
    'Heavy combat hand armor made of reinforced aluminum providing maximum protection to Great House troops.',
    't_ui_iconclothsandfliesheavyglovesr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4cb43e1e-e320-4597-bf65-e258b5a85560',
    'item_656',
    'Duneman Heavy Mask',
    'A heavy combat helmet made of reinforced aluminum providing maximum protection to Great House troops.',
    't_ui_iconclothsandfliesheavyheadr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8281959d-7aae-4615-8cea-a6fc886f7266',
    'item_657',
    'Duneman Heavy Jacket',
    'A heavy combat armor made of reinforced aluminum providing maximum protection to Great House troops.',
    't_ui_iconclothsandfliesheavybodyr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd3139af4-f209-4460-ab60-69067a19a41a',
    'item_658',
    'Kirab Heavy Boots',
    'Heavy combat boots made of reinforced iron providing maximum protection to Great House troops.',
    't_ui_iconclothkirabheavyshoesr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cc5cf69a-5ddf-4558-9ed9-b24fe4079269',
    'item_659',
    'Kirab Heavy Pants',
    'Heavy combat leg armor made of reinforced iron providing maximum protection to Great House troops.',
    't_ui_iconclothkirabheavybottomr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '67a40001-94db-4108-a753-b5634a1f3be1',
    'item_661',
    'Kirab Heavy Headwrap',
    'A heavy combat helmet made of reinforced iron providing maximum protection to Great House troops.',
    't_ui_iconclothkirabheavyhelmetr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f54c3d04-a0d1-404f-baee-bac867d67b72',
    'item_662',
    'Kirab Heavy Jerkin',
    'A heavy combat armor made of reinforced iron providing maximum protection to Great House troops.',
    't_ui_iconclothkirabheavybodyr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ed8d6dd1-3019-4b2c-b806-40c8a1e0a970',
    'item_663',
    'Slaver Heavy Boots',
    'Heavy combat boots made of reinforced steel providing maximum protection to Great House troops.',
    't_ui_iconclothslaverheavybootsr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bb563b37-f18c-4d8a-9216-92ead77f42b5',
    'item_664',
    'Slaver Heavy Pants',
    'Heavy combat leg armor made of reinforced steel providing maximum protection to Great House troops.',
    't_ui_iconclothslaverheavybottomr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0409784e-60b3-4211-a88c-58b614eeafc3',
    'item_665',
    'Slaver Heavy Gloves',
    'Heavy combat hand armor made of reinforced steel providing maximum protection to Great House troops.',
    't_ui_iconclothslaverheavyglovesr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7487d062-a40a-4f65-80d5-d3f0252e5c1e',
    'item_666',
    'Slaver Heavy Helmet',
    'A heavy combat helmet made of reinforced steel providing maximum protection to Great House troops.',
    't_ui_iconclothslaverheavyhelmetr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'db040229-9524-45a3-a0ef-d1c62b14cad1',
    'item_667',
    'Slaver Heavy Jerkin',
    'A heavy combat armor made of reinforced steel providing maximum protection to Great House troops.',
    't_ui_iconclothslaverheavybodyr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0dc1228d-538c-4c7f-9f5d-58b82bc7c41b',
    'item_668',
    'Mercenary Heavy Pants',
    'Heavy combat leg armor made of reinforced duraluminum providing maximum protection to Great House troops.',
    't_ui_iconclothmercheavybottomr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2dafda25-de08-4d82-954d-8b67ba7473c9',
    'item_669',
    'Mercenary Heavy Gloves',
    'Heavy combat hand armor made of reinforced duraluminum providing maximum protection to Great House troops.',
    't_ui_iconclothmercheavyglovesr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd2658ba0-faa2-42e6-871f-18c86cad25bf',
    'item_670',
    'Mercenary Heavy Helmet',
    'A heavy combat helmet made of reinforced duraluminum providing maximum protection to Great House troops.',
    't_ui_iconclothmercheavyhelmetr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '10b08598-8a43-422d-8f83-3ce5e344d67b',
    'item_671',
    'Mercenary Heavy Boots',
    'Heavy combat boots made of reinforced duraluminum providing maximum protection to Great House troops.',
    't_ui_iconclothmercheavybootsr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '63352077-0df9-43f6-b1c7-a4602eba8e2a',
    'item_672',
    'Mercenary Heavy Chestplate',
    'A heavy combat armor made of reinforced duraluminum providing maximum protection to Great House troops.',
    't_ui_iconclothmercheavybodyr_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6ce4ed21-d1e4-4422-af91-856135d341e1',
    'item_673',
    'CHOAM Heavy Boots',
    'Heavy combat boots made of reinforced plastanium providing maximum protection to Great House troops.',
    't_ui_iconclothchoamheavybootsmaler_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '766da381-e8c3-403d-96ac-09907bd62669',
    'item_674',
    'CHOAM Heavy Greaves',
    'Heavy combat leg armor made of reinforced plastanium providing maximum protection to Great House troops.',
    't_ui_iconclothchoamheavybottommaler_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1d3376df-584a-43cc-8520-e46dd047e282',
    'item_675',
    'CHOAM Heavy Gauntlets',
    'Heavy combat hand armor made of reinforced plastanium providing maximum protection to Great House troops.',
    't_ui_iconclothchoamheavyglovesmaler_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd9121aee-2a27-40c4-ac2f-336b183cbd08',
    'item_676',
    'CHOAM Heavy Helmet',
    'A heavy combat helmet made of reinforced plastanium providing maximum protection to Great House troops.',
    't_ui_iconclothchoamheavyheadmaler_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bf7dcf2d-dcff-48d6-b4b1-8fd74c9a6c71',
    'item_677',
    'CHOAM Heavy Chestplate',
    'A heavy combat armor made of reinforced plastanium providing maximum protection to Great House troops.',
    't_ui_iconclothchoamheavytorsomaler_d.webp',
    'Garment',
    'Heavy Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c474f9f-96c7-40b2-b536-4b69601eac31',
    'item_50',
    'Holtzman Shield Mk2',
    'An Old Imperial personal shielding device that can be manually toggled on and off to deflect incoming darts and blades at the cost of power from a Power Pack. However, the slow blade penetrates the shield and melee combatants will take advantage of this.

The shield also prevents objects from exiting, thus it will automatically deactivate when firing darts or throwing objects. It will then automatically reactivate according to its refresh time. While active, the shield generates sounds and vibrations that drive sandworms mad. Usage on open sands is not recommended.',
    't_ui_iconwearchoamshield01r_d.webp',
    'Garment',
    'Utility',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '003b7e5d-342b-4dac-bc23-e3bb8ef50d61',
    'item_56',
    'Holtzman Shield Mk3',
    'An Old Imperial personal shielding device that can be manually toggled on and off to deflect incoming darts and blades at the cost of power from a Power Pack. However, the slow blade penetrates the shield and melee combatants will take advantage of this.

The shield also prevents objects from exiting, thus it will automatically deactivate when firing darts or throwing objects. It will then automatically reactivate according to its refresh time. While active, the shield generates sounds and vibrations that drive sandworms mad. Usage on open sands is not recommended.',
    't_ui_iconwearchoamshield01r_d.webp',
    'Garment',
    'Utility',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '87a0a229-c637-4167-9920-9154e3bae259',
    'item_57',
    'Holtzman Shield Mk5',
    'An Old Imperial personal shielding device that can be manually toggled on and off to deflect incoming darts and blades at the cost of power from a Power Pack. However, the slow blade penetrates the shield and melee combatants will take advantage of this.

The shield also prevents objects from exiting, thus it will automatically deactivate when firing darts or throwing objects. It will then automatically reactivate according to its refresh time. While active, the shield generates sounds and vibrations that drive sandworms mad. Usage on open sands is not recommended.',
    't_ui_iconwearchoamshield01r_d.webp',
    'Garment',
    'Utility',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b8f5d97b-af7a-4e01-a8a9-7518733aded9',
    'item_77',
    'Adaptive Holtzman Shield',
    'A Unique personal shielding device that can be manually toggled on and off to deflect incoming darts and blades at the cost of power from a Power Pack. However, the slow blade penetrates the shield and melee combatants will take advantage of this.

The shield also prevents objects from exiting, thus it will automatically deactivate when firing darts or throwing objects. It will then automatically reactivate according to its refresh time. While active, the shield generates sounds and vibrations that drive sandworms mad. Usage on open sands is not recommended.',
    't_ui_iconwearchoamshield01r_d.webp',
    'Garment',
    'Utility',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '65a8df3a-2ed9-4497-b2e7-4d46dca0dc39',
    'item_306',
    'Incendiary Gel',
    'Few weapons inspire the type of fear created by fire. Use this ammunition in conjunction with incendiary weapons to instill maximum terror in your adversaries.',
    't_ui_iconresourceincendiarygelr_d.webp',
    'Utility',
    'Ammo',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a894f148-b66a-428b-98bf-0a6e9425a56f',
    'item_23',
    'Steel Ingot',
    'A Steel ingot refined from Carbon Ore and Iron Ingot at any Ore Refinery. Used to create products that require Steel.',
    't_ui_iconresourcesteelbarr_d.webp',
    'Resource',
    'Ingot',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3a83b880-2165-4fd3-a32a-630860ba7a47',
    'item_29',
    'Aluminum Ingot',
    'An Aluminum ingot, refined from Aluminum Ore at a Medium Ore Refinery. Used to create products that require Aluminum. Can also be further processed into Duraluminum with Jasmium Crystals.',
    't_ui_iconresourcealuminiumbarr_d.webp',
    'Resource',
    'Ingot',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8cdf253a-1583-4453-bb8a-37a109223ab5',
    'item_32',
    'Duraluminum Ingot',
    'A Duraluminum ingot, refined from Aluminum Ingots and Jasmium Crystals at a Medium Ore Refinery. Used to create products that require Duraluminum.',
    't_ui_iconresourceduraluminumrodr_d.webp',
    'Resource',
    'Ingot',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9decc0b3-c56b-47c3-92b4-7fee0f62fa78',
    'item_36',
    'Iron Ingot',
    'An Iron ingot, refined from Iron Ore at any Ore Refinery. Used to create products that require Iron. Can also be further processed into Steel with Carbon Ore.',
    't_ui_iconresourceironbarr_d.webp',
    'Resource',
    'Ingot',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e762c1fd-4a06-4699-abd3-e3091405f531',
    'item_47',
    'Copper Ingot',
    'A Copper ingot, refined from Copper Ore at any Ore Refinery. Used to create products that require Copper.',
    't_ui_iconresourcecopperbarr_d.webp',
    'Resource',
    'Ingot',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a85dc373-92ae-4e15-8985-1b6c7228a22c',
    'item_53',
    'Plastanium Ingot',
    'Pure titanium is extracted from its ore, heated until liquid, and then carefully threaded with stravidium fibers to enhance its strength.',
    't_ui_iconresourceplastaniumingotr_d.webp',
    'Resource',
    'Ingot',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '64278cb2-f466-4d26-843d-70f52de8460e',
    'item_627',
    'Iodine Pill',
    'Shortens the time required for radiation breakdown within the body and further shields the body from exposure to radiological exposure when used with a radiation suit.',
    't_ui_iconconsumradiationpillr_d.webp',
    'Utility',
    'Consumable',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '898ca31f-8ca4-420c-9364-de5755907de8',
    'item_156',
    'Ixian Decoder',
    'Ixian minimic film decoder tool found at the Captain''s Chair, at the Wreck of The Hephaestus',
    't_ui_iconjourneyixiandecoderr_d.webp',
    'Contract Quest',
    'Journey Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'eef81cb4-d216-4b1b-a19c-91274ad342be',
    'item_157',
    'Bloody eyeball',
    'Bloody eyeball taken from Ixian crewman, it could be used to gain access to pentashields locked behind retina scans',
    't_ui_iconjourneybloodyeyeballr_d.webp',
    'Contract Quest',
    'Journey Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '33c0d7b0-8f11-47cd-b449-6413504443fd',
    'item_158',
    'Minimic Film',
    'Encoded minimic film found in the Safe inside the Sietch. It will require some sort of decoder to gain access to its information.',
    't_ui_iconjourneyminimicfilmr_d.webp',
    'Contract Quest',
    'Journey Item',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7b1c7bb9-5999-4f71-a7a8-a439945d35cd',
    'item_342',
    'Regis Kindjal',
    'A common personal weapon popular among the family members of this Great House, the Atreides Kindjal is styled after the particular variety that Duke Leto Atreides himself carries.',
    't_ui_iconwpnmeleeatredagger01r_d.webp',
    'Weapon',
    'Melee',
    'Kindjal',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8a991307-0a83-4138-90c1-f47a9e0cd9b4',
    'item_343',
    'Adept Kindjal',
    'A common personal weapon popular among the family members of this Great House, the Atreides Kindjal is styled after the particular variety that Duke Leto Atreides himself carries.',
    't_ui_iconwpnmeleeatredagger01r_d.webp',
    'Weapon',
    'Melee',
    'Kindjal',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f227bd47-9254-4c70-b13e-603c1f0108c0',
    'item_344',
    'House Kindjal',
    'A common personal weapon popular among the family members of this Great House, the Atreides Kindjal is styled after the particular variety that Duke Leto Atreides himself carries.',
    't_ui_iconwpnmeleeatredagger01r_d.webp',
    'Weapon',
    'Melee',
    'Kindjal',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f0ac3155-cad3-468c-ae99-671332d69814',
    'item_345',
    'Artisan Kindjal',
    'A common personal weapon popular among the family members of this Great House, the Atreides Kindjal is styled after the particular variety that Duke Leto Atreides himself carries.',
    't_ui_iconwpnmeleeatredagger01r_d.webp',
    'Weapon',
    'Melee',
    'Kindjal',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 200/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2307ad1c-91c1-4654-9000-e7373cb59284',
    'item_346',
    'Standard Kindjal',
    'A common personal weapon popular among the family members of this Great House, the Atreides Kindjal is styled after the particular variety that Duke Leto Atreides himself carries.',
    't_ui_iconwpnmeleeatredagger01r_d.webp',
    'Weapon',
    'Melee',
    'Kindjal',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4550b591-3c7b-4ac7-9fd2-d594d99198b5',
    'item_347',
    'Kindjal',
    'A common personal weapon popular among the family members of this Great House, the Atreides Kindjal is styled after the particular variety that Duke Leto Atreides himself carries.',
    't_ui_iconwpnmeleeatredagger01r_d.webp',
    'Weapon',
    'Melee',
    'Kindjal',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd7bee81e-4ccc-41b9-b39b-eceaeed23a4c',
    'item_678',
    'Kirab Scout Boots',
    'Lightly armored boots made of iron, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothkirablightshoesr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a167d69b-9cd0-4c3f-a244-ef9bfec1885d',
    'item_679',
    'Kirab Scout Pants',
    'Lightly armored leggings made of iron, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothkirablightbottomr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99b234a4-92ad-4e00-b679-e71ae7bcf64c',
    'item_680',
    'Kirab Scout Gloves',
    'Lightly armored gloves made of iron, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothkirablightglovesr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3b60c22c-7a95-4ccd-a675-e94de593d798',
    'item_681',
    'Kirab Scout Helmet',
    'A lightly armored helmet made of iron, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothkirablighthelmetr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c63b0c6d-7ebd-47ea-85da-f15e8078f239',
    'item_682',
    'Kirab Scout Jacket',
    'A lightly armored top made of iron, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothkirablightbodyr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8d28eb50-79dc-4ab9-812f-bd8a3e946d97',
    'item_683',
    'Slaver Scout Boots',
    'Lightly armored boots made of steel, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothslaverrusherbootsr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b5a41887-b32f-4074-b00a-f060a439960d',
    'item_684',
    'Slaver Scout Pants',
    'Lightly armored leggings made of steel, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothslaverrusherbottomr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7f07b50e-29fd-4255-b1bd-214ba49acaff',
    'item_685',
    'Slaver Scout Gloves',
    'Lightly armored gloves made of steel, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothslaverrusherglovesr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '69b4c271-e18e-410d-9ae9-a6353b3459d3',
    'item_686',
    'Slaver Scout Mask',
    'A lightly armored helmet made of steel, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothslaverrusherhelmetr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e89657b3-b310-4920-8f38-bc98b81b1ef6',
    'item_687',
    'Slaver Scout Jacket',
    'A lightly armored top made of steel, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothslaverrusherbodyr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0e322b2c-7afd-4156-8b6a-145bf933cd4a',
    'item_688',
    'Mercenary Scout Boots',
    'Lightly armored boots made of duraluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothmerclightbootsr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '482bdc8d-9608-47ba-bfff-cd5c16463ef3',
    'item_690',
    'Mercenary Scout Leggings',
    'Lightly armored leggings made of duraluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothmerclightbottomr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7d3d30ba-eb30-4cae-bd4a-6995b0deba00',
    'item_691',
    'Mercenary Scout Gloves',
    'Lightly armored gloves made of duraluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothmerclightglovesr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '92cf208d-84af-41eb-8103-d22798c39e63',
    'item_692',
    'Mercenary Scout Helmet',
    'A lightly armored helmet made of duraluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothmerclighthelmetr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ced862b0-fccd-401f-8106-ac67a2d23383',
    'item_693',
    'Mercenary Scout Top',
    'A lightly armored top made of duraluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothmerclightbodyr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3d692550-f536-4fbd-bbfd-d01ba3c3d9bf',
    'item_694',
    'CHOAM Scout Boots',
    'Lightly armored boots made of plastanium, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothchoamscoutarmourshoesmaler_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f3f9efc6-47d2-4997-8414-8d4648c6bc17',
    'item_696',
    'CHOAM Scout Pants',
    'Lightly armored leggings made of plastanium, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothchoamscoutarmourbottommaler_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '933bae82-b8ed-4acd-a447-ffb56a5f40d4',
    'item_697',
    'CHOAM Scout Gloves',
    'Lightly armored gloves made of plastanium, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothchoamscoutarmourglovesmaler_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '483a79ec-8cae-4dff-bc09-d30ca8580294',
    'item_698',
    'CHOAM Scout Helmet',
    'A lightly armored helmet made of plastanium, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothchoamscoutarmourhelmetmaler_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd37242b1-2e9a-425c-ab7b-45c07376b84e',
    'item_699',
    'CHOAM Scout Chestplate',
    'A lightly armored top made of plastanium, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothchoamscoutarmourtopmaler_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f3232a30-02b4-4d69-b579-7cd7253f225f',
    'item_700',
    'Duneman Scout Boots',
    'Lightly armored boots made of aluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothsandfliesrusherbootsr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '930542d2-ff89-462d-90e8-258861f59d4b',
    'item_701',
    'Duneman Scout Pants',
    'Lightly armored leggings made of aluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothsandfliesrusherbottomr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ecc7c94d-cbba-42b9-9393-071bd6c22035',
    'item_702',
    'Duneman Scout Gloves',
    'Lightly armored gloves made of aluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothsandfliesrusherglovesr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '82b0fbe0-ffee-41fe-829f-282c5a6de53a',
    'item_703',
    'Duneman Scout Helmet',
    'A lightly armored helmet made of aluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothsandfliesrusherheadr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5da894d7-5292-4a09-a5a5-df1e4ac4ec4c',
    'item_704',
    'Duneman Scout Jacket',
    'A lightly armored top made of aluminum, providing versatility in hydration and protection to Great House scouts.',
    't_ui_iconclothsandfliesrusherbodyr_d.webp',
    'Garment',
    'Light Armor',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '962a32ea-4ecf-4462-af20-53153d6d56fd',
    'item_3',
    'Atreides Basic Lights Set',
    'Atreides Basic Lights
-Wall Light
-Standing Light x2
-Floor Light',
    't_ui_iconplacpropatrestandinglight02_d.webp',
    'Furniture',
    'Lights',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'eb9d2759-eb9c-4170-93b5-df9d7269d234',
    'item_7',
    'Harkonnen Basic Lights Set',
    'Harkonnen Basic Lights
-Wall Light
-Standing Light
-Floor Light',
    't_ui_iconplacharklightstanding_d.webp',
    'Furniture',
    'Lights',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bc1e83ce-5eca-4a7b-a890-a682b8bb4c2d',
    'item_11',
    'CHOAM Advanced Lights Set',
    'CHOAM Ceiling Lights
- Ceiling Lights x2',
    't_ui_iconplacchoamsuspensorlight_d.webp',
    'Furniture',
    'Lights',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '37546727-dad1-4793-bf47-6da1ea29fe54',
    'item_618',
    'Literjon',
    'Use to drink its contents sip by sip. A Fremen item that can store water collected with a Dew Reaper or that has been transferred from other sources.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3e77cf60-47a4-4860-bb4f-d3faffe5f751',
    'item_626',
    'Hajra Literjon Mk1',
    'A Unique water container created by the Fremen for those going on a journey of seeking. Often carried by wali on their Trial of Aql, the contents were donated from the entire sietch as a sacrifice for good luck. Stores more water than ordinary literjons.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'eedb2cd4-357b-485b-aa3c-570fcbcd8382',
    'item_632',
    'Decaliterjon',
    'Use to drink its contents sip by sip. A Fremen item that can store water collected with a Dew Reaper or that has been transferred from other sources.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'af0c1e22-75c4-4fd9-aea7-f10fea4ea567',
    'item_639',
    'Literjon Mk6',
    'Use to drink its contents sip by sip. A Fremen item that can store water collected with a Dew Reaper or that has been transferred from other sources.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6d0873c2-03ae-45a1-ba39-1368950a3ee4',
    'item_643',
    'Hajra Literjon Mk2',
    'A Unique water container created by the fremen for those going on a journey of seeking. Often carried by wali on their trial of aql, the contents were donated from the entire sietch as a sacrifice for good luck. Stores more water than ordinary literjons.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b7fa4f7b-4ed3-4719-8bda-730843584336',
    'item_644',
    'Hajra Literjon Mk3',
    'A Unique water container created by the Fremen for those going on a journey of seeking. Often carried by wali on their Trial of Aql, the contents were donated from the entire sietch as a sacrifice for good luck. Stores more water than ordinary literjons.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6dd37566-09a3-4f32-875d-b879f2414fef',
    'item_645',
    'Hajra Literjon Mk4',
    'A Unique water container created by the Fremen for those going on a journey of seeking. Often carried by wali on their Trial of Aql, the contents were donated from the entire sietch as a sacrifice for good luck. Stores more water than ordinary literjons.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '51c49435-4591-432c-abda-8f57f8390eae',
    'item_646',
    'Hajra Literjon Mk5',
    'A Unique water container created by the Fremen for those going on a journey of seeking. Often carried by wali on their Trial of Aql, the contents were donated from the entire sietch as a sacrifice for good luck. Stores more water than ordinary literjons.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '046ed1a4-24c4-46cc-a8ec-cf6b115856fa',
    'item_647',
    'Hajra Literjon Mk6',
    'A Unique water container created by the Fremen for those going on a journey of seeking. Often carried by wali on their Trial of Aql, the contents were donated from the entire sietch as a sacrifice for good luck. Stores more water than ordinary literjons.',
    't_ui_iconconsumliterjonr_d.webp',
    'Utility',
    'Hydration Tools',
    'Literjon',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a8701ec9-4a5b-4670-a356-0f301d18b427',
    'item_925',
    'Low-grade Lubricant',
    'A low-grade lubricant required for omnidirectional wind turbines to function. Can be refined in a chemical refinery.',
    't_ui_iconresourcelowgradelubricantr_d.webp',
    'Component',
    'Fuel',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd409ce8a-eb23-4cac-89cd-33079e3d54ab',
    'item_4',
    'Atreides Office Furniture Set',
    'Atreides Office Furniture
-Desk
-Bookshelf
-Wall Partition
-Wall Art
-Chair
-Carpet
-Couch
-Trophy
-Urn
-Books x 3',
    't_ui_iconplacpropatreofficetable_d.webp',
    'Furniture',
    'Office',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'baec6117-3e8d-4f0f-ab83-026d76a39bb3',
    'item_8',
    'Harkonnen Office Furniture Set',
    'Harkonnen Office Furniture
-Desk
-Bookshelf
-Wall Partition
-Wall Art
-Chair
-Carpet
-Bench Left
-Trophy
-Urn
-Books x 3',
    't_ui_iconplacharkofficetable_d.webp',
    'Furniture',
    'Office',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fe6a550e-e41e-47d4-8ff4-0c0cfa36ff7f',
    'item_12',
    'CHOAM Office Furniture Set',
    'CHOAM Office Furniture Placeables
-Desk
-Bookshelf
-Wall Partition
-Wall Art
-Chair
-Carpet
-Couch',
    't_ui_iconplacchoamofficetable_d.webp',
    'Furniture',
    'Office',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '22de2054-c95b-4644-bbab-b4f96b4a6770',
    'item_55',
    'Irradiated Core',
    'A power crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceirradiatedcorer_d.webp',
    'Resource',
    'Raw Resource',
    'Ore',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '74e14fb7-79a9-434d-8db8-4c6f10e35a69',
    'item_906',
    'Aluminum Ore',
    'Aluminum ore, mined from an Aluminum deposit. Can be refined into Aluminum Ingots at a Medium Ore Refinery to create new products that require it.',
    't_ui_iconresourcebauxiteorer_d.webp',
    'Resource',
    'Raw Resource',
    'Ore',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c137819f-e124-457e-bfd9-49cbf3522091',
    'item_907',
    'Copper Ore',
    'Copper ore, mined from a Copper deposit. Can be refined into Copper Ingots at any Ore Refinery to create new products that require it.',
    't_ui_iconresourceazuriteorer_d.webp',
    'Resource',
    'Raw Resource',
    'Ore',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '140fec75-b09c-4547-8cce-c8350f8ad4f1',
    'item_908',
    'Carbon Ore',
    'Carbon ore, mined from a Carbon deposit. Can be processed with Iron Ingots together to create refined Steel Ingots at any Ore Refinery to create new products that require it.',
    't_ui_iconresourcedolomiterockr_d.webp',
    'Resource',
    'Raw Resource',
    'Ore',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dd684db9-6328-4a87-a60f-b4052e16dd93',
    'item_911',
    'Iron Ore',
    'Iron ore, mined from an Iron deposit. Can be refined into Iron Ingots at any Ore Refinery to create new products that require it.',
    't_ui_iconresourcemagnetiteorer_d.webp',
    'Resource',
    'Raw Resource',
    'Ore',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ea042008-2cb8-4565-8525-be34f3177208',
    'item_921',
    'Titanium Ore',
    'Titanium ore is found in the deep desert, and most commonly utilized in the production of plastanium, an alloy of titanium and stravidium.',
    't_ui_iconresourcetitaniumorer_d.webp',
    'Resource',
    'Raw Resource',
    'Ore',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dcdbacbe-aef6-4579-bb16-32923bf9acb6',
    'item_51',
    'Personal Light',
    'A Personal Light for exploration. This model has a toggle feature which allows it to be manually switched on and off.',
    't_ui_icongadgetportablelight01r_d.webp',
    'Utility',
    'Deployables',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '107ca751-9ed5-4509-bb20-c162393754d8',
    'item_351',
    'Regis Disruptor Pistol',
    'This Unique heavy pistol borrows technology from the fast-firing disruptor submachine gun, while adding a charging mechanism to fire shield-destabilizing darts.',
    't_ui_iconwpnheavypistol_unique_bleed_06r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd7588ce4-9127-4574-a8a1-c8faf5b4abe3',
    'item_352',
    'Adept Disruptor Pistol',
    'This Unique heavy pistol borrows technology from the fast-firing disruptor submachine gun, while adding a charging mechanism to fire shield-destabilizing darts.',
    't_ui_iconwpnheavypistol_unique_bleed_05r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1fac3f8f-f6ce-4c22-a3b1-4d7632f55042',
    'item_353',
    'House Disruptor Pistol',
    'This Unique heavy pistol borrows technology from the fast-firing disruptor submachine gun, while adding a charging mechanism to fire shield-destabilizing darts.',
    't_ui_iconwpnheavypistol_unique_bleed_04r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c5fa993-8de4-435c-98bb-a848efd54909',
    'item_354',
    'Artisan Disruptor Pistol',
    'This Unique heavy pistol borrows technology from the fast-firing disruptor submachine gun, while adding a charging mechanism to fire shield-destabilizing darts.',
    't_ui_iconwpnheavypistol_unique_bleed_03r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'de9fa731-f03d-410a-ad45-cfaef997f955',
    'item_393',
    'Regis Maula Pistol',
    'Lightweight but with a short range, the Maula Pistol is a reliable sidearm.',
    't_ui_iconwpn2hchoammaula01_t6r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4f6e2a75-3ae1-439d-b02d-0ab8ba89cc36',
    'item_394',
    'Adept Maula Pistol',
    'Lightweight but with a short range, the Maula Pistol is a reliable sidearm.',
    't_ui_iconwpn2hchoammaula01_t5r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd9aa538d-5429-44f1-9d50-21382068742b',
    'item_395',
    'House Maula Pistol',
    'Lightweight but with a short range, the Maula Pistol is a reliable sidearm.',
    't_ui_iconwpn2hchoammaula01_t4r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f8f0893b-4f47-4106-9ad3-7ad981cd29eb',
    'item_396',
    'Artisan Maula Pistol',
    'Lightweight but with a short range, the Maula Pistol is a reliable sidearm.',
    't_ui_iconwpn2hchoammaula01_t3r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fa3615fa-0a62-4597-bc50-a861e958ee12',
    'item_397',
    'Standard Maula Pistol',
    'Redesigned from the ground up, the MK ll is a must-have for successful underworld kingpins. Or so they are reputed to be. They''ve not been convicted of anything.',
    't_ui_iconwpn2hchoammaula01_t2r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd1945258-c278-48d3-9417-614cd84cce3d',
    'item_398',
    'Maula Pistol',
    'An improvement on its predecessor, the Maula Pistol MK l did not sell well at first owing to its high price relative to its improvements. The price was subsequently dropped and sales picked up.',
    't_ui_iconwpn2hchoammaula01_t1r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ed6ffa17-bef2-43d0-a52e-e1e6135e017c',
    'item_399',
    'Improvised Maula Pistol',
    'Lightweight but with a short range, the Maula Pistol is a reliable sidearm.',
    't_ui_iconwpn2hchoammaula01_t0r_d.webp',
    'Weapon',
    'Ranged',
    'Pistol',
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1dd880f0-a64c-4960-9d15-864f1901933a',
    'item_934',
    'Plasteel Plate',
    'A crafting component for crafting plasteel crafting components. Can be found in the Deep Desert, or obtained from Landsraad rewards.',
    't_ui_iconresourceplasteelplater_d.webp',
    'Resource',
    'Component',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2d895e83-682e-4163-a0aa-a08238a7a66f',
    'item_18',
    'Shaddam IV Portraits',
    'A set of Paintings of His Imperial Excellency the Padisah Emperor Shaddam Corino IV',
    't_ui_iconplacpropneutportraitemperoratrebig_d.webp',
    'Furniture',
    'Portraits',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c34b7fcb-92a0-4c39-92d5-fee08e1f4ecb',
    'item_39',
    'Improvised Power Pack',
    'Essential item that allows the user to operate equipment that requires power. When all power is depleted, stop the current activity to allow the battery to recharge.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c7e137ab-c097-4c5d-b16b-df586af8be40',
    'item_44',
    'Power Pack Mk2',
    'An improved power pack. This more advanced version has a larger power capacity and regenerates power faster.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '148827cf-0889-4ef4-8a65-3819e891c1f5',
    'item_45',
    'Power Pack Mk4',
    'A power pack with a very large capacity, made for the use of industrial tools and equipment.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8999ffee-ab40-498b-8d20-78ee79f87131',
    'item_52',
    'Power Pack Mk6',
    'The first generation of power packs were quite unstable and had a unfortunate habit of blowing its user to smithereens. The design has since been improved to ensure this happens quite rarely now.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '765d9cd0-e858-4d41-92d5-d5c8afecaded',
    'item_74',
    'Power Pack Mk1',
    'Essential item that allows the user to operate equipment that requires power. When all power is depleted, stop the current activity to allow the battery to recharge.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ab867987-cbbb-4a2f-93c5-b1ed781ed5e9',
    'item_75',
    'Power Pack Mk3',
    'Essential item that allows the user to operate equipment that requires power. When all power is depleted, stop the current activity to allow the battery to recharge.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9a47f847-0621-4e50-a748-7a009793e79b',
    'item_76',
    'Power Pack Mk5',
    'Essential item that allows the user to operate equipment that requires power. When all power is depleted, stop the current activity to allow the battery to recharge.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Garment',
    'Utility',
    'Power Pack',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ef6eb61b-b7f3-42e8-92d7-f720d41bfecb',
    'item_811',
    'Radiation Suit Mk4',
    'The radiation suit is a Great House protection garment that can shield the body from exposure to radiological exposure and allow the wearer to fight or otherwise function in a contaminated area.',
    't_ui_iconclothsmugradiationsuitfullbodymaler_d.webp',
    'Garment',
    'Radiation Suit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f29f79d1-1f2e-461f-89f2-10f4091eb569',
    'item_812',
    'Radiation Suit Mk5',
    'The radiation suit is a Great House protection garment that can shield the body from exposure to radiological exposure and allow the wearer to fight or otherwise function in a contaminated area.',
    't_ui_iconclothsmugradiationsuitfullbodymaler_d.webp',
    'Garment',
    'Radiation Suit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c2a8e7b6-2f40-47c8-8723-c1a422044d55',
    'item_813',
    'Radiation Suit Mk6',
    'The radiation suit is a Great House protection garment that can shield the body from exposure to radiological exposure and allow the wearer to fight or otherwise function in a contaminated area.',
    't_ui_iconclothsmugradiationsuitfullbodymaler_d.webp',
    'Garment',
    'Radiation Suit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '32078de7-2316-4260-9ffd-4dbb842dcaf1',
    'item_303',
    'Regis Rapier',
    'The Great House Atreides Rapier is a longer sword used for self-defense. Can penetrate shields. It is a long blade, with longer reach and more raw damage.',
    't_ui_iconwpnmeleeatrerapier01r_d.webp',
    'Weapon',
    'Melee',
    'Rapier',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2bc87055-496c-4da4-8531-a4b6dfe92db1',
    'item_304',
    'Adept Rapier',
    'The Great House Atreides Rapier is a longer sword used for self-defense. Can penetrate shields. It is a long blade, with longer reach and more raw damage.',
    't_ui_iconwpnmeleeatrerapier01r_d.webp',
    'Weapon',
    'Melee',
    'Rapier',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '52464a8a-099c-4ff2-bcfa-e3039af6dcc3',
    'item_305',
    'House Rapier',
    'The Great House Atreides Rapier is a longer sword used for self-defense. Can penetrate shields. It is a long blade, with longer reach and more raw damage.',
    't_ui_iconwpnmeleeatrerapier01r_d.webp',
    'Weapon',
    'Melee',
    'Rapier',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '08efc979-91db-4dfe-8978-1a827ed3218a',
    'item_19',
    'Solido Replicator',
    'Point this tool at an existing base to store a blueprint copy. Use again to place a projection of the saved base in a different location. You can then use a Construction Tool to rebuild the base.',
    't_ui_icontoolbaseblueprintr_d.webp',
    'Utility',
    'Utility Tools',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8057c1ac-e7a3-40ff-acb5-a2090ba51bfa',
    'item_325',
    'Assassin''s Rifle',
    'Many in the Imperium have heard of chaumurky, poison administered through the drink, and chaumas, poison delivered through the food. This Unique rifle toys with a third concept — poison delivered in a small explosive dart that explodes on contact with a shield, allowing it to waft through.',
    't_ui_iconwpnlongrifle_unique_poison_03r_d.webp',
    'Weapon',
    'Ranged',
    'Rifle',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '330ef3b3-56e3-402a-891b-265710591974',
    'item_326',
    'Regis Tripleshot Repeating Rifle',
    'This Unique non-scoped Spitdart Rifle was developed with increased magazine capacity and fires poison-coated darts in a horizontal tripleshot pattern.',
    't_ui_iconwpnlongrifle_unique_largemag_06r2_d.webp',
    'Weapon',
    'Ranged',
    'Rifle',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b9a5bde5-3568-434f-94ca-6e61ec5bd62d',
    'item_327',
    'Fivefinger''s Tripleshot Rifle',
    'For many years, the nobles of House Wydras lived in constant fear of an assassin''s dart fired by the infamous Fivefingers. In his youth, he lost his right hand and eye during a duel with a Wydras nobleman. He disappeared from public eye for a long time — then returned with this Unique tripleshot rifle to wreak vengeance on those who had left him maimed.',
    't_ui_iconwpnlongrifle_unique_largemag_05r_d.webp',
    'Weapon',
    'Ranged',
    'Rifle',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4035abea-2b78-480d-b076-a682866981b1',
    'item_297',
    'Rocket',
    'A rocket projectile with an explosive warhead and a propellant for extra thrust. Typically utilized by vehicular rocket launchers.',
    't_ui_iconresourcevehiclerocketammor_d.webp',
    'Utility',
    'Ammo',
    'Rocket Ammo',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '313a48fe-52d3-495e-805d-6574d37838e4',
    'item_295',
    'Regis Missile Launcher',
    'A launcher that shoots missiles.',
    't_ui_iconwpn2hfremrocketlauncher01r_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cdf0ccd2-789c-4bee-b79e-25b2f618b437',
    'item_480',
    'Buggy Rocket Launcher Mk5',
    'Arms a Buggy with a rocket launcher. Use a welding torch to attach the rocket launcher to a Buggy Rear Hull with an available utility slot.',
    't_ui_iconvehccbrocketlauncherr_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8ad5488f-5151-4621-b9e7-a8d45bf6dca4',
    'item_481',
    'Buggy Rocket Launcher Mk6',
    'Arms a Buggy with a rocket launcher. Use a welding torch to attach the rocket launcher to a Buggy Rear Hull with an available utility slot.',
    't_ui_iconvehccbrocketlauncherr_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '19912d3b-37ee-4301-96c3-35bc7a10fed2',
    'item_516',
    'Scout Ornithopter Rocket Launcher Mk5',
    'Adds a rocket launcher to a Scout Ornithopter. Use a Welding Torch to attach the rocket launcher to the Main Hull.',
    't_ui_iconvehcolrocketlauncherr_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5d96c351-4fc4-4603-b985-63b8b0cc5c16',
    'item_517',
    'Scout Ornithopter Rocket Launcher Mk6',
    'Adds a rocket launcher to a Scout Ornithopter. Use a Welding Torch to attach the rocket launcher to the Main Hull.',
    't_ui_iconvehcolrocketlauncherr_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '12018a0a-ac7f-46e9-a875-e154cda91ab1',
    'item_542',
    'Assault Ornithopter Rocket Launcher Mk5',
    'Adds a rocket launcher to an Assault Ornithopter. Use a Welding Torch to attach the rocket launcher to the Assault Ornithopter Cabin.',
    't_ui_iconvehcomrocketlauncherr_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0258e8ea-d918-47cb-ad0a-f56e73babbd5',
    'item_543',
    'Assault Ornithopter Rocket Launcher Mk6',
    'Adds a rocket launcher to an Assault Ornithopter. Use a Welding Torch to attach the rocket launcher to the Assault Ornithopter Cabin.',
    't_ui_iconvehcomrocketlauncherr_d.webp',
    'Weapon',
    'Ranged',
    'Rocket Launcher',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cb24d4bb-157f-46be-85b9-1e43353349ce',
    'item_290',
    'Handheld Life Scanner Mk3',
    'A Unique scanner that specializes in only detecting the living.',
    't_ui_icontoolscanner_unique_body_03r_d.webp',
    'Utility',
    'Cartography Tools',
    'Scanner',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ee33bbef-78de-4295-8ed1-5c16bd144929',
    'item_291',
    'Long Range Scanner',
    'An Unique improved power-driven handheld exploration scanner that allows the user to project a scan in front of them to mark information on their map.',
    't_ui_icontool1hsmughandheldscannerr_d.webp',
    'Utility',
    'Cartography Tools',
    'Scanner',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b527422b-3461-4996-a1c5-d8ab05607e66',
    'item_292',
    'Handheld Resource Scanner',
    'A power-driven handheld exploration scanner that allows the user to project a scan in front of them to mark information on their map. Can be fabricated with Fremen components.',
    't_ui_icontool1hsmughandheldscannerr_d.webp',
    'Utility',
    'Cartography Tools',
    'Scanner',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '86b39756-7eab-4b05-82c2-9170401c296d',
    'item_606',
    'Sandbike Scanner Mk2',
    'Scan the environment without getting off your sandbike with this Old Imperial module. Attach to a sandbike with available utility slots using a Welding Torch.',
    't_ui_iconvehchoamloscannerr_d.webp',
    'Utility',
    'Cartography Tools',
    'Scanner',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '46049966-55ef-4ab4-a620-ac040e39d830',
    'item_15',
    'CHOAM Office Small Decorations Set',
    'CHOAM Office Small Decorative Items
-Trophy
-Urn
-Books x 3',
    't_ui_iconplacchoamtrophy_d.webp',
    'Furniture',
    'Small Decorations',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8ebf2186-494b-47e1-bbc0-7c59cddf8c12',
    'item_16',
    'CHOAM Bedroom Small Decorations Set',
    'CHOAM Bedroom Small Decorative Items
-Vases x 4',
    't_ui_iconplacchoamvase01a_d.webp',
    'Furniture',
    'Small Decorations',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f4b19143-52e6-4295-8b53-a49f96672deb',
    'item_17',
    'CHOAM Dining Room Small Decorations Set',
    'CHOAM Dining Room Small Decorative Items
- Bowl
- Carafe
- Spice Jar
- Serving Plate
- Plate
- Cup x 2',
    't_ui_iconplacchoambowl_d.webp',
    'Furniture',
    'Small Decorations',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e9f8540a-10bd-414d-ad52-47ca21a101d8',
    'item_210',
    'Piter''s Disruptor',
    'This Unique disruptor has been modified to spray doubleshots of heavy darts at a slower rate. The twisted mentat advisor to Baron Harkonnen, Piter de Vries, created this modified disruptor to be used to suppress riots on Giedi Prime. In his words, ''peace through suppression''.',
    't_ui_iconwpnuniquesmg2r_d.webp',
    'Weapon',
    'Ranged',
    'SMG Disruptor',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a932a19a-f313-4e39-83a5-f93f42193676',
    'item_416',
    'Regis Disruptor M11',
    'As the Holtzman Effect is impervious to fast moving ballistics, Disruptors instead fire darts of variable velocities in order to find penetration points on the shield. Once inside a Holtzman Shield they trigger a static pulse that impacts the power flow to the shield. If enough disruptor darts penetrate, a shield can be taken offline. A Great House item.',
    't_ui_iconwpn2hatresmg01_t6r_d.webp',
    'Weapon',
    'Ranged',
    'SMG Disruptor',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6e51f725-e193-4d74-b740-2d51247bb41f',
    'item_417',
    'Adept Disruptor M11',
    'As the Holtzman Effect is impervious to fast moving ballistics, Disruptors instead fire darts of variable velocities in order to find penetration points on the shield. Once inside a Holtzman Shield they trigger a static pulse that impacts the power flow to the shield. If enough disruptor darts penetrate, a shield can be taken offline. A Great House item.',
    't_ui_iconwpn2hatresmg01_t5r_d.webp',
    'Weapon',
    'Ranged',
    'SMG Disruptor',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '078ebe37-fed7-4afb-8f9a-9f2f7d25bbf2',
    'item_418',
    'House Disruptor M11',
    'As the Holtzman Effect is impervious to fast moving ballistics, Disruptors instead fire darts of variable velocities in order to find penetration points on the shield. Once inside a Holtzman Shield they trigger a static pulse that impacts the power flow to the shield. If enough disruptor darts penetrate, a shield can be taken offline. A Great House item.',
    't_ui_iconwpn2hatresmg01_t4r_d.webp',
    'Weapon',
    'Ranged',
    'SMG Disruptor',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f85c2df0-ea7a-409c-9aa1-5628286ec537',
    'item_419',
    'Artisan Disruptor M11',
    'As the Holtzman Effect is impervious to fast moving ballistics, Disruptors instead fire darts of variable velocities in order to find penetration points on the shield. Once inside a Holtzman Shield they trigger a static pulse that impacts the power flow to the shield. If enough disruptor darts penetrate, a shield can be taken offline. A Great House item.',
    't_ui_iconwpn2hatresmg01_t3r_d.webp',
    'Weapon',
    'Ranged',
    'SMG Disruptor',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 300/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c6cee535-e1af-4935-b13e-843b8ed5707a',
    'item_420',
    'Standard Disruptor M11',
    'As the Holtzman Effect is impervious to fast moving ballistics, Disruptors instead fire darts of variable velocities in order to find penetration points on the shield. Once inside a Holtzman Shield they trigger a static pulse that impacts the power flow to the shield. If enough disruptor darts penetrate, a shield can be taken offline. A Great House item.',
    't_ui_iconwpn2hatresmg01_t2r_d.webp',
    'Weapon',
    'Ranged',
    'SMG Disruptor',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2098a1ab-18c0-4247-8d08-a25a3dd0038d',
    'item_814',
    'Caladan Casual Trousers',
    'Garments popular among Houses Minor on Caladan.',
    't_ui_iconclothneutcaladancasualbottommaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '10b36a4b-6c3c-491c-9882-0e4130b55470',
    'item_815',
    'Caladan Casual Boots',
    'Garments popular among Houses Minor on Caladan.',
    't_ui_iconclothneutcaladancasualshoesmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0309b355-61d7-4781-9dc0-ae43863a190f',
    'item_816',
    'Caladan Casual Tunic',
    'Garments popular among Houses Minor on Caladan.',
    't_ui_iconclothneutcaladancasualtopmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd17cb04e-a961-444f-9004-691e6467a5e4',
    'item_822',
    'Giedi Casual Shoes',
    'Shoes in classic Giedi Prime style.',
    't_ui_iconclothharksocialoutfit03shoesmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a3b58b79-e85a-4e84-b00f-6dcc245be3e6',
    'item_823',
    'Giedi Casual Pants',
    'Pants in classic Giedi Prime style.',
    't_ui_iconclothharksocialoutfit03bottommaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '55494788-eb79-4d2d-83ff-9a026d5cbd5e',
    'item_824',
    'Giedi Casual Shirt',
    'A tunic in classic Giedi Prime style.',
    't_ui_iconclothharksocialoutfit03topmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '01c32930-659c-4563-8d64-dca15fab619c',
    'item_825',
    'Entrepreneur Casual Shoes',
    'Shoes favored by smugglers on Arrakis.',
    't_ui_iconclothsmugenterpreneurcasualshoesmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '647d5f1c-64a1-4f9b-a61a-86d5d4c2162d',
    'item_826',
    'Entrepreneur Casual Pants',
    'Pants favored by smugglers on Arrakis.',
    't_ui_iconclothsmugenterpreneurcasualbottommaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2d067958-0e96-4c4d-bf57-217263fd27b2',
    'item_827',
    'Entrepreneur Casual Gloves',
    'Gloves favored by smugglers on Arrakis.',
    't_ui_iconclothsmugenterpreneurcasualhandsmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e0b5d645-f82f-4fe4-890c-307ab66401d7',
    'item_828',
    'Entrepreneur Casual Shirt',
    'Shirt favored by smugglers on Arrakis.',
    't_ui_iconclothsmugenterpreneurcasualtopmaler_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8bc6acaf-03c8-4dc9-b180-106f67df89de',
    'item_900',
    'Imperial Casual Top',
    'Casual clothing in an Imperial style.',
    't_ui_iconclothsocialimperialbodyr_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8aea01d0-b778-4c48-b231-c5b4120796ae',
    'item_901',
    'Imperial Casual Shoes',
    'Casual shoes in an Imperial style.',
    't_ui_iconclothsocialimperialbootsr_d.webp',
    'Garment',
    'Social Outfit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '581dbd7e-f10e-438f-b326-711682f12970',
    'item_620',
    'Melange Spiced Food',
    'The spice melange extends life, expands consciousness and allows the mysterious navigators of the spacing guild to guide heighliners safely between the stars. This food is seasoned with spice melange and will raise the amount of spice in your blood.',
    't_ui_iconconsumspicefood01r_d.webp',
    'Utility',
    'Consumable',
    'Spiced Food Drink',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0e0bacb4-a2e8-479f-8d4e-bd67da8839f6',
    'item_623',
    'Melange Spiced Beer',
    'The spice melange extends life, expands consciousness and allows the mysterious navigators of the spacing guild to guide heighliners safely between the stars. This food is seasoned with spice melange and will raise the amount of spice in your blood.',
    't_ui_iconconsumspicedbeerr_d.webp',
    'Utility',
    'Consumable',
    'Spiced Food Drink',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1a4d2b8b-df84-4fa6-a1ce-fc319ec04828',
    'item_624',
    'Melange Spiced Coffee',
    'The spice melange extends life, expands consciousness and allows the mysterious navigators of the spacing guild to guide heighliners safely between the stars. This food is seasoned with spice melange and will raise the amount of spice in your blood.',
    't_ui_iconconsumspicedcoffeer_d.webp',
    'Utility',
    'Consumable',
    'Spiced Food Drink',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2ab250e5-d3a0-4bb9-b1e9-8ccd871d8e28',
    'item_625',
    'Melange Spiced Wine',
    'The spice melange extends life, expands consciousness and allows the mysterious navigators of the spacing guild to guide heighliners safely between the stars. This food is seasoned with spice melange and will raise the amount of spice in your blood.',
    't_ui_iconconsumspicedwiner_d.webp',
    'Utility',
    'Consumable',
    'Spiced Food Drink',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'eb789706-28b5-4a90-b36e-ea6b0226a09b',
    'item_638',
    'Melange Spiced Liquor',
    'The spice melange extends life, expands consciousness and allows the mysterious navigators of the spacing guild to guide heighliners safely between the stars. This food is seasoned with spice melange and will raise the amount of spice in your blood.',
    't_ui_iconconsumspicedliquorr_d.webp',
    'Utility',
    'Consumable',
    'Spiced Food Drink',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c8b46cfd-e7a1-4399-bc84-66907b11f8bb',
    'item_263',
    'Staking Unit',
    'Use this device to stake out more sections of land for your existing landclaim.',
    't_ui_iconplacneutstakingunitr_d.webp',
    'Utility',
    'Deployables',
    'Staking Unit',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3188e59f-c66e-43f0-ac7d-948ab63523ad',
    'item_267',
    'Vertical Staking Unit',
    'Use this device to extend the land of your existing base vertically.',
    't_ui_iconplacneutstakingunitr_d.webp',
    'Utility',
    'Deployables',
    'Staking Unit',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e970c47f-86a7-481e-88fc-d01ec2e86e8e',
    'item_24',
    'Micro-sandwich Fabric',
    'The Micro-Sandwich Fabric is a shorthand for the multi-layered water recycling component used in Fremen equipment such as stillsuits. Look for these in caves.',
    't_ui_iconresourcemicrosandwichfabricr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3d262b73-57e0-47f4-8aeb-e7c801bbac9a',
    'item_97',
    'Atreides Stillsuit Swatch',
    'An Atreides color swatch for Stillsuits.',
    't_ui_icontmogitemswatches_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '112fc896-b405-4c80-84f2-1cc4cf2f2700',
    'item_104',
    'Harkonnen Stillsuit Swatch',
    'A Harkonnen color swatch for Stillsuits.',
    't_ui_icontmogitemswatches_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '07a1e399-56c1-4c6d-be8f-61d89b7d4eca',
    'item_829',
    'Slaver Stillsuit Boots',
    'These Fremen designed stillsuit boots utilize steel heel pumps in order to facilitate the distillation process.',
    't_ui_iconclothslaverstillsuitbootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '82fc2fc3-9200-47d1-b46d-8a6999ef975c',
    'item_830',
    'Slaver Stillsuit Golves',
    'Designed by Fremen, these stillsuit gloves utilize steel fittings to help withstand many expeditions.',
    't_ui_iconclothslaverstillsuitglovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7a8d4b89-deb7-42cb-a874-361f986c5837',
    'item_831',
    'Slaver Stillsuit Mask',
    'A Fremen stillsuit mask with steel fittings, made to withstand many expeditions.',
    't_ui_iconclothslaverstillsuithelmetr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fa702736-4643-4d7d-b3e5-21e3898829c8',
    'item_832',
    'Slaver Stillsuit Body',
    'Designed by Fremen, this stillsuit uses steel-fitted tubings and catchpockets to withstand many expeditions.',
    't_ui_iconclothslaverstillsuitbodyr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1bca37a3-d870-4000-a3a2-c8f7c74823b8',
    'item_833',
    'Kirab Stillsuit Boots',
    'These Fremen designed stillsuit boots utilize iron heel pumps in order to facilitate the distillation process.',
    't_ui_iconclothnatistillsuit01shoesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '075451cf-c614-43af-8bed-0c0363ad159b',
    'item_834',
    'Kirab Stillsuit Gloves',
    'Designed by Fremen, these stillsuit gloves utilize iron fittings to help withstand many expeditions.',
    't_ui_iconclothnatistillsuit01glovesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c950060-e1e0-4450-9a88-56d08ac3be7c',
    'item_835',
    'Kirab Stillsuit Mask',
    'A Fremen stillsuit mask with iron fittings, made to withstand many expeditions.',
    't_ui_iconclothnatistillsuit01hoodmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b32c7e25-ee56-470f-b1e0-bfb6855e83ea',
    'item_836',
    'Kirab Stillsuit Body',
    'Designed by Fremen, this stillsuit uses iron-fitted tubings and catchpockets to withstand many expeditions.',
    't_ui_iconclothnatistillsuit01bodymaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b490e08f-9876-4924-8aff-952521d440c8',
    'item_837',
    'Native Stillsuit Boots',
    'These Fremen designed stillsuit boots utilize aluminum heel pumps in order to facilitate the distillation process.',
    't_ui_iconclothsmugarrakeenstillsuitshoesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ee3a3f37-7876-4ed4-a237-4d8b4a965055',
    'item_838',
    'Stillsuit Tubing',
    'The best tubing of course comes from the Fremen, but they do not share. The Maas Kharet are seen by many as a cheap imitation of the Fremen, and they produce a cheap imitation of Fremen stillsuit tubing.',
    't_ui_iconresourcestillsuittubingr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6556c7f6-fb14-426b-9004-de7c99264118',
    'item_839',
    'Native Stillsuit Gloves',
    'Designed by Fremen, these stillsuit gloves utilize aluminum fittings to help withstand many expeditions.',
    't_ui_iconclothsmugarrakeenstillsuitglovesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '50bb3b40-0a3f-47aa-834c-42f1bc6fdbb2',
    'item_840',
    'Native Stillsuit Mask',
    'A Fremen stillsuit mask with aluminum fittings, made to withstand many expeditions.',
    't_ui_iconclothsmugarrakeenstillsuithelmetmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71260fc6-65b7-48f6-911d-5022d60d780c',
    'item_841',
    'Native Stillsuit Body',
    'Designed by Fremen, this stillsuit uses aluminum-fitted tubings and catchpockets to withstand many expeditions.',
    't_ui_iconclothsmugarrakeenstillsuitbodymaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c5118165-cdcb-4200-93a4-de8dbdfe460c',
    'item_842',
    'Mercenary Stillsuit Boots',
    'These Fremen designed stillsuit boots utilize duraluminum heel pumps in order to facilitate the distillation process.',
    't_ui_iconclothmercstillsuitshoesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c47e46be-0f47-4f1c-8bee-8036ac9f813c',
    'item_843',
    'Mercenary Stillsuit Gloves',
    'Designed by Fremen, these stillsuit gloves utilize duraluminum fittings to help withstand many expeditions.',
    't_ui_iconclothmercstillsuitglovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8610abbf-2ba6-485f-9549-0243330aa120',
    'item_844',
    'Mercenary Stillsuit Mask',
    'A Fremen stillsuit mask with duraluminum fittings, made to withstand many expeditions.',
    't_ui_iconclothmercstillsuithelmetr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '740b03be-b809-4036-a538-12b4474d73a1',
    'item_845',
    'Mercenary Stillsuit Body',
    'Designed by Fremen, this stillsuit uses duraluminum-fitted tubings and catchpockets to withstand many expeditions.',
    't_ui_iconclothmercstillsuitbodyr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '65bd8c5b-39bc-49bf-8669-63ae27be0e4b',
    'item_846',
    'CHOAM Stillsuit Boots',
    'These Fremen designed stillsuit boots utilize plastanium heel pumps in order to facilitate the distillation process.',
    't_ui_iconclothchoamstillsuit01shoesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '10ec6adc-5082-4bc4-9270-43905f0cd1f4',
    'item_847',
    'Improved Watertube',
    'A stillsuit crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceimprovedwatertuber_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd527838e-ca52-4d69-aaf7-1fdfdd97095d',
    'item_848',
    'CHOAM Stillsuit Gloves',
    'Designed by Fremen, these stillsuit gloves utilize plastanium fittings to help withstand many expeditions.',
    't_ui_iconclothchoamstillsuit01glovesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '13ecc708-db9c-44b2-bda3-60bbfe8b057c',
    'item_849',
    'CHOAM Stillsuit Mask',
    'A Fremen stillsuit mask with plastanium fittings, made to withstand many expeditions.',
    't_ui_iconclothchoamstillsuit01hoodmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '53f33b13-346a-4cc4-9b08-19622fe9fdab',
    'item_850',
    'CHOAM Stillsuit Body',
    'Designed by Fremen, this stillsuit uses plastanium-fitted tubings and catchpockets to withstand many expeditions.',
    't_ui_iconclothchoamstillsuit01bodymaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '04b566ab-4303-4998-a534-befe97b9739a',
    'item_851',
    'Scavenger Stillsuit Boots',
    'These Fremen designed stillsuit boots utilize copper heel pumps in order to facilitate the distillation process.',
    't_ui_iconclothneutleakingstillsuitbootsmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9127f100-ff09-4aa9-823c-a84dfd1492fe',
    'item_852',
    'Scavenger Stillsuit Gloves',
    'Designed by Fremen, these stillsuit gloves utilize copper fittings to help withstand many expeditions.',
    't_ui_iconclothneutleakingstillsuitglovesmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6dacfdad-50dc-4a58-b63c-2bf987bb763e',
    'item_853',
    'Scavenger Stillsuit Mask',
    'A Fremen stillsuit mask with copper fittings, made to withstand many expeditions.',
    't_ui_iconclothneutleakingstillsuithoodmaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f0a8e0c0-bb67-4376-a559-013d5ae99a55',
    'item_854',
    'Scavenger Stillsuit Body',
    'Designed by Fremen, this stillsuit uses copper-fitted tubings and catchpockets to withstand many expeditions.',
    't_ui_iconclothneutleakingstillsuitbodymaler_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1549f0d7-1e3c-46f2-8083-d429a117dcd2',
    'item_855',
    'Hollower Stillsuit Boots',
    'The Hollower Clan is an inbred family of scavengers who inhabit the Hollow Arches of Southern Hagga Basin. This Unique stillsuit was their invention - though rumor persists that it was a gift from Fremen that they hid during the Sardaukar pogrom.',
    't_ui_iconclothstillsuituniquearmored01bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '91a5de3d-fc1c-4d8f-9c01-d2575e396a69',
    'item_856',
    'Hollower Stillsuit Gloves',
    'The Hollower Clan is an inbred family of scavengers who inhabit the Hollow Arches of Southern Hagga Basin. This Unique stillsuit was their invention - though rumor persists that it was a gift from Fremen that they hid during the Sardaukar pogrom.',
    't_ui_iconclothstillsuituniquearmored01glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c067bbc0-0972-40f7-aff6-12c2db9a7c31',
    'item_857',
    'Hollower Stillsuit Mask',
    'The Hollower Clan is an inbred family of scavengers who inhabit the Hollow Arches of Southern Hagga Basin. This Unique stillsuit was their invention - though rumor persists that it was a gift from Fremen that they hid during the Sardaukar pogrom.',
    't_ui_iconclothstillsuituniquearmored01maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dd113fe8-5f9f-4659-9ba6-0abd31b89da4',
    'item_858',
    'Hollower Stillsuit Garment',
    'The Hollower Clan is an inbred family of scavengers who inhabit the Hollow Arches of Southern Hagga Basin. This Unique stillsuit was their invention - though rumor persists that it was a gift from Fremen that they hid during the Sardaukar pogrom.',
    't_ui_iconclothstillsuituniquearmored01topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e7f1c287-4fa9-49c5-b588-9daf10f5c63a',
    'item_859',
    'Menol''s Stillsuit Boots',
    'Menol was well loved among the Kirab, known far and wide for his spice beer brewing operations. He accidentally discovered that soaking his stillsuit leathers led to a stiffer, more protective Unique garment. Like his spice beer, he shared this knowledge freely, didn''t help him much when he was stabbed to death by a drunk Kirab who hallucinated he was a sandworm.',
    't_ui_iconclothstillsuituniquearmored02bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '141f00b0-ecc3-4b0d-886b-83bac83186e9',
    'item_860',
    'Menol''s Stillsuit Gloves',
    'Menol was well loved among the Kirab, known far and wide for his spice beer brewing operations. He accidentally discovered that soaking his stillsuit leathers led to a stiffer, more protective Unique garment. Like his spice beer, he shared this knowledge freely, didn''t help him much when he was stabbed to death by a drunk Kirab who hallucinated he was a sandworm.',
    't_ui_iconclothstillsuituniquearmored02glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dd4413ae-8329-4e81-a097-3078797fa460',
    'item_861',
    'Menol''s Stillsuit Mask',
    'Menol was well loved among the Kirab, known far and wide for his spice beer brewing operations. He accidentally discovered that soaking his stillsuit leathers led to a stiffer, more protective Unique garment. Like his spice beer, he shared this knowledge freely, didn''t help him much when he was stabbed to death by a drunk Kirab who hallucinated he was a sandworm.',
    't_ui_iconclothstillsuituniquearmored02maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a03fe4db-a2fb-43cc-bd61-6c3918f1c780',
    'item_862',
    'Menol''s Stillsuit Garment',
    'Menol was well loved among the Kirab, known far and wide for his spice beer brewing operations. He accidentally discovered that soaking his stillsuit leathers led to a stiffer, more protective Unique garment. Like his spice beer, he shared this knowledge freely, didn''t help him much when he was stabbed to death by a drunk Kirab who hallucinated he was a sandworm.',
    't_ui_iconclothstillsuituniquearmored02topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e62d2952-9d92-4a89-b371-8b02450815b2',
    'item_863',
    'Kel''s Stillsuit Boots',
    'Kel is the most paranoid of the slavelords who came to Arrakis to help with the building of Neo-Carthag. He was a nervous businessman, even before he splintered with the rest of the slavers and moved his operations across the rift. Now he sleeps in this Unique stillsuit he designed. He does not sleep well at night.',
    't_ui_iconclothstillsuituniquearmored03bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '90610c3e-d93d-4a26-b9d0-6ee6250bf30a',
    'item_864',
    'Kel''s Stillsuit Gloves',
    'Kel is the most paranoid of the slavelords who came to Arrakis to help with the building of Neo-Carthag. He was a nervous businessman, even before he splintered with the rest of the slavers and moved his operations across the rift. Now he sleeps in this Unique stillsuit he designed. He does not sleep well at night.',
    't_ui_iconclothstillsuituniquearmored03glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c56abb36-58bb-4dcf-8f1c-94c252d2584c',
    'item_865',
    'Kel''s Stillsuit Mask',
    'Kel is the most paranoid of the slavelords who came to Arrakis to help with the building of Neo-Carthag. He was a nervous businessman, even before he splintered with the rest of the slavers and moved his operations across the rift. Now he sleeps in this Unique stillsuit he designed. He does not sleep well at night.',
    't_ui_iconclothstillsuituniquearmored03maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3bf6ab21-fe03-4c82-bf7b-866801c9a1bb',
    'item_866',
    'Kel''s Stillsuit Garment',
    'Kel is the most paranoid of the slavelords who came to Arrakis to help with the building of Neo-Carthag. He was a nervous businessman, even before he splintered with the rest of the slavers and moved his operations across the rift. Now he sleeps in this Unique stillsuit he designed. He does not sleep well at night.',
    't_ui_iconclothstillsuituniquearmored03topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '470cbc2e-825c-45d4-9a00-e5116d114edf',
    'item_867',
    'Shadrath''s Stillsuit Boots',
    'Shadrath was a Fremen warrior, who killed dozens of Sardaukar in razzia across the Shield Wall. When he was gravely wounded, he returned to a hidden cave and sealed himself in a deathstill, preserving his water for his tribe. This Unique armored stillsuit is based on the design of the one found abandoned by the deathstill.',
    't_ui_iconclothstillsuituniquearmored04bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a993c409-4488-44ee-8fea-64281f9f9cec',
    'item_868',
    'Shadrath''s Stillsuit Gloves',
    'Shadrath was a Fremen warrior, who killed dozens of Sardaukar in razzia across the Shield Wall. When he was gravely wounded, he returned to a hidden cave and sealed himself in a deathstill, preserving his water for his tribe. This Unique armored stillsuit is based on the design of the one found abandoned by the deathstill.',
    't_ui_iconclothstillsuituniquearmored04glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8667cf12-3780-4397-9d04-13205cae9d68',
    'item_869',
    'Shadrath''s Stillsuit Mask',
    'Shadrath was a Fremen warrior, who killed dozens of Sardaukar in razzia across the Shield Wall. When he was gravely wounded, he returned to a hidden cave and sealed himself in a deathstill, preserving his water for his tribe. This Unique armored stillsuit is based on the design of the one found abandoned by the deathstill.',
    't_ui_iconclothstillsuituniquearmored04maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '615aaa73-8b91-488e-8648-b0d7136107d1',
    'item_870',
    'Shadrath''s Stillsuit Garment',
    'Shadrath was a Fremen warrior, who killed dozens of Sardaukar in razzia across the Shield Wall. When he was gravely wounded, he returned to a hidden cave and sealed himself in a deathstill, preserving his water for his tribe. This Unique armored stillsuit is based on the design of the one found abandoned by the deathstill.',
    't_ui_iconclothstillsuituniquearmored04topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '736aa762-f179-40ad-8975-2a6a6b512ec7',
    'item_871',
    'Saturnine Stillsuit Boots',
    'The Saturnine were a group of merc-assassins who came to Arrakis during the Fremen pogrom. The Saturnine pride themselves on hunting dangerous individuals and converting them into trophies. The Saturnine claim that this Unique stillsuit bears the visage of Stilgar, a famous Fremen naib.',
    't_ui_iconclothstillsuituniquearmored05bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '348d4ab5-510c-4533-9bcd-8c7f8d7bab9a',
    'item_872',
    'Saturnine Stillsuit Gloves',
    'The Saturnine were a group of merc-assassins who came to Arrakis during the Fremen pogrom. The Saturnine pride themselves on hunting dangerous individuals and converting them into trophies. The Saturnine claim that this Unique stillsuit bears the visage of Stilgar, a famous Fremen naib.',
    't_ui_iconclothstillsuituniquearmored05glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '57e4d3af-538a-4980-a723-f81b879e6530',
    'item_873',
    'Saturnine Stillsuit Mask',
    'The Saturnine were a group of merc-assassins who came to Arrakis during the Fremen pogrom. The Saturnine pride themselves on hunting dangerous individuals and converting them into trophies. The Saturnine claim that this Unique stillsuit bears the visage of Stilgar, a famous Fremen naib.',
    't_ui_iconclothstillsuituniquearmored05maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bf22c1fc-7f59-4b44-a691-1e13223f0faf',
    'item_874',
    'Saturnine Stillsuit Garment',
    'The Saturnine were a group of merc-assassins who came to Arrakis during the Fremen pogrom. The Saturnine pride themselves on hunting dangerous individuals and converting them into trophies. The Saturnine claim that this Unique stillsuit bears the visage of Stilgar, a famous Fremen naib.',
    't_ui_iconclothstillsuituniquearmored05topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5091c451-d6c7-49a3-b26a-208c1c789025',
    'item_875',
    'Imperial Stillsuit Boots',
    'This Unique stillsuit was designed by the finest tailors CHOAM has access to, and every detail has been considered for the comfort and cut. It is also highly armored, which makes it useful in combat. But regardless, the Imperium has never quite managed to replicate the elegant simplicity of Fremen technology.',
    't_ui_iconclothstillsuituniquearmored06bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '56d9501f-11c7-4b0f-91c3-ebfc1443f05d',
    'item_876',
    'Imperial Stillsuit Gloves',
    'This Unique stillsuit was designed by the finest tailors CHOAM has access to, and every detail has been considered for the comfort and cut. It is also highly armored, which makes it useful in combat. But regardless, the Imperium has never quite managed to replicate the elegant simplicity of Fremen technology.',
    't_ui_iconclothstillsuituniquearmored06glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '128ad491-c538-4966-9c25-63f9dc030973',
    'item_877',
    'Imperial Stillsuit Mask',
    'This Unique stillsuit was designed by the finest tailors CHOAM has access to, and every detail has been considered for the comfort and cut. It is also highly armored, which makes it useful in combat. But regardless, the Imperium has never quite managed to replicate the elegant simplicity of Fremen technology.',
    't_ui_iconclothstillsuituniquearmored06maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4f77308c-f7eb-47f8-a9f1-2fe3ae7a4e9f',
    'item_878',
    'Imperial Stillsuit Garment',
    'This Unique stillsuit was designed by the finest tailors CHOAM has access to, and every detail has been considered for the comfort and cut. It is also highly armored, which makes it useful in combat. But regardless, the Imperium has never quite managed to replicate the elegant simplicity of Fremen technology.',
    't_ui_iconclothstillsuituniquearmored06topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ccceb551-c415-4778-b075-b6ee94c97858',
    'item_879',
    'Maraqeb Stillsuit Boots',
    'Maraqeb, known colloquially as The Sentinel, is a rock formation that has weathered thousands of years of sandstorms. The Fremen believed it was a holy site, a place that rewards endurance. This Unique stillsuit is based on the principles of Maraqeb - durability and efficiency.',
    't_ui_iconclothstillsuituniqueefficient04bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '938ae3e6-f885-44b9-a15b-e7565de30185',
    'item_880',
    'Maraqeb Stillsuit Gloves',
    'Maraqeb, known colloquially as The Sentinel, is a rock formation that has weathered thousands of years of sandstorms. The Fremen believed it was a holy site, a place that rewards endurance. This Unique stillsuit is based on the principles of Maraqeb - durability and efficiency.',
    't_ui_iconclothstillsuituniqueefficient04glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0c1c8d6-5a08-4d38-9e33-5f1f6155decf',
    'item_881',
    'Maraqeb Stillsuit Mask',
    'Maraqeb, known colloquially as The Sentinel, is a rock formation that has weathered thousands of years of sandstorms. The Fremen believed it was a holy site, a place that rewards endurance. This Unique stillsuit is based on the principles of Maraqeb - durability and efficiency.',
    't_ui_iconclothstillsuituniqueefficient04maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '035be4c3-c8c5-4b0d-ad86-0827f74a47df',
    'item_882',
    'Maraqeb Stillsuit Garment',
    'Maraqeb, known colloquially as The Sentinel, is a rock formation that has weathered thousands of years of sandstorms. The Fremen believed it was a holy site, a place that rewards endurance. This Unique stillsuit is based on the principles of Maraqeb - durability and efficiency.',
    't_ui_iconclothstillsuituniqueefficient04topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '685e9d5d-8678-4737-ac56-38e56e56b02a',
    'item_883',
    'Batigh Stillsuit Boots',
    'A stillsuit manufacturer from Carthag once visited Kynes the Planetologist to enlist his aid in designing a better stillsuit. This Unique stillsuit was the result, and Kynes insisted that the manufacturer name it the Batigh, which the manufacturer proudly did.',
    't_ui_iconclothstillsuituniqueefficient05bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ac85fc1a-6d84-4555-a2fa-22b2f4a85c67',
    'item_884',
    'Batigh Stillsuit Gloves',
    'A stillsuit manufacturer from Carthag once visited Kynes the Planetologist to enlist his aid in designing a better stillsuit. This Unique stillsuit was the result, and Kynes insisted that the manufacturer name it the Batigh, which the manufacturer proudly did.',
    't_ui_iconclothstillsuituniqueefficient05glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '557dd6e2-b525-491a-8d34-aa060055a1a1',
    'item_885',
    'Batigh Stillsuit Mask',
    'A stillsuit manufacturer from Carthag once visited Kynes the Planetologist to enlist his aid in designing a better stillsuit. This Unique stillsuit was the result, and Kynes insisted that the manufacturer name it the Batigh, which the manufacturer proudly did.',
    't_ui_iconclothstillsuituniqueefficient05maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c58ca128-4c1f-431c-b6e3-eeecd9c21625',
    'item_886',
    'Batigh Stillsuit Garment',
    'A stillsuit manufacturer from Carthag once visited Kynes the Planetologist to enlist his aid in designing a better stillsuit. This Unique stillsuit was the result, and Kynes insisted that the manufacturer name it the Batigh, which the manufacturer proudly did.',
    't_ui_iconclothstillsuituniqueefficient05topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0ebe99a1-a473-40ae-8ee8-e6f99b237277',
    'item_887',
    'Villari''s Stillsuit Boots',
    'After his ordeal in the Deep Desert, Keif Villari became an overnight hero to the members of the Miner''s Guild. Cashing in on his fame, this Unique stillsuit is branded by CHOAM as ''the stillsuit to wear when you''re stuck in the desert for forty days''. Villari receives a small royalty for each stillsuit purchased.',
    't_ui_iconclothstillsuituniqueefficient06bootsr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5e5798fc-1d18-428b-8f45-07259d5e0858',
    'item_888',
    'Villari''s Stillsuit Gloves',
    'After his ordeal in the Deep Desert, Keif Villari became an overnight hero to the members of the Miner''s Guild. Cashing in on his fame, this Unique stillsuit is branded by CHOAM as ''the stillsuit to wear when you''re stuck in the desert for forty days''. Villari receives a small royalty for each stillsuit purchased.',
    't_ui_iconclothstillsuituniqueefficient06glovesr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3de5f2b5-55c8-4d38-a01f-bf04eda89fe9',
    'item_889',
    'Villari''s Stillsuit Mask',
    'After his ordeal in the Deep Desert, Keif Villari became an overnight hero to the members of the Miner''s Guild. Cashing in on his fame, this Unique stillsuit is branded by CHOAM as ''the stillsuit to wear when you''re stuck in the desert for forty days''. Villari receives a small royalty for each stillsuit purchased.',
    't_ui_iconclothstillsuituniqueefficient06maskr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c25e3a9e-0ad2-407f-aadd-58df5e19cf9f',
    'item_890',
    'Villari''s Stillsuit Garment',
    'After his ordeal in the Deep Desert, Keif Villari became an overnight hero to the members of the Miner''s Guild. Cashing in on his fame, this Unique stillsuit is branded by CHOAM as ''the stillsuit to wear when you''re stuck in the desert for forty days''. Villari receives a small royalty for each stillsuit purchased.',
    't_ui_iconclothstillsuituniqueefficient06topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c692af61-8261-4089-85c7-28f9aa10ee7f',
    'item_891',
    'Shaddam''s Bladder',
    'This Unique stillsuit design was originally an extension to the Imperial stillsuit and was manufactured by sycophant in the case of a visit from the Emperor himself. With extra large thighpads and catchpockets, this stillsuit lets the wearer go for days without needing to use a toilet, something which has become a source of much amusement.',
    't_ui_iconclothstillsuituniquehighcapacity06topr_d.webp',
    'Garment',
    'Stillsuit',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5d156b63-11cb-42d4-9557-ba09aff61b6f',
    'item_22',
    'Stilltent',
    'This stilltent will retain some lost moisture while sheltering from the elements in the desert.',
    't_ui_iconplacchoamstilltentr_d.webp',
    'Utility',
    'Deployables',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cc2bbce4-d219-4737-b8df-88be74577075',
    'item_31',
    'Double-sealed Stilltent',
    'A Unique creation. This stilltent utilizes extra seals in order to trap more moisture over time.',
    't_ui_iconplacchoamstilltentr_d.webp',
    'Utility',
    'Deployables',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99da310e-437b-4b0a-8a23-16dbc4a39785',
    'item_1',
    'Harkonnen Stronghold',
    'Construction set for building strong permanent bases in the Harkonnen style. Allows selection of this set with a Construction Tool.',
    't_ui_iconplacharklevel3foundationr_d.webp',
    'Buildings Sets',
    'Stronghold Set',
    'Harkonnen',
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '28ee05c0-528c-46b9-a28c-6e69cabb12cb',
    'item_2',
    'Atreides Stronghold',
    'Construction set for building strong permanent bases in the Atreides style. A choice with the Construction Tool.',
    't_sm_env_pb_atre_outposfoundation_d.webp',
    'Buildings Sets',
    'Stronghold Set',
    'Atreides',
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5969fb4e-b71c-4701-8d2c-29ff12088a63',
    'item_256',
    'Survey Probe',
    '"Ammunition" to be loaded into a Survey Probe Launcher. Launch one probe at a high altitude to map the local area. Fremen origin.',
    't_ui_iconresourcechoamsurveyprobeprober_d.webp',
    'Utility',
    'Ammo',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '191d4568-356c-4e5a-b283-34cc16591b70',
    'item_255',
    'Survey Probe Launcher',
    'Launch a Survey Probe from high altitude to map out worthwhile information about your surrounding area.',
    't_ui_icontool1hchoamsurveyprobelauncherr_d.webp',
    'Utility',
    'Cartography Tools',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '28d1962e-7516-450f-8c25-6cfe9d932c0b',
    'item_35',
    'Leap Suspensor Belt',
    'Reduces gravity''s pull on the user, allowing for extended height and distance when jumping. Old Imperial origin. Depletes power from a power pack on use.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Garment',
    'Utility',
    'Suspensor Belt',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a64b881a-1a06-404b-87dd-503e1ea2e63b',
    'item_40',
    'Full Suspensor Belt',
    'Removes gravity''s influence on the user while active, allowing for extending traversal in any vertical direction. Depletes power from a Power Pack when in use. Old Imperial origin.',
    't_ui_iconwearchoamsuspensorfullreductionr_d.webp',
    'Garment',
    'Utility',
    'Suspensor Belt',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9616439b-f5b4-4fbc-b151-df648a2e032d',
    'item_42',
    'Planar Suspensor Belt',
    'Stabilizes the user''s vertical position and allows them to reposition horizontally. Sluggish repositioning but low power depletion for extended use.',
    't_ui_iconwearchoamsuspensorpartialstabilizationr_d.webp',
    'Garment',
    'Utility',
    'Suspensor Belt',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71135e84-5bbe-4d48-9517-40841ed2c378',
    'item_43',
    'Responsive Planar Suspensor Belt',
    'Stabilizes the user''s vertical position and allows them to reposition horizontally. Responsive repositioning but high power depletion, generally used for advanced combat maneuvers.',
    't_ui_iconwearchoamsuspensorfullstabilizationr_d.webp',
    'Garment',
    'Utility',
    'Suspensor Belt',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6c6c60a4-9f67-4eaa-980b-9792bf3ac17a',
    'item_46',
    'Passive Suspensor Belt',
    'Protects user from taking damage from falling. Automatically kicks on at damaging speeds and will persist as long as the user has power. Old Imperial origin.',
    't_ui_iconwearchoamsuspensorpassivereductionr_d.webp',
    'Garment',
    'Utility',
    'Suspensor Belt',
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '69694b8f-4442-49c2-9d88-f111190d8f29',
    'item_95',
    'Atreides Heavy Armor Swatch',
    'An Atreides color swatch for Heavy Armors.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9036a560-0985-4350-8044-7f527c0ab685',
    'item_96',
    'Atreides Light Armor Swatch',
    'An Atreides color swatch for Light Armors.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '640f7491-00c1-436d-baaf-15222ec11aa4',
    'item_98',
    'Atreides Flying Vehicle Swatch',
    'An Atreides color swatch for Flying Vehicles.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 400/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0ea44858-263d-42c2-b2a5-0b766459cca9',
    'item_99',
    'Atreides Ground Vehicle Swatch',
    'An Atreides color swatch for Ground Vehicles.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '88aca22d-22b6-460a-85b9-96989d9a9199',
    'item_100',
    'Atreides Melee Weapon Swatch',
    'An Atreides color swatch for Melee Weapons.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '41149a70-bbfc-43e8-9468-65e34adc76ac',
    'item_101',
    'Atreides Ranged Weapon Swatch',
    'An Atreides color swatch for Ranged Weapons.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5e70f506-40fc-4742-ab8b-2be50fa49c2d',
    'item_102',
    'Harkonnen Heavy Armor Swatch',
    'A Harkonnen color swatch for Heavy Armors.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6936fe2e-3165-4580-bc80-934b6efbd2ef',
    'item_103',
    'Harkonnen Light Armor Swatch',
    'A Harkonnen color swatch for Light Armors.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '08b4edfb-3485-4f12-b249-957dd091a7d8',
    'item_105',
    'Harkonnen Flying Vehicle Swatch',
    'A Harkonnen color swatch for Flying Vehicles.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2efd9c11-afa8-43b7-a4cb-f1883b326df8',
    'item_106',
    'Harkonnen Ground Vehicle Swatch',
    'A Harkonnen color swatch for Ground Vehicles.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '507ab583-99b6-4b05-b0fd-ff7b7bf1f665',
    'item_107',
    'Harkonnen Melee Weapon Swatch',
    'A Harkonnen color swatch for Melee Weapons.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8589cf49-ba3c-4088-a487-2a98baba930d',
    'item_108',
    'Harkonnen Ranged Weapon Swatch',
    'A Harkonnen color swatch for Ranged Weapons.',
    't_ui_icontmogitemswatches_d.webp',
    'Customization',
    'Swatch',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a34dfe57-afaa-463a-bd59-bd5e20afbfc3',
    'item_154',
    'Seron''s Sword Hilt',
    'A well-worn sword hilt. Close examination reveals that it is inlaid with traditional motifs of House Ginaz.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c0cd9e2d-d7b7-4784-8b38-c0fd5814f77c',
    'item_195',
    'Replica Pulse-sword',
    'During the Butlerian Jihad, pulse-swords were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when parrying an enemy - offering a small stamina boost. A far cry from the legendary swords of the Butlerian Jihad.',
    't_ui_iconwpnmeleeuniquesword_05r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9a8a50ef-f95b-4914-95af-d9f7bd52386c',
    'item_200',
    'Jolt-sword',
    'During the Butlerian Jihad, pulse-swords were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when parrying an enemy — offering a small stamina boost. A far cry from the legendary swords of the Butlerian Jihad.',
    't_ui_iconwpnmeleeuniquesword_04r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '19ed197f-c30f-4ad0-8211-f8fe3382f5d8',
    'item_203',
    'Spark-sword',
    'During the Butlerian Jihad, pulse-swords were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when parrying an enemy — offering a small stamina boost. A far cry from the legendary swords of the Butlerian Jihad.',
    't_ui_iconwpnmeleeuniquesword_03r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3ce05191-a149-4e42-af09-717030d1738b',
    'item_204',
    'Shock-sword',
    'During the Butlerian Jihad, pulse-swords were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries. This Unique blade gives a small jolt of electrical energy to the palms when parrying an enemy — offering a small stamina boost. A far cry from the legendary swords of the Butlerian Jihad.',
    't_ui_iconwpnmeleeuniquesword_02r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '86cd7417-b69d-4fe1-832b-2319f519d9e9',
    'item_205',
    'Pseudo Pulse-Sword',
    'During the Butlerian Jihad, pulse-swords were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries. This Unique blade gives a small jolt of electrical energy to the palms when parrying an enemy — offering a small stamina boost. A far cry from the legendary swords of the Butlerian Jihad.',
    't_ui_iconwpnmeleeuniqueswordr_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8d74d680-1ed3-41a7-b667-a5c33647dde6',
    'item_388',
    'Regis Sword',
    'The sword is longer and heavier than a kindjal, but utilizes sweeping attacks that can help deal with multiple foes. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleechoamsword01r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8efc8bdc-7d68-4035-a306-f48fd654b381',
    'item_389',
    'Adept Sword',
    'The sword is longer and heavier than a kindjal, but utilizes sweeping attacks that can help deal with multiple foes. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleechoamsword01r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9d52ef36-9fa7-4dc5-acbb-b5edae0e68ae',
    'item_390',
    'House Sword',
    'The sword is longer and heavier than a kindjal, but utilizes sweeping attacks that can help deal with multiple foes. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleechoamsword01r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '35fa689c-f822-4da7-b6d2-f3e0d31a86ca',
    'item_391',
    'Artisan Sword',
    'The sword is longer and heavier than a kindjal, but utilizes sweeping attacks that can help deal with multiple foes. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleechoamsword01r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cb2f9185-98e1-45eb-b843-4a821ddff1b3',
    'item_392',
    'Standard Sword',
    'The sword is longer and heavier than a kindjal, but utilizes sweeping attacks that can help deal with multiple foes. Can penetrate shields. A Great House item.',
    't_ui_iconwpnmeleechoamsword01r_d.webp',
    'Weapon',
    'Melee',
    'Sword',
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'aeba3292-8cba-40e8-ba01-b4b1c425be2d',
    'item_26',
    'Thumper',
    'Activating this device in the desert will cause vibrations that summon sandworms.',
    't_ui_iconplacchoamthumper01r_d.webp',
    'Utility',
    'Deployables',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd58e9d6c-050c-4ca9-b564-212ddd29aedd',
    'item_20',
    'Salvaged Metal',
    'This metal has been salvaged from wreckage left on Arrakis. Can be recovered with a Cutteray. Used for crafting rudimentary metal items.',
    't_ui_iconresourcescrapmetalr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '56460fd2-f4d2-42a3-abd9-faec377536b5',
    'item_28',
    'Clapper Mk4',
    'Modified to follow the Fremen design, this Unique thumper generates a large amount of threat with the sandworm in a short amount of time. Just be sure to place it on open sand.',
    't_ui_iconplacchoamthumper01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ebc8943-d500-4a2a-8d73-33f3ffe43b9e',
    'item_41',
    'Cobalt Paste',
    'A dissolution of Cobalt, refined from Erythrite Crystal from the Hagga Rift at a Chemical Refinery. Used to create products that require Cobalt.',
    't_ui_iconresourcecobaltbarr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dd22bb08-80c4-49c6-b507-22821e5c5686',
    'item_54',
    'Spice Melange',
    'Made from Spice Sand at a Spice Refinery. The most sought-after resource in the universe. Enables intergalactic travel and extends life. Addictive. Withdrawal leads to death.',
    't_ui_iconresourcerefinedspicer_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd2753786-c211-48a3-8b8f-f43731ffd2d2',
    'item_67',
    'Old Sparky Mk1',
    'Sim found that if he crossed the wires in his power pack just so, he could create a Unique power pack that recharged quickly - but with a slightly reduced power pool. Sim''s power pack became known as ''old sparky'' for it''s constant discharge of electrical sparks - but his technique was copied widely by those who value speed over duration.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f57dd147-8d15-420f-9531-13b72ef0437a',
    'item_68',
    'Old Sparky Mk2',
    'Sim found that if he crossed the wires in his power pack just so, he could create a Unique power pack that recharged quickly - but with a slightly reduced power pool. Sim''s power pack became known as ''old sparky'' for its constant discharge of electrical sparks - but his technique was copied widely by those who value speed over duration.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b3115d8d-cb93-4418-ba11-07c0ca35d3f7',
    'item_69',
    'Old Sparky Mk3',
    'Sim found that if he crossed the wires in his power pack just so, he could create a Unique power pack that recharged quickly - but with a slightly reduced power pool. Sim''s power pack became known as ''old sparky'' for its constant discharge of electrical sparks - but his technique was copied widely by those who value speed over duration.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a95f341e-b7a2-448b-8531-859c04444f3e',
    'item_70',
    'Old Sparky Mk4',
    'Sim found that if he crossed the wires in his power pack just so, he could create a Unique power pack that recharged quickly - but with a slightly reduced power pool. Sim''s power pack became known as ''old sparky'' for its constant discharge of electrical sparks - but his technique was copied widely by those who value speed over duration.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2819fda6-2100-414b-9949-daf56fc2d03a',
    'item_71',
    'Young Sparky Mk5',
    'Sim found that if he crossed the wires in his power pack just so, he could create a Unique power pack that recharged quickly - but with a slightly reduced power pool. Sim''s power pack became known as ''old sparky'' for its constant discharge of electrical sparks - but his technique was copied widely by those who value speed over duration.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '17fbd308-1574-4ab2-9b53-bf6d7c38adbd',
    'item_73',
    'Young Sparky Mk6',
    'Sim found that if he crossed the wires in his power pack just so, he could create a Unique power pack that recharged quickly - but with a slightly reduced power pool. Sim''s power pack became known as ''old sparky'' for its constant discharge of electrical sparks - but his technique was copied widely by those who value speed over duration.',
    't_ui_iconwearchoampowerpack01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b469dd07-1101-4d72-a19d-6650fdf2c3b4',
    'item_78',
    'Sentinel Belt',
    'This {Unique} stabilization suspensor belt enables the wearer to rapidly adjust movements to avoid incoming hits while suspended.',
    't_ui_iconwearchoamsuspensorfullstabilizationr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'be4b9475-1e15-44bc-8e91-c5be62517c26',
    'item_112',
    'CHOAM Communinet Transceiver',
    'Aside from a label identifying this item as CHOAM company property, this appears to be a standard Communinet transceiver. A local CHOAM representative would probably like this back.',
    't_ui_iconcontractchoamcommuninettransceiver_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '49ee1d06-7732-4750-93d6-396c953edb3d',
    'item_116',
    'Sandflies Transponder',
    'This Communinet transponder is tuned to secret Sandflies channels. It would be a major boon to anyone wanting to listen in on their communications.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c086f9bf-b507-46fb-abcd-24e95cd69b98',
    'item_120',
    'Maas Kharet Map',
    'This crude map shows some local landmarks and supposedly some other locations of interest. Being unfamiliar with the meaning of the markings, this map reveals no useful information to you.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '390f9969-0a2f-4f8f-802a-2df957c9aa1b',
    'item_121',
    'Cultivating Hufuf Vines in Artificial Environments — E. Goetha',
    'This book goes into great detail on how to grow Hufuf plants. Parts seem to have been added recently, noting the peculiarities of growing these plants on Arrakis, concluding that this is really only feasible in the confines of a biological testing station. Someone at the Anvil would probably be interested in this.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9fda9ac7-8ec8-4c16-b8b7-3c4b1cdfd756',
    'item_122',
    'Scrap Metal Delivery',
    'Alright, it''s time we pack up all the scrap we''ve gathered so far and start hauling it over to Pinnacle Station. Let Traj worry about how he is going to get that stuff past the Harkonnens.',
    't_ui_iconcontracts_funnel_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c208aa2e-8ff5-47b0-a79f-32bacd246ca5',
    'item_123',
    'Electronics Delivery',
    'Once we are done sorting out the electronics we can move them over to Griffin''s Reach and get paid. 

Make sure to remove any sign that we got this from an Atreides ''thopter, or we''ll get another two-hour lecture from Charki.',
    't_ui_iconcontracts_funnel_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '869adbd5-8a6b-4c52-b807-00aa8a5ac18c',
    'item_124',
    'Trout Leather Delivery',
    'Our equipment is breaking left, right, and center. We all know what needs to be done: one of you needs to go to Griffin''s Reach, talk to Charki, restrain the urge to shoot him in the face, and get us a repair tool. 

Take some Trout Leather to barter with. Charki hates us, but he is also a businessman.',
    't_ui_iconcontracts_funnel_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'aa30be17-0899-453b-b098-c7a40937e310',
    'item_125',
    'Offload Equipment',
    'We have a massive pile of stuff that the marks were carrying when we grabbed them. We should offload it before we move this herd to Harko. Traj at the trade post goes on and on about how he hates Slavers, but he buys our stuff all the same. Easy profit.',
    't_ui_iconcontracts_funnel_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7bb8b3cb-b0ff-48ec-b9dd-01837837f598',
    'item_126',
    'Smuggler Notes',
    'A document detailing the sale of munitions to both the Harkonnen and Atreides.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f6c3634d-cd50-46ee-9a9d-1d48b05b85dc',
    'item_133',
    'Item item_133',
    NULL,
    't_ui_iconcontracts_funnel_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '398ef6e4-4863-4cfa-99d1-8dbed20441a6',
    'item_134',
    'Semuta Trade Logs',
    'Among the other Semuta buyers on the list, you find the name: Maxim Kazmir. Even better, the payment methods suggest he''s using more than his own funds. Some of these resources were meant for House Harkonnen.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '64d4be5c-4857-4e5b-a388-bdb78753d0ca',
    'item_138',
    'Beam Modulator',
    'A very visible warning label declares ''DO NOT USE WITH HANDHELD CUTTERAYS. INSTALLATION BY AUTHORIZED PERSONEL ONLY. KEEP AWAY FROM CHILDREN AND MAULA.''',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bf46c48e-74bf-4534-bcc3-e62e437b48fc',
    'item_139',
    'The Red Scorpion',
    'You ask ''who is the Red Scorpion?'' But I say, don''t ask ''who,'' but ''what.'' The Red Scorpion is an idea. A stinger in the flesh of the Atreides. A poison in the blood of the Harkonnen.

I am not a Duke or a Baron. I am just a man. But I am the Red Scorpion.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6e49b2de-bafe-4395-92be-3ff247601a37',
    'item_140',
    'The Guerilla in the Desert',
    'Strike with superior force where the enemy is weak.

Refuse to be pinned down by the enemy, always maintain a clear route of retreat.

A fair fight only benefits your opponent.

If you expend lives to hold territory, you will only lose both.

Be like water — hard to find and quick to disappear.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b6914560-661f-4988-859c-698863ed113a',
    'item_141',
    'Run with Tarit!',
    'Worried about the Slavers? Run with Tarit, he knows their plans better than they do. 

Worried about the Sardaukar patrols? Run with Tarit, he knows how to avoid the ships.

Worried about the worms? Let Tarit show you how to avoid the open sand.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd0ae4db0-82e6-43e5-8884-6d72bd8a630c',
    'item_142',
    'Get the best loot with Drot!',
    'Drot''s band always gets the best loot. Everybody knows this!

Are you tired of taking out scavengers for half a literjon of water and a handful of Solaris? Do you want to live like a Duke, even just for a day? Join Drot''s band!',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '825ebedf-5980-4715-ad8a-739e3e36b5c6',
    'item_144',
    'Bloodied Letter',
    'This letter, while blood-stained, is still legible: "Deliver the goods to the Sandflies, before we’re found out. They’ll pay handsomely. — Skorda”',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '519fc4e5-3035-4ae9-955f-d8040d185d1a',
    'item_147',
    'The Man in the Shadows',
    'House Harkonnen has identified the culprit behind the theft of several decagrams of Spice. Posing as a potential buyer, I have been in contact with the thief and duped them into a rendezvous — your team is to meet them there, kill them, and bring back the stolen goods.

Remember that I am paying extra for your discretion. Under NO CIRCUMSTANCES are you to bother any other representatives of House Harkonnen pertaining to this matter.',
    't_ui_iconcontracts_funnel_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b734ff1b-621f-4b30-ab3e-e7f638a3a79e',
    'item_148',
    'Servo-Stim Transmitter',
    'A device for adjusting servo-stimulator output in the target''s brain. Each is tuned to a specific range of servo-stimulators.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b8070f79-610f-4ea3-a736-5517540f7148',
    'item_151',
    'Tainted Spice',
    'This is, without a doubt, one of the containers Skorda attempted to smuggle to Arrakis.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '880e31a5-0809-492a-87ec-c4d15e160d8c',
    'item_155',
    'Tleilaxu Eyes',
    'Insect-like compound eyes fashioned out of metal.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '42ccd37a-5ffe-4cf6-a518-14bccaff8f18',
    'item_160',
    'List of Naibs',
    'Long lists of Fremen names, with particular focus on the line of Naibs for every major sietch.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '66909f03-3bd0-4f46-a4e9-259afec4de3a',
    'item_161',
    'Ecological Lexicon of Arrakis',
    'A detailed account of how Kynes connected the Fremen''s religious teachings with the science of ecology, in an attempt to turn Arrakis green.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '87bfaa95-0fb6-421b-9c32-9727659e83af',
    'item_163',
    'Item item_163',
    NULL,
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bc3bb150-ba32-4948-a1ae-fd28dbf887a5',
    'item_164',
    'Seron''s Challenge',
    'Addressed to Count Hasimir Fenring, invoking the laws of Kanly.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9e46db05-5da4-40ac-b09d-f0adf0308e40',
    'item_169',
    'Kara Valk''s Medicine',
    'These stims are mostly reserved for use in palliative care, but they can also offset the worst episodes of withdrawal symptoms a person with an unreliable servo-stim implant might suffer.

Long-term usage is not recommended.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7c0b7887-aa17-4e7f-ba31-ca0b1712f73b',
    'item_170',
    'Servo-Stimulator Transmitter',
    'A master transmitter, able to access any servo-stimulator implant in its vicinity. Could be used to sever the link to the implant, allowing for non-lethal removal.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8d9dfb41-87c7-43ef-8832-eea9b9aaccf2',
    'item_171',
    'Bundle of Deserter Clothes',
    'A tightly wrapped bundle of clothes, some with bloodstains. None of the clothes seem likely to fit you.',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c7815427-6f3c-4d00-b9dd-13c364a140b9',
    'item_173',
    'Automated Poison Snooper',
    'You are not overly familiar with this model, but it does not seem to have detected anything recently. Perhaps it is broken?',
    't_ui_iconcontractwrappedpackage_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fb0fcf36-98fb-492d-a8e8-eafb9f7daeb7',
    'item_174',
    'Falsified Communication Log',
    'A falsified communication log, meant to incriminate someone at Helius Gate.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3b850548-0b59-406f-aefb-b810a81b8234',
    'item_175',
    'Letter from Anton',
    'A personal letter from Anton Tolliver.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9dd9c81b-80ab-4139-ab44-e5c8bf128795',
    'item_176',
    'Altered letter from Anton',
    'An altered version of Anton''s letter, written by you and Maxim Kazmir.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cbc70260-102b-4051-97cf-298679ab61d1',
    'item_177',
    'Chakobsa Note',
    'A note written in Chakobsa. Derek Chinara might be able to decipher it.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '994d4207-3b91-4781-9f1b-ac1e9330204f',
    'item_178',
    'Poison Vial',
    'A rare vial of poison, coveted by enthusiasts and assassins alike.',
    't_ui_iconjourneychaumaspoisonr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e67cc1a5-28b7-4a80-a815-a15ea9a65eaa',
    'item_179',
    'Atreides Intel Log',
    'An Atreides information log, containing classified military secrets.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '34f3e7ca-21a7-4998-a126-c93a5f674a0c',
    'item_180',
    'Altered Atreides Intel Log',
    'An altered version of the Atreides information log.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99ac2e8d-964f-4291-a8ff-1f26ab67f670',
    'item_182',
    'Dr. Kynes''s Research Notes',
    'Even with your considerable training, you are not able to make sense of these notes — it''d likely take a very experienced Planetologist to decipher the work.',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '07a3ffb7-8704-4c64-b6d6-5894504beb41',
    'item_183',
    'List of Harkonnen Spies',
    NULL,
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '748be6eb-b456-4887-a8cb-41c81942dc3c',
    'item_184',
    'Zantara''s Signet Ring',
    'Zantara''s Signet Ring acquired in the lab under Old Carthag.',
    't_ui_iconjourneyzantarassignetringr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '91044a1f-d224-4c67-bc2e-aee358ab77c2',
    'item_186',
    'Lisan al-Gaib and Alam al-Mithal',
    '"The Lisan al-Gaib defies opposites.
He may be as a stranger to you and as one who has always lived among you.
He may see the future whilst gazing into the past.
He may be both dead and alive."',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ed8cb70d-724a-43a9-b672-1ad71f665b27',
    'item_187',
    'The Mahdi''s Blade',
    '"The blade of the Mahdi is slow, but immutable.
Like a doctor''s knife, it cuts to heal.
What his blade takes from you:
Rejoice, for he has relieved you of a burden."',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4477edd5-79de-4e92-9e57-8668d63afdf3',
    'item_188',
    'On Witches',
    '"It is written: Suffer not a witch to live among us.
Who is this witch?
Not one who knows the weirding way, but one who is warped by weirding.
Where demons make their home, a witch must die."',
    't_ui_iconcontractgenericnotebook_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '80b55a87-e9cc-4f6f-b009-dfb1cd72c493',
    'item_189',
    'Sub-Leader Key',
    'Sub-Leader Key',
    't_ui_iconjourneyprayerroompentashieldkeyr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a2f6771b-7e2b-45ad-9ba3-a87665248a84',
    'item_190',
    'Shield Dissembler',
    'Shield Dissembler',
    't_ui_iconjourneyshielddissemblerr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'abf5bc3c-f7a1-4490-a095-51aa374cf33b',
    'item_191',
    'Shigawire Garrote',
    'Shigawire Garrote',
    't_ui_iconjourneyshigawiregarotter_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c0e0a9f-d961-43bb-ab6e-471a28de4139',
    'item_192',
    'Chaumas Poison',
    'Chaumas Poison',
    't_ui_iconjourneychaumaspoisonr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2f7819e6-5848-4936-8c84-f02bd1d6a51b',
    'item_193',
    'Chaumurky Poison',
    'Chaumurky Poison',
    't_ui_iconjourneychaumurkypoisonr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cb2f3476-9b01-41a3-af1d-a515b1a5e503',
    'item_194',
    'Vehicle Backup Tool',
    'Use it to store and restore your Sandbike or Scout Ornithopter.',
    't_ui_icontool1hchoambackupkey01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '94d3b0ec-c34b-478a-81bd-0ec228a08332',
    'item_202',
    'Carbide Scraps',
    'This industrial byproduct is closely guarded by the Maas Kharet in their most sacred site. Nobody is entirely sure why.',
    't_ui_iconresourcecarbidescrapsr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b9d96251-c53c-471c-b9aa-fbbf0a04ccb2',
    'item_206',
    'Sardaukar Intimidator',
    'A Unique Disruptor with heavy darts doubleshots for added damage. What it lacks in rate of fire it makes up for the punches it throws.',
    't_ui_iconwpnuniquesmg3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a5112739-5dd8-48d7-9e45-69de92edecab',
    'item_213',
    'Abulurd''s Rapture',
    'This Unique disruptor has been modified to spray doubleshots of heavy darts at a slower rate. The name is based on a popular joke that made the rounds on Arrakis a few years ago — a comment on the Baron''s preferences and the virility of his younger brother, Abulurd. Anybody who was heard making the joke in Harkonnen territory was hanged, of course.',
    't_ui_iconwpnuniquesmg1r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '56726be3-591a-4d52-8ab6-5d05954248a0',
    'item_214',
    'Way of the Misr',
    'This Unique Maula pistol has a modified spring mechanism that automatically reloads darts without releasing trigger pressure. This model is older than any others, and seems to have been developed by the Fremen. It differs from the designs that integrate the modifications from Count Fenring.',
    't_ui_iconwpniconuniquesda6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'db29f1b0-21c4-4e40-8a2e-ea638a9eca49',
    'item_215',
    'Way of the Desert',
    'This Unique Maula pistol has a modified spring mechanism that automatically reloads darts without releasing trigger pressure. Integrating the modifications from Count Hasimir Fenring, this newer design also accommodates better materials for longer durability.',
    't_ui_iconwpniconuniquesda5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '576159cf-6cd6-44d2-954c-897c19ea2a54',
    'item_216',
    'Way of the Fighter',
    'This Unique Maula pistol has a modified spring mechanism that automatically reloads darts without releasing trigger pressure. Integrating the modifications from Count Hasimir Fenring, this newer design also accommodates better materials for longer durability.',
    't_ui_iconwpniconuniquesda4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ca90c7ae-5d3a-40c3-91c4-c594ff1468ec',
    'item_217',
    'Way of the Lost',
    'This Unique Maula pistol has a modified spring mechanism that automatically reloads darts without releasing trigger pressure. Integrating the modifications from Count Hasimir Fenring, this newer design also accommodates better materials for longer durability.',
    't_ui_iconwpniconuniquesda3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4ba206a5-0772-4072-85dc-96cadb9c6b69',
    'item_218',
    'Way of the Wanderer',
    'This Unique Maula pistol has a modified spring mechanism that automatically reloads darts without releasing trigger pressure. Integrating the modifications from Count Hasimir Fenring, this newer design also accommodates better materials for longer durability.',
    't_ui_iconwpniconuniquesda2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c7e27449-4d66-4be7-8ea2-111737edd706',
    'item_219',
    'Way of the Fallen',
    'This Unique Maula pistol has a modified spring mechanism that automatically reloads darts without releasing trigger pressure. Rumor has it that Count Hasimir Fenring designed this modification himself, admiring the design of the maula pistol while decrying the inefficiency of its firing mechanism.',
    't_ui_iconwpniconuniquesda1r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd90822a1-ad9a-4770-b717-f406b492848b',
    'item_220',
    'Shishakli''s Bite',
    'A too-tight spring in the magazine coupled with a too-wide barrel make this Unique maula pistol fire bursts of two darts at the same time, albeit with reduced accuracy. Manufacturers have labelled these obvious problems as "features".',
    't_ui_iconwpnuniquesda_doubleshot_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e0948f16-bbe5-49e9-94af-080b48459d9a',
    'item_221',
    'Taqwa''s Double',
    'A Unique maula pistol developed in the shadow of Taqwa''s Watch in the O''odham. Though Fremen battles rarely rely solely upon the maula pistol, it is still prudent to carry one — especially one with the capacity to fire double-shots bursts.',
    't_ui_iconwpnuniquesda_doubleshot_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a656f34a-26fa-431c-8ace-97f453a5e9aa',
    'item_222',
    'Shadrath''s Edge',
    'Shadrath crafted this Unique Maula pistol during his razzia against the Sardaukar bases around the Shield Wall. The double shot burst firing mechanism caused some inaccuracy in the shots, but it made up for it with the ability to puncture Sardaukar armor.',
    't_ui_iconwpnuniquesda_doubleshot_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ab30b2e-99c9-4783-a70b-fbbd42e482e8',
    'item_223',
    'Perforator',
    'Thin spikes in the barrel mean that the darts fired from this Unique scattergun will break into multiple shrapnel pieces on impact, causing a bleeding effect on enemies. Another example of Sardaukar weaponry built to intimidate and oppress.',
    't_ui_iconwpnuniquescattergun5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '87c88242-c806-4e28-9135-c1295e219c6a',
    'item_224',
    'Syndicate Impaler',
    'Thin spikes in the barrel mean that the darts fired from this Unique scattergun will break into multiple shrapnel pieces on impact, causing a bleeding effect on enemies. Brought from offworld only by Syndicate mercenaries, these formidable scatterguns are rarely found on Arrakis.',
    't_ui_iconwpnuniquescattergun4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a11a2f1a-66ca-4e91-947b-3dfc0972605f',
    'item_225',
    'Eviscerator',
    'Thin spikes in the barrel mean that the darts fired from this Unique scattergun will break into multiple shrapnel pieces on impact, causing a bleeding effect on enemies. Sandflies propaganda states that this weapon was used against them when they rebelled, though there are no records of the mining guild ever having access to such weapons.',
    't_ui_iconwpnuniquescattergun3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'db0d4179-06aa-4fce-9ca9-513235ca17fa',
    'item_226',
    'Ripper',
    'Thin spikes in the barrel mean that the darts fired from this Unique scattergun will break into multiple shrapnel pieces on impact, causing a bleeding effect on enemies. The slavers claim that they are the ones who designed this weapon — it is commonly used among them for crowd control.',
    't_ui_iconwpnuniquescattergun2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fccf9a7a-a12e-49d8-a5d9-c94ecb9da27e',
    'item_227',
    'Shredder',
    'Thin spikes in the barrel mean that the darts fired from this Unique scattergun will break into multiple shrapnel pieces on impact, causing a bleeding effect on enemies. It isn''t known who created such a sadistic weapon — but it is commonly used by the Kirab of Hagga Basin.',
    't_ui_iconwpnuniquescattergun1r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '60007557-c089-4608-8a46-77d1a9d2ee55',
    'item_228',
    'Shellburster',
    'This Unique scattergun was used during the Battle of Arrakeen. When Harkonnen troops charged the front gates of the palace, they were dismayed to find the shields still functional, despite being assured otherwise. A group of Atreides gunners used shellburst scatterguns to spread fire and chaos among the Harkonnen ranks, breaking them.',
    't_ui_iconwpnuniquescattergun_fire_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '32729a76-3b4e-4049-95eb-81dfebcf5897',
    'item_229',
    'Starburst',
    'This Unique scattergun was first discovered aboard the wreck of the Euporia in the Sheol. The crew and weapons on board were Ixian, leading to speculation that the weapon was sidestepping the prohibitions of the Butlerian Jihad. However, when the weapon was opened up, it was a disappointingly standard application of heat transference principles.',
    't_ui_iconwpnuniquescattergun_fire_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '58a133fe-8661-4f73-bcd1-e6c868fa22b8',
    'item_230',
    'Firestorm',
    'The Sandflies created this Unique scattergun by combining some of the principles of the cutteray with the necessities of modern warfare. The darts in this scattergun are superheated by a scalpel sized laser so that when they are fired they burst into flaming particles on impact.',
    't_ui_iconwpnuniquescattergun_fire_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 500/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e62be094-c45d-424f-a4ec-b1f9788b2c9a',
    'item_231',
    'Static Needle',
    'This Unique rapier is utilized by House forces to shock and disrupt the power supplies of their opponents.',
    't_ui_iconwpnmeleeuniquerapier_power_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '70a72920-5bb2-48cf-bf5e-a0c2d9e437aa',
    'item_232',
    'Halleck''s Pick',
    'This Unique sword contains a series of toxin releasing nodules along the length of the blade. Gurney Halleck, renowned troubadour and mercenary, kept a similar blade by his side when performing for noble audiences. When a drunken noble once asked if he felt his music was bad enough that he needed a sword to defend it, Gurney replied: ''Nay, I fear not your wrath, but when your wives and daughters rush the stage — I''ll need steel to keep my trousers fastened!''',
    't_ui_iconwpnmeleeuniquerapier_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9d997552-c893-495b-b1b3-d1b42b1c0a8c',
    'item_233',
    'Kharet Viper',
    'This Unique sword contains a series of toxin releasing nodules along the length of the blade. When struck with enough force, these nodules release a burst of poisonous gas — capable of passing through a shield. The Maas Kharet probably borrowed this design from the slavers — filling it with a poison of their own.',
    't_ui_iconwpnmeleeuniquerapier_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '00d99dc6-f30d-4532-95eb-7e5827ca570f',
    'item_234',
    'Poison Mist',
    'A lethally modified version of a slaver weapon, this Unique sword contains a series of toxin releasing nodules along the length of the blade. When struck with enough force, these nodules release a burst of poisonous gas — capable of passing through a shield. The slaver version of this weapon was used to release a sedative gas for capturing the unwilling.',
    't_ui_iconwpnmeleeuniquerapierr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5bac3133-fd19-4de0-8934-058209c38146',
    'item_235',
    'Vaporizer',
    'While artillery weapons and projectiles became deemphasized with the invention of the Holtzman shield, the humble flamethrower saw wider adoption in the military forces of the Imperium. Holtzman shields provide very little protection against being slowly cooked from the outside.

This Unique flamethrower has a higher gel capacity and more intense flame.',
    't_ui_iconwpnuniqueflamethrower_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1314d03f-254f-4a00-867f-68ce66b0636a',
    'item_237',
    'Shaitan''s Tongue',
    'If there was one weapon the Sardaukar used to inspire fear in the Fremen, it was the flamethrower. In the narrow corridors of the sietch warrens, a single Sardaukar could become a firestorm of death and destruction. Perhaps worse, for the Fremen, the corpses could not be recovered for their water.

This Unique flamethrower has a higher gel capacity and more intense flame.',
    't_ui_iconwpnuniqueflamethrowerr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '30b8a7c7-b0bc-40eb-a17b-cbed9b59bad1',
    'item_239',
    'Cauterizer',
    'This Unique knife is a modified surgical tool that was developed for treating field injuries. It seals injuries as it cuts using a small cutteray to superheat the blade. Mostly useful for amputations and as desperate field surgeons discovered, setting your enemy on fire.',
    't_ui_iconwpnmeleeuniquedirk_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '94e7676c-a4ae-4da3-af7b-f71fa1774389',
    'item_241',
    'Moisture Sealer',
    'Ironically, the Fremen themselves might be the origin of this knife. For moisture sealing caves, they used this Unique knife to quickly seal the plastic hoods against the cave walls. And for removal, they simply reheated the dirk and sliced the melted plastic from the walls.',
    't_ui_iconwpnmeleeuniquedirk_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '06af119f-2d0f-4449-9663-9d6a38ce0179',
    'item_243',
    'Denira''s Gift',
    'Denira Quirth ran a supply depot for the Sandflies for many years, ensuring the flow of spice and other goods to the smugglers, in return for the basic supplies they needed to survive.

This Unique dirk was reportedly a gift from Esmar Tuek himself a product of black-market technology that only a smuggler could access.',
    't_ui_iconwpnmeleeuniquedirk_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ea50ccb2-7f6f-4a3e-89ac-948467bbe7f7',
    'item_244',
    'Searing Shiv',
    'Once there was a slave called Fila. She was captured by slavers while very young and dragged to Arrakis to serve the Harkonnen as a slave. While she lay dreaming in a slaver camp in Jabal Eifrit, disturbed by the spice that she was ingesting from the air, she dreamed of a flaming dirk that could set her free. When she woke, this Unique dirk was in her hand. Fila slew several of her captors, burning them with the knife, before she fled south and disappeared. Though some say, she changed her name to Mendia and her story continued.',
    't_ui_iconwpnmeleeuniquedirkr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '008d3ae3-7eb8-4cad-94b3-01f5f0720a96',
    'item_245',
    'Salusan Vengeance',
    'When Salusa Secundus was reduced from a fertile planet to an irradiated wasteland of a planet, House Corrino swore vengeance on their enemies. This Unique battle rifle was created as a memory of that oath and the explosive darts that it fires are reminiscent of the fires that rained down on Salusa Secundus itself.',
    't_ui_iconwpnuniquear4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a86ffb72-e5aa-4c80-bed3-667b7d7bf27e',
    'item_246',
    'Scrubber',
    'Another weapon liberated from the shipwrecks of the Sheol, this Unique battle rifle has been modified with a mechanism that adds a touch of explosive powder to every dart that passes down the barrel. Perhaps used as protection against smuggler or pirate attacks in the interplanetary shipping lanes.',
    't_ui_iconwpnuniquear3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cc36a0c0-ef13-4139-b61f-4526ae3de8f8',
    'item_247',
    'Pipecleaner',
    'This Unique battle rifle has been modified with a mechanism that adds a touch of explosive powder to every dart that passes down the barrel. The Sandflies use weapons like this to rapidly clear rubble filled tunnels beneath the Sentinel, hence the name.',
    't_ui_iconwpnuniquear2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1bebb505-2e04-4f12-aaff-2d91da86344d',
    'item_248',
    'The Tapper',
    'This Unique battle rifle has been modified with a mechanism that adds a touch of explosive powder to every dart that passes down the barrel. Though ranged weapons are uncommon elsewhere in the Imperium, on Arrakis they have become more prevalent due to the deemphasis on shields.',
    't_ui_iconwpnuniquear1r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1f65c503-9789-4460-9193-e0fcdff67aae',
    'item_249',
    'Indara''s Lullaby',
    'When the War of Assassins came to Arrakis, Indara and her husband, Ardan, were stationed at a small Atreides outpost on the shield wall. As the relentless attacks of the Harkonnens continued, Ardan forced Indara to flee into a nearby cave system with their young child. Nobody knows why this Unique weapon is named for Indara - but there is speculation that she and her child still haunt the caves of the Deep Desert Shield Wall.',
    't_ui_iconwpnuniquear_burst_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1fb76a50-6dde-47d1-a0c5-42a8c472f216',
    'item_250',
    'Mendek''s Rattle',
    'General Mendek was a swordsman all his life, until he was stationed on Arrakis. When he saw the lack of shields among the Fremen, he commissioned a Unique burst shot battle rifle.

''The first shot is for the Baron. The second is for my lady wife. And the last shot is for forcing me to be stationed on this godsforsaken dustbowl.''',
    't_ui_iconwpnuniquear_burst_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '91303e66-5f2e-453b-99d2-513cad47ec00',
    'item_251',
    'Stammershot',
    'A young Atreides engineer with a very bad stutter was routinely ridiculed by his fellows stationed at The Aegis. To reduce his stutter, he began using semuta to help calm his mind. He became an addict, hopelessly enthralled to his semuta supplier — a Harkonnen agent.

This specially modified Unique rifle was the last thing many heard at The Aegis when the young man turned it upon his once-comrades and then himself.',
    't_ui_iconwpnuniquear_burst_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bc49dee7-7924-4a87-8898-c32af362bad6',
    'item_252',
    'Zaal''s Companion',
    'Zaal Karak captured this rifle on a raid into the Vermillius Gap for fresh slaves. He admired the workmanship but chose to reinforce it with more robust materials. Other slavers copied him and now this once-Unique rifle is popular amongst the slavers of the basin.',
    't_ui_iconwpnuniquear_burst_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '212710b3-3f27-4a82-9559-22655d5d1410',
    'item_253',
    'Fila''s Regret',
    'Nobody truly knows who Fila is or was, but it is rumored that she, for a while, was mistress to Aren, a Kirab Warlord. That may explain why this Unique rifle is similar to one wielded by Aren during his final days. But did he create the rifle, or was it the work of the mysterious Fila?',
    't_ui_iconwpnuniquear_burst_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5a036fd1-a303-4463-a06b-468e8ac09d58',
    'item_254',
    'Aren''s Vengeance',
    'When Aren was ousted by the Kirab, he brought some of their technology with him into the Southern basin. This Unique battle rifle is based on a similar Kirab model. Aren''s intention was to eventually lead an army of scavengers north to take vengeance on his old comrades.',
    't_ui_iconwpnuniquear_burst_01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f4cf24ee-418a-4bf7-bc96-808552dad442',
    'item_258',
    'Thermoelectric Cooler',
    'A crafting component used to cool down Harvesting tools used in the Deep Desert. Spare parts are usually found in the Deep Desert on the Shield Wall.',
    't_ui_iconresourcethermoelectriccoolerr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '70d5fdc4-ef15-4bf0-a1b5-ed4ee54e9395',
    'item_264',
    'Solari',
    'Solaris are the currency of the Imperium. Use it to buy goods from vendors. Upon defeat you will drop your Solaris, so be sure to visit a banker in villages to deposit them for safekeeping.',
    't_ui_iconresourcesolariscoinr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd6817093-b663-4e73-bcbd-33b6eb25da13',
    'item_265',
    'Regis Drillshot FK7',
    'Double barrel mid range shotgun that fires "burrow darts". When colliding with an active shield, burrow darts stick to them and penetrate them after a short time, dealing damage to the protected target.',
    't_ui_iconwpn2hsmugshotgun01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3fc73b4b-6e5b-41bb-9e40-69b839b02298',
    'item_268',
    'Adept Drillshot FK7',
    'Double barrel mid range shotgun that fires "burrow darts". When colliding with an active shield, burrow darts stick to them and penetrate them after a short time, dealing damage to the protected target.',
    't_ui_iconwpn2hsmugshotgun01_t5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c6bae8ce-bf56-4603-a41e-dee040a943b1',
    'item_269',
    'House Drillshot FK7',
    'Double barrel mid range shotgun that fires "burrow darts". When colliding with an active shield, burrow darts stick to them and penetrate them after a short time, dealing damage to the protected target.',
    't_ui_iconwpn2hsmugshotgun01_t4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4c264ee2-3666-4534-8b25-3095f09811da',
    'item_270',
    'Regis JABAL Spitdart',
    'Another workhorse of a weapon, the JABAL Spitdart is scoped for long range engagements and fires darts capable of poisoning targets.',
    't_ui_iconwpn2hsmugrifle01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ca336bd4-a546-4255-bde9-bc9d7ba26010',
    'item_271',
    'Adept JABAL Spitdart',
    'Another workhorse of a weapon, the JABAL Spitdart is scoped for long range engagements and fires darts capable of poisoning targets.',
    't_ui_iconwpn2hsmugrifle01_t5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0a18fd79-d149-4a85-af51-2daa3d20ab27',
    'item_272',
    'House JABAL Spitdart',
    'Another workhorse of a weapon, the JABAL Spitdart is scoped for long range engagements and fires darts capable of poisoning targets.',
    't_ui_iconwpn2hsmugrifle01_t4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'eddcf69b-c85a-46cb-b705-8c65f20bc1e6',
    'item_273',
    'Artisan JABAL Spitdart',
    'Another workhorse of a weapon, the JABAL Spitdart is scoped for long range engagements and fires darts capable of poisoning targets.',
    't_ui_iconwpn2hsmugrifle01_t3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dbee15e8-6821-40b0-8630-71cdcc2afd10',
    'item_274',
    'A Dart for Every Man',
    'This Unique disruptor has a small inscription beneath the barrel, beside the makers mark. It reads ''In honor of the Faufreluches — a dart for every man and for every man a dart.'' No matter how often the schematics are modified, this inscription is always fabricated on the weapon.',
    't_ui_iconwpnsmg_unique_largemag_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '61fc77b5-bf4e-4d24-bf81-359c8fcd877e',
    'item_275',
    'Relentless',
    'The Atreides base in the Hagga Basin overlooks the radiated shipwrecks of the Sheol. Sometimes, during the long watches of the night, when a soldier has time to contemplate their life on Arrakis, they take the long elevator down to the sands and disappear into the south. This Unique disruptor is named as an insult to those who would desert their posts — and used against them if they are ever seen again.',
    't_ui_iconwpnsmg_unique_largemag_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4960b701-fd13-45c2-945a-c987807faf8e',
    'item_276',
    'Ironwatch Special',
    'The history of Ironwatch is tied to the fate of the great Ironworks of Vermillius Gap. When they were abandoned, so was Ironwatch. This Unique disruptor is known as an Ironwatch Special because many of them were found stockpiled in the basement when the Sandflies reclaimed the base.',
    't_ui_iconwpnsmg_unique_largemag_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1bc21641-a4bf-41cc-9b15-b445a37e90b5',
    'item_277',
    'Seb''s Kisser',
    'Seb was a veteran of the Kytheria, that came down in the Hagga Rift. With a few survivors, Seb was able to escape the rift and overtake a small slaver cave near the edge of the rift. This Unique high-capacity disruptor was a part of his success — though it is said that he later traded the secret of manufacturing them to Smiley Tyg at the Anvil Tradepost.',
    't_ui_iconwpnsmg_unique_largemag_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '22e48ef0-150e-4858-99c4-203795a3212f',
    'item_278',
    'Legion Tattoo',
    'Smiley Tyg sometimes has special goods that he sells with no questions asked or answered. A few seasons ago, schematics for a Unique high-capacity disruptor — a weapon focused on attacking shields — began to appear in his stock at the Anvil Tradepost. Rumors that they were plundered from a Sardaukar convoy ambushed by Zantara the Lion earned them their moniker as the Legion Tattoo — bolstered by the rhythm they make as they fire.',
    't_ui_iconwpnsmg_unique_largemag_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '017b0711-50fc-4d3f-b0fa-231c2e12a8ce',
    'item_279',
    'Regis Burst Drillshot',
    'An increased capacity makes this Unique Drillshot the anti-shield weapon of choice. An added charge mechanism was added to the base FK7, powering up devastating 2-round bursts of burrow darts.',
    't_ui_iconwpnshotgun_unique_explosive_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bf35839a-be32-4066-b190-7f94bcf7fe1b',
    'item_281',
    'Adept Burst Drillshot',
    'An increased capacity makes this Unique Drillshot the anti-shield weapon of choice. An added charge mechanism was added to the base FK7, powering up devastating 2-round bursts of burrow darts.',
    't_ui_iconwpnshotgun_unique_explosive_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9dc37fa3-72f7-4d0f-b31c-d49bbe5e9dfa',
    'item_282',
    'House Burst Drillshot',
    'An increased capacity makes this Unique Drillshot the anti-shield weapon of choice. An added charge mechanism was added to the base FK7, powering up devastating 2-round bursts of burrow darts.',
    't_ui_iconwpnshotgun_unique_explosive_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd1d3421e-bb47-438a-9d8d-7c0f19a7c15d',
    'item_283',
    'Penetrator',
    'This Unique scattergun fires drilling darts which penetrate slowly through a Holtzman shield and then continue drilling — causing gaping bleeding wounds to the enemy. When the inventor was asked about the juvenile name he simply replied ''I''m all about drilling through defenses and going deep. I also design weapons. Ask your mother.''',
    't_ui_iconwpnshotgun_unique_blood_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '47148aca-03c3-40b3-a82d-f2a5f547be1c',
    'item_284',
    'Scrap Metal Knife',
    'Designed by necessity using whatever is close at hand, many resort to this melee weapon for short-range Blade Damage.',
    't_ui_iconwpnmeleeneutdagger01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6652d5f2-a877-4798-bd63-6306f463e584',
    'item_285',
    'Regis GRDA 44',
    'Heavy for its size, it is highly recommended to hold the GRDA 44 with both hands, despite certain actors portraying its use with one in each hand.',
    't_ui_iconwpn2hchoamscattergun01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '728ec742-8a30-4d7f-87c3-39f91a47aa48',
    'item_286',
    'Adept GRDA 44',
    'Heavy for its size, it is highly recommended to hold the GRDA 44 with both hands, despite certain actors portraying its use with one in each hand.',
    't_ui_iconwpn2hchoamscattergun01_t5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2e8ed342-06d0-4b85-a890-3104f5185c62',
    'item_287',
    'House GRDA 44',
    'Heavy for its size, it is highly recommended to hold the GRDA 44 with both hands, despite certain actors portraying its use with one in each hand.',
    't_ui_iconwpn2hchoamscattergun01_t4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3659b506-2e5d-40a2-83d8-1bd17560a9f1',
    'item_288',
    'Artisan GRDA 44',
    'Heavy for its size, it is highly recommended to hold the GRDA 44 with both hands, despite certain actors portraying its use with one in each hand.',
    't_ui_iconwpn2hchoamscattergun01_t3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ff35e245-7e1d-4bc9-87b8-4d6ebcf4078c',
    'item_289',
    'Standard GRDA 44',
    'Heavy for its size, it is highly recommended to hold the GRDA 44 with both hands, despite certain actors portraying its use with one in each hand. A Great House item.',
    't_ui_iconwpn2hchoamscattergun01_t2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0b46c093-ede1-400d-ab53-6bdaaca2f4f9',
    'item_293',
    'The Ancient Way',
    'When Holtzman shields became widely available, the use of artillery in warfare dramatically reduced. During the Battle of Arrakeen, the Baron Harkonnen brought them back, using heavy rockets to seal Atreides soldiers in caves, thus avoiding the problem of Holtzman shields entirely. Since then, these Unique missile launchers have become widely sought after by Fremen and Imperial troops alike.',
    't_ui_iconwpnrocketlauncher_unique_homing_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '83b900c3-17d0-4e59-a3a5-0dbd09a4aea8',
    'item_294',
    'Precision Range Finder',
    'A Weapon crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceprecisionrangefinderr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4a811e9c-2ed4-4806-8f5b-8ca9b050953d',
    'item_296',
    'Range Finder',
    'Unsurprisingly, if you want to acquire a range-finder, look for sharpshooters. But remember, if you can see them, they can probably see you.',
    't_ui_iconresourcerangefinderr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'aae6fdc8-33c4-4d22-a7b5-da40ce5d18c8',
    'item_311',
    'Sandflies Carver',
    'Optimized for the operations of the Sandflies, this Unique cutteray lasts longer than a regular cutteray and delivers increased yields of aluminum.',
    't_ui_icontoolminingtool_2h_unique_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '440cd2c1-1535-4db1-b549-65114733842b',
    'item_312',
    'Callie''s Breaker',
    'Callie worked the great galleries of the rift, until the Kytheria crashed and the war escalated into the caverns. She joined the deserters, carving tunnels through the old mining galleries using her trusty buggy and her favorite tool. Callie was lost when one of the tunnels she was opening collapsed beneath her, but her Uniquetool was retrieved.',
    't_ui_icontoolminingtool_2h_unique_01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5ee334e4-959f-4715-a082-b6b9a362c365',
    'item_317',
    'Olef''s Quickcutter',
    'When Olef was assigned to the great ironworks in Vermillius Gap, he didn''t despair. He saw opportunity amongst the spires of stone — a lot of thirsty miners and nowhere to drink. He started stealing supplies and set up his own little after-hours establishment selling spice-laced moonshine. Before long, he was so busy he had no time to fill his mining quotas. He had a drunk engineer create this Unique cutteray to help him stay afloat.',
    't_ui_icontoolminingtool_1h_unique_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '48ae8013-d0c6-44a8-a009-55993ed4227d',
    'item_318',
    'Sim''s Cutter',
    'When the mining facilities were abandoned in the Vermillius Gap, Sim and his fellow miners decided to try their luck as scavengers. Sim ''borrowed'' a Unique cutteray from the ironworks, discovering too late that it was tuned for increased Granite, Copper and Salvage yields and only had basic Iron yields. ''Oh the iron-y'' Sim was heard to exclaim.',
    't_ui_icontoolminingtool_1h_unique_01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4f454bf5-f4d9-4ad6-8a29-43b5590f0409',
    'item_322',
    'Dunewatcher',
    'Fremen warriors modified these Unique rifles and used them in their relentless guerilla campaign against the Harkonnen. A single Fremen could remain, near buried and practically invisible in the sand dunes beside a spice blow, awaiting their chance at Harkonnen prey. These warriors were called Dunewatchers.',
    't_ui_iconwpnlongrifle_unique_poison_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '72b1bb7c-03ea-4642-8962-a848f89ad97b',
    'item_323',
    'Thufir''s Best',
    'Piter de Vries and Thufir Hawat are both trained assassins as well as Mentats. In the few instances where their masters must meet under a sign of truce, both men are responsible for the security of their lords beneath the Guild Peace. The soldiers who oversee these meetings are equipped with this Unique rifle and placed at strategic locations. They have steady hands and a calm demeanor — anything else could quickly lead to disaster.',
    't_ui_iconwpnlongrifle_unique_poison_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '494fadc2-a8b7-44d9-b763-73fe2b8ebaa7',
    'item_324',
    'Long Shot',
    'This Unique rifle was named for an assassin who was paid a huge sum by the Atreides to take down the Beast Rabban. Witnesses say that the shot was perfect — lodging a poison dart deep into Rabban''s neck — and that he laughed and pulled it out while his bodyguard swarmed the assassin.',
    't_ui_iconwpnlongrifle_unique_poison_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bb35ca66-b180-4965-87af-6b334c57abd8',
    'item_328',
    'Bashar''s Command',
    'This Unique machine gun is considered so effective at cowing the populace during wars, it is often placed on display in local population centers as a threat. However, the Sardaukar prefer not to carry such bulky weapons into conflict, and will only do so at a Bashar''s Command.',
    't_ui_iconwpnlmg_unique_rapidfire_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '234da06b-eb63-44d6-baf6-1dfbfe031e1f',
    'item_330',
    'Experimental Vulcan GAU-94',
    'Developed in the warfare labs of House Thorvald, this Unique Vulcan gun uses new materials science to strip weight and replace it with capacity. Though highly sought after, these guns are experimental and banned from CHOAM export. How this arrived on Arrakis, is a mystery.',
    't_ui_iconwpnlmg_unique_rapidfire_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9e7411b2-69c6-4505-ad17-90445c7f04f5',
    'item_331',
    'Plasma Cannon',
    'Originally designed to fire a steady stream of blue orbs at hellish foes, this Unique plasma gun tears imps to shreds and rips Arch-viles and Cacodemons apart. Oh... I''ve just been informed this text is for DUNE not DOOM. Ignore me then.',
    't_ui_iconwpnlmg_unique_power_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '60ce73cc-ccdc-4014-a701-ff0b8a04ce3b',
    'item_332',
    'Replica Pulse-knife',
    'During the Butlerian Jihad, pulse-blades were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when hitting an enemy — offering a small stamina boost. A far cry from the legendary weapons of the Butlerian Jihad.',
    't_ui_iconwpnmeleekindjal_unique_stamina_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0bb8be6-65de-4786-a112-ffe35128545b',
    'item_333',
    'Jolt-knife',
    'During the Butlerian Jihad, pulse-blades were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when hitting an enemy — offering a small stamina boost. A far cry from the legendary weapons of the Butlerian Jihad.',
    't_ui_iconwpnmeleekindjal_unique_stamina_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1acef9c6-8e7b-4030-8cf5-5b2b74e39472',
    'item_334',
    'Spark-Knife',
    'During the Butlerian Jihad, pulse-blades were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when hitting an enemy — offering a small stamina boost. A far cry from the legendary weapons of the Butlerian Jihad.',
    't_ui_iconwpnmeleekindjal_unique_stamina_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '15bbe758-6a46-4bca-9a5e-1c87df586c3e',
    'item_335',
    'Shock-Knife',
    'During the Butlerian Jihad, pulse-blades were used to cut through the thinking machines and damage their electronics with pulses of deadly electricity. It is said that the secret of their making was lost during the ensuing centuries.

This Unique blade gives a small jolt of electrical energy to the palms when hitting an enemy — offering a small stamina boost. A far cry from the legendary weapons of the Butlerian Jihad.',
    't_ui_iconwpnmeleekindjal_unique_stamina_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c4453566-1929-4547-806d-95a845751a00',
    'item_336',
    'Feyd''s Drinker',
    'Commonly used in his black-gloved main-hand during arena bouts, Feyd-Rautha Harkonnen had a small compartment designed that could deliver poison - though usually it was the white-gloved off-hand that carried the poisoned blade. Though most never knew of his treachery, this Unique kindjal became popular on Arrakis for the opposite reason, it was capable of stealing blood from enemies and storing it in the compartment.',
    't_ui_iconwpnmeleekindjal_unique_blood_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '24c720de-1097-47ed-af09-a14d279706f2',
    'item_337',
    'Pardot''s Drinker',
    'Pardot Kynes first came into contact with the Fremen by killing three Harkonnen bravos who were attacking Fremen youth. Kynes lamented violence — not the act, but the loss of blood and thus, precious water, it incurred. He developed this Unique kindjal simply because if he was forced to kill others, he didn''t want it to be wasteful.',
    't_ui_iconwpnmeleekindjal_unique_blood_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '56b8ddac-0029-4ee0-8b9e-1961644ba624',
    'item_338',
    'Shadrath''s Drinker',
    'This Unique kindjal was used as an off-hand weapon by the Fremen warrior Shadrath in his campaign against the Sardaukar. Though a Fremen would never be far from their crysknife, a secondary blade can help to stay alive, particularly if it serves the function of capturing water during fights.',
    't_ui_iconwpnmeleekindjal_unique_blood_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '95806107-958b-4d21-955a-7e2b2035c7f8',
    'item_339',
    'Glutton''s Drinker',
    'This Unique kindjal slurps up blood as it cuts — thoroughly suitable for the mysterious entity known only as the Glutton. Though few have claimed to see him in person, the wounds left by this knife are unmistakable.',
    't_ui_iconwpnmeleekindjal_unique_blood_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c220c675-1aa7-488a-b499-e9f823154b4d',
    'item_340',
    'Scipio''s Drinker',
    'Scipio the warlord liked to draw blood from his enemies during torture. He created this Unique kindjal based on one he had stolen in the Southern Hagga Basin. Made of more advanced materials, this kindjal works on the same principle — small grooves feed blood into the hilt which can be emptied into a waiting container.',
    't_ui_iconwpnmeleekindjal_unique_blood_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '85242f7d-09d5-440e-a9ed-03ad3ff91d75',
    'item_341',
    'Kaleff''s Drinker',
    'Cornered in a cave by Sardaukar forces, Kaleff managed to stay alive for weeks without a water source, only emerging to draw blood from his enemies. When he was finally killed, the Sardaukar discovered this Unique kindjal modified to include an exsanguination apparatus.',
    't_ui_iconwpnmeleekindjal_unique_blood_01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '271effc3-a18a-4311-a84e-c9e0daae2f3b',
    'item_348',
    'Missile',
    'A missile projectile that is typically utilized by infantry missile launchers.',
    't_ui_iconresourcehandguidedmissiler_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f6a73308-55ab-499a-9a01-fc7ba25333f7',
    'item_349',
    'Seethe',
    'This Unique pistol comes with increased accuracy and bonus damage for headshots, but with a low capacity clip.',
    't_ui_iconwpnheavypistol_unique_headshot_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e5ed7716-935d-4c86-b251-5594b047de11',
    'item_350',
    'Cope',
    'This Unique pistol comes with increased accuracy and bonus damage for headshots, but with a low capacity clip.',
    't_ui_iconwpnheavypistol_unique_headshot_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8cd32e0d-cd45-40c5-9b3c-b83a4b1594ce',
    'item_356',
    'Regis Rafiq Snubnose',
    'There is a Rafiq Snubnose Pistol in the cabinet by the bed of Count Daran of Ishkal. His wife is unaware and would disapprove.',
    't_ui_iconwpn2hharkpistol01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '957b7ca3-a3cb-4e5e-bf51-e1f40b088353',
    'item_357',
    'Adept Rafiq Snubnose',
    'There is a Rafiq Snubnose Pistol in the cabinet by the bed of Count Daran of Ishkal. His wife is unaware and would disapprove.',
    't_ui_iconwpn2hharkpistol01_t5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '16e449de-764e-41bb-b980-5ef7db1d7a65',
    'item_358',
    'House Rafiq Snubnose',
    'There is a Rafiq Snubnose Pistol in the cabinet by the bed of Count Daran of Ishkal. His wife is unaware and would disapprove.',
    't_ui_iconwpn2hharkpistol01_t4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '67a08216-908f-4217-8d8f-50c348fe485a',
    'item_359',
    'Artisan Rafiq Snubnose',
    'There is a Rafiq Snubnose Pistol in the cabinet by the bed of Count Daran of Ishkal. His wife is unaware and would disapprove.',
    't_ui_iconwpn2hharkpistol01_t3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4559b20f-e8aa-40f1-a437-616d82541711',
    'item_360',
    'Regis Karpov 38',
    'State-of-the-art assault weapon and status notifier in mercenary and other parastate military circles.',
    't_ui_iconwpn2hharkrifle01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cc46a5dd-4847-44ac-9083-c3aed38694bf',
    'item_361',
    'Adept Karpov 38',
    'State-of-the-art assault weapon and status notifier in mercenary and other parastate military circles.',
    't_ui_iconwpn2hharkrifle01_t5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1034a5e5-d40b-430f-b795-6a86c0d760ff',
    'item_362',
    'House Karpov 38',
    'State-of-the-art assault weapon and status notifier in mercenary and other parastate military circles.',
    't_ui_iconwpn2hharkrifle01_t4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99ab6b3d-a3a1-42c7-92e4-6aff0ff986ad',
    'item_363',
    'Artisan Karpov 38',
    'The new version came out in the 70s during a particularly garish fashion season and this model has since been tainted by a look that is now considered quite out-of-style.',
    't_ui_iconwpn2hharkrifle01_t3r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c1b6ca3b-baf3-40e3-bc0f-e055b51383fe',
    'item_364',
    'Standard Karpov 38',
    'Anton Karpov continued to make incremental improvements on what is widely considered a perfect design.',
    't_ui_iconwpn2hharkrifle01_t2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '21875f69-e537-4f8f-9df3-a7749c59dcf2',
    'item_365',
    'Karpov 38',
    'The standard Great House assault rifle for more than a hundred years, the Karpov 38 shone due to its simple design and very low maintenance needs.',
    't_ui_iconwpn2hharkrifle01_t1r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8d165aea-cea9-4b2c-b55a-285ddfd874f8',
    'item_367',
    'Glasser',
    'A Unique item. Little known fact: Jared Garoti was a notorious pyromaniac in his early years and nearly burnt his ancestral home to the ground building one of his creations.',
    't_ui_iconwpnflamethrower_prototype_2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '11bb9110-3a53-4e47-860f-f46e0bb0ad00',
    'item_368',
    'Scorchbolt',
    'A Unique item. Little known fact: Jared Garoti was a notorious pyromaniac in his early years and nearly burnt his ancestral home to the ground building one of his creations.',
    't_ui_iconwpnflamethrower_prototyper_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4a3fbc7d-ece6-4e63-9cc6-1c5693aa268d',
    'item_373',
    'Buoyant Reaper Mk6',
    'Crafted to the same general standards of other Dew Reapers, this particular design was modified by Thufir Hawat to ease the lives of the Atreides pyons. This Unique Dew Reaper siphons a portion of the Holtzman field that powers the collection of dew to lighten the Dew Reaper itself, allowing an easier swing, lighter load and more efficiency in the long run.',
    't_ui_icontooldewreaper_unique_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '50469ee5-a51b-4de8-8ae8-47a08a26f2fd',
    'item_374',
    'Buoyant Reaper Mk5',
    'Crafted to the same general standards of other Dew Reapers, this particular design was modified by Thufir Hawat to ease the lives of the Atreides pyons. This Unique Dew Reaper siphons a portion of the Holtzman field that powers the collection of dew to lighten the Dew Reaper itself, allowing an easier swing, lighter load and more efficiency in the long run.',
    't_ui_icontooldewreaper_unique_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b715296a-46bc-4eb0-aad1-76a1e318ef0d',
    'item_375',
    'Buoyant Reaper Mk4',
    'Crafted to the same general standards of other Dew Reapers, this particular design was modified by Thufir Hawat to ease the lives of the Atreides pyons. This Unique Dew Reaper siphons a portion of the Holtzman field that powers the collection of dew to lighten the Dew Reaper itself, allowing an easier swing, lighter load and more efficiency in the long run.',
    't_ui_icontooldewreaper_unique_03r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fb61818b-ac3c-4fb1-b5f4-3fdd63f97672',
    'item_376',
    'Buoyant Reaper Mk3',
    'Crafted to the same general standards of other Dew Reapers, this particular design was modified by Thufir Hawat to ease the lives of the Atreides pyons. This Unique Dew Reaper siphons a portion of the Holtzman field that powers the collection of dew to lighten the Dew Reaper itself, allowing an easier swing, lighter load and more efficiency in the long run.',
    't_ui_icontooldewreaper_unique_02r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd479afe6-5b9b-4f22-9aa7-3b68c2bd2a28',
    'item_377',
    'Buoyant Reaper Mk2',
    'Crafted to the same general standards of other Dew Reapers, this particular design was modified by Thufir Hawat to ease the lives of the Atreides pyons. This Unique Dew Reaper siphons a portion of the Holtzman field that powers the collection of dew to lighten the Dew Reaper itself, allowing an easier swing, lighter load and more efficiency in the long run.',
    't_ui_icontooldewreaper_unique_01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '98bd2fef-03c4-4890-9854-45ff6d420d5e',
    'item_379',
    'Dew Reaper Mk2',
    'Fremen device used on dew bearing primrose flowerfields at dawn to harvest water into a literjon or water tank. Depletes power when used.',
    't_ui_icontoolchoamdewreaper01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f4e4e02d-1226-4695-ac8e-58d37884a3d4',
    'item_380',
    'Omni Focused Dew Scythe',
    'An alteration to the mechanisms in this Unique dew scythe allow it to gather more moisture from plants at the cost of a reduced gathering area.',
    't_ui_icontooldewreaper_2h_unique_yieldincrease_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fbff27c6-5db1-4cd0-8d4e-88f5a3a457db',
    'item_381',
    'Focused Reaper Mk5',
    'An alteration to the mechanisms in this Unique dew scythe allow it to gather more moisture from plants at the cost of a reduced gathering area.',
    't_ui_icontooldewreaper_2h_unique_yieldincrease_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7b8f2c54-81fb-4947-a31e-e85d97a17ada',
    'item_382',
    'Dew Scythe Mk6',
    'Fremen device used on dew bearing primrose flowerfields at dawn to harvest water into a literjon or water tank. Depletes power when used.',
    't_ui_icontool1hchoamdewreapert6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a551b404-3feb-4edf-af23-945b194b0657',
    'item_383',
    'Collapsible Dew Reaper Mk6',
    'This Unique dew reaper can collapse down into an extremely small size, reducing the amount of space it occupies in inventories.',
    't_ui_icontooldewreaper_1h_unique_compact_06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '06acc757-637e-4bd9-a5eb-53f5c4d910f1',
    'item_384',
    'Collapsible Dew Reaper Mk5',
    'This Unique dew reaper can collapse down into an extremely small size, reducing the amount of space it occupies in inventories.',
    't_ui_icontooldewreaper_1h_unique_compact_05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '76023536-1666-4426-986e-3b515b50c8b3',
    'item_385',
    'Collapsible Dew Reaper Mk4',
    'This Unique dew reaper can collapse down into an extremely small size, reducing the amount of space it occupies in inventories.',
    't_ui_icontooldewreaper_1h_unique_compact_04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ac9c896a-78fd-4754-a213-10a8af189883',
    'item_386',
    'Dew Reaper Mk6',
    'Fremen device used on dew bearing primrose flowerfields at dawn to harvest water into a literjon or water tank. Depletes power when used.',
    't_ui_icontoolchoamdewreapertier6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'eac9a961-efc0-4aa3-99a8-5c6712796d9d',
    'item_387',
    'Dew Reaper Mk4',
    'Fremen device used on dew bearing primrose flowerfields at dawn to harvest water into a literjon or water tank. Depletes power when used.',
    't_ui_icontoolchoamdewreaper01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4c31da7f-cd42-4ca1-b36c-b6c418c305bf',
    'item_400',
    'Black Market K-28 Lasgun',
    'Though the Imperium has forbidden the import of lasguns without a safety mechanism, there are other alternatives for bringing a lasgun to Arrakis. The smugglers have access to an entire offworld arsenal of lasguns that do not include the safety mechanisms put in place by the Landsraad council.
Unfortunately, this Unique lasgun is not one of them. It''s just a regular lasgun with the serial numbers filed off.',
    't_ui_iconwpnchoamlg2r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '41885830-301b-4981-9087-ce263340f835',
    'item_401',
    'Arhun K-28 Lasgun',
    'When a lasgun contacted a hot shield in Carthag, it was a disaster. Thousands died in the ensuing nuclear blast and the city was leveled.

Due to the devastating loss of life and spice production capacity, all lasguns imported to Arrakis are now fitted with a safety mechanism that immediately shuts them off if they are targeting a Holtzman shield, including this Unique model.',
    't_ui_iconwpnchoamlg1r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '29d255ca-b00b-45ad-9dbd-9b5585901d95',
    'item_421',
    'Regis Vulcan GAU-92',
    'A light machine gun that sports a large capacity magazine and a high fire rate. Used for crowd control against multiple opponents.',
    't_ui_iconwpn2hatrelmg01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '16423c3b-eab9-4f90-b4c5-26f332ea9236',
    'item_422',
    'Adept Vulcan GAU-92',
    'A light machine gun that sports a large capacity magazine and a high fire rate. Used for crowd control against multiple opponents.',
    't_ui_iconwpn2hatrelmg01_t5r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 600/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ad723d1d-8bb8-4f96-b57a-121e9b418f77',
    'item_423',
    'House Vulcan GAU-92',
    'A light machine gun that sports a large capacity magazine and a high fire rate. Used for crowd control against multiple opponents.',
    't_ui_iconwpn2hatrelmg01_t4r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'beeb0486-ebb3-400a-9536-a8122337ec67',
    'item_425',
    'Unfixed Crysknife',
    'The Unfixed Crysknife is made from a sandworm''s tooth and is very brittle. Cannot leave the owner''s person.',
    't_ui_iconwpnmeleefremcrysknife01r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f4e2dcdf-cf32-4b4d-b9f2-793983f32136',
    'item_426',
    'Worm Tooth',
    'A crafting component obtained from dying to the sandworm. Can be used to craft an unfixed crysknife.',
    't_ui_iconresourcegiantsandwormtoothr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '451370c2-7e3a-47f5-85c0-c58ecadcd80a',
    'item_427',
    'Ambition',
    'A {Unique} shotgun with an ambitious design that holds two slugs in each barrel to limit the downsides of these types of weapons.',
    't_ui_iconwpn2hsmugshotgun01_t6r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b6cdb635-f46f-4dba-b062-d3edbf0c673f',
    'item_432',
    'Rattler Boost Module Mk3',
    'Named for the cool-blooded snakes of old earth and the inevitable shaking and rattling that comes when it is engaged, this Unique boost module generates less heat, but like the snake it is named for, is a little more sluggish when cool.',
    't_ui_iconvehccbboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a719cc5b-898b-4d28-8b34-43d2c95fbd4d',
    'item_433',
    'Rattler Boost Module Mk4',
    'Named for the cool-blooded snakes of old earth and the inevitable shaking and rattling that comes when it is engaged, this Unique boost module generates less heat, but like the snake it is named for, is a little more sluggish when cool.',
    't_ui_iconvehccbboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7741fb37-578f-4414-b6e4-e4de8a4fcf62',
    'item_434',
    'Rattler Boost Module Mk5',
    'Named for the cool-blooded snakes of old earth and the inevitable shaking and rattling that comes when it is engaged, this Unique boost module generates less heat, but like the snake it is named for, is a little more sluggish when cool.',
    't_ui_iconvehccbboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '828dfabc-36b5-4bba-b5d8-002aa9ccf6c3',
    'item_435',
    'Rattler Boost Module Mk6',
    'Named for the cool-blooded snakes of old earth and the inevitable shaking and rattling that comes when it is engaged, this Unique boost module generates less heat, but like the snake it is named for, is a little more sluggish when cool.',
    't_ui_iconvehccbboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9738c905-df14-4dfa-b4bf-167e1a3e82f6',
    'item_441',
    'Complex Machinery',
    'Ironically, these components are found in many older fabricators and refineries, but cannot themselves be easily fabricated.',
    't_ui_iconresourcecomplexmachineryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4f7ee0b5-893e-4eb0-b63a-650e6e52ce86',
    'item_451',
    'Advanced Machinery',
    'An Infrastructure crafting component used in plastanium tier crafting. Can be found in the Deep Desert, obtained from Landsraad rewards, or crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceadvancedmachineryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '93665a3f-4e3e-4ad5-a3ab-ea8683142770',
    'item_452',
    'Buggy PSU Mk3',
    'Defines the power efficiency and manages the heat dissipation of the Buggy. Use a Welding Torch to attach the PSU to a Buggy chassis.',
    't_ui_iconvehccbpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8f66188b-c3d2-46d9-9a8a-62f18287b3fd',
    'item_453',
    'Buggy PSU Mk4',
    'Defines the power efficiency and manages the heat dissipation of the Buggy. Use a Welding Torch to attach the PSU to a Buggy chassis.',
    't_ui_iconvehccbpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ee8b745-1bb6-43a5-a283-e10864b23d77',
    'item_454',
    'Buggy PSU Mk5',
    'Defines the power efficiency and manages the heat dissipation of the Buggy. Use a Welding Torch to attach the PSU to a Buggy chassis.',
    't_ui_iconvehccbpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9b09cb46-d15f-4180-8a42-4e1a75ae8d21',
    'item_456',
    'Buggy PSU Mk6',
    'Defines the power efficiency and manages the heat dissipation of the Buggy. Use a Welding Torch to attach the PSU to a Buggy chassis.',
    't_ui_iconvehccbpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd49c560b-1a76-42d9-a1a9-bb4f024de4dd',
    'item_458',
    'Buggy Rear Mk3',
    'Comes with two passenger seats. Use a Welding Torch to attach the rear hull to a Buggy Chassis.',
    't_ui_iconvehccbbodyr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1dc8b40d-b038-4b4d-986d-5ea5e81e1452',
    'item_460',
    'Buggy Rear Mk4',
    'Comes with two passenger seats. Use a Welding Torch to attach the rear hull to a Buggy Chassis.',
    't_ui_iconvehccbbodyr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '040e6d06-862b-4f13-83a4-1acdd6bd9cfb',
    'item_461',
    'Buggy Rear Mk5',
    'Comes with two passenger seats. Use a Welding Torch to attach the rear hull to a Buggy Chassis.',
    't_ui_iconvehccbbodyr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '02aab463-435b-45fe-a99d-a3177121f3df',
    'item_462',
    'Buggy Rear Mk6',
    'Comes with two passenger seats. Use a Welding Torch to attach the rear hull to a Buggy Chassis.',
    't_ui_iconvehccbbodyr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a5feed5b-1d61-4b72-8181-e05f69525adf',
    'item_464',
    'Buggy Utility Rear Mk3',
    'Comes with a turret seat. Use a Welding Torch to attach the rear utility hull to a Buggy Chassis.',
    't_ui_iconvehccbturrethullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0195ca6c-ba2c-4868-9cee-3fb8f578559a',
    'item_465',
    'Buggy Utility Rear Mk4',
    'Comes with a turret seat. Use a Welding Torch to attach the rear hull to a Buggy Chassis.',
    't_ui_iconvehccbturrethullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ed47cc82-a404-47e4-9f13-960c37d4256c',
    'item_466',
    'Buggy Utility Rear Mk5',
    'Comes with a turret seat. Use a welding torch to attach the rear hull to the chassis.',
    't_ui_iconvehccbturrethullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8bda044c-5083-4baa-ac15-2b9b44c0355e',
    'item_467',
    'Buggy Utility Rear Mk6',
    'Comes with a turret seat. Use a welding torch to attach the rear hull to the chassis.',
    't_ui_iconvehccbturrethullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'af8edd28-544b-48f8-8df9-e6c4ba78bedd',
    'item_476',
    'Bigger Buggy Boot Mk3',
    'Sometimes the engineers who design an interesting concept are also the ones who name it. This Unique storage extension for the four man groundcar or ''buggy'' allows the transport of more inventory. Just try not to snigger at the name.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'af732b1e-6c7b-4d5d-bf42-1163e1d0992a',
    'item_477',
    'Bigger Buggy Boot Mk4',
    'Sometimes the engineers who design an interesting concept are also the ones who name it. This Unique storage extension for the four man groundcar or ''buggy'' allows the transport of more inventory. Just try not to snigger at the name.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c5292d3b-562d-44ce-8de0-f3ddfdd8002f',
    'item_478',
    'Bigger Buggy Boot Mk5',
    'Sometimes the engineers who design an interesting concept are also the ones who name it. This Unique storage extension for the four man groundcar or ''buggy'' allows the transport of more inventory. Just try not to snigger at the name.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ceb8ae5c-11e2-4bfc-8fbd-a81dd6369e3d',
    'item_479',
    'Bigger Buggy Boot Mk6',
    'Sometimes the engineers who design an interesting concept are also the ones who name it. This Unique storage extension for the four man groundcar or ''buggy'' allows the transport of more inventory. Just try not to snigger at the name.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '34f9ab9e-8929-4ed4-b98d-e5c86f57f3ee',
    'item_497',
    'Stormrider Boost Module Mk4',
    'Though the sandstorms of Arrakis have been known to reach 700km an hour and tear metal to shreds, still there are those who insist on trying to boost through them. This Unique boost module has a larger air intake to avoid dust clogging - it keeps the ''thopter cool but at a cost of overall boost speed.',
    't_ui_iconvehcolboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4939c3ad-2f19-4b34-97a2-2cd651be3ad1',
    'item_498',
    'Stormrider Boost Module Mk5',
    'Though the sandstorms of Arrakis have been known to reach 700km an hour and tear metal to shreds, still there are those who insist on trying to boost through them. This Unique boost module has a larger air intake to avoid dust clogging - it keeps the ''thopter cool but at a cost of overall boost speed.',
    't_ui_iconvehcolboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0236ae5a-cd53-4ab3-8f48-7d847fcd18f1',
    'item_499',
    'Stormrider Boost Module Mk6',
    'Though the sandstorms of Arrakis have been known to reach 700km an hour and tear metal to shreds, still there are those who insist on trying to boost through them. This Unique boost module has a larger air intake to avoid dust clogging - it keeps the ''thopter cool but at a cost of overall boost speed.',
    't_ui_iconvehcolboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0f05dac9-bf29-4bc0-bf6a-50f07ec106bf',
    'item_524',
    'Scout Ornithopter Scan Module',
    'Adds a scan ability to the Ornithopter. Use a Welding Torch to attach it to the cockpit.',
    't_ui_iconvehcomscannerr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b3d0e87d-51c5-4649-8409-5cdab848ca18',
    'item_527',
    'Steady Assault Boost Module Mk5',
    'This Unique boost provides a steady boost at a lower maximum speed, proving the adage "slow and steady wins the race." On Arrakis, natives tend to modify it slightly saying "only if you have enough fuel and the worm is very far away."',
    't_ui_iconvehcmoboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8d282ec1-2e57-48bc-8c7e-6f4cca8be70b',
    'item_528',
    'Steady Assault Boost Module Mk6',
    'This Unique boost provides a steady boost at a lower maximum speed, proving the adage "slow and steady wins the race." On Arrakis, natives tend to modify it slightly saying "only if you have enough fuel and the worm is very far away."',
    't_ui_iconvehcmoboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '97510131-4f73-4cdf-b311-83fc218f253e',
    'item_549',
    'Steady Carrier Boost Module Mk6',
    'This Unique boost provides a steady boost at a lower maximum speed, proving the adage "slow and steady wins the race." On Arrakis, natives tend to modify it slightly saying "only if you have enough fuel and the worm is very far away."',
    't_ui_iconvehctothrusterr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ad9f1ce0-9f13-41fa-94ca-00dd35c141ff',
    'item_563',
    'Night Rider Sandbike Boost Mk2',
    'This Unique booster comes with an extra large air intake for better performance during the cool evening on Arrakis, though it helps very little during the superheated air of the day. Standard gear amongst the Dunemen who prefer to work by night.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9d237167-e8a0-43b0-a241-ab770bb435e6',
    'item_564',
    'Night Rider Sandbike Boost Mk3',
    'This Unique booster comes with an extra large air intake for better performance during the cool evening on Arrakis, though it helps very little during the superheated air of the day. Standard gear amongst the Dunemen who prefer to work by night.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4de9a8e8-7088-42f9-a973-3ad02455725c',
    'item_565',
    'Night Rider Sandbike Boost Mk4',
    'This Unique booster comes with an extra large air intake for better performance during the cool evening on Arrakis, though it helps very little during the superheated air of the day. Standard gear amongst the Dunemen who prefer to work by night.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '469d4856-5910-48a9-8003-6bf501a66771',
    'item_566',
    'Night Rider Sandbike Boost Mk5',
    'This Unique booster comes with an extra large air intake for better performance during the cool evening on Arrakis, though it helps very little during the superheated air of the day. Standard gear amongst the Dunemen who prefer to work by night.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5cf2f5a8-4ab4-4b84-843c-66ec6f9ff917',
    'item_567',
    'Night Rider Sandbike Boost Mk6',
    'This Unique booster comes with an extra large air intake for better performance during the cool evening on Arrakis, though it helps very little during the superheated air of the day. Standard gear amongst the Dunemen who prefer to work by night.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5b2311d5-867f-495d-b1af-ccda260951a3',
    'item_586',
    'Sandbike PSU Mk1',
    'Defines the power efficiency and controls the heat dissipation of the Sandbike. Use a welding torch to attach the power supply unit to a Sandbike Chassis.',
    't_ui_iconvehch1mgcpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '79fc9572-4efb-49af-af90-5c34776e35b4',
    'item_587',
    'Sandbike PSU Mk2',
    'Defines the power efficiency and controls the heat dissipation of the Sandbike. Use a welding torch to attach the power supply unit to a Sandbike Chassis.',
    't_ui_iconvehch1mgcpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0a23f820-06c7-4ba0-941a-2e614c6ce1e5',
    'item_588',
    'Sandbike PSU Mk3',
    'Defines the power efficiency and controls the heat dissipation of the Sandbike. Use a welding torch to attach the power supply unit to a Sandbike Chassis.',
    't_ui_iconvehch1mgcpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4996a5cf-4027-4f5d-b2d4-444f67aca4cf',
    'item_589',
    'Sandbike PSU Mk4',
    'Defines the power efficiency and controls the heat dissipation of the Sandbike. Use a welding torch to attach the power supply unit to a Sandbike Chassis.',
    't_ui_iconvehch1mgcpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c794bca-2a3c-4a21-947d-44d97d049181',
    'item_590',
    'Sandbike PSU Mk5',
    'Defines the power efficiency and controls the heat dissipation of the Sandbike. Use a welding torch to attach the power supply unit to a Sandbike Chassis.',
    't_ui_iconvehch1mgcpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ea8cc412-d6a3-4e7a-9a8a-53f61d6c39bf',
    'item_591',
    'Sandbike PSU Mk6',
    'Defines the power efficiency and controls the heat dissipation of the Sandbike. Use a welding torch to attach the power supply unit to a Sandbike Chassis.',
    't_ui_iconvehch1mgcpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ecda9d0c-e7e2-42af-b70e-be57b71af5aa',
    'item_592',
    'Sandbike Hull Mk1',
    'Protects the inner mechanisms of the Sandbike and provides seating for the driver. Use a Welding Torch to attach the hull to a Sandbike Chassis.',
    't_ui_iconvehch1mgchullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'da3af798-465f-410c-b5d3-c4b5167a95a1',
    'item_593',
    'Sandbike Hull Mk2',
    'Protects the inner mechanisms of the Sandbike and provides seating for the driver. Use a Welding Torch to attach the hull to a Sandbike Chassis.',
    't_ui_iconvehch1mgchullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5dfb107e-d243-40f2-be0b-920cb3938cd4',
    'item_594',
    'Sandbike Hull Mk3',
    'Protects the inner mechanisms of the Sandbike and provides seating for the driver. Use a Welding Torch to attach the hull to a Sandbike Chassis.',
    't_ui_iconvehch1mgchullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cc6fcac9-0ceb-48d3-b59c-223c31a989e9',
    'item_595',
    'Sandbike Hull Mk4',
    'Protects the inner mechanisms of the Sandbike and provides seating for the driver. Use a Welding Torch to attach the hull to a Sandbike Chassis.',
    't_ui_iconvehch1mgchullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '56cfcda7-49c9-4c10-9fd6-4c6064969c37',
    'item_596',
    'Sandbike Hull Mk5',
    'Protects the inner mechanisms of the Sandbike and provides seating for the driver. Use a Welding Torch to attach the hull to a Sandbike Chassis.',
    't_ui_iconvehch1mgchullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b84bdf0c-bb03-4dec-b68f-2ba90ae57332',
    'item_597',
    'Sandbike Hull Mk6',
    'Protects the inner mechanisms of the Sandbike and provides seating for the driver. Use a Welding Torch to attach the hull to a Sandbike Chassis.',
    't_ui_iconvehch1mgchullr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3bf35b76-3f3b-41db-b4be-0281fc50bcd9',
    'item_598',
    'Sandbike Inventory Mk1',
    'Adds inventory space to the Sandbike. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcinventoryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71a9ba48-ac1f-4fd3-8141-7e5f9b9a136a',
    'item_599',
    'Sandbike Inventory Mk2',
    'Adds inventory space to the Sandbike. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcinventoryr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd288390d-bed1-413e-b0aa-55f1e0535903',
    'item_611',
    'Sandcrawler PSU Mk6',
    'Defines the power efficiency and manages the heat dissipation of a Sandcrawler. Use a Welding Torch to attach the PSU to a Sandcrawler Chassis.',
    't_ui_iconvehcigpsur_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '002515f8-4600-44c9-9817-8a24025a8634',
    'item_615',
    'Sandcrawler Centrifuge Mk6',
    'Adds a container for collecting Spice Sand to the Sandcrawler. Use a Welding Torch to attach it to a Sandcrawler Chassis.',
    't_ui_iconvehcigcylinderr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5ef4072e-c9a5-4c46-99fe-1c8a2abab3ec',
    'item_616',
    'Upgraded Regis Spice Container',
    'Adds a container for collecting Spice Sand to the Sandcrawler. Use a Welding Torch to attach it to a Sandcrawler Chassis.',
    't_ui_iconvehcigcylinderr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2bbd01b8-67d2-4c67-a431-afa7de3b60a4',
    'item_617',
    'Sandcrawler Vacuum Mk6',
    'A Spice Header is a scoop mechanism that allows the collection of Spice Sand. A Spice Container is also required for the header to function. Use a Welding Torch to attach the header to a Sandcrawler Chassis.',
    't_ui_iconvehcigcheaderr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3f2f0459-ce95-4f56-8d56-38844198bf75',
    'item_621',
    'Spice Sand',
    'Can be harvested by hand or with a Static Compactor at Spice Blow sites before the Worm arrives. Can be refined into valuable Spice Melange at a Spice Refinery.',
    't_ui_iconresourceunrefinedspicer_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a72a50f0-57c5-4e9a-8eb9-f37b7afcf055',
    'item_622',
    'Mouse Corpse',
    'A dead Muad''dib. Can be consumed to drink some blood as a last resort.',
    't_ui_iconresourcemuad_dibcorpser_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'edd217a2-01a9-40a4-af72-8b3cd3bae7f6',
    'item_628',
    'Agave Seeds',
    'In common with its distant ancestors, the fruits of the Arrakeen Agave contain a large mass of seeds, which are put to many uses by those who have ready access to them.',
    't_ui_iconresourcesaguarorawr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '28cc4e1e-026f-4491-b606-6ee513efc125',
    'item_629',
    'Cup of Water',
    'Purchase to immediately refill your hydration meter by 100mL.',
    't_ui_iconconsumcupwaterr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2a127ffc-c80a-47db-a9d9-b0239508eda8',
    'item_630',
    'Sapho Juice',
    'Drink to reduce the time it takes to activate mentat vision abilities.',
    't_ui_iconconsumsaphojuicer_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e3a0e31a-e68b-4b8e-9513-7341b7e4105c',
    'item_635',
    'Off-world Medical Supplies',
    'Fremen medical tradition relies on only what the desert provides. Everyone else uses off-world pharmaceuticals, if they can get them.',
    't_ui_iconresourceoff-worldmedicalsuppliesr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9e3988bd-888c-4ef3-8843-2ad5b1bf5861',
    'item_648',
    'Scipio''s Bloodbag',
    'Scipio was a Kirab Warlord who took over the Wreck of the Pallas when it fell during the war of assassins. Over time, Scipio became known for his brutal torture of those who trespassed on his territory. He would extract most of the blood from their bodies, then abandon them near the leaking radiation core by the engines of the Pallas. This Uniqueblood bag is able to tolerate large amounts of reuse - a reminder of its twisted legacy.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1ffcd6ec-4678-4b2b-98db-782c15ffa33b',
    'item_649',
    'Glutton''s Bloodbag',
    'A whisper and a rumor, even among the slaver''s themselves is the Slavelord known as the Glutton. His origins are clouded in mystery, but he has carved himself a space within the cutthroat world of the slavers -literally. His wake is littered with corpses and it is rumored that the Glutton is a cannibal. This Unique bloodbag was apparently designed by him, but to what end, even the Slavers don''t seem to know.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ecf2669b-423b-4e9f-8c80-0f3372c11d45',
    'item_650',
    'Sinner''s Bloodbag',
    'This Unique bloodbag was symbolically named for the blood that the Sandflies shed when they rebelled against the Miner''s Guild. Though the gesture is symbolic, the practicality of the blood bag is not.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd6129138-fc75-4762-90ba-ac3231cda4d0',
    'item_651',
    'Maas Kharet Bloodbag',
    'This Unique bloodbag is used by the Mass Kharet to gather large quantities of water for sacrifice to Shai-Hulud. Though others view the cults habits as wasteful, their leader knows that sacrificing something as precious as water is a mark of power.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99cb3bea-e667-4216-8d4b-d90182fafd92',
    'item_652',
    'The Baron''s Bloodbag',
    'This Unique bloodbag is named for the Baron Harkonnen. During one of his infrequent visits to Arrakis, he had a group of Fremen sacrificed in Carthag, and then hung bags full of their blood in public places throughout the city - daring others to come and try to reclaim their water.',
    't_ui_iconconsumbloodsackr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '29d15aec-cfc1-4d5a-90da-f2e10c513c53',
    'item_660',
    'Kirab Heavy Gauntlet',
    'Heavy combat hand armor made of reinforced iron providing maximum protection to Great House troops.',
    't_ui_iconclothkirabheavyglovesr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c7b58018-96ac-402f-83aa-c3dc28d0e4c4',
    'item_689',
    'Sandtrout Leathers',
    'The Maas Kharet have a particular affinity with this type of leather, and often make use of it in their clothing.',
    't_ui_iconresourcetroutleatherr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '93ec6689-5d39-47da-a4d1-3f01f2824db0',
    'item_714',
    'The Forge Chestpiece',
    'Stock armor is made of hardened plasmeld. This Unique armor set is reinforced during the fabrication process - attaching minor heat dissipating components to every molecule within the plasmeld mass. This delivers increased heat resistance and a hard armor.',
    't_ui_iconclothharkmedunique02topr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '26f12f0f-012b-4880-a561-ef9435b89b2a',
    'item_720',
    'Power Harness',
    'This Unique heavy chest armor comes with additional power reserves to assist House forces in mining and suspensor usage.',
    't_ui_iconclothheavyuniquepowerincreasetop06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9ab06ef3-c361-4cd5-9199-c1cc0d2b0cea',
    'item_730',
    'Bulwark Chest',
    'This Unique heavy armor has internal layers of reinforced metal to protect House troops from blades and darts, however the bulk of this armor greatly increases stamina costs.',
    't_ui_iconclothheavyuniquereinforcedtop06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ee46bf80-9fc5-44c8-b1c1-8e905c3f7454',
    'item_732',
    'Miner''s Blessing',
    'Once in a while, there is a glitch in the gigantic entity that is CHOAM and the supply chains get crossed and something is sent to the place it was never meant to be. These Unique jackets, which arrived on Arrakis in very limited supply, are made of a much lighter material than the standard, which means they are cooler and more protective.',
    't_ui_iconclothlightuniquebiomheattop04r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3d11b705-1d1c-4e8d-a0a1-684eae6a19f6',
    'item_733',
    'Station Garb',
    'These Unique jackets were designed for the workers and guard from the Mysa Tarill power station. They are a cut above the usual supplies given out to pyons — probably because the power station was manned by a crew of highly trained engineers. Like the station, these jackets have mostly been long since abandoned.',
    't_ui_iconclothlightuniquebiomheattop05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '15536dac-8228-47db-ace9-06ee15c3142c',
    'item_734',
    'Desert Garb',
    'This Unique light chest armor is made with breathable material which allows House forces to better survive harsh desert climates.',
    't_ui_iconclothlightuniquebiomheattop06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '12d15b53-5e84-4c32-888a-5c636c264a9f',
    'item_736',
    'Wayfinder Helm',
    'The electronics in this Unique helmet connect to hand-held scanners, boosting their scanning range.',
    't_ui_iconclothlightuniquescanninghelmet05r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ec81b637-d514-4506-9664-1ea092d6e079',
    'item_737',
    'Wayfinder Helm',
    'The electronics in this Unique helmet connect to hand-held scanners, boosting their scanning range.',
    't_ui_iconclothlightuniquescanninghelmet06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c4bf9500-4b4f-4da4-8cab-4c7161f183cf',
    'item_755',
    'Scavenger Chestpiece',
    'Threadbare apparel. Those scrounging for salvage in the open desert can often afford little else.',
    't_ui_iconclothsmugscavengertorsomaler_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ede46443-9c4f-4b48-88c0-25c2c2b2935b',
    'item_760',
    'Oathbreaker Chestpiece',
    'Amongst the Kirab there is a common expression "there is only the final oath". The Kirab know how close they are to the edge, to becoming what they despise, scavengers without friend or family, consigned to the southern reaches of Hagga Basin. This Unique armor is a remnant of those who have forsaken their final oath - their oath to the Kirab themselves.',
    't_ui_iconclothneutatredeserterunique01topr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'be0a4af8-1ab3-48b6-8899-ac6682d28a5c',
    'item_780',
    'Executor''s Chestpiece',
    'This Unique armor is handed out to the legal representatives of CHOAM, such as lawyers and tax collectors. Unfortunately the bright orange CHOAM logo tends to make them more of a target, despite the reinforcement.',
    't_ui_iconclothneutatredeserterunique05topr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '659268cf-e531-43da-b163-bc2c879b2dec',
    'item_785',
    'Aren''s Chestpiece',
    'Aren was a disgraced Kirab warlord who fled south to live amongst the scavengers. He developed this Unique scavenger armor - but it did not save him when the Kirab sent a squad south to eliminate him.',
    't_ui_iconclothneutsmugdeserterunique01topr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '81d7937b-71e1-4c19-ace8-c272df9a31ea',
    'item_789',
    'Mendia''s Wrap',
    'The story of the warlord Mendia is well known among the Kirab. How she escaped slavery in the north, abandoning her former life. How she gained a reputation for brutality by executing any slavers they captured. How she defeated their former leader, Aren, in a duel and drove him into hiding in the Southern Hagga Basin. This Unique armor is modelled after her own - reinforced to keep her enemies at bay.',
    't_ui_iconclothneutsmugdeserterunique02helmetr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3c3631c9-752b-467b-a370-e04bafcb238d',
    'item_810',
    'Pincushion Chestpiece',
    'This Unique armor set uses an experimental plasmeld layer to absorb dart impacts. In the earliest versions, the darts would stick in the gel-like outer layer, leaving the wearer bristling with darts like a pincushion. Though that flaw has been perfected, the name persists.',
    't_ui_iconclothneutsmugdeserterunique06topr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f253852f-50b8-4cba-a099-7e0a1962a598',
    'item_817',
    'Maula Breeches',
    'Maula are the lowest caste in the Imperium. This clothing reflects that caste, being of such poor quality that it offers no protection against weapon or weather.',
    't_ui_iconclothchoammaulaclothingbottommaler_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '226f1e48-9f00-4e94-bf11-8b1972a39571',
    'item_905',
    'Idaho''s Charge',
    'This jacket was jury-rigged by Duncan Idaho to improve his suspensor power during aerial combat bouts. His famous knee charge relies on suspensors to give him additional range. This Unique jacket features a series of specially designed capacitors to optimize the flow of energy through battery pack and suspensor belt.',
    't_ui_iconclothlightuniquereducesuspensortop06r_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4bc97676-341a-4d8a-83d1-cad3a4ff7ec1',
    'item_909',
    'Flour Sand',
    'Found in flour sand drifts on the open sands, predominantly in the Vermilius Gap. Can be harvested by hand or with a Static Compactor. Can be refined into Silicone Blocks in a Chemical Refinery.',
    't_ui_iconresourcefloursandr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6d424b3b-2bab-42b5-be8c-87350283d243',
    'item_914',
    'Spice Residue',
    'Residue left from spice refining, useful in crafting.',
    't_ui_iconresourcespiceresiduer_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '38064b31-bd46-471a-8708-5aefbff40062',
    'item_915',
    'Granite Stone',
    'Stronger than the sandstones that crumble in the storms that sweep across Arrakis, granite stone is widely used a basic building material. It is found almost everywhere there is dirt.',
    't_ui_iconresourcerhyoliter_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4ec78d2f-6d29-4c4c-9192-8a4226981d0a',
    'item_918',
    'Basalt Stone',
    'Stone which can be refined for usage in construction.',
    't_ui_iconresourcebasaltr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fd32377e-9be8-4ec5-9878-b1bb82cd967e',
    'item_920',
    'Plastone',
    'An artificial composite of Silicone and Basalt used in sandstorm-resistant construction.',
    't_ui_iconresourceplastoner_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2bc5307d-67b4-4e3e-89c9-ab6f4f89ce9d',
    'item_922',
    'Stravidium Mass',
    'Raw stravidium mass can be found in the deep desert, and refined into fibers.',
    't_ui_iconresourcestravidiumorer_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8bc69145-31dc-4228-92eb-0ded19a1d069',
    'item_923',
    'Calibrated Servok',
    'These specialist servoks are commonly repurposed from heavy-duty equipment. This type of equipment was used extensively in Jabal Eifrit.',
    't_ui_iconresourcecalibratedservokr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bbab9e55-0c61-4322-9346-58ec3f4a0677',
    'item_927',
    'Makeshift Filter',
    'A filter with simple functionality to keep Windtraps running and clear of sand. Fitted for smaller Windtraps. Can be crafted in a Survival Fabricator.',
    't_ui_iconresourcemakeshiftfilterr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5585c9b1-8472-4699-9e6d-4329af59e0ef',
    'item_928',
    'Standard Filter',
    'A CHOAM-patented filter with improved protection against the harsh winds of Arakkis. Needed to keep Windtraps running and clear of sand. Fitted for smaller Windtraps. Can be crafted in a Survival Fabricator.',
    't_ui_iconresourcestandardfilterr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '62bb4dc6-ccde-4ae6-8be8-650895ae1bd0',
    'item_929',
    'Particulate Filter',
    'A thorough filter to catch any unwanted particles, dust and sand. Needed to keep Windtraps running and clear of sand. Fitted for Larger Windtraps. Can be crafted in a Survival Fabricator.',
    't_ui_iconresourceparticulatefilterr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a7758a36-b02c-44f0-ab88-7ca66394d7ce',
    'item_930',
    'Advanced Particulate Filter',
    'An advanced filter for catching any unwanted particles, dust and sand. Needed to keep Windtraps running and clear of sand. Fitted for Larger Windtraps. Can be crafted in an Advanced Survival Fabricator.',
    't_ui_iconresourceadvancedparticulatefilterr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'affe35c3-6bda-499d-ba96-597fb82c7696',
    'item_932',
    'Shigawire Garotte',
    'Shigawire Garotte.',
    't_ui_iconjourneyshigawiregarotter_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e8b3d10e-3bd1-4543-bac7-765687335bdb',
    'item_933',
    'Blank Sinkchart',
    'A blank sinkchart that can be populated with survey data. Open the Map and select a surveyed area to populate it.

Requires the Cartographer passive from the Planetologist Skill tree.',
    't_ui_iconsinkchartemptyr_d.webp',
    'Unknown',
    'Unknown',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1b74578e-a187-4bca-923a-d69f6c0c7f0d',
    'item_705',
    'Syndicate Boots',
    'The Syndicate is a large offworld criminal organization that has never been able to get a foothold on Arrakis — due to the tireless efforts of Esmar Tuek and the smugglers to keep them out. Nobody knows why their mercenaries have begun to arrive in the Hagga Basin, nor what their interest is in the radiated wrecks of the Sheol. This Unique armor is designed to keep environmental hazards at bay.',
    't_ui_iconclothharkmedunique01bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5bdde01b-446a-4271-880a-469a989cf2eb',
    'item_706',
    'Syndicate Pants',
    'The Syndicate is a large offworld criminal organization that has never been able to get a foothold on Arrakis — due to the tireless efforts of Esmar Tuek and the smugglers to keep them out. Nobody knows why their mercenaries have begun to arrive in the Hagga Basin, nor what their interest is in the radiated wrecks of the Sheol. This Unique armor is designed to keep environmental hazards at bay.',
    't_ui_iconclothharkmedunique01bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 700/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2648c575-02eb-44d6-a7ab-72ddd91336bf',
    'item_707',
    'Syndicate Gauntlets',
    'The Syndicate is a large offworld criminal organization that has never been able to get a foothold on Arrakis — due to the tireless efforts of Esmar Tuek and the smugglers to keep them out. Nobody knows why their mercenaries have begun to arrive in the Hagga Basin, nor what their interest is in the radiated wrecks of the Sheol. This Unique armor is designed to keep environmental hazards at bay.',
    't_ui_iconclothharkmedunique01glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '787dfa88-b46f-4fc2-adbd-0a9bc2170b5e',
    'item_708',
    'Syndicate Helmet',
    'The Syndicate is a large offworld criminal organization that has never been able to get a foothold on Arrakis — due to the tireless efforts of Esmar Tuek and the smugglers to keep them out. Nobody knows why their mercenaries have begun to arrive in the Hagga Basin, nor what their interest is in the radiated wrecks of the Sheol. This Unique armor is designed to keep environmental hazards at bay.',
    't_ui_iconclothharkmedunique01helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e611a724-0d65-41d2-8860-ed2eb24db6ed',
    'item_709',
    'Syndicate Chestplate',
    'The Syndicate is a large offworld criminal organization that has never been able to get a foothold on Arrakis — due to the tireless efforts of Esmar Tuek and the smugglers to keep them out. Nobody knows why their mercenaries have begun to arrive in the Hagga Basin, nor what their interest is in the radiated wrecks of the Sheol. This Unique armor is designed to keep environmental hazards at bay.',
    't_ui_iconclothharkmedunique01topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8eeb60a0-71ac-476b-8097-c05ae6f62ad7',
    'item_710',
    'The Forge Boots',
    'Stock armor is made of hardened plasmeld. This Unique armor set is reinforced during the fabrication process - attaching minor heat dissipating components to every molecule within the plasmeld mass. This delivers increased heat resistance and a hard armor.',
    't_ui_iconclothharkmedunique02bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '65635f32-f7e9-4568-9630-06bf6f936740',
    'item_711',
    'The Forge Pants',
    'Stock armor is made of hardened plasmeld. This Unique armor set is reinforced during the fabrication process - attaching minor heat dissipating components to every molecule within the plasmeld mass. This delivers increased heat resistance and a hard armor.',
    't_ui_iconclothharkmedunique02bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ac685758-42c3-48e4-98a7-42bede22930b',
    'item_712',
    'The Forge Gloves',
    'Stock armor is made of hardened plasmeld. This Unique armor set is reinforced during the fabrication process - attaching minor heat dissipating components to every molecule within the plasmeld mass. This delivers increased heat resistance and a hard armor.',
    't_ui_iconclothharkmedunique02glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a5508cba-6c46-4293-ac35-cb15e1a99c6e',
    'item_713',
    'The Forge Helmet',
    'Stock armor is made of hardened plasmeld. This Unique armor set is reinforced during the fabrication process - attaching minor heat dissipating components to every molecule within the plasmeld mass. This delivers increased heat resistance and a hard armor.',
    't_ui_iconclothharkmedunique02helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6e9e2df5-56f2-4a6a-91d4-f48ebf30b7af',
    'item_715',
    'Iri''s Gauntlets',
    'Iri was a leader among the Kirab who became obsessed with finding a way to nullify the Holtzman effect. His tinkering led to the development of these Unique gauntlets that use a feedback loop to decrease power usage. Iri himself claimed that the gauntlets "spoke" to him and his state of mind deteriorated greatly until he threw himself from a cliff.',
    't_ui_iconclothheavyuniquepowerefficientgloves02r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'cd0df781-30e5-4977-a570-3f73f6f9013d',
    'item_716',
    'Shock Gauntlets',
    'These Unique gauntlets used to be attached to uncooperative slaves - shocking their palms as a punishment. One supervisor noticed that slaves equipped with the gauntlets needed to recharge their tools and power packs less frequently. The gauntlets were quickly modified to a low level current and given to all workers. Even slavers value efficiency.',
    't_ui_iconclothheavyuniquepowerefficientgloves03r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7e535715-f03c-4d46-8c26-2aaea9e7aced',
    'item_717',
    'Power Gauntlets',
    'These Unique gauntlets were developed to help fatigued miners keep going when their tools were running low. Containing a series of capacitors within them, they help to even out the power flow and increase efficiency. The Sandflies have co-opted these gauntlets for use in their own operations.',
    't_ui_iconclothheavyuniquepowerefficientgloves04r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9ac65b22-009b-41b9-8f73-2fe9f36d972d',
    'item_718',
    'Station Gauntlets',
    'These Unique gauntlets were developed for use on the power station at Mysa Tarill. After the incident with the sandworm, the station was abandoned and boxes of these gauntlets were left lying around to be scavenged by those brave or foolish enough to approach the worm.',
    't_ui_iconclothheavyuniquepowerefficientgloves05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0e9138d-9c5e-4fcf-9764-6baf62bc087d',
    'item_719',
    'Circuit Gauntlets',
    'A Unique heavy armor gauntlet that recon squads use to optimize power usage on connected Power Packs.',
    't_ui_iconclothheavyuniquepowerefficientgloves06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd4882e25-05f7-42ef-8abd-b3f6839cdd19',
    'item_721',
    'Mendek''s Boots',
    'General Mendek of the Harkonnen famously led a battlegroup during the Battle of Arrakeen that used old-world artillery to seal Atreides forces in shield wall caves. Mendek had this Unique armor conditioned as a reminder of the battle, sometimes wearing it to remind himself of what it must have felt like to be trapped in those caves, with no way to escape.',
    't_ui_iconclothheavyuniquereinforcedboots05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd2734a01-9ceb-4be5-bae2-6110f091b9a1',
    'item_722',
    'Bulwark Boots',
    'This Unique heavy armor has internal layers of reinforced metal to protect House troops from blades and darts, however the bulk of this armor greatly increases stamina costs.',
    't_ui_iconclothheavyuniquereinforcedboots06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd8d6536a-a129-4794-b790-793928ab0025',
    'item_723',
    'Mendek''s Pants',
    'General Mendek of the Harkonnen famously led a battlegroup during the Battle of Arrakeen that used old-world artillery to seal Atreides forces in shield wall caves. Mendek had this Unique armor conditioned as a reminder of the battle, sometimes wearing it to remind himself of what it must have felt like to be trapped in those caves, with no way to escape.',
    't_ui_iconclothheavyuniquereinforcedbottom05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4ab55ddb-ab5d-4199-8cd9-541efbf76823',
    'item_724',
    'Bulwark Leggings',
    'This Unique heavy armor has internal layers of reinforced metal to protect House troops from blades and darts, however the bulk of this armor greatly increases stamina costs.',
    't_ui_iconclothheavyuniquereinforcedbottom06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '36f4bad7-bd3f-4c3d-91e8-67475b69b587',
    'item_725',
    'Mendek''s Gauntlets',
    'General Mendek of the Harkonnen famously led a battlegroup during the Battle of Arrakeen that used old-world artillery to seal Atreides forces in shield wall caves. Mendek had this Unique armor conditioned as a reminder of the battle, sometimes wearing it to remind himself of what it must have felt like to be trapped in those caves, with no way to escape.',
    't_ui_iconclothheavyuniquereinforcedgloves05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6eb8cee7-2951-426d-9c3a-d978b3d02959',
    'item_726',
    'Bulwark Gloves',
    'This Unique heavy armor has internal layers of reinforced metal to protect House troops from blades and darts, however the bulk of this armor greatly increases stamina costs.',
    't_ui_iconclothheavyuniquereinforcedgloves06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bc1ac575-8448-4ea9-8721-f42933f96fcc',
    'item_727',
    'Mendek''s Helmet',
    'General Mendek of the Harkonnen famously led an battlegroup during the Battle of Arrakeen that used old-world artillery to seal Atreides forces in shield wall caves. Mendek had this Unique armor conditioned as a reminder of the battle, sometimes wearing it to remind himself of what it must have felt like to be trapped in those caves, with no way to escape.',
    't_ui_iconclothheavyuniquereinforcedhelmet05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '15df23c4-f12d-4091-aa96-ca86ecde88a0',
    'item_728',
    'Bulwark Helmet',
    'This Unique heavy armor has internal layers of reinforced metal to protect House troops from blades and darts, however the bulk of this armor greatly increases stamina costs.',
    't_ui_iconclothheavyuniquereinforcedhelmet06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7ab8b5eb-0727-40a2-b7f1-bbee3583529b',
    'item_729',
    'Mendek''s Chestplate',
    'The Syndicate is a large offworld criminal organization that has never been able to get a foothold on Arrakis — due to the tireless efforts of Esmar Tuek and the smugglers to keep them out. Nobody knows why their mercenaries have begun to arrive in the Hagga Basin, nor what their interest is in the radiated wrecks of the Sheol. This Unique armor is designed to keep environmental hazards at bay.',
    't_ui_iconclothheavyuniquereinforcedtop05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3d591dc8-2811-491b-ae5a-f3359609404b',
    'item_731',
    'Skin-lined Jacket',
    'When they were establishing their presence in the Hagga Basin, the Slavers noticed that their slaves were often dying of heatstroke. They could not have their stock dying, so they developed this Unique jacket to protect their slaves from the worst of the elements. Sometimes even the worst of people have good ideas. Just don''t look too closely at the leather.',
    't_ui_iconclothlightuniquebiomheattop03r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0c220bcb-d59f-4c44-ac42-c48538a4e287',
    'item_735',
    'Hook-claw Gloves',
    'These Unique light armor gloves assist House troops in climbing, making it less arduous and stamina draining.',
    't_ui_iconclothlightuniqueclimbinggloves06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '697738ee-db46-47fb-8ca9-76c95cbb9575',
    'item_738',
    'Compression-Stim Leggings',
    'These Unique light leggings are equipped with a compression triggered mechanism which stimulates the leg muscles, reducing the stamina drain of dashing.',
    't_ui_iconclothlightuniquestaminabottom04r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71b9f5f8-b9c2-4d0e-9791-60ff96fc541b',
    'item_739',
    'Stim-Leggings',
    'These Unique light leggings are equipped with a compression triggered mechanism which stimulates the leg muscles, reducing the stamina drain of dashing.',
    't_ui_iconclothlightuniquestaminabottom05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fcdfde51-d877-421c-858c-d6e9a81e91ce',
    'item_740',
    'Ix-core Leggings',
    'These Unique light leggings are equipped with a compression triggered mechanism which stimulates the leg muscles, reducing the stamina drain of dashing.',
    't_ui_iconclothlightuniquestaminabottom06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '95efa7f5-2cbf-4ddf-ba6d-40adc649987f',
    'item_741',
    'Softstep Boots',
    'Found abandoned throughout the former territories of the Fremen, these Unique boots are made of a strange type of soft leather. Each step in these boots seems to melt into the sand, reducing the vibrations that attract the worm.',
    't_ui_iconclothlightuniquewormthreatboots02r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '508a6357-fc24-4ec5-a411-45ae841cca0c',
    'item_742',
    'Ta''lab Softstep Boots',
    'Found abandoned throughout the former territories of the Fremen, these Unique boots are made of a strange type of soft leather. Each step in these boots seems to melt into the sand, reducing the vibrations that attract the worm. This particular set is based on a design found in the long-abandoned Sietch Ta''lab.',
    't_ui_iconclothlightuniquewormthreatboots03r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c98fd45a-b639-47a7-a8a0-a28f5427f69a',
    'item_743',
    'Idaho Softstep Boots',
    'A small mechanism in the sole of these Unique light armor boots emits an irregular vibration that reduces the amount of worm-attention generated by footsteps on the open sands.',
    't_ui_iconclothlightuniquewormthreatboots04r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6a923a0e-60ef-434f-9cef-05affe6d56ac',
    'item_744',
    'Tarl Softstep Boots',
    'These Unique boots were taken from the rubble of Sietch Tarl after it was destroyed by the Sardaukar. Sietch Tarl was the place where Liet-Kynes made a final stand against the Sardaukar, collapsing the walls and killing dozens of them in a desperate final stand. Perhaps Liet-Kynes wore these same boots on that fateful day.',
    't_ui_iconclothlightuniquewormthreatboots05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7ab01041-e531-4e98-9724-cee94e8c047f',
    'item_745',
    'Tabr Softstep Boots',
    'Found abandoned throughout the former territories of the Fremen, these Unique boots are made of a strange type of soft leather. Each step in these boots seems to melt into the sand, reducing the vibrations that attract the worm. Sietch Tabr was one of the Fremen sietches that put up little to no resistance during the pogrom, instead melting away quietly.',
    't_ui_iconclothlightuniquewormthreatboots06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '96213806-135d-4a8f-a105-b4c439fd53d1',
    'item_746',
    'Makeshift Shoes',
    'A crude pair of shoes made from plant fiber, used as a last resort by explorers.',
    't_ui_iconclothnatisandtroutleathershoesmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1e3c5d14-bb1b-496d-adb1-a21966a02d08',
    'item_747',
    'Makeshift Pants',
    'A crude pair of pants made from plant fiber, used as a last resort by explorers.',
    't_ui_iconclothnatisandtroutleatherpantmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '68c9d6cd-5435-4d23-b53c-eeac1e26d8a2',
    'item_748',
    'Makeshift Gloves',
    'A crude pair of gloves made from plant fiber, used as a last resort by explorers.',
    't_ui_iconclothnatisandtroutleatherglovesmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9f59b34b-24b8-409d-a35c-95b6617b2724',
    'item_749',
    'Makeshift Hood',
    'A crude hood made from plant fiber, used as a last resort by explorers.',
    't_ui_iconclothnatisandtroutleatherhatmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '099d957b-b14d-4aa1-9f26-bfd6d3f781ce',
    'item_750',
    'Makeshift Jacket',
    'A crude jacket made from plant fiber, used as a last resort by explorers.',
    't_ui_iconclothnatisandtroutleathertopmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '14af9935-4063-46a2-a560-2c8487f04371',
    'item_751',
    'Scavenger Boots',
    'Threadbare apparel. Those scrounging for salvage in the open desert can often afford little else.',
    't_ui_iconclothsmugscavengerbootsmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '87429f3f-0efb-4556-9d76-169fee0ccdd7',
    'item_752',
    'Scavenger Pants',
    'Threadbare apparel. Those scrounging for salvage in the open desert can often afford little else.',
    't_ui_iconclothsmugscavengerbottommaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '98e0171f-0dbd-484b-9cad-40ee6b391479',
    'item_753',
    'Scavenger Gloves',
    'Threadbare apparel. Those scrounging for salvage in the open desert can often afford little else.',
    't_ui_iconclothsmugscavengerglovesmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f02103ec-f00b-4538-a813-5e1c3092e74d',
    'item_754',
    'Scavenger Hood',
    'Threadbare apparel. Those scrounging for salvage in the open desert can often afford little else.',
    't_ui_iconclothsmugscavengerheadmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '487536bd-b86a-4bf2-9a9f-6e4bbeb14885',
    'item_756',
    'Oathbreaker Boots',
    'Amongst the Kirab there is a common expression "there is only the final oath". The Kirab know how close they are to the edge, to becoming what they despise, scavengers without friend or family, consigned to the southern reaches of Hagga Basin. This Unique armor is a remnant of those who have forsaken their final oath - their oath to the Kirab themselves.',
    't_ui_iconclothneutatredeserterunique01bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '33edf384-9818-4749-b6a9-afd7757dd420',
    'item_757',
    'Oathbreaker Pants',
    'Amongst the Kirab there is a common expression "there is only the final oath". The Kirab know how close they are to the edge, to becoming what they despise, scavengers without friend or family, consigned to the southern reaches of Hagga Basin. This Unique armor is a remnant of those who have forsaken their final oath - their oath to the Kirab themselves.',
    't_ui_iconclothneutatredeserterunique01bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '39869e04-4b56-44f2-8775-96c6b7732885',
    'item_758',
    'Oathbreaker Gauntlets',
    'Amongst the Kirab there is a common expression "there is only the final oath". The Kirab know how close they are to the edge, to becoming what they despise, scavengers without friend or family, consigned to the southern reaches of Hagga Basin. This Unique armor is a remnant of those who have forsaken their final oath - their oath to the Kirab themselves.',
    't_ui_iconclothneutatredeserterunique01glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b0dc2a9f-9950-4070-b52a-6d90f0afcb5a',
    'item_759',
    'Oathbreaker Headwrap',
    'Amongst the Kirab there is a common expression "there is only the final oath". The Kirab know how close they are to the edge, to becoming what they despise, scavengers without friend or family, consigned to the southern reaches of Hagga Basin. This Unique armor is a remnant of those who have forsaken their final oath - their oath to the Kirab themselves.',
    't_ui_iconclothneutatredeserterunique01helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5c31ce33-7b15-41a2-b2d2-4d78dcdcebe1',
    'item_761',
    'Karak''s Boots',
    'Zaal Karak is a ruthless slavelord who runs his operation with an iron fist. This intimidating Unique heavy armor was commissioned as a present for him from the na-baron of the Harkonnen, Feyd-Rautha. It is Zaal Karak and his men who supply the bulk of slaves for the building of Neo-Carthag.',
    't_ui_iconclothneutatredeserterunique02bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '371634fb-172e-4b4f-8087-15f6b2797092',
    'item_762',
    'Karak''s Pants',
    'Zaal Karak is a ruthless slavelord who runs his operation with an iron fist. This intimidating Unique heavy armor was commissioned as a present for him from the na-baron of the Harkonnen, Feyd-Rautha. It is Zaal Karak and his men who supply the bulk of slaves for the building of Neo-Carthag.',
    't_ui_iconclothneutatredeserterunique02bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f8fbd9c2-88d8-4bbf-bd0b-10d4d7734242',
    'item_763',
    'Karak''s Gauntlets',
    'Zaal Karak is a ruthless slavelord who runs his operation with an iron fist. This intimidating Unique heavy armor was commissioned as a present for him from the na-baron of the Harkonnen, Feyd-Rautha. It is Zaal Karak and his men who supply the bulk of slaves for the building of Neo-Carthag.',
    't_ui_iconclothneutatredeserterunique02glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0752ac60-b7fb-419a-abbb-14e835b827cc',
    'item_764',
    'Karak''s Helmet',
    'Zaal Karak is a ruthless slavelord who runs his operation with an iron fist. This intimidating Unique heavy armor was commissioned as a present for him from the na-baron of the Harkonnen, Feyd-Rautha. It is Zaal Karak and his men who supply the bulk of slaves for the building of Neo-Carthag.',
    't_ui_iconclothneutatredeserterunique02helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8f0ef932-3ac9-4bcb-8593-278ca7c5a655',
    'item_765',
    'Karak''s Jacket',
    'Zaal Karak is a ruthless slavelord who runs his operation with an iron fist. This intimidating Unique heavy armor was commissioned as a present for him from the na-baron of the Harkonnen, Feyd-Rautha. It is Zaal Karak and his men who supply the bulk of slaves for the building of Neo-Carthag.',
    't_ui_iconclothneutatredeserterunique02topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3deab060-5e03-43e7-864e-660fbd7d9405',
    'item_766',
    'Sentinel Boots',
    'Though the Sandflies have long since broken ties with the Miner''s Guild, they still maintain the gear and traditions of their former life. These Unique boots are modified duneman boots - built for long hours in the mines.',
    't_ui_iconclothneutatredeserterunique03bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '70989e0f-ec27-4a66-8c3b-b4adca25ac55',
    'item_767',
    'Sentinel Pants',
    'Though the Sandflies have long since broken ties with the Miner''s Guild, they still maintain the gear and traditions of their former life. These Unique pants are modified duneman pants - built for long hours in the mines.',
    't_ui_iconclothneutatredeserterunique03bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '339d5331-037f-46a3-a3c4-87b68c15bcef',
    'item_768',
    'Sentinel Gauntlets',
    'Though the Sandflies have long since broken ties with the Miner''s Guild, they still maintain the gear and traditions of their former life. These Unique gauntlets are modified duneman gauntlets - built for long hours in the mines.',
    't_ui_iconclothneutatredeserterunique03glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '74526e46-397e-4321-9833-246a81d46d5e',
    'item_769',
    'Sentinel Helmet',
    'Though the Sandflies have long since broken ties with the Miner''s Guild, they still maintain the gear and traditions of their former life. This Unique helmet is a modified duneman helmet - built for long hours in the mines.',
    't_ui_iconclothneutatredeserterunique03helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c9abd4a0-c407-4963-b0e0-db1986eb034e',
    'item_770',
    'Sentinel Jacket',
    'Though the Sandflies have long since broken ties with the Miner''s Guild, they still maintain the gear and traditions of their former life. This Unique jacket is a modified duneman jacket - built for long hours in the mines.',
    't_ui_iconclothneutatredeserterunique03topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '366b2a30-6353-4b76-a868-cc23683297fa',
    'item_771',
    'Acheronian Boots',
    'In ancient mythology, Acheron was said to be the entrance to hell. This Unique armor was retrieved from a shipwreck in the Sheol and became sought after due to its thick protective layer. Not that it helped those who died of radiation in the Sheol.',
    't_ui_iconclothneutatredeserterunique04bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '19403422-a1e4-4472-b705-c7b01d18be85',
    'item_772',
    'Acheronian Pants',
    'In ancient mythology, Acheron was said to be the entrance to hell. This Unique armor was retrieved from a shipwreck in the Sheol and became sought after due to its thick protective layer. Not that it helped those who died of radiation in the Sheol.',
    't_ui_iconclothneutatredeserterunique04bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dad92e65-cdf6-452d-b647-adc3ead311cf',
    'item_773',
    'Acheronian Gauntlets',
    'In ancient mythology, Acheron was said to be the entrance to hell. This Unique armor was retrieved from a shipwreck in the Sheol and became sought after due to its thick protective layer. Not that it helped those who died of radiation in the Sheol.',
    't_ui_iconclothneutatredeserterunique04glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '502f4507-f3d0-487e-ab90-33f0023a8d0f',
    'item_774',
    'Acheronian Helmet',
    'In ancient mythology, Acheron was said to be the entrance to hell. This Unique armor was retrieved from a shipwreck in the Sheol and became sought after due to its thick protective layer. Not that it helped those who died of radiation in the Sheol.',
    't_ui_iconclothneutatredeserterunique04helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e0999a23-2466-4386-af5b-0d4718a69023',
    'item_775',
    'Acheronian Chestplate',
    'In ancient mythology, Acheron was said to be the entrance to hell. This Unique armor was retrieved from a shipwreck in the Sheol and became sought after due to its thick protective layer. Not that it helped those who died of radiation in the Sheol.',
    't_ui_iconclothneutatredeserterunique04topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c335909-ae2b-4a3f-81bc-438acc580cc8',
    'item_776',
    'Executor''s Boots',
    'This Unique armor is handed out to the legal representatives of CHOAM, such as lawyers and tax collectors. Unfortunately the bright orange CHOAM logo tends to make them more of a target, despite the reinforcement.',
    't_ui_iconclothneutatredeserterunique05bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0bd7d8e0-397d-4ecd-a9d4-a42f5e044603',
    'item_777',
    'Executor''s Pants',
    'This Unique armor is handed out to the legal representatives of CHOAM, such as lawyers and tax collectors. Unfortunately the bright orange CHOAM logo tends to make them more of a target, despite the reinforcement.',
    't_ui_iconclothneutatredeserterunique05bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '07d8e9f6-c18b-4492-952e-76a81b3ffbb9',
    'item_778',
    'Executor''s Gauntlets',
    'This Unique armor is handed out to the legal representatives of CHOAM, such as lawyers and tax collectors. Unfortunately the bright orange CHOAM logo tends to make them more of a target, despite the reinforcement.',
    't_ui_iconclothneutatredeserterunique05glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '00a3f198-86a8-49b0-b95e-3914c7914275',
    'item_779',
    'Executor''s Helmet',
    'This Unique armor is handed out to the legal representatives of CHOAM, such as lawyers and tax collectors. Unfortunately the bright orange CHOAM logo tends to make them more of a target, despite the reinforcement.',
    't_ui_iconclothneutatredeserterunique05helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c3512e9d-bb77-4b8a-8764-6ac366c38fab',
    'item_781',
    'Aren''s Boots',
    'Aren was a disgraced Kirab warlord who fled south to live amongst the scavengers. He developed this Unique scavenger armor - but it did not save him when the Kirab sent a squad south to eliminate him.',
    't_ui_iconclothneutsmugdeserterunique01bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5625c03f-0325-4639-8009-1e184ee61e35',
    'item_782',
    'Aren''s Pants',
    'Aren was a disgraced Kirab warlord who fled south to live amongst the scavengers. He developed this Unique scavenger armor - but it did not save him when the Kirab sent a squad south to eliminate him.',
    't_ui_iconclothneutsmugdeserterunique01bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '27fa0f3e-83d3-4b5a-bdd5-200e9860962b',
    'item_783',
    'Aren''s Gloves',
    'Aren was a disgraced Kirab warlord who fled south to live amongst the scavengers. He developed this Unique scavenger armor - but it did not save him when the Kirab sent a squad south to eliminate him.',
    't_ui_iconclothneutsmugdeserterunique01glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1d4a5378-4025-4886-a511-2e56c36acb73',
    'item_784',
    'Aren''s Mask',
    'Aren was a disgraced Kirab warlord who fled south to live amongst the scavengers. He developed this Unique scavenger armor - but it did not save him when the Kirab sent a squad south to eliminate him.',
    't_ui_iconclothneutsmugdeserterunique01helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0323ef1d-fef6-442e-b298-d1025f533c24',
    'item_786',
    'Mendia''s Boots',
    'The story of the warlord Mendia is well known among the Kirab. How she escaped slavery in the north, abandoning her former life. How she gained a reputation for brutality by executing any slavers they captured. How she defeated their former leader, Aren, in a duel and drove him into hiding in the Southern Hagga Basin. This Unique armor is modelled after her own - reinforced to keep her enemies at bay.',
    't_ui_iconclothneutsmugdeserterunique02bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '195fbdf9-97cc-4382-a1dd-dbc41cf10db2',
    'item_787',
    'Mendia''s Pants',
    'The story of the warlord Mendia is well known among the Kirab. How she escaped slavery in the north, abandoning her former life. How she gained a reputation for brutality by executing any slavers they captured. How she defeated their former leader, Aren, in a duel and drove him into hiding in the Southern Hagga Basin. This Unique armor is modelled after her own - reinforced to keep her enemies at bay.',
    't_ui_iconclothneutsmugdeserterunique02bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1215bafe-8cfe-4b58-bdfa-835100ca7ee5',
    'item_788',
    'Mendia''s Gauntlets',
    'The story of the warlord Mendia is well known among the Kirab. How she escaped slavery in the north, abandoning her former life. How she gained a reputation for brutality by executing any slavers they captured. How she defeated their former leader, Aren, in a duel and drove him into hiding in the Southern Hagga Basin. This Unique armor is modelled after her own - reinforced to keep her enemies at bay.',
    't_ui_iconclothneutsmugdeserterunique02glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '84589e1e-a0e0-4704-b86f-fee7ab7b528b',
    'item_790',
    'Mendia''s Jacket',
    'The story of the warlord Mendia is well known among the Kirab. How she escaped slavery in the north, abandoning her former life. How she gained a reputation for brutality by executing any slavers they captured. How she defeated their former leader, Aren, in a duel and drove him into hiding in the Southern Hagga Basin. This Unique armor is modelled after her own - reinforced to keep her enemies at bay.',
    't_ui_iconclothneutsmugdeserterunique02topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bfab9d2c-c5b5-4cbe-8329-e8c0c204c643',
    'item_791',
    'Inkvine Boots',
    'Inkvine was a creeping plant native to Giedi Prime, used as a material by slavers for generations. Inkvine whips were the most common - particularly for the slow burning beet colored scars that they left on their victims. This Unique light armor is dyed to look almost like inkvine, despite being made from lesser materials.',
    't_ui_iconclothneutsmugdeserterunique03bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '695ef73c-2101-4a70-b99a-b72e0aea6fcc',
    'item_792',
    'Inkvine Pants',
    'Inkvine was a creeping plant native to Giedi Prime, used as a material by slavers for generations. Inkvine whips were the most common - particularly for the slow burning beet colored scars that they left on their victims. This Unique light armor is dyed to look almost like inkvine, despite being made from lesser materials.',
    't_ui_iconclothneutsmugdeserterunique03bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f1f1733e-e60c-4e26-a1de-ae0ea023dc88',
    'item_793',
    'Inkvine Gauntlets',
    'Inkvine was a creeping plant native to Giedi Prime, used as a material by slavers for generations. Inkvine whips were the most common - particularly for the slow burning beet colored scars that they left on their victims. This Unique light armor is dyed to look almost like inkvine, despite being made from lesser materials.',
    't_ui_iconclothneutsmugdeserterunique03glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c20c7424-0d3b-439b-a0da-bc59907796ab',
    'item_794',
    'Inkvine Mask',
    'Inkvine was a creeping plant native to Giedi Prime, used as a material by slavers for generations. Inkvine whips were the most common - particularly for the slow burning beet colored scars that they left on their victims. This Unique light armor is dyed to look almost like inkvine, despite being made from lesser materials.',
    't_ui_iconclothneutsmugdeserterunique03helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4f959854-6c75-49eb-9668-8cd524f303d1',
    'item_795',
    'Inkvine Jacket',
    'Inkvine was a creeping plant native to Giedi Prime, used as a material by slavers for generations. Inkvine whips were the most common - particularly for the slow burning beet colored scars that they left on their victims. This Unique light armor is dyed to look almost like inkvine, despite being made from lesser materials.',
    't_ui_iconclothneutsmugdeserterunique03topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e69e045f-0cf0-4463-b109-c4732460461f',
    'item_796',
    'Quirth''s Boots',
    'Denira Quirth never intended to fight a war - she just wanted to survive it. When the Sandflies defected she swore not to shed the blood of her former colleagues - despite believing that the Sandflies cause was just. Her Unique armor is built to withstand the ordeals of Arrakis - but not the darts of her enemies.',
    't_ui_iconclothneutsmugdeserterunique04bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '43eb91a2-d6f9-4215-bc18-4bad154796d8',
    'item_797',
    'Quirth''s Pants',
    'Denira Quirth never intended to fight a war - she just wanted to survive it. When the Sandflies defected she swore not to shed the blood of her former colleagues - despite believing that the Sandflies cause was just. Her Unique armor is built to withstand the ordeals of Arrakis - but not the darts of her enemies.',
    't_ui_iconclothneutsmugdeserterunique04bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dfde5c48-2014-4ddb-9973-a28e82e85f2a',
    'item_798',
    'Quirth''s Gauntlets',
    'Denira Quirth never intended to fight a war - she just wanted to survive it. When the Sandflies defected she swore not to shed the blood of her former colleagues - despite believing that the Sandflies cause was just. Her Unique armor is built to withstand the ordeals of Arrakis - but not the darts of her enemies.',
    't_ui_iconclothneutsmugdeserterunique04glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e7549eaf-2370-44b9-bf9e-5541aacf8b63',
    'item_799',
    'Quirth''s Helmet',
    'Denira Quirth never intended to fight a war - she just wanted to survive it. When the Sandflies defected she swore not to shed the blood of her former colleagues - despite believing that the Sandflies cause was just. Her Unique armor is built to withstand the ordeals of Arrakis - but not the darts of her enemies.',
    't_ui_iconclothneutsmugdeserterunique04helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '234b6ae3-89cc-42f8-943b-08c38fceb6c4',
    'item_800',
    'Quirth''s Jacket',
    'Denira Quirth never intended to fight a war - she just wanted to survive it. When the Sandflies defected she swore not to shed the blood of her former colleagues - despite believing that the Sandflies cause was just. Her Unique armor is built to withstand the ordeals of Arrakis - but not the darts of her enemies.',
    't_ui_iconclothneutsmugdeserterunique04topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '37e31951-5ce0-4201-9420-9958014b3508',
    'item_801',
    'Chosen Boots',
    'The Chosen are the elite warriors of the Maas Kharet cult, which makes its home at the old power station of Mysa Tarill. There are always four Chosen - Fire, Body, Tooth and Breath. Each is a symbolic part of the great sandworm, though this Unique armor is probably just something looted from the station.',
    't_ui_iconclothneutsmugdeserterunique05bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '61d34400-254b-4cde-a40e-e25ff0f72955',
    'item_802',
    'Chosen Pants',
    'The Chosen are the elite warriors of the Maas Kharet cult, which makes its home at the old power station of Mysa Tarill. There are always four Chosen - Fire, Body, Tooth and Breath. Each is a symbolic part of the great sandworm, though this Unique armor is probably just something looted from the station.',
    't_ui_iconclothneutsmugdeserterunique05bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8047a681-9402-4473-ba71-ce899287009c',
    'item_803',
    'Chosen Gauntlets',
    'The Chosen are the elite warriors of the Maas Kharet cult, which makes its home at the old power station of Mysa Tarill. There are always four Chosen - Fire, Body, Tooth and Breath. Each is a symbolic part of the great sandworm, though this Unique armor is probably just something looted from the station.',
    't_ui_iconclothneutsmugdeserterunique05glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5f1198ab-8362-4e7b-a98a-fc1811b04308',
    'item_804',
    'Chosen Helmet',
    'The Chosen are the elite warriors of the Maas Kharet cult, which makes its home at the old power station of Mysa Tarill. There are always four Chosen - Fire, Body, Tooth and Breath. Each is a symbolic part of the great sandworm, though this Unique armor is probably just something looted from the station.',
    't_ui_iconclothneutsmugdeserterunique05helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5f36298e-ed1b-488e-a894-923dfb920214',
    'item_805',
    'Chosen Chestplate',
    'The Chosen are the elite warriors of the Maas Kharet cult, which makes its home at the old power station of Mysa Tarill. There are always four Chosen - Fire, Body, Tooth and Breath. Each is a symbolic part of the great sandworm, though this Unique armor is probably just something looted from the station.',
    't_ui_iconclothneutsmugdeserterunique05topr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4d0810f1-db38-4b15-a6d0-d9a17e1f12d7',
    'item_806',
    'Pincushion Boots',
    'This Unique armor set uses an experimental plasmeld layer to absorb dart impacts. In the earliest versions, the darts would stick in the gel-like outer layer, leaving the wearer bristling with darts like a pincushion. Though that flaw has been perfected, the name persists.',
    't_ui_iconclothneutsmugdeserterunique06bootsr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c99efec9-d1ea-4ead-bb26-b091dc39cafa',
    'item_807',
    'Pincushion Pants',
    'This Unique armor set uses an experimental plasmeld layer to absorb dart impacts. In the earliest versions, the darts would stick in the gel-like outer layer, leaving the wearer bristling with darts like a pincushion. Though that flaw has been perfected, the name persists.',
    't_ui_iconclothneutsmugdeserterunique06bottomr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ade7ef04-a571-4dd9-aad3-26c505159af0',
    'item_808',
    'Pincushion Gauntlets',
    'This Unique armor set uses an experimental plasmeld layer to absorb dart impacts. In the earliest versions, the darts would stick in the gel-like outer layer, leaving the wearer bristling with darts like a pincushion. Though that flaw has been perfected, the name persists.',
    't_ui_iconclothneutsmugdeserterunique06glovesr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '28aaa84f-ca85-4487-93bf-0d1857c5b9ca',
    'item_809',
    'Pincushion Helmet',
    'This Unique armor set uses an experimental plasmeld layer to absorb dart impacts. In the earliest versions, the darts would stick in the gel-like outer layer, leaving the wearer bristling with darts like a pincushion. Though that flaw has been perfected, the name persists.',
    't_ui_iconclothneutsmugdeserterunique06helmetr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd9979b64-5976-4090-877a-609afe27b65c',
    'item_818',
    'Maula Bracers',
    'Maula are the lowest caste in the Imperium. This clothing reflects that caste, being of such poor quality that it offers no protection against weapon or weather.',
    't_ui_iconclothchoammaulaclothingwristmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '93d4b2da-6d15-47ed-9e62-31bf3d186324',
    'item_819',
    'Maula Boots',
    'Maula are the lowest caste in the Imperium. This clothing reflects that caste, being of such poor quality that it offers no protection against weapon or weather.',
    't_ui_iconclothchoammaulaclothingshoesmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '48c2ad6c-2e1c-44d9-aa6e-3a2099c027e8',
    'item_820',
    'Maula Vest',
    'Maula are the lowest caste in the Imperium. This clothing reflects that caste, being of such poor quality that it offers no protection against weapon or weather.',
    't_ui_iconclothchoammaulaclothingtopmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '05de18e6-cdd6-4226-a82a-0b9575845cea',
    'item_821',
    'Maula Vest',
    'Maula are the lowest caste in the Imperium. This clothing reflects that caste, being of such poor quality that it offers no protection against weapon or weather.',
    't_ui_iconclothsmugmaulafremkittopmaler_d.webp',
    'Garment',
    'Unknown',
    NULL,
    0,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd027116e-7791-403f-83b2-e1e12b6479ca',
    'item_892',
    'Shadow Hood',
    'This Unique hood is designed to reduce the harm caused by direct sunlight. It has been soaked in the juice of the creosote bush - inhibiting sweating and reducing heat buildup.',
    't_ui_iconclothstillsuituniquehighmitigation04maskr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7f3f17ca-1bcc-4ee5-a2c0-b97b33126385',
    'item_893',
    'Shaded Hood',
    'This Unique hood is designed to reduce the harm caused by direct sunlight. It has been soaked in the juice of the creosote bush - inhibiting sweating and reducing heat buildup.',
    't_ui_iconclothstillsuituniquehighmitigation05maskr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8f171dcf-9e0f-48af-b9a1-8ab85ddc19b2',
    'item_894',
    'Pardot''s Hood',
    'This Unique hood is designed to reduce the harm caused by direct sunlight. The famous planetologist, Pardot Kynes, designed this hood for Fremen workers who were helping with his experiments. It has been soaked in the juice of the creosote bush - inhibiting sweating and reducing heat buildup.',
    't_ui_iconclothstillsuituniquehighmitigation06maskr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '399eea23-9ec8-423c-874c-4a2401f7e955',
    'item_895',
    'Reaper Gloves',
    'Treated with a small amount of huf-huf oil, these Unique gloves repel water and prevent any additional dew from escaping while harvesting.',
    't_ui_iconclothlightuniquedewreapgloves03r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6a3a9739-4f8d-4950-ac6f-8ba007ab280c',
    'item_896',
    'Improved Reaper Gloves',
    'Treated with a small amount of huf-huf oil, these Unique gloves repel water and prevent any additional dew from escaping while harvesting.',
    't_ui_iconclothlightuniquedewreapgloves04r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7d819479-702d-487b-8535-f783ad75d04e',
    'item_897',
    'Advanced Reaper Gloves',
    'Treated with a small amount of huf-huf oil, these Unique gloves repel water and prevent any additional dew from escaping while harvesting.',
    't_ui_iconclothlightuniquedewreapgloves05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 800/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd614e2f0-71da-41a8-8cd5-c322856d209b',
    'item_898',
    'Yueh''s Reaper Gloves',
    'The treatment for these gloves was designed by the traitor, Dr Yueh. Originally he was searching for a way to repel blood from gloves during surgeries, but the applications of his water repellant treatment were wider than he imagined. Treated with a small amount of huf-huf oil, these Unique gloves repel water and prevent any additional dew from escaping while harvesting.',
    't_ui_iconclothlightuniquedewreapgloves06r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3632e028-a05b-491d-be08-424da09af056',
    'item_899',
    'Rigged Suspensor Jacket',
    'Used primarily by those who are called to spend long hours doing heavy activity while using suspensor belts, this Unique jacket features a series of specially designed capacitors to optimize the flow of energy through battery pack and suspensor belt.',
    't_ui_iconclothlightuniquereducesuspensortop03r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f0c81652-4ad8-407d-982e-465481468c8c',
    'item_902',
    'Improved Suspensor Jacket',
    'Used primarily by those who are called to spend long hours doing heavy activity while using suspensor belts, this Unique jacket features a series of specially designed capacitors to optimize the flow of energy through battery pack and suspensor belt.',
    't_ui_iconclothlightuniquereducesuspensortop04r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '04ca5e2a-c7d6-451d-994c-90e90b87d9fd',
    'item_903',
    'Spice Mask',
    'A mask with a filtration system that prevents the wearer from inhaling airborne spice particles. Dunemen utilize this to avoid adverse addictive effects while working the spice fields.',
    't_ui_iconclothspicemaskr_d.webp',
    'Garment',
    'Unknown',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0c58b85d-f25c-4adc-a431-28e22180d4b3',
    'item_904',
    'Advanced Suspensor Jacket',
    'Used primarily by those who are called to spend long hours doing heavy activity while using suspensor belts, this Unique jacket features a series of specially designed capacitors to optimize the flow of energy through battery pack and suspensor belt.',
    't_ui_iconclothlightuniquereducesuspensortop05r_d.webp',
    'Garment',
    'Unknown',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7616e485-5253-4e16-9d95-3a1db0b3df26',
    'item_428',
    'Buggy Booster Mk3',
    'Adds a boost ability to the Buggy providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Buggy Rear Hull.',
    't_ui_iconvehccbboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5600d082-770e-423e-9c6b-597cdb8c2217',
    'item_429',
    'Buggy Booster Mk4',
    'Adds a boost ability to the Buggy providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Buggy Rear Hull.',
    't_ui_iconvehccbboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8d173bbb-2d7c-4ffc-93c7-c5915f7352d0',
    'item_430',
    'Buggy Booster Mk5',
    'Adds a boost ability to the Buggy providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Buggy Rear Hull.',
    't_ui_iconvehccbboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bd833174-f6bb-4655-968a-d6cb124af3d6',
    'item_431',
    'Buggy Booster Mk6',
    'Adds a boost ability to the Buggy providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Buggy Rear Hull.',
    't_ui_iconvehccbboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '86507396-11b5-488c-bc10-a60b24dd04d4',
    'item_494',
    'Scout Ornithopter Thruster Mk4',
    'Adds a thrust ability to a Scout Ornithopter. Thrusters provide a triggerable burst of acceleration and increased maximum speed. Thrusters have a fixed duration and cooldown time. Use a Welding Torch to attach it to a Scout Ornithopter Body Hull.',
    't_ui_iconvehcolboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '222689ed-9520-4c9e-9464-4ad2064ed15d',
    'item_495',
    'Scout Ornithopter Thruster Mk5',
    'Adds a thrust ability to a Scout Ornithopter. Thrusters provide a triggerable burst of acceleration and increased maximum speed. Thrusters have a fixed duration and cooldown time. Use a Welding Torch to attach it to a Scout Ornithopter Body Hull.',
    't_ui_iconvehcolboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '082e9003-acba-4bbf-bdfd-c98daa4f8e10',
    'item_496',
    'Scout Ornithopter Thruster Mk6',
    'Adds a thrust ability to a Scout Ornithopter. Thrusters provide a triggerable burst of acceleration and increased maximum speed. Thrusters have a fixed duration and cooldown time. Use a Welding Torch to attach it to a Scout Ornithopter Body Hull.',
    't_ui_iconvehcolboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e4e3d644-caca-4807-acae-f0e33b2db61e',
    'item_525',
    'Assault Ornithopter Thruster Mk5',
    'Adds a thrust ability to an Assault Ornithopter. Thrusters provide a triggerable burst of acceleration and increased maximum speed. Thrusters have a fixed duration and cooldown time. Use a Welding Torch to attach it to an Assault Ornithopter Cabin.',
    't_ui_iconvehcmoboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '54633899-ca03-4cef-8ec0-79e54fe8823d',
    'item_526',
    'Assault Ornithopter Thruster Mk6',
    'Adds a thrust ability to an Assault Ornithopter. Thrusters provide a triggerable burst of acceleration and increased maximum speed. Thrusters have a fixed duration and cooldown time. Use a Welding Torch to attach it to an Assault Ornithopter Cabin.',
    't_ui_iconvehcmoboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd2161e98-e2ec-4d59-9053-3efa720b7f9e',
    'item_548',
    'Carrier Ornithopter Thruster Mk6',
    'Adds a thrust ability to a Carrier Ornithopter. Thrusters provide a triggerable burst of acceleration and increased maximum speed. Thrusters have a fixed duration and cooldown time. Use a Welding Torch to attach it to a Carrier Ornithopter Main Hull.',
    't_ui_iconvehctothrusterr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '82a2410e-ada8-4c68-acad-2af288f556be',
    'item_558',
    'Sandbike Booster Mk2',
    'Adds a boost ability to the Sandbike providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e270056b-e8ac-4b54-8a7b-0982df77a277',
    'item_559',
    'Sandbike Booster Mk3',
    'Adds a boost ability to the Sandbike providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'bcb8cf60-fcd3-4c9d-a8e1-fa80ffc527a8',
    'item_560',
    'Sandbike Booster Mk4',
    'Adds a boost ability to the Sandbike providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7f04be49-f695-42ca-a54e-33455d9daada',
    'item_561',
    'Sandbike Booster Mk5',
    'Adds a boost ability to the Sandbike providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e4a12ba4-3833-439d-b37a-e4f3af6dc804',
    'item_562',
    'Sandbike Booster Mk6',
    'Adds a boost ability to the Sandbike providing a temporary increase in acceleration and top speed. Use a Welding Torch to attach it to a Sandbike Hull.',
    't_ui_iconvehch1mgcboostr_d.webp',
    'Vehicle Part',
    'Vehicle Booster',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ca54cbaf-7460-4f38-b97f-4843bfeb9d70',
    'item_436',
    'Buggy Chassis Mk3',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Buggy chassis.',
    't_ui_iconvehccbchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7a7b433f-6cae-4612-b190-63e7eba37c20',
    'item_437',
    'Buggy Chassis Mk4',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Buggy chassis.',
    't_ui_iconvehccbchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1d5bbb8a-ad66-4e79-bf54-92a862951be8',
    'item_438',
    'Buggy Chassis Mk5',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Buggy chassis.',
    't_ui_iconvehccbchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '73ab41c6-a819-40ad-bd86-20617ec38064',
    'item_439',
    'Buggy Chassis Mk6',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Buggy chassis.',
    't_ui_iconvehccbchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '20cdcb6e-ef28-4919-b36b-2d45663c3999',
    'item_500',
    'Scout Ornithopter Chassis Mk4',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Ornithopter chassis.',
    't_ui_iconvehcolchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9f989530-83c5-4521-a897-099f9b9199ae',
    'item_501',
    'Scout Ornithopter Chassis Mk5',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Ornithopter chassis.',
    't_ui_iconvehcolchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2c5463cc-3194-436e-a32d-17f96a67a408',
    'item_502',
    'Scout Ornithopter Chassis Mk6',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Ornithopter chassis.',
    't_ui_iconvehcolchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '36fbfba4-68ee-4753-a27f-76f77b898b55',
    'item_529',
    'Assault Ornithopter Chassis Mk5',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Assault Ornithopter chassis.',
    't_ui_iconvehcmochassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8dd50aef-41b5-4a17-851f-8c9b63f86354',
    'item_530',
    'Assault Ornithopter Chassis Mk6',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Assault Ornithopter chassis.',
    't_ui_iconvehcmochassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '863f27ba-2c0b-4b87-8720-c365e549e59d',
    'item_550',
    'Carrier Ornithopter Chassis Mk6',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Carrier Ornithopter chassis.',
    't_ui_iconvehctochassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd931b57e-be86-4e1c-a1b6-a518ae09f911',
    'item_568',
    'Sandbike Chassis Mk1',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandbike chassis.',
    't_ui_iconvehch1mgcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e757aed5-f93a-4755-b106-fdf529db1f11',
    'item_569',
    'Sandbike Chassis Mk2',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandbike chassis.',
    't_ui_iconvehch1mgcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b6f42e40-9a69-4bde-b609-999dd1c3ada3',
    'item_570',
    'Sandbike Chassis Mk3',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandbike chassis.',
    't_ui_iconvehch1mgcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4fed0081-b260-4fc3-8586-448ac5f17582',
    'item_571',
    'Sandbike Chassis Mk4',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandbike chassis.',
    't_ui_iconvehch1mgcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '5061531f-f17e-46d9-87da-830d9272c5b3',
    'item_572',
    'Sandbike Chassis Mk5',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandbike chassis.',
    't_ui_iconvehch1mgcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c545b4ba-d1ea-4c60-9511-3e8001e2ce5d',
    'item_573',
    'Sandbike Chassis Mk6',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandbike chassis.',
    't_ui_iconvehch1mgcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4a634f58-29fd-4745-96d7-9e554f53ce46',
    'item_608',
    'Sandcrawler Chassis Mk6',
    'The chassis is the starting point for assembling vehicles as it provides the base framework to which all other components are attached. Use a Welding Torch to place the Sandcrawler chassis',
    't_ui_iconvehcigcchassisr_d.webp',
    'Vehicle Part',
    'Vehicle Chasis',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4ba676b9-e4e0-4f59-9dba-66192ae0ac18',
    'item_440',
    'Buggy Engine Mk3',
    'Defines the acceleration and speed of the Buggy. Use a Welding Torch to attach the engine to a Buggy Chassis.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '08a73061-8de2-4247-9c4c-2701c3ce9776',
    'item_442',
    'Buggy Engine Mk4',
    'Defines the acceleration and speed of the Buggy. Use a Welding Torch to attach the engine to a Buggy Chassis.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1b508a1b-b958-43b9-99cf-c17ccf5b6d3a',
    'item_443',
    'Buggy Engine Mk5',
    'Defines the acceleration and speed of the Buggy. Use a Welding Torch to attach the engine to a Buggy Chassis.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '857c18cd-3c6e-4f49-bc8a-bd73391814ca',
    'item_445',
    'Buggy Engine Mk6',
    'Defines the acceleration and speed of the Buggy. Use a Welding Torch to attach the engine to a Buggy Chassis.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b22766a4-6278-40f7-ba6e-176c9c317dcb',
    'item_447',
    'Bluddshot Buggy Engine Mk3',
    'Tio Holtzman was patron to the nobleman Niko Bludd, who provided funding for his research. One day this would lead to the development of the Holtzman effect, but earlier experiments such as this Unique engine are another result of that collaboration. The name has been corrupted over the centuries since.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e2a29c43-111b-45cb-aa84-ba11a0b14765',
    'item_448',
    'Bluddshot Buggy Engine Mk4',
    'Tio Holtzman was patron to the nobleman Niko Bludd, who provided funding for his research. One day this would lead to the development of the Holtzman effect, but earlier experiments such as this Unique engine are another result of that collaboration. The name has been corrupted over the centuries since.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c2026549-94f3-409a-83e1-dd583550ab1f',
    'item_449',
    'Bluddshot Buggy Engine Mk5',
    'Tio Holtzman was patron to the nobleman Niko Bludd, who provided funding for his research. One day this would lead to the development of the Holtzman effect, but earlier experiments such as this Unique engine are another result of that collaboration. The name has been corrupted over the centuries since.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fdb60521-28c1-40a2-9ee4-4dc7aee5bd23',
    'item_450',
    'Bluddshot Buggy Engine Mk6',
    'Tio Holtzman was patron to the nobleman Niko Bludd, who provided funding for his research. One day this would lead to the development of the Holtzman effect, but earlier experiments such as this Unique engine are another result of that collaboration. The name has been corrupted over the centuries since.',
    't_ui_iconvehccbenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'be918b23-5112-4af8-a477-5e480db8a752',
    'item_503',
    'Scout Ornithopter Engine Mk4',
    'Defines the maximum speed of a Scout Ornithopter. Use a Welding Torch to attach the engine to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e5456630-e3ff-4864-9e24-01c333a7a770',
    'item_504',
    'Scout Ornithopter Engine Mk5',
    'Defines the maximum speed of a Scout Ornithopter. Use a Welding Torch to attach the engine to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fb216bfe-63c1-4e6a-9a0a-17bb183f033f',
    'item_505',
    'Scout Ornithopter Engine Mk6',
    'Defines the maximum speed of a Scout Ornithopter. Use a Welding Torch to attach the engine to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '03dbbc75-ea0b-48af-b998-6e5412cf5ba5',
    'item_531',
    'Assault Ornithopter Engine Mk5',
    'Defines the maximum speed of an Assault Ornithopter. Use a Welding Torch to attach the engine to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmoenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f829d77c-bddb-419f-b865-ec93a45c08e4',
    'item_532',
    'Assault Ornithopter Engine Mk6',
    'Defines the maximum speed of an Assault Ornithopter. Use a Welding Torch to attach the engine to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmoenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '98e68a1f-73db-40ba-a04b-ce06dc438faf',
    'item_551',
    'Carrier Ornithopter Engine Mk6',
    'Defines the maximum speed of a Carrier Ornithopter. Use a Welding Torch to attach the engine to a Carrier Ornithopter Chassis.',
    't_ui_iconvehctoenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9af131ec-9f24-4048-8770-bf66b6cafee6',
    'item_574',
    'Sandbike Engine Mk1',
    'Defines the acceleration and speed of a Sandbike. Use a Welding Torch to attach the engine to a Sandbike Chassis.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8272d2b7-f57e-41a3-afb1-1dcf264e1162',
    'item_575',
    'Sandbike Engine Mk2',
    'Defines the acceleration and speed of a Sandbike. Use a Welding Torch to attach the engine to a Sandbike Chassis.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1a664bbc-c44d-4269-addd-efa1f8ee358c',
    'item_576',
    'Sandbike Engine Mk3',
    'Defines the acceleration and speed of a Sandbike. Use a Welding Torch to attach the engine to a Sandbike Chassis.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6035b7b5-2e16-4c8f-9e49-4362225d562d',
    'item_577',
    'Sandbike Engine Mk4',
    'Defines the acceleration and speed of a Sandbike. Use a Welding Torch to attach the engine to a Sandbike Chassis.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '999525a3-7fae-4bb9-98b1-095ccc3a5f98',
    'item_578',
    'Sandbike Engine Mk5',
    'Defines the acceleration and speed of a Sandbike. Use a Welding Torch to attach the engine to a Sandbike Chassis.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2b426cd8-0ce6-4f3e-975e-eac5ebf94f88',
    'item_579',
    'Sandbike Engine Mk6',
    'Defines the acceleration and speed of a Sandbike. Use a Welding Torch to attach the engine to a Sandbike Chassis.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ec9472a8-21f4-448c-9ef6-7296617e013c',
    'item_580',
    'Mohandis Sandbike Engine Mk1',
    'The Mohandis family claim their ancestry as merchant-engineers and even claim that this model of engine was crafted by an ancestor known only as Slide Rule. A Unique modification allows it be fitted into sandbikes - giving increased speed at the cost of additional heat.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '33d6b78f-798b-4722-b7b9-73c65a003e6c',
    'item_581',
    'Mohandis Sandbike Engine Mk2',
    'The Mohandis family claim their ancestry as merchant-engineers and even claim that this model of engine was crafted by an ancestor known only as Slide Rule. A Unique modification allows it be fitted into sandbikes - giving increased speed at the cost of additional heat.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '10f6dd99-0c9e-4361-8b04-9cac2f1d8247',
    'item_582',
    'Mohandis Sandbike Engine Mk3',
    'The Mohandis family claim their ancestry as merchant-engineers and even claim that this model of engine was crafted by an ancestor known only as Slide Rule. A Unique modification allows it be fitted into sandbikes - giving increased speed at the cost of additional heat.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c08b11c0-8ff3-498d-956d-0c31b74d05c6',
    'item_583',
    'Mohandis Sandbike Engine Mk4',
    'The Mohandis family claim their ancestry as merchant-engineers and even claim that this model of engine was crafted by an ancestor known only as Slide Rule. A Unique modification allows it be fitted into sandbikes - giving increased speed at the cost of additional heat.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '53af2e17-3382-4f3e-917f-c98ab141d5df',
    'item_584',
    'Mohandis Sandbike Engine Mk5',
    'The Mohandis family claim their ancestry as merchant-engineers and even claim that this model of engine was crafted by an ancestor known only as Slide Rule. A Unique modification allows it be fitted into sandbikes - giving increased speed at the cost of additional heat.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6ffb5366-d72f-49d0-a39e-a669a0a32ea9',
    'item_585',
    'Mohandis Sandbike Engine Mk6',
    'The Mohandis family claim their ancestry as merchant-engineers and even claim that this model of engine was crafted by an ancestor known only as Slide Rule. A Unique modification allows it be fitted into sandbikes - giving increased speed at the cost of additional heat.',
    't_ui_iconvehch1mgcenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0ca38588-cfc9-4af2-930e-10480041286b',
    'item_609',
    'Sandcrawler Engine Mk6',
    'Defines the acceleration and speed of the Sandcrawler. Use a Welding Torch to attach the engine to a Sandcrawler Chassis.',
    't_ui_iconvehcigenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '61be82f0-0f4c-4a9d-aa5c-617942c7cfee',
    'item_610',
    'Walker Sandcrawler Engine Mk6',
    'When every second on the sands counts, this Unique sandcrawler engine''s increased speed will allow for quicker spice harvesting operations.',
    't_ui_iconvehcigenginer_d.webp',
    'Vehicle Part',
    'Vehicle Engine',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '08e95413-657e-4357-bb35-c44c65030a0c',
    'item_468',
    'Buggy Hull Mk3',
    'Comes with a driver and a passenger seat. Use a Welding Torch to attach the front hull to a Buggy Chassis.',
    't_ui_iconvehccbcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'aa80802c-1b71-474a-bc2f-0b5c6bbd8839',
    'item_469',
    'Buggy Hull Mk4',
    'Comes with a driver and a passenger seat. Use a Welding Torch to attach the front hull to a Buggy Chassis.',
    't_ui_iconvehccbcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3600b4a5-b18a-4e50-8657-00f9b4c3a7f0',
    'item_470',
    'Buggy Hull Mk5',
    'Comes with a driver and a passenger seat. Use a Welding Torch to attach the front hull to a Buggy Chassis.',
    't_ui_iconvehccbcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '249e86e7-dbf7-43ba-8de7-c8aecdc43696',
    'item_471',
    'Buggy Hull Mk6',
    'Comes with a driver and a passenger seat. Use a Welding Torch to attach the front hull to a Buggy Chassis.',
    't_ui_iconvehccbcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f0ec4a22-fe08-4057-9473-bf0bf62bbb07',
    'item_509',
    'Scout Ornithopter Hull Mk4',
    'Adds a protective layer to the body of a Scout Ornithopter. Use a welding torch to attach the body hull to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolhullr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'a3a84fe6-9bc2-4cf4-8151-39e2d8b6ab4a',
    'item_510',
    'Scout Ornithopter Hull Mk5',
    'Adds a protective layer to the body of a Scout Ornithopter. Use a welding torch to attach the body hull to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolhullr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e22916b5-29aa-48cf-8b6c-5c69534a48cc',
    'item_511',
    'Scout Ornithopter Hull Mk6',
    'Adds a protective layer to the body of a Scout Ornithopter. Use a welding torch to attach the body hull to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolhullr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8b93b1c9-5232-4b25-aaee-049d933d5109',
    'item_512',
    'Scout Ornithopter Cockpit Mk4',
    'Control module for a Scout Ornithopter. Includes a pilot seat. Use a Welding Torch to attach the cockpit to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '921cafed-122d-4934-82b9-ce46ca1b9a5a',
    'item_513',
    'Scout Ornithopter Cockpit Mk5',
    'Control module for a Scout Ornithopter. Includes a pilot seat. Use a Welding Torch to attach the cockpit to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '715670d3-e94b-4ea4-a5a0-519894b375e3',
    'item_514',
    'Scout Ornithopter Cockpit Mk6',
    'Control module for a Scout Ornithopter. Includes a pilot seat. Use a Welding Torch to attach the cockpit to a Scout Ornithopter Chassis.',
    't_ui_iconvehcolcockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e549f7d2-3995-480c-b74d-25a400ffeb1e',
    'item_535',
    'Assault Ornithopter Cabin Mk5',
    'Enclosed cabin for the Assault Ornithopter. Includes seating for two passengers. Use a Welding Torch to attach the cabin to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmohullr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2cfb736f-4910-4cfa-bd2a-9d7fe4a450c5',
    'item_536',
    'Assault Ornithopter Cabin Mk6',
    'Enclosed cabin for the Assault Ornithopter. Includes seating for two passengers. Use a Welding Torch to attach the cabin to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmohullr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '887b6950-61c5-4fb1-ba15-9b8ed4dd0c65',
    'item_537',
    'Assault Ornithopter Tail Mk5',
    'Adds a protective layer to the rear of the Assault Ornithopter. Use a Welding Torch to attach the tail to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmotailr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '1d424bfe-8de8-4891-b8dc-d64e5e4729ae',
    'item_538',
    'Assault Ornithopter Tail Mk6',
    'Adds a protective layer to the rear of the Assault Ornithopter. Use a Welding Torch to attach the tail to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmotailr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71d5c1d2-c0e8-44e2-bc50-bc88995dd941',
    'item_539',
    'Assault Ornithopter Cockpit Mk5',
    'Enclosed cockpit for the Assault Ornithopter. Includes seating for the pilot and co-pilot. Use a Welding Torch to attach the cockpit to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmocockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '09261128-165d-4adf-81a1-c8eb0c8192fa',
    'item_540',
    'Assault Ornithopter Cockpit Mk6',
    'Enclosed cockpit for the Assault Ornithopter. Includes seating for the pilot and co-pilot. Use a Welding Torch to attach the cockpit to an Assault Ornithopter Chassis.',
    't_ui_iconvehcmocockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'c87b34ad-d048-449b-a81a-a918965f8c92',
    'item_553',
    'Carrier Ornithopter Main Hull Mk6',
    'Enclosed cabin for the Carrier Ornithopter. Includes seating for the pilot and five passengers. Use a Welding Torch to attach the main hull to a Carrier Ornithopter Chassis.',
    't_ui_iconvehctocockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '50df1754-d03e-419c-94e6-d67f5ce5e832',
    'item_554',
    'Carrier Ornithopter Tail Hull Mk6',
    'Adds a protective layer to the rear of the Carrier Ornithopter. Use a Welding Torch to attach the tail hull to a Carrier Ornithopter Chassis.',
    't_ui_iconvehctotailr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4d922bc2-385a-48f3-bf2a-93b87aa46170',
    'item_555',
    'Carrier Ornithopter Side Hull Mk6',
    'Adds a protective layer to the sides of the Carrier Ornithopter. Use a Welding Torch to attach the side hull to a Carrier Ornithopter Chassis.',
    't_ui_iconvehctohullr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fa0e0bc8-985b-4bc8-9a9a-9c057403fe94',
    'item_612',
    'Sandcrawler Cabin Mk6',
    'Enclosed control module for a Sandcrawler. Includes seating for the driver and one passenger. Use a Welding Torch to attach the cabin to a Sandcrawler Chassis.',
    't_ui_iconvehcigccockpitr_d.webp',
    'Vehicle Part',
    'Vehicle Hull Body',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6350b6ed-a3c3-4603-80ee-6b0fb8e7f8e6',
    'item_607',
    'Sandbike Backseat Mk1',
    'Adds additional seating for a passenger to a Sandbike. Attach the passenger seat to a Sandbike Hull with a Welding Torch.',
    't_ui_iconvehch1mgbackseatr_d.webp',
    'Vehicle Part',
    'Vehicle Seat',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dc681dc6-5ac1-473e-8ba5-361423f06114',
    'item_472',
    'Buggy Storage Mk3',
    'Adds inventory space to the Buggy. Use a Welding Torch to attach it to the Buggy Rear Hull.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Vehicle Part',
    'Vehicle Storage',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '35b33ad6-d83c-4880-bd29-b105642864bd',
    'item_473',
    'Buggy Storage Mk4',
    'Adds inventory space to the Buggy. Use a Welding Torch to attach it to the Buggy Rear Hull.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Vehicle Part',
    'Vehicle Storage',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99d5d85b-ace7-4807-8848-621d4819cedb',
    'item_474',
    'Buggy Storage Mk5',
    'Adds inventory space to the Buggy. Use a Welding Torch to attach it to the Buggy Rear Hull.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Vehicle Part',
    'Vehicle Storage',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '26d1a19c-9835-4410-83b0-3a9b1a4beabf',
    'item_475',
    'Buggy Storage Mk6',
    'Adds inventory space to the Buggy. Use a Welding Torch to attach it to the Buggy Rear Hull.',
    't_ui_iconvehccbinventoryr_d.webp',
    'Vehicle Part',
    'Vehicle Storage',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd3a1f8c3-8962-406e-adc4-9be839db63ff',
    'item_515',
    'Scout Ornithopter Storage Mk4',
    'Adds inventory space to a Scout Ornithopter. Use a Welding Torch to attach it to a Scout Ornithopter Body Hull.',
    't_ui_iconvehcolinventoryr_d.webp',
    'Vehicle Part',
    'Vehicle Storage',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4fe17825-ecb5-4ff1-8f80-3fca8a5711c7',
    'item_541',
    'Assault Ornithopter Storage Mk5',
    'Optional Old Imperial module that adds inventory storage to an Assault Ornithopter. Use a Welding Torch to attach it to an Assault Ornithopter Body Hull.',
    't_ui_iconvehcominventoryr_d.webp',
    'Vehicle Part',
    'Vehicle Storage',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '32ef2a2c-ad67-4ab1-a2f0-a47ce514f6c4',
    'item_48',
    'The Emperor''s Wings Mk1',
    'A prop from the famous play ''My Father''s Shadow'', this Unique suspensor belt is used by Jongleurs for short, but effective bursts of floating during performances. Jump twice to activate and float upwards. Suspensor fields are notorious for preserving momentum, and they deplete power as long as they are kept activated.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    1,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '6cac48ff-9def-49e7-8f47-84b70add500d',
    'item_58',
    'The Emperor''s Wings Mk2',
    'A prop from the famous play ''My Father''s Shadow'', this Unique suspensor belt is used by Jongleurs for short, but effective bursts of floating during performances. Jump twice to activate and float upwards. Suspensor fields are notorious for preserving momentum, and they deplete power as long as they are kept activated.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    2,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'db840144-95b2-4fa0-83b2-a3ecbf1630cd',
    'item_60',
    'The Emperor''s Wings Mk3',
    'A prop from the famous play ''My Father''s Shadow'', this Unique suspensor belt is used by Jongleurs for short, but effective bursts of floating during performances. Jump twice to activate and float upwards. Suspensor fields are notorious for preserving momentum, and they deplete power as long as they are kept activated.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    3,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '9672e663-bcd3-43af-9a5a-81b1c6147480',
    'item_62',
    'The Emperor''s Wings Mk4',
    'A prop from the famous play ''My Father''s Shadow'', this Unique suspensor belt is used by Jongleurs for short, but effective bursts of floating during performances. Jump twice to activate and float upwards. Suspensor fields are notorious for preserving momentum, and they deplete power as long as they are kept activated.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    4,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '84f09a78-09bf-4686-a226-0fbefe67d792',
    'item_63',
    'The Emperor''s Wings Mk5',
    'A prop from the famous play ''My Father''s Shadow'', this Unique suspensor belt is used by Jongleurs for short, but effective bursts of floating during performances. Jump twice to activate and float upwards. Suspensor fields are notorious for preserving momentum, and they deplete power as long as they are kept activated.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '0c1a2663-6e0d-4790-915c-b2e057384592',
    'item_64',
    'The Emperor''s Wings Mk6',
    'A prop from the famous play ''My Father''s Shadow'', this Unique suspensor belt is used by Jongleurs for short, but effective bursts of floating during performances. Jump twice to activate and float upwards. Suspensor fields are notorious for preserving momentum, and they deplete power as long as they are kept activated.',
    't_ui_iconwearchoamsuspensorpartialreductionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '972074b3-d11a-4266-a118-e53b3334a3e3',
    'item_482',
    'Buggy Tread Mk3',
    'Defines the grip of the Buggy. Use a Welding Torch to attach the treads to a Buggy Chassis. All attached treads must be of the same type.',
    't_ui_iconvehccbtreadsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '13f58724-8798-43bc-86ed-50d64e1a5929',
    'item_483',
    'Buggy Tread Mk4',
    'Defines the grip of the Buggy. Use a Welding Torch to attach the treads to a Buggy Chassis. All attached treads must be of the same type.',
    't_ui_iconvehccbtreadsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
-- Progress: 900/934 entities processed
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '83e700ef-f536-4f16-8ec2-0ff5a26f0356',
    'item_484',
    'Buggy Tread Mk5',
    'Defines the grip of the Buggy. Use a Welding Torch to attach the treads to a Buggy Chassis. All attached treads must be of the same type.',
    't_ui_iconvehccbtreadsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ab81f081-ff04-4c85-b126-9c926dff10c5',
    'item_485',
    'Buggy Tread Mk6',
    'Defines the grip of the Buggy. Use a Welding Torch to attach the treads to a Buggy Chassis. All attached treads must be of the same type.',
    't_ui_iconvehccbtreadsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '8c1502be-9737-40d0-88a8-730c81d16728',
    'item_518',
    'Scout Ornithopter Wing Mk4',
    'A wing assembly that provides aerodynamic lift for a Scout Ornithopter. Use a Welding Torch to attach the wings to the Body Hull of an ornithopter. All attached wings must be of the same type.',
    't_ui_iconvehcolwingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '99cb1a3a-6123-48ae-8a4b-200beca3e396',
    'item_519',
    'Scout Ornithopter Wing Mk5',
    'A wing assembly that provides aerodynamic lift for a Scout Ornithopter. Use a Welding Torch to attach the wings to the Body Hull of an ornithopter. All attached wings must be of the same type.',
    't_ui_iconvehcolwingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '89734828-b8ef-4926-96ad-bd01f268b589',
    'item_520',
    'Scout Ornithopter Wing Mk6',
    'A wing assembly that provides aerodynamic lift for a Scout Ornithopter. Use a Welding Torch to attach the wings to the Body Hull of an ornithopter. All attached wings must be of the same type.',
    't_ui_iconvehcolwingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '393380c8-67ed-4ca5-8f28-07c5d71dfc7e',
    'item_521',
    'Albatross Wing Module Mk4',
    'Named for the birds from old terra who could cross an ocean with a single wingbeat, these Unique ''thopter wings are designed for speed, but they limit maneuverability.',
    't_ui_iconvehcolwingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '7a53751d-871c-41dc-8e70-96818e8241ef',
    'item_522',
    'Albatross Wing Module Mk5',
    'Named for the birds from old terra who could cross an ocean with a single wingbeat, these Unique ''thopter wings are designed for speed, but they limit maneuverability.',
    't_ui_iconvehcolwingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'fbe01d4d-3927-47b4-8e8f-08a0d5e4db3a',
    'item_523',
    'Albatross Wing Module Mk6',
    'Named for the birds from old terra who could cross an ocean with a single wingbeat, these Unique ''thopter wings are designed for speed, but they limit maneuverability.',
    't_ui_iconvehcolwingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dcb30a8e-7e62-46da-90b5-185d7dc3e5ae',
    'item_544',
    'Assault Ornithopter Wing Mk5',
    'A wing assembly that provides aerodynamic lift for an Assault Ornithopter. Use a Welding Torch to attach the wings to the Cabin of an ornithopter. All attached wings must be of the same type.',
    't_ui_iconvehcmowingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'ce177db9-23a1-4e58-aed1-3a3025505c67',
    'item_545',
    'Assault Ornithopter Wing Mk6',
    'A wing assembly that provides aerodynamic lift for an Assault Ornithopter. Use a Welding Torch to attach the wings to the Cabin of an ornithopter. All attached wings must be of the same type.',
    't_ui_iconvehcmowingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd976b922-6a82-4f10-ad82-71398e24375f',
    'item_546',
    'Hummingbird Wing Module Mk5',
    'This Unique wing was developed during the Harkonnen stewardship of Arrakis, before the current War of Assassins. The Fremen were fond of raiding Harkonnen bases and stealing these Ornithopters, then using them in kamikaze attacks on harvesting operations.',
    't_ui_iconvehcmowingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2878ee7c-c679-489d-bbb9-16c0fbbec13a',
    'item_547',
    'Hummingbird Wing Module Mk6',
    'This Unique wing was developed during the Harkonnen stewardship of Arrakis, before the current War of Assassins. The Fremen were fond of raiding Harkonnen bases and stealing these Ornithopters, then using them in kamikaze attacks on harvesting operations.',
    't_ui_iconvehcmowingsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71f37994-77d3-4fcb-87a6-743c9be5a23e',
    'item_556',
    'Carrier Ornithopter Wing Mk6',
    'Influences the flying capabilities of the Ornithopter. Use a welding torch to attach the wings to the side hulls. (Attached wings must be of the same type.)',
    't_ui_iconvehctolocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4c616ac1-ed28-4a6c-8101-b740e7dfccfa',
    'item_557',
    'Roc Carrier Wing',
    'Named for the birds from old terra who could cross an ocean with a single wingbeat, these Unique ''thopter wings are designed for speed, but they limit maneuverability.',
    't_ui_iconvehctolocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'e82a61dc-6a0d-4159-b7a4-9f04927a05bd',
    'item_600',
    'Sandbike Tread Mk1',
    'Defines the grip of the Sandbike. Use a Welding Torch to attach the treads to a Sandbike Chassis. All attached treads must be of the same type.',
    't_ui_iconvehch1mgclocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd558a18d-1c64-46a5-bcf6-952f651ceb09',
    'item_601',
    'Sandbike Tread Mk2',
    'Defines the grip of the Sandbike. Use a Welding Torch to attach the treads to a Sandbike Chassis. All attached treads must be of the same type.',
    't_ui_iconvehch1mgclocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    2,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '110857fd-b7a2-4cd2-9eb1-ca00794f7be9',
    'item_602',
    'Sandbike Tread Mk3',
    'Defines the grip of the Sandbike. Use a Welding Torch to attach the treads to a Sandbike Chassis. All attached treads must be of the same type.',
    't_ui_iconvehch1mgclocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '118185f7-f13d-4576-9a2e-0eb267141151',
    'item_603',
    'Sandbike Tread Mk4',
    'Defines the grip of the Sandbike. Use a Welding Torch to attach the treads to a Sandbike Chassis. All attached treads must be of the same type.',
    't_ui_iconvehch1mgclocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    4,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'dac090f7-488d-4d56-af67-325ae00f9d30',
    'item_604',
    'Sandbike Tread Mk5',
    'Defines the grip of the Sandbike. Use a Welding Torch to attach the treads to a Sandbike Chassis. All attached treads must be of the same type.',
    't_ui_iconvehch1mgclocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '55dd7950-1065-4143-a092-db149ecda72f',
    'item_605',
    'Sandbike Tread Mk6',
    'Defines the grip of the Sandbike. Use a Welding Torch to attach the treads to a Sandbike Chassis. All attached treads must be of the same type.',
    't_ui_iconvehch1mgclocomotionr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '71b8a93d-6bbc-4c6f-af41-f7851b9e8aa4',
    'item_613',
    'Sandcrawler Tread Mk6',
    'Defines the grip of the Sandcrawler. Use a Welding Torch to attach the treads to a Sandcrawler Chassis. All attached treads must be of the same type.',
    't_ui_iconvehcigctreadsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '06c51d93-dad9-478d-a4bd-846b38a0080a',
    'item_614',
    'Dampened Sandcrawler Treads',
    'Walk without rhythm and you won''t attract the worm'' is a difficult principle to apply to a vehicle that is designed to crawl around on sand sucking up spice. These Unique treads apply acoustic principles to lower their overall vibration — but the sandworm will always come regardless.',
    't_ui_iconvehcigctreadsr_d.webp',
    'Vehicle Part',
    'Vehicle Tread Wing',
    NULL,
    6,
    false,
    true,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '26ce436b-6a20-4ddf-ba6f-270343a3c2b9',
    'item_87',
    'Harkonnen Sandbike Variant',
    'A Harkonnen customization that can be applied to Sandbikes.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'f644f291-a084-4ed3-810a-196c540ea02a',
    'item_88',
    'Harkonnen Buggy Variant',
    'A Harkonnen customization that can be applied to Buggies.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'aeff397c-bbde-4358-9519-3e825f8b1f9f',
    'item_89',
    'Atreides Sandbike Variant',
    'An Atreides customization that can be applied to Sandbikes.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '3978622c-2466-46f5-a513-7f381387f0df',
    'item_90',
    'Atreides Buggy Variant',
    'An Atreides customization that can be applied to Buggies.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4597f295-2864-4c57-9fbd-783610235c98',
    'item_91',
    'Harkonnen Light Ornithopter Variant',
    'A Harkonnen customization that can be applied to Light Ornithopters.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'd4c57d31-ff98-4cdd-a862-1666996249c3',
    'item_92',
    'Harkonnen Medium Ornithopter Variant',
    'A Harkonnen customization that can be applied to Medium Ornithopters.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '04c97161-61c0-422c-9f86-8dda0e8d8b74',
    'item_93',
    'Atreides Light Ornithopter Variant',
    'An Atreides customization that can be applied to Light Ornithopters.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '4a68b873-e14d-401c-a202-2e38399ec9f7',
    'item_94',
    'Atreides Medium Ornithopter Variant',
    'An Atreides customization that can be applied to Medium Ornithopters.',
    't_ui_icontmogitemvariant_d.webp',
    'Customization',
    'Vehicle Variant',
    NULL,
    69,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2f469c4e-2343-4e10-9459-fc1ae193748e',
    'item_299',
    'Welding Torch Mk5',
    'A welding torch with high-quality repair capabilities in terms of durability and longevity. Welding Wire is required for repairs. It can also be used to assemble or disassemble vehicles.',
    't_ui_icontool1hchoamvehicleweldingtoolr_d.webp',
    'Utility',
    'Utility Tools',
    NULL,
    5,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '098a9123-113f-4c92-889f-2523fb26c29d',
    'item_301',
    'Welding Torch Mk3',
    'A welding torch with average-quality repair capabilities in terms of durability and longevity. Welding Wire is required for repairs. It can also be used to assemble or disassemble vehicles.',
    't_ui_icontool1hchoamvehicleweldingtoolr_d.webp',
    'Utility',
    'Utility Tools',
    NULL,
    3,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '2e779c9d-0192-43fd-b855-5e2e7a57ff80',
    'item_302',
    'Welding Torch Mk1',
    'A welding torch with low-quality repair capabilities in terms of durability and longevity. Welding Wire is required for repairs. It can also be used to assemble or disassemble vehicles.',
    't_ui_icontool1hchoamvehicleweldingtoolr_d.webp',
    'Utility',
    'Utility Tools',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();
INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    'b1eb9287-5364-4233-9047-e616b4443d23',
    'item_916',
    'Welding Wire',
    'Welding material is required when using the welding torch to repair vehicle parts. Crafted from salvaged metal parts.',
    't_ui_iconresourceweldingwirer_d.webp',
    'Utility',
    'Ammo',
    NULL,
    1,
    false,
    false,
    '{}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();

-- Completed: 934 entities processed successfully (inserted or updated)