-- ============================================================
-- MindCircle — Part C: DM cleanup
-- Direct messages jinke sender/receiver ab exist nahi karte
-- (Part A ke orphan cleanup ke baad stale reh gaye the).
-- SQL Editor mein ek baar run karo. Safe to re-run.
-- ============================================================

delete from public.direct_messages
where sender_id not in (select id from public.users)
   or receiver_id not in (select id from public.users);

-- Optional check: kitne valid DMs bache
select count(*) as remaining_dms from public.direct_messages;
