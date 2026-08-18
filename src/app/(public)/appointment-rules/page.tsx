"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { minutesToTime } from "@/lib/slots";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageLoader } from "@/components/ui/PageLoader";
import { Collapsible } from "@/components/ui/Collapsible";
import { useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { mergeServiceContent } from "@/lib/serviceContent";
import { BOOKING_RULES } from "@/lib/eligibility";
import { CourtContactsBlock } from "@/components/ui/CourtContactsBlock";

/**
 * Публичные правила записи — отдельный раздел.
 * Тексты из CMS (serviceContent), график из настроек календаря.
 */
export default function RulesPage() {
  const { ready, state } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const cal = state.calendar;
  const sc = mergeServiceContent(state.serviceContent);
  const rules = sc.rules ?? BOOKING_RULES;

  if (!ready) {
    return <PageLoader />;
  }

  const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const days = cal.receptionWeekdays.map((d) => weekdays[d]).join(", ");

  const title = isKy
    ? rules.titleKy || rules.titleRu
    : rules.titleRu || rules.titleKy;
  const welcome = isKy
    ? rules.welcomeKy || rules.welcomeRu
    : rules.welcomeRu || rules.welcomeKy;
  const rulesList = isKy
    ? rules.rulesKy?.length
      ? rules.rulesKy
      : rules.rulesRu
    : rules.rulesRu;
  const cannotTitle = isKy
    ? rules.cannotTitleKy || rules.cannotTitleRu
    : rules.cannotTitleRu;
  const cannot = isKy
    ? rules.cannotKy?.length
      ? rules.cannotKy
      : rules.cannotRu
    : rules.cannotRu;
  const deleteNote = isKy
    ? rules.deleteNoteKy || rules.deleteNoteRu
    : rules.deleteNoteRu;
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs
        items={[
          { label: t.crumbs.home, href: "/" },
          { label: t.crumbs.rules },
        ]}
      />
      <h1 className="section-title mb-2">{title || t.footer.rules}</h1>
      <p className="mb-6 text-sm text-slate-500">
        {isKy
          ? "Расмий эрежелер · тексттерди админ «Контент сервиса» аркылуу өзгөртөт"
          : "Официальные правила · тексты правятся в админке: «Контент сервиса»"}
      </p>

      <div className="space-y-3">
        <CourtContactsBlock isKy={isKy} showSchedule />

        <Collapsible
          title={
            isKy
              ? "Электрондук жазылуунун убакыт терезеси"
              : "Окно электронной записи (слоты)"
          }
          subtitle={
            isKy
              ? "Системадагы күндөр жана интервалдар"
              : "Дни и интервалы в системе записи"
          }
          defaultOpen={false}
        >
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              {isKy ? "Күндөр (система)" : "Дни (система)"}:{" "}
              <strong className="text-slate-900">{days}</strong>
            </li>
            <li>
              {isKy ? "Убакыт" : "Время"}:{" "}
              <strong className="text-slate-900">
                {minutesToTime(cal.dayStartMinutes)} –{" "}
                {minutesToTime(cal.dayEndMinutes)}
              </strong>
            </li>
            <li>
              {isKy ? "Интервал" : "Интервал"}:{" "}
              <strong className="text-slate-900">
                {cal.slotDurationMinutes} {isKy ? "мүн" : "мин"}
              </strong>
              , {isKy ? "тыныгуу" : "перерыв"}{" "}
              <strong className="text-slate-900">
                {cal.breakMinutes} {isKy ? "мүн" : "мин"}
              </strong>
            </li>
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            {isKy
              ? "Жеке кабыл алуу күндөрү — жетекчиликтин таблицасында жогоруда."
              : "Персональные дни приёма руководства — в таблице выше (как на sot.kg)."}
          </p>
        </Collapsible>

        <Collapsible
          title={isKy ? "Эрежелер" : "Правила записи"}
          subtitle={isKy ? "Негизги талаптар" : "Основные требования"}
          defaultOpen
        >
          {welcome && (
            <p className="mb-4 text-sm leading-relaxed text-slate-700">
              {welcome}
            </p>
          )}
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            {(rulesList || []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
          {deleteNote && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {deleteNote}
            </p>
          )}
        </Collapsible>

        <Collapsible
          title={cannotTitle || (isKy ? "Кабыл алынбайт" : "Не обеспечиваем приём")}
          defaultOpen={false}
        >
          <ul className="space-y-2 text-sm text-slate-600">
            {(cannot || []).map((r, i) => (
              <li key={i}>— {r}</li>
            ))}
          </ul>
        </Collapsible>

        <div className="grid gap-3 sm:grid-cols-2">
          <Collapsible
            title={isKy ? "Каралат" : "Предмет приёма"}
            defaultOpen={false}
          >
            <ul className="space-y-2 text-sm text-emerald-900">
              {(allowed || []).map((i) => (
                <li key={i}>— {i}</li>
              ))}
            </ul>
          </Collapsible>
          <Collapsible
            title={isKy ? "Каралбайт" : "Не рассматривается"}
            defaultOpen={false}
          >
            <ul className="space-y-2 text-sm text-red-900">
              {(forbidden || []).map((i) => (
                <li key={i}>— {i}</li>
              ))}
            </ul>
          </Collapsible>
        </div>

        {cal.rulesText?.trim() && (
          <Collapsible
            title={
              isKy
                ? "Кошумча эскертүү (график)"
                : "Доп. текст из настроек графика"
            }
            defaultOpen={false}
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {cal.rulesText}
            </pre>
          </Collapsible>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={routes.appointment} className="btn-primary">
          {isKy ? "Жазылуу" : "Записаться"}
        </Link>
        <Link href="/" className="btn-outline">
          {isKy ? "Башкы" : "На главную"}
        </Link>
      </div>
    </div>
  );
}
