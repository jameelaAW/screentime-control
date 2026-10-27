# How to process a refund (owner's runbook)

Use this every time you refund a buyer. It takes about two minutes.

**What happens:** the buyer's account is *paused*, not deleted. They can no longer use the app, but their data
is kept, and they can still sign in to the **Account** page to delete it themselves. You can undo it.

## Steps

1. **Check the request** against the Refund Policy (https://screentime-control.vercel.app/refunds).
2. **Refund in Payhip.** Open the order in your Payhip dashboard and refund it. Payhip disables the
   licence key by itself when an order is refunded.
3. **Find the buyer's licence key** on the same Payhip order. (It looks like `ABCDE-FGHIJ-KLMNO-PQRST`.)
4. **Pause the account in Supabase.**
   - Open https://supabase.com/dashboard/project/yyrjajgslppxjspimthj/sql/new
   - Paste this, replacing the key, and press **Run**:

     ```sql
     select public.revoke_license('ABCDE-FGHIJ-KLMNO-PQRST');
     ```

   - You can use the email the buyer signed up with instead of the key:

     ```sql
     select public.revoke_license('buyer@example.com');
     ```

   - The result should say **`1 licence(s) suspended`**. If it says `0`, the key or email did not match:
     check for a typo, or that the buyer used a different email in the app than on Payhip (use the key then).
5. **Reply to the buyer** at support@mzdigitalbuys.com, saying the refund is done and the account is paused.

## What the buyer sees

When they next open the app, they land on a page titled **Your access is paused**. They can enter a new
licence key if they buy again, or delete their account.

## To undo it (for example, a refund that was a mistake)

```sql
select public.restore_license('ABCDE-FGHIJ-KLMNO-PQRST');
```

The result should say `1 licence(s) restored`. The account works again straight away.

## Good to know

- Refunding in Payhip alone does **not** pause an account that is already activated. Step 4 is what does that.
- The app does not delete a paused account's data automatically. If the buyer asks you to delete it, ask them
  to use **Account → Delete my account**, or ask them to confirm by email and delete it for them.
- These commands only work when you run them from the Supabase SQL editor. Buyers and the public cannot run them.
- Nothing here talks to Payhip automatically. Payhip does offer a "refunded" notification (webhook), but its exact
  contents are not documented well enough to build on safely. If you want this automated, send me a real example
  of that notification from Payhip and I can build it.
