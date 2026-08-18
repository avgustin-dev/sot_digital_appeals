"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  STAGE_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { env } from "@/config/env";
import { EmblemKR } from "@/components/brand/Emblem";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/slots";
import { mergeServiceContent, pickLocale } from "@/lib/serviceContent";
import { CourtContactsBlock } from "@/components/ui/CourtContactsBlock";
import { CitizenHubNav } from "@/components/layout/CitizenHubNav";

/**
 * Хаб раздела «Приём граждан руководством Верховного суда Кыргызской Республики»
 * UX-идеи: qabul.sud.uz (статус, код, статистика, оценка) + предмет приёма КР.
 */
export default function HomePage() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const router = useRouter();
  const { ready, state, lookupByCode, recoverCodesByPhone } = useStore();

  const sc = mergeServiceContent(state.serviceContent);
  const hubTitle = pickLocale(isKy, sc.hubTitleRu, sc.hubTitleKy);
  const hubLead = pickLocale(isKy, sc.hubLeadRu, sc.hubLeadKy);
  const hubCta = pickLocale(isKy, sc.hubCtaRu, sc.hubCtaKy);
  const memoTitle = pickLocale(isKy, sc.memoTitleRu, sc.memoTitleKy);
  const memoItems = isKy
    ? sc.memoItemsKy?.length
      ? sc.memoItemsKy
      : sc.memoItemsRu
    : sc.memoItemsRu?.length
      ? sc.memoItemsRu
      : sc.memoItemsKy;
  const allowed = isKy
    ? sc.allowedKy?.length
      ? sc.allowedKy
      : sc.allowedRu
    : sc.allowedRu;
  const forbidden = isKy
    ? sc.forbiddenKy?.length
      ? sc.forbiddenKy
      : sc.forbiddenRu
    : sc.forbiddenRu;

  const [statusCode, setStatusCode] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusOk, setStatusOk] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    title: string;
    body: string;
    email?: string;
  } | null>(null);

  const [recoverPhone, setRecoverPhone] = useState("");
  const [recoverMsg, setRecoverMsg] = useState("");
  const [rateCode, setRateCode] = useState("");

  const stats = useMemo(() => {
    if (!ready) {
      return {
        registered: 0,
        upcoming: 0,
        inProcess: 0,
        completed: 0,
        cancelled: 0,
      };
    }
    const apts = state.appointments;
    const appeals = state.appeals;
    return {
      registered: apts.length,
      upcoming: apts.filter(
        (a) => a.status === "confirmed" || a.status === "rescheduled"
      ).length,
      inProcess: appeals.filter((a) =>
        ["under_review", "ready_for_reception", "in_control"].includes(a.stage)
      ).length,
      completed: apts.filter((a) => a.status === "completed").length,
      cancelled: apts.filter((a) => a.status === "cancelled").length,
    };
  }, [ready, state.appointments, state.appeals]);

  function onCheckStatus(e: React.FormEvent) {
    e.preventDefault();
    setStatusOk(false);
    setStatusMsg("");
    setStatusNotice(null);
    const found = lookupByCode(statusCode);
    if (!found) {
      setStatusMsg(
        isKy
          ? "Код боюнча жазылуу табылган жок."
          : "Запись с таким кодом не найдена."
      );
      return;
    }
    const { appointment, appeal } = found;
    const stage = appeal
      ? STAGE_LABELS[appeal.stage]
      : STATUS_LABELS[appointment.status];
    setStatusOk(true);
    setStatusMsg(
      isKy
        ? `${appointment.code}: ${formatDateRu(appointment.date)}, ${appointment.slotStart}–${appointment.slotEnd}. Абалы: ${stage}.`
        : `${appointment.code}: ${formatDateRu(appointment.date)}, ${appointment.slotStart}–${appointment.slotEnd}. Статус: ${stage}.`
    );
    const latest = appeal?.notifications?.[0];
    if (latest) {
      setStatusNotice({
        title: latest.title,
        body: latest.body,
        email: appointment.email,
      });
    }
  }

  function onRecover(e: React.FormEvent) {
    e.preventDefault();
    setRecoverMsg("");
    const codes = recoverCodesByPhone(recoverPhone);
    if (!codes.length) {
      setRecoverMsg(
        isKy
          ? "Бул телефон боюнча жазылуу табылган жок."
          : "По этому телефону активных записей не найдено."
      );
      return;
    }
    setRecoverMsg(
      isKy
        ? `Табылган коддор: ${codes.join(", ")}. PIN — жазылуу ырастоосунда.`
        : `Найдены коды: ${codes.join(", ")}. PIN указан в подтверждении записи.`
    );
  }

  return (
    <div className="bg-court-mist">
      {/* Hero раздела */}
      <section className="border-b border-court-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center md:px-6 md:py-12">
          <EmblemKR size={72} priority className="mx-auto" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-court-muted">
            {pickLocale(isKy, sc.orgNameRu, sc.orgNameKy)}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-court-navy sm:text-3xl">
            {hubTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-left text-sm leading-relaxed text-court-ink sm:text-base sm:text-center">
            {hubLead}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-left text-xs leading-relaxed text-court-muted sm:text-center sm:text-sm">
            {pickLocale(isKy, sc.hubKickerRu, sc.hubKickerKy)}
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-lg border border-court-line bg-court-mist/50 p-5 text-left shadow-sm">
            <div className="text-sm text-center font-semibold text-court-navy">
              {isKy
                ? "Жеке кабыл алууга жазылуу"
                : "Электронная запись на личный приём"}
            </div>

            <Link
              href="/book"
              className="btn-primary mt-4 w-full !py-2.5"
            >
              {hubCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 md:px-6 md:py-8">
        {/* Памятка */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-court-ink sm:px-5">
          <div className="font-semibold text-amber-900">{memoTitle}</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-amber-950/90">
            {(memoItems?.length ? memoItems : []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <CourtContactsBlock isKy={isKy} showSchedule />
        <CitizenHubNav />

        {/* Статистика + статус / код / оценка */}
        <div className={`grid gap-4 ${env.demo ? "lg:grid-cols-2" : ""}`}>
          {env.demo && (
          <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-court-navy">
              {isKy
                ? "Электрондук кабыл алуу статистикасы"
                : "Статистика электронного приёма"}
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <StatRow
                label={
                  isKy
                    ? "Жазылган жарандар"
                    : "Зарегистрированы на приём"
                }
                value={stats.registered}
                color="bg-court-blue"
                max={Math.max(stats.registered, 1)}
              />
              <StatRow
                label={
                  isKy ? "Күтүлүп жаткан кабыл алуу" : "Ожидают приёма"
                }
                value={stats.upcoming}
                color="bg-sky-500"
                max={Math.max(stats.registered, 1)}
              />
              <StatRow
                label={
                  isKy ? "Кароо процессинде" : "В процессе рассмотрения"
                }
                value={stats.inProcess}
                color="bg-amber-500"
                max={Math.max(stats.registered, 1)}
              />
              <StatRow
                label={isKy ? "Өткөрүлгөн" : "Проведённые приёмы"}
                value={stats.completed}
                color="bg-emerald-600"
                max={Math.max(stats.registered, 1)}
              />
              <StatRow
                label={isKy ? "Жокко чыгарылган" : "Отменённые записи"}
                value={stats.cancelled}
                color="bg-rose-500"
                max={Math.max(stats.registered, 1)}
              />
            </ul>
            <p className="mt-3 text-xs text-court-muted">
              {isKy
                ? "Көрсөткүчтөр учурдагы каттоолор боюнча."
                : "Показатели по зарегистрированным обращениям."}
            </p>
          </div>
          )}

          <div className="space-y-4">
            <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-court-navy">
                {isKy
                  ? "Кайрылуунун абалын текшерүү"
                  : "Проверка состояния обращения"}
              </h2>
              <p className="mt-1 text-xs text-court-muted">
                  {isKy
                    ? "Жазылуу кодун киргизиңиз."
                    : "Введите код записи, указанный при подтверждении."}
              </p>
              <form onSubmit={onCheckStatus} className="mt-3 space-y-2">
                <input
                  className="input font-mono uppercase"
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value)}
                  placeholder="VS-2026-...."
                />
                <button type="submit" className="btn-primary w-full !py-2">
                  {isKy ? "Текшерүү" : "Проверить"}
                </button>
              </form>
              {statusMsg && (
                <div className="mt-3 space-y-2">
                  <p
                    className={`text-sm ${statusOk ? "text-emerald-800" : "text-rose-800"}`}
                  >
                    {statusMsg}
                  </p>
                  {statusOk && statusNotice && (
                    <div className="rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-950">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                        {isKy ? "Уведомление" : "Уведомление"}
                      </div>
                      <div className="mt-0.5 font-semibold">
                        {statusNotice.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed">
                        {statusNotice.body}
                      </p>
                      {statusNotice.email ? (
                        <p className="mt-1.5 text-[11px] text-sky-800">
                          {isKy
                            ? `Почта: ${statusNotice.email}`
                            : `Направлено на почту: ${statusNotice.email}`}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
              <Link
                href="/my-appointment"
                className="mt-2 inline-block text-xs font-medium text-court-blue hover:underline"
              >
                {isKy
                  ? "Толук башкаруу (код + PIN) →"
                  : "Полное управление (код + PIN) →"}
              </Link>
            </div>

            <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-court-navy">
                {isKy ? "Кодду калыбына келтирүү" : "Восстановление кода"}
              </h2>
              <form onSubmit={onRecover} className="mt-3 space-y-2">
                <input
                  className="input"
                  value={recoverPhone}
                  onChange={(e) => setRecoverPhone(e.target.value)}
                  placeholder="+996 XXX XXX XXX"
                />
                <button type="submit" className="btn-outline w-full !py-2">
                  {isKy ? "Кодду табуу" : "Найти код"}
                </button>
              </form>
              {recoverMsg && (
                <p className="mt-2 text-sm text-court-ink">{recoverMsg}</p>
              )}
            </div>

            <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-court-navy">
                {isKy
                  ? "Сервисти баалоо"
                  : "Оценка сервиса записи и приёма"}
              </h2>
              <p className="mt-1 text-xs text-court-muted">
                {isKy
                  ? "Электрондук жазылуунун ыңгайлуулугу жана коомдук кабыл алуунун иши. Каттоо кодун киргизиңиз."
                  : "Удобство электронной записи и качество работы общественной приёмной. Введите регистрационный код записи."}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (rateCode.trim()) {
                    router.push(
                      `/feedback/${rateCode.trim().toUpperCase()}`
                    );
                  }
                }}
                className="mt-3 space-y-2"
              >
                <input
                  className="input font-mono uppercase"
                  value={rateCode}
                  onChange={(e) => setRateCode(e.target.value)}
                  placeholder="VS-2026-...."
                />
                <button type="submit" className="btn-outline w-full !py-2">
                  {isKy ? "Баалоого өтүү" : "Перейти к оценке"}
                </button>
              </form>
              <Link
                href="/feedback"
                className="mt-2 inline-block text-xs font-medium text-court-blue hover:underline"
              >
                {isKy ? "Бөлүм жөнүндө →" : "Подробнее об оценке →"}
              </Link>
            </div>
          </div>
        </div>

        {/* Предмет приёма */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-court-line bg-white p-5">
            <h3 className="font-semibold text-court-success">
              {pickLocale(isKy, sc.allowedTitleRu, sc.allowedTitleKy) ||
                t.home.allowed}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-court-ink">
              {allowed.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-court-line bg-white p-5">
            <h3 className="font-semibold text-court-danger">
              {pickLocale(isKy, sc.forbiddenTitleRu, sc.forbiddenTitleKy) ||
                t.home.forbidden}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-court-ink">
              {forbidden.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  max,
}: {
  label: string;
  value: number;
  color: string;
  max: number;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <li>
      <div className="mb-1 flex justify-between gap-2">
        <span className="text-court-ink">{label}</span>
        <span className="font-mono font-semibold text-court-navy">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-court-mist">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.max(pct, value > 0 ? 8 : 0)}%` }}
        />
      </div>
    </li>
  );
}
