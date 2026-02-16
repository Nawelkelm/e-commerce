-- Check all footer fields from HomeSettings
SELECT 
  "footerEnabled",
  "footerAboutTitle",
  "footerAboutText",
  "footerContactEnabled",
  "footerSocialEnabled",
  "footerFacebook",
  "footerInstagram",
  "footerLinksEnabled",
  "footerColumn1Title",
  "footerColumn1Links",
  "footerCopyrightText"
FROM "HomeSettings" 
WHERE id = '00000000-0000-0000-0000-000000000001';
