"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

// BFF sign-in. Posts credentials to the auth route, which sets the httpOnly session
// cookie; the middleware then lets the app shell through.
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      router.push("/overview");
      router.refresh();
      return;
    }
    setPending(false);
    setError("Invalid email or password.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div
            className="mx-auto grid size-9 place-items-center rounded-lg font-serif text-on-accent"
            style={{ background: "linear-gradient(160deg,var(--accent-2),var(--accent))" }}
            aria-hidden
          >
            a
          </div>
          <h1 className="font-serif text-xl font-medium text-text">Sign in to ATB</h1>
          <p className="text-[13px] text-text-3">Real-time AI agent-orchestration console</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-2xl border border-border bg-panel p-5 shadow-[var(--shadow)]"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[12.5px] font-medium text-text-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-inset px-3 text-sm text-text outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[12.5px] font-medium text-text-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-inset px-3 text-sm text-text outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          {error && (
            <p role="alert" className="text-[12.5px] text-red">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
