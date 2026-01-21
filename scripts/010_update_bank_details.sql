-- Update bank details in site_settings
UPDATE public.site_settings
SET value = '{"bank": "Banco Galicia", "account_holder": "MAITE BUSTINZA", "cbu": "0070664930004001936415", "alias": "MENTEVIVAESPACIO", "account_number": "4001936-4 664-1"}'
WHERE key = 'bank_details';
