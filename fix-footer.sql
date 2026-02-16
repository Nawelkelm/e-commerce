UPDATE "HomeSettings" 
SET "footerEnabled" = true 
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT "footerEnabled", "footerAboutTitle", "footerContactEnabled", "footerSocialEnabled", "footerLinksEnabled" 
FROM "HomeSettings" 
WHERE id = '00000000-0000-0000-0000-000000000001';
