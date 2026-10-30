# Launch checklist (SGD 5.00, one-time)

Order matters. Do not announce the product or share the link until step 10 passes.

## A. Legal (before taking real money)
1. Fill the 11 values in the legal pages: legal name, effective date, governing law, refund days, fix business days, reply business days, minimum access months, closure notice days, delete-within days, backup days.
2. Have a lawyer review Terms, Privacy and Refunds.
3. Set `LEGAL_FINAL = true` in `lib/legal.ts`, then commit and push to `main`. This also shows the Terms/Privacy/Refunds links on the login page.

## B. Hosting
4. Check that your Vercel plan allows commercial use (the free Hobby plan does not).

## C. Payhip
5. Create the product at SGD 5.00 (currency SGD). Turn on licence keys for it. Paste the text from `docs/PAYHIP-LISTING.md` as the description. Check your fee per sale at this price. Keep the product unpublished or hidden until step 11.
6. Copy the product secret into Vercel as `PAYHIP_PRODUCT_SECRET` (Settings, Environment Variables), then redeploy. The login page only asks for a key once this variable exists.

## D. Switch the gate on (steps 8 and 9 together, in the Supabase SQL editor)
7. Check Authentication, Users. Delete any account that should not stay free.
8. Keep every account that exists now free:
   ```sql
   insert into public.licenses (key_hash, user_id, source)
   select 'grandfathered:' || id::text, id, 'grandfathered' from auth.users
   on conflict do nothing;
   ```
9. Turn the gate on:
   ```sql
   update public.app_settings set license_required = true;
   ```
10. Test with a real purchase of your own product, using a brand-new email:
    - Sign-up works, then the app asks for a licence key.
    - Enter the key from the Payhip email and press Activate.
    - Add a child, start and stop a timer, open the Account page.
    - The same key on a second account must be refused.
    - Refund it in Payhip and check the account is paused (see `docs/REFUNDS.md`).

## E. Go live
11. Publish the Payhip product and share the link.
12. Watch support@mzdigitalbuys.com for the first week. Expect "key not accepted" and "key already used" mails (the guide covers both).

## To turn the gate off again (emergency)
```sql
update public.app_settings set license_required = false;
```

## Still open
- Payhip refund webhook (needs a real sample payload).
- Real device test of the report and the CSV download.
- A real 6-minute-limit phone alert test.
