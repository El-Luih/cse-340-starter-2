--
--TASK ONE
--
--EXERCISE #1
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
--EXERCISE #2
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;
--EXERCISE #3
DELETE FROM public.account
WHERE account_id = 1;
-- EXERCISE #4
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
--EXERCISE #5
SELECT inv_make,
    inv_model,
    classification_name
FROM public.inventory AS inventory
    INNER JOIN public.classification AS classification ON inventory.classification_id = classification.classification_id
WHERE inventory.classification_id = 2;
--EXERCISE #6
UPDATE public.inventory AS invt
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');