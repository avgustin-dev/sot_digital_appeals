"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ORG_NAME } from "@/lib/constants";
import { EmblemKR } from "@/components/brand/Emblem";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/ui/LangSwitch";

export default function AdminLoginPage() {
  const { login, currentUser, ready, state } = useStore();
  const router = useRouter();
  const { lang } = useI18n();
  const isKy = lang === "ky";
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function homePath(user: { role: string; login: string }) {
    if (user.login === "predsedatel" || user.role === "admin") return "/admin";
    if (user.role === "responsible") return "/admin/control";
    if (user.role === "leadership") return "/admin/reception";
    const pending = state.appointments.some(
      (a) => a.status === "pending_review"
    );
    if (user.role === "reception" && pending) return "/admin/inbox";
    return "/admin";
  }

  useEffect(() => {
    if (ready && currentUser) router.replace(homePath(currentUser));
  }, [ready, currentUser, router, state.appointments]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(loginName, password);
    if (!res.ok) {
      setError(res.error || (isKy ? "Кирүү катасы" : "Ошибка входа"));
      return;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f2f5]">
      <header className="border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <EmblemKR size={40} />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 sm:text-sm">
              {ORG_NAME}
            </div>
            <div className="text-[11px] text-slate-500">
              Служебный кабинет
            </div>
          </div>
          <LangSwitch />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-xl font-semibold text-slate-900">
            {isKy ? "Кызматтык кабинет" : "Служебный кабинет"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isKy
              ? "Кызматкерлер үчүн · /admin"
              : "Доступ для сотрудников · /admin"}
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="login">
                  {isKy ? "Логин" : "Логин"}
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
                  {isKy ? "Сырсөз" : "Пароль"}
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
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary w-full">
                {isKy ? "Кирүү" : "Войти"}
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="mb-2 font-semibold text-slate-800">
                {isKy ? "Каттоо эсептери (таанышуу үчүн)" : "Учётные записи (для ознакомления)"}
              </div>
              <ul className="space-y-2">
                <li>
                  <div className="text-slate-500">
                    {isKy
                      ? "Төрага — бардык бөлүмдөр"
                      : "Председатель — полный обзор"}
                  </div>
                  <div className="font-mono">predsedatel / vs2026</div>
                </li>
                <li>
                  <div className="text-slate-500">
                    {isKy ? "Жарандар менен иштөө бөлүмү" : "Отдел по работе с гражданами"}
                  </div>
                  <div className="font-mono">priemnaya / priem123</div>
                </li>
                <li>
                  <div className="text-slate-500">
                    {isKy ? "Жетекчилик (кабыл алуу)" : "Руководство (приём)"}
                  </div>
                  <div className="font-mono">rukovodstvo / sud2026</div>
                </li>
                <li>
                  <div className="text-slate-500">
                    {isKy ? "Жооптуу аткаруучу" : "Ответственный исполнитель"}
                  </div>
                  <div className="font-mono">otvet1 / otvet123</div>
                </li>
                <li>
                  <div className="text-slate-500">
                    {isKy ? "Администратор" : "Администратор"}
                  </div>
                  <div className="font-mono">admin / admin123</div>
                </li>
              </ul>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link
              href="/"
              className="font-medium text-court-blue hover:underline"
            >
              ← {isKy ? "Коомдук бөлүм" : "Публичный раздел"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
