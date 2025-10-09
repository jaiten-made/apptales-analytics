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
        className="w-full flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
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
          className="flex-none rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:grayscale disabled:cursor-not-allowed"
          style={{
            backgroundImage: "linear-gradient(45deg, #FFBF00 0%, #FFD85C 100%)",
          }}
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
