-- WhatsApp Campaign Count Reset SQL Scripts

-- 1. List all users with their current WhatsApp campaign counts
SELECT 
  u.id,
  u.username,
  u.email,
  sp.name as plan_name,
  us.whatsapp_sends_used,
  sp.whatsapp_send_limit
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.id = (
  SELECT id FROM user_subscriptions 
  WHERE user_id = u.id 
  ORDER BY created_at DESC 
  LIMIT 1
)
ORDER BY u.id;

-- 2. Reset WhatsApp campaign count for a specific user (replace USER_ID with actual ID)
-- UPDATE user_subscriptions 
-- SET whatsapp_sends_used = 0 
-- WHERE user_id = USER_ID 
-- AND id = (
--   SELECT id FROM user_subscriptions 
--   WHERE user_id = USER_ID 
--   ORDER BY created_at DESC 
--   LIMIT 1
-- );

-- 3. Reset WhatsApp campaign count for ALL users
-- UPDATE user_subscriptions SET whatsapp_sends_used = 0;

-- 4. Check specific user's subscription details
-- SELECT 
--   us.*,
--   sp.plan_name,
--   sp.whatsapp_send_limit
-- FROM user_subscriptions us
-- JOIN subscription_plans sp ON us.plan_id = sp.id
-- WHERE us.user_id = USER_ID
-- ORDER BY us.created_at DESC;
