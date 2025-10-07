import React, { useState } from "react";

export default function SubscribeForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const res = await fetch("/subscribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err?.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full flex-1 rounded-xl border border-slate-300/70 bg-white/70 px-4 py-3 text-sm shadow-sm outline-none backdrop-blur-md transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-0"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_18px_-4px_rgba(99,102,241,0.4)] transition hover:shadow-[0_6px_26px_-6px_rgba(99,102,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Joining..." : "Join Waitlist"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      )}
    </div>
  );
}
