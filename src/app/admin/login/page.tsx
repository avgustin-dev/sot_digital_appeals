"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ORG_NAME } from "@/lib/constants";
import { EmblemKR } from "@/components/brand/Emblem";

export default function AdminLoginPage() {
  const { login, currentUser, ready } = useStore();
  const router = useRouter();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && currentUser) router.replace("/admin");
  }, [ready, currentUser, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(loginName, password);
    if (!res.ok) {
      setError(res.error || "Ошибка входа");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-court-mist">
      <div className="border-b border-court-line bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <EmblemKR size={40} />
          <div className="text-sm font-semibold text-court-navy">{ORG_NAME}</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-xl font-semibold text-court-navy">
            Служебный кабинет
          </h1>
          <p className="mt-1 text-sm text-court-muted">
            Доступ для сотрудников · /admin
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-6 border border-court-line bg-white p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="login">
                  Логин
                </label>
                <input
                  id="login"
                  className="input"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary w-full">
                Войти
              </button>
            </div>

            <div className="mt-6 border-t border-court-line pt-4 text-xs text-court-muted">
              <div className="mb-2 font-semibold text-court-navy">
                Демонстрационные учётные записи
              </div>
              <ul className="space-y-1 font-mono">
                <li>priemnaya / priem123</li>
                <li>rukovodstvo / sud2026</li>
                <li>otvet1 / otvet123</li>
                <li>admin / admin123</li>
              </ul>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="text-court-blue hover:underline">
              ← Публичный сервис
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
