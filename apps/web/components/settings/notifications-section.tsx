'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { apiGetNotifyEmail, apiSetNotifyEmail } from '@/lib/auth';

export function NotificationsSection() {
  const setUser = useAuthStore((s) => s.setUser);
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGetNotifyEmail()
      .then((r) => {
        setValue(r.email ?? '');
        setSaved(r.email);
        setDelivery(r.deliveryConfigured);
      })
      .catch(() => setDelivery(false));
  }, []);

  const save = async (email: string | null) => {
    setBusy(true);
    setError(null);
    try {
      const { user } = await apiSetNotifyEmail(email);
      setUser(user);
      setSaved(email);
      setValue(email ?? '');
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : 'Could not save. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2">
        <Bell className="size-5 text-[var(--color-brand)]" aria-hidden />
        <h2 className="text-lg font-semibold">Form notifications</h2>
      </div>
      <p className="mt-1 text-sm text-black/60">
        Get an email whenever someone submits a contact or newsletter form on
        any of your sites. Leave blank to turn notifications off.
      </p>

      {saved ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-green-600">
          <Check className="size-4" aria-hidden /> Notifying{' '}
          <span className="font-medium">{saved}</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-600">
          No notification email set — submissions only appear in your inbox.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          />
          <Button onClick={() => save(value.trim() || null)} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
          {saved ? (
            <Button variant="ghost" onClick={() => save(null)} disabled={busy}>
              Turn off
            </Button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {delivery === false ? (
          <p className="text-xs text-amber-600">
            No email provider is configured on the server, so notifications are
            logged but not delivered. Set <code>RESEND_API_KEY</code> to enable
            sending.
          </p>
        ) : null}
      </div>
    </section>
  );
}
