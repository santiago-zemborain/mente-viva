-- Hacer admin al usuario con email mentevivaespacio@gmail.com
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'mentevivaespacio@gmail.com';

-- Si no existe el perfil aún, lo insertamos cuando se registre
-- Verificar que el usuario existe:
SELECT id, email, role FROM profiles WHERE email = 'mentevivaespacio@gmail.com';
