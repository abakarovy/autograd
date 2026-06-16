"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(typeof j.error === "string" ? j.error : "Ошибка входа");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-frost-200 bg-ink-850/60 p-8 shadow-card backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Администрирование</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Вход в панель</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Маршрут <span className="font-mono text-zinc-400">/admin/login</span> — только для персонала салона.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-zinc-400">Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-frost-200 bg-ink-950/70 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-accent/50"
            placeholder="Введите пароль"
            required
          />
        </label>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-50"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-600">
        Пароль задаётся в <span className="font-mono">.env</span> →{" "}
        <span className="font-mono text-zinc-500">ADMIN_PASSWORD</span>
      </p>
    </div>
  );
}
