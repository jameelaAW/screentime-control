'use client';
import { useActionState } from 'react';
import { deleteAccount, type DeleteState } from '@/lib/actions/account';

export default function DeleteAccountForm() {
  const [state, action, pending] = useActionState<DeleteState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="delete-form">
      {state.error && <p className="error" role="alert">{state.error}</p>}
      <label>Your password<input name="password" type="password" autoComplete="current-password" required maxLength={72} /></label>
      <label>Type <strong>DELETE</strong> to confirm<input name="confirm" autoComplete="off" autoCapitalize="characters" spellCheck={false} required maxLength={10} /></label>
      <button className="danger-button" disabled={pending}>{pending ? 'Deleting…' : 'Delete my account and all data'}</button>
    </form>
  );
}
