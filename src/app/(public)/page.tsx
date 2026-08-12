"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PIPELINE_STEPS,
  RECEPTION_ALLOWED,
  RECEPTION_FORBIDDEN,
  STAGE_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { useI18n } from "@/lib/i18n";
import { EmblemKR } from "@/components/brand/Emblem";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/slots";
import { defaultServiceContent } from "@/lib/serviceContent";
import { CourtContactsBlock } from "@/components/ui/CourtContactsBlock";

/**
 * Хаб раздела «Приём граждан руководством Верховного суда Кыргызской Республики»
 * UX-идеи: qabul.sud.uz (статус, код, статистика, оценка) + предмет приёма КР.
 */
export default function HomePage() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const router = useRouter();
  const { ready, state, lookupByCode, recoverCodesByPhone } = useStore();

  const sc = state.serviceContent ?? defaultServiceContent();
  const hubTitle = isKy
    ? sc.hubTitleKy || sc.hubTitleRu
    : sc.hubTitleRu || sc.hubTitleKy;
  const hubLead = isKy
    ? sc.hubLeadKy || sc.hubLeadRu
    : sc.hubLeadRu || sc.hubLeadKy;
  const hubCta = isKy
    ? sc.hubCtaKy || sc.hubCtaRu
    : sc.hubCtaRu || sc.hubCtaKy;
  const memoTitle = isKy
    ? sc.memoTitleKy || sc.memoTitleRu
    : sc.memoTitleRu || sc.memoTitleKy;
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
      : sc.allowedRu?.length
        ? sc.allowedRu
        : RECEPTION_ALLOWED
    : sc.allowedRu?.length
      ? sc.allowedRu
      : RECEPTION_ALLOWED;
  const forbidden = isKy
    ? sc.forbiddenKy?.length
      ? sc.forbiddenKy
      : sc.forbiddenRu?.length
        ? sc.forbiddenRu
        : RECEPTION_FORBIDDEN
    : sc.forbiddenRu?.length
      ? sc.forbiddenRu
      : RECEPTION_FORBIDDEN;

  const [statusCode, setStatusCode] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusOk, setStatusOk] = useState(false);

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
            {t.orgName}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-court-navy sm:text-3xl">
            {hubTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-left text-sm leading-relaxed text-court-ink sm:text-base sm:text-center">
            {hubLead}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-left text-xs leading-relaxed text-court-muted sm:text-center sm:text-sm">
            {isKy
              ? "Төмөндө — жазылуу, жазылууну башкаруу, эрежелер жана сервис сапатын баалоо (электрондук жазылуу + кабыл алуу)."
              : "Ниже — запись на приём, управление записью, правила и оценка качества сервиса (электронная запись и работа общественной приёмной)."}
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
            {(memoItems?.length
              ? memoItems
              : isKy
                ? defaultServiceContent().memoItemsKy
                : defaultServiceContent().memoItemsRu
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <CourtContactsBlock isKy={isKy} showSchedule />

        {/* Статистика + статус / код / оценка */}
        <div className="grid gap-4 lg:grid-cols-2">
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
                ? "Демо-маалыматтар учурдагы платформадан."
                : "Демо-показатели по данным этой платформы."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-court-navy">
                {isKy
                  ? "Кайрылуунун абалын текшерүү"
                  : "Проверка состояния обращения"}
              </h2>
              <p className="mt-1 text-xs text-court-muted">
                {isKy
                  ? "Жазылуу кодун киргизиңиз (мисалы VS-2026-1001)."
                  : "Введите код записи (например VS-2026-1001)."}
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
                <p
                  className={`mt-2 text-sm ${statusOk ? "text-emerald-800" : "text-rose-800"}`}
                >
                  {statusMsg}
                </p>
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

        {/* Предмет + цикл */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-court-line bg-white p-5">
            <h3 className="font-semibold text-court-success">
              {t.home.allowed}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-court-ink">
              {allowed.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-court-line bg-white p-5">
            <h3 className="font-semibold text-court-danger">
              {t.home.forbidden}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-court-ink">
              {forbidden.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-court-line bg-white p-5 sm:p-6">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="section-title !mb-0">{t.home.cycle}</h2>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {isKy ? "Демо" : "Демо"}
            </span>
          </div>
          <p className="mb-2 text-sm text-court-muted">{t.home.cycleLead}</p>
          <p className="mb-4 text-xs text-slate-500">
            {isKy
              ? "Төмөнкү этаптар — демо-түшүндүрмө. Расмий порталда бул бөлүм өзгөчө баракча катары калбашы мүмкүн."
              : "Схема этапов приведена для демонстрации. В официальной версии отдельная страница «Порядок работы» может не публиковаться как самостоятельный раздел."}
          </p>
          <ProgressSteps
            steps={PIPELINE_STEPS.map((s) => ({
              title: s.title,
              desc: s.desc,
            }))}
            current={0}
          />
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/process"
              className="font-medium text-court-blue hover:underline"
            >
              {t.footer.process} ({isKy ? "демо" : "демо"}) →
            </Link>
            <Link
              href="/rules"
              className="font-medium text-court-blue hover:underline"
            >
              {t.footer.rules} →
            </Link>
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
