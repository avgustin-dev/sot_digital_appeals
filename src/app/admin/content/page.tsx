"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { mergeServiceContent } from "@/lib/serviceContent";
import type {
  LeadershipDayWindow,
  LeadershipPerson,
  ServiceContent,
} from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { PageLoader } from "@/components/ui/PageLoader";
import { cn, generateId } from "@/lib/utils";
import { minutesToTime, timeToMinutes } from "@/lib/slots";
import {
  leadershipDayWindows,
  leadershipScheduleLabels,
  withLeadershipSchedule,
  withScheduleLabels,
} from "@/lib/leadershipSchedule";

function linesToArray(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToLines(arr: string[] | undefined): string {
  return (arr ?? []).join("\n");
}

const WEEKDAYS = [
  { id: 1, ru: "Пн", ky: "Дүй" },
  { id: 2, ru: "Вт", ky: "Шей" },
  { id: 3, ru: "Ср", ky: "Шар" },
  { id: 4, ru: "Чт", ky: "Бей" },
  { id: 5, ru: "Пт", ky: "Жум" },
  { id: 6, ru: "Сб", ky: "Ишм" },
  { id: 0, ru: "Вс", ky: "Жек" },
];

type Tab = "chrome" | "home" | "leadership" | "book" | "rules";

function Field({
  label,
  value,
  onChange,
  multiline,
  rows,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
      {multiline ? (
        <textarea
          className="input min-h-[88px] w-full resize-y font-normal"
          rows={rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          className="input w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </label>
  );
}

function Pair({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function emptyPerson(): LeadershipPerson {
  return {
    id: generateId("ldr"),
    fullNameRu: "",
    fullNameKy: "",
    positionRu: "",
    positionKy: "",
    weekdayRu: "",
    weekdayKy: "",
    timeRu: "",
    timeKy: "",
    shortRu: "",
    shortKy: "",
    bookLabelRu: "",
    bookLabelKy: "",
    showInSchedule: true,
    bookable: true,
    windowKind: "calendar",
    weekdays: [2, 4],
    startMinutes: 8 * 60,
    endMinutes: 12 * 60,
    dayWindows: [
      { weekday: 2, startMinutes: 8 * 60, endMinutes: 12 * 60 },
      { weekday: 4, startMinutes: 8 * 60, endMinutes: 12 * 60 },
    ],
  };
}

export default function ContentCmsPage() {
  const { ready, state, currentUser, updateServiceContent, resetServiceContent } =
    useStore();
  const { lang } = useI18n();
  const isKy = lang === "ky";
  const canEdit =
    !!currentUser &&
    ["admin", "reception", "leadership"].includes(currentUser.role);

  const [tab, setTab] = useState<Tab>("leadership");
  const [draft, setDraft] = useState<ServiceContent>(() =>
    mergeServiceContent()
  );
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setDraft(mergeServiceContent(state.serviceContent));
  }, [ready, state.serviceContent]);

  if (!ready) return <PageLoader label={isKy ? "Жүктөө…" : "Загрузка…"} />;

  function patch(p: Partial<ServiceContent>) {
    setDraft((d) => ({ ...d, ...p }));
    setMsg("");
  }

  function setPersonWindows(index: number, next: LeadershipDayWindow[]) {
    const cal = state.calendar;
    setDraft((d) => ({
      ...d,
      leadership: d.leadership.map((x, j) =>
        j === index
          ? withScheduleLabels(withLeadershipSchedule(x, next), cal)
          : x
      ),
    }));
    setMsg("");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) {
      setErr(true);
      setMsg(
        isKy
          ? "Түзөтүүгө укугуңуз жок."
          : "Недостаточно прав для редактирования."
      );
      return;
    }
    const saved = await updateServiceContent({
      ...draft,
      leadership: draft.leadership.map((p) =>
        withScheduleLabels(p, state.calendar)
      ),
    });
    if (saved && "ok" in saved && !saved.ok) {
      setErr(true);
      setMsg(saved.error);
      return;
    }
    setErr(false);
    setMsg(isKy ? "Сакталды. Коомдук бөлүм жаңыртылды." : "Сохранено. Публичный раздел обновлён.");
  }

  async function onReset() {
    if (!canEdit) return;
    if (
      !window.confirm(
        isKy
          ? "Бардык тексттерди жана жетекчиликти тазалоо? Сайт бош калат, кайра админкадан толтурасыз."
          : "Очистить все тексты и руководство? Сайт станет пустым, заполните заново через админку."
      )
    ) {
      return;
    }
    const saved = await resetServiceContent();
    if (saved && "ok" in saved && !saved.ok) {
      setErr(true);
      setMsg(saved.error);
      return;
    }
    setDraft(mergeServiceContent());
    setErr(false);
    setMsg(isKy ? "Тазаланды. Кайра толтуруңуз." : "Очищено. Заполните заново.");
  }

  const tabs: { id: Tab; ru: string; ky: string }[] = [
    { id: "leadership", ru: "Руководство", ky: "Жетекчилик" },
    { id: "chrome", ru: "Шапка и подвал", ky: "Шапка жана подвал" },
    { id: "home", ru: "Главная", ky: "Башкы бет" },
    { id: "book", ru: "Запись", ky: "Жазылуу" },
    { id: "rules", ru: "Правила", ky: "Эрежелер" },
  ];

  return (
    <div className="animate-fade-up mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {isKy ? "Сайт" : "Сайт"}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {isKy ? "Коомдук сайт" : "Публичный сайт"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            {isKy
              ? "ФИО жетекчилик, байланыш, тексттер жана навигация — коомдук бөлүмдө дароо көрүнөт."
              : "ФИО руководства, контакты, тексты и навигация сразу отображаются в публичном разделе."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isKy ? "Сайт" : "Сайт"}
          </Link>
        </div>
      </div>

      {!canEdit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {isKy
            ? "Көрүү гана. Түзөтүү: admin, reception, leadership."
            : "Только просмотр. Редактирование: admin, reception, leadership."}
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.id
                ? "bg-court-navy text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isKy ? t.ky : t.ru}
          </button>
        ))}
      </div>

      <form onSubmit={onSave} className="space-y-5">
        {tab === "chrome" && (
          <>
            <Pair title={isKy ? "Мекеме" : "Организация"}>
              <Field
                label="Наименование (RU)"
                value={draft.orgNameRu}
                onChange={(v) => patch({ orgNameRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Аталышы (KY)"
                value={draft.orgNameKy}
                onChange={(v) => patch({ orgNameKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Сервис (RU)"
                value={draft.appNameRu}
                onChange={(v) => patch({ appNameRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Сервис (KY)"
                value={draft.appNameKy}
                onChange={(v) => patch({ appNameKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Кнопка записи (RU)"
                value={draft.navBookCtaRu}
                onChange={(v) => patch({ navBookCtaRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Жазылуу баскычы (KY)"
                value={draft.navBookCtaKy}
                onChange={(v) => patch({ navBookCtaKy: v })}
                disabled={!canEdit}
              />
            </Pair>
            <Pair title={isKy ? "Жогорку меню" : "Верхнее меню"}>
              {draft.headerNav.map((item, i) => (
                <div key={`${item.href}-${i}`} className="space-y-2 md:col-span-2">
                  <div className="text-[11px] font-mono text-slate-400">
                    {item.href}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Пункт (RU)"
                      value={item.labelRu}
                      onChange={(v) => {
                        const headerNav = draft.headerNav.map((x, j) =>
                          j === i ? { ...x, labelRu: v } : x
                        );
                        patch({ headerNav });
                      }}
                      disabled={!canEdit}
                    />
                    <Field
                      label="Пункт (KY)"
                      value={item.labelKy}
                      onChange={(v) => {
                        const headerNav = draft.headerNav.map((x, j) =>
                          j === i ? { ...x, labelKy: v } : x
                        );
                        patch({ headerNav });
                      }}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              ))}
            </Pair>
            <Pair title={isKy ? "Подвал" : "Подвал"}>
              <Field
                label="Общественная приёмная (RU)"
                value={draft.footerReceptionRu}
                onChange={(v) => patch({ footerReceptionRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Коомдук кабыл алуу (KY)"
                value={draft.footerReceptionKy}
                onChange={(v) => patch({ footerReceptionKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Независимость судей (RU)"
                value={draft.footerIndependenceRu}
                onChange={(v) => patch({ footerIndependenceRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Көз карандысыздык (KY)"
                value={draft.footerIndependenceKy}
                onChange={(v) => patch({ footerIndependenceKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Дела на приёме (RU)"
                value={draft.footerNoCasesRu}
                onChange={(v) => patch({ footerNoCasesRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Иштер (KY)"
                value={draft.footerNoCasesKy}
                onChange={(v) => patch({ footerNoCasesKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Сноска в подвале (RU)"
                value={draft.footerDisclaimerRu}
                onChange={(v) => patch({ footerDisclaimerRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Подвал эскертүүсү (KY)"
                value={draft.footerDisclaimerKy}
                onChange={(v) => patch({ footerDisclaimerKy: v })}
                disabled={!canEdit}
              />
            </Pair>
          </>
        )}

        {tab === "home" && (
          <>
            <Pair title={isKy ? "Башкы бет" : "Главная"}>
              <Field
                label="Заголовок (RU)"
                value={draft.hubTitleRu}
                onChange={(v) => patch({ hubTitleRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Баш аты (KY)"
                value={draft.hubTitleKy}
                onChange={(v) => patch({ hubTitleKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Лид (RU)"
                value={draft.hubLeadRu}
                onChange={(v) => patch({ hubLeadRu: v })}
                multiline
                rows={4}
                disabled={!canEdit}
              />
              <Field
                label="Лид (KY)"
                value={draft.hubLeadKy}
                onChange={(v) => patch({ hubLeadKy: v })}
                multiline
                rows={4}
                disabled={!canEdit}
              />
              <Field
                label="Подзаголовок (RU)"
                value={draft.hubKickerRu}
                onChange={(v) => patch({ hubKickerRu: v })}
                multiline
                rows={2}
                disabled={!canEdit}
              />
              <Field
                label="Кошумча текст (KY)"
                value={draft.hubKickerKy}
                onChange={(v) => patch({ hubKickerKy: v })}
                multiline
                rows={2}
                disabled={!canEdit}
              />
              <Field
                label="CTA (RU)"
                value={draft.hubCtaRu}
                onChange={(v) => patch({ hubCtaRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="CTA (KY)"
                value={draft.hubCtaKy}
                onChange={(v) => patch({ hubCtaKy: v })}
                disabled={!canEdit}
              />
            </Pair>
            <Pair title={isKy ? "Эскертме" : "Памятка"}>
              <Field
                label="Заголовок (RU)"
                value={draft.memoTitleRu}
                onChange={(v) => patch({ memoTitleRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Баш аты (KY)"
                value={draft.memoTitleKy}
                onChange={(v) => patch({ memoTitleKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Пункты (RU)"
                hint="Одна строка — один пункт"
                value={arrayToLines(draft.memoItemsRu)}
                onChange={(v) => patch({ memoItemsRu: linesToArray(v) })}
                multiline
                rows={5}
                disabled={!canEdit}
              />
              <Field
                label="Пункттер (KY)"
                value={arrayToLines(draft.memoItemsKy)}
                onChange={(v) => patch({ memoItemsKy: linesToArray(v) })}
                multiline
                rows={5}
                disabled={!canEdit}
              />
            </Pair>
            <Pair title={isKy ? "Предмет кабыл алуу" : "Предмет приёма"}>
              <Field
                label="Разрешено — заголовок (RU)"
                value={draft.allowedTitleRu}
                onChange={(v) => patch({ allowedTitleRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Уруксат — баш аты (KY)"
                value={draft.allowedTitleKy}
                onChange={(v) => patch({ allowedTitleKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Разрешено (RU)"
                value={arrayToLines(draft.allowedRu)}
                onChange={(v) => patch({ allowedRu: linesToArray(v) })}
                multiline
                rows={5}
                disabled={!canEdit}
              />
              <Field
                label="Уруксат (KY)"
                value={arrayToLines(draft.allowedKy)}
                onChange={(v) => patch({ allowedKy: linesToArray(v) })}
                multiline
                rows={5}
                disabled={!canEdit}
              />
              <Field
                label="Не допускается — заголовок (RU)"
                value={draft.forbiddenTitleRu}
                onChange={(v) => patch({ forbiddenTitleRu: v })}
                disabled={!canEdit}
              />
              <Field
                label="Тыюу — баш аты (KY)"
                value={draft.forbiddenTitleKy}
                onChange={(v) => patch({ forbiddenTitleKy: v })}
                disabled={!canEdit}
              />
              <Field
                label="Не допускается (RU)"
                value={arrayToLines(draft.forbiddenRu)}
                onChange={(v) => patch({ forbiddenRu: linesToArray(v) })}
                multiline
                rows={4}
                disabled={!canEdit}
              />
              <Field
                label="Тыюу (KY)"
                value={arrayToLines(draft.forbiddenKy)}
                onChange={(v) => patch({ forbiddenKy: linesToArray(v) })}
                multiline
                rows={4}
                disabled={!canEdit}
              />
            </Pair>
          </>
        )}

        {tab === "leadership" && (
          <div className="space-y-4">
            <Pair title={isKy ? "Байланыш" : "Контакты"}>
              <Field
                label={isKy ? "Ишеним телефону" : "Телефон доверия"}
                value={draft.contacts.trustPhone}
                onChange={(v) =>
                  patch({ contacts: { ...draft.contacts, trustPhone: v } })
                }
                disabled={!canEdit}
              />
              <Field
                label="tel: (для ссылки)"
                value={draft.contacts.trustPhoneTel}
                onChange={(v) =>
                  patch({ contacts: { ...draft.contacts, trustPhoneTel: v } })
                }
                disabled={!canEdit}
              />
              <Field
                label="Адрес (RU)"
                value={draft.contacts.addressRu}
                onChange={(v) =>
                  patch({ contacts: { ...draft.contacts, addressRu: v } })
                }
                disabled={!canEdit}
              />
              <Field
                label="Дарек (KY)"
                value={draft.contacts.addressKy}
                onChange={(v) =>
                  patch({ contacts: { ...draft.contacts, addressKy: v } })
                }
                disabled={!canEdit}
              />
              <Field
                label="Кабинет записи (RU)"
                value={draft.contacts.receptionOfficeRu}
                onChange={(v) =>
                  patch({
                    contacts: { ...draft.contacts, receptionOfficeRu: v },
                  })
                }
                disabled={!canEdit}
              />
              <Field
                label="Жазылуу кабинети (KY)"
                value={draft.contacts.receptionOfficeKy}
                onChange={(v) =>
                  patch({
                    contacts: { ...draft.contacts, receptionOfficeKy: v },
                  })
                }
                disabled={!canEdit}
              />
              <Field
                label="Источник сведений (RU)"
                value={draft.contacts.sourceNoteRu}
                onChange={(v) =>
                  patch({ contacts: { ...draft.contacts, sourceNoteRu: v } })
                }
                multiline
                rows={2}
                disabled={!canEdit}
              />
              <Field
                label="Маалымат булагы (KY)"
                value={draft.contacts.sourceNoteKy}
                onChange={(v) =>
                  patch({ contacts: { ...draft.contacts, sourceNoteKy: v } })
                }
                multiline
                rows={2}
                disabled={!canEdit}
              />
            </Pair>

            {draft.leadership.map((p, i) => (
              <section
                key={p.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    {p.fullNameRu || p.fullNameKy || p.id}
                  </h2>
                  {canEdit && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm text-rose-700 hover:underline"
                      onClick={() =>
                        patch({
                          leadership: draft.leadership.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isKy ? "Өчүрүү" : "Удалить"}
                    </button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="ФИО (RU)"
                    value={p.fullNameRu}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, fullNameRu: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="ФИО (KY)"
                    value={p.fullNameKy}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, fullNameKy: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="Должность (RU)"
                    value={p.positionRu}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, positionRu: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="Кызматы (KY)"
                    value={p.positionKy}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, positionKy: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="Кратко в талоне (RU)"
                    value={p.shortRu}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, shortRu: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="Кыскача (KY)"
                    value={p.shortKy}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, shortKy: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="В списке записи (RU)"
                    value={p.bookLabelRu}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, bookLabelRu: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                  <Field
                    label="Жазылуу тизмесинде (KY)"
                    value={p.bookLabelKy}
                    onChange={(v) => {
                      const leadership = draft.leadership.map((x, j) =>
                        j === i ? { ...x, bookLabelKy: v } : x
                      );
                      patch({ leadership });
                    }}
                    disabled={!canEdit}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.showInSchedule}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const leadership = draft.leadership.map((x, j) =>
                          j === i
                            ? { ...x, showInSchedule: e.target.checked }
                            : x
                        );
                        patch({ leadership });
                      }}
                    />
                    {isKy ? "Графикте көрсөтүү" : "Показывать в графике"}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.bookable}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const leadership = draft.leadership.map((x, j) =>
                          j === i ? { ...x, bookable: e.target.checked } : x
                        );
                        patch({ leadership });
                      }}
                    />
                    {isKy ? "Жазылууга ачык" : "Доступен для записи"}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    {isKy ? "Терезе" : "Окно слотов"}
                    <select
                      className="input !w-auto !py-1"
                      value={p.windowKind}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const kind = e.target.value as "fixed" | "calendar";
                        const leadership = draft.leadership.map((x, j) =>
                          j === i
                            ? withScheduleLabels(
                                { ...x, windowKind: kind },
                                state.calendar
                              )
                            : x
                        );
                        patch({ leadership });
                      }}
                    >
                      <option value="fixed">
                        {isKy ? "Жеке график" : "Личный график"}
                      </option>
                      <option value="calendar">
                        {isKy ? "Жалпы календарь" : "Общий календарь"}
                      </option>
                    </select>
                  </label>
                </div>
                {(() => {
                  const labels = leadershipScheduleLabels(p, state.calendar);
                  return (
                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {isKy
                          ? "Сайттагы график кабыл алуудан"
                          : "На сайте — из графика приёма"}
                      </div>
                      <div className="mt-0.5 font-medium">
                        {isKy ? labels.weekdayKy : labels.weekdayRu}
                      </div>
                      <div className="tabular-nums text-slate-600">
                        {isKy ? labels.timeKy : labels.timeRu}
                      </div>
                    </div>
                  );
                })()}
                {p.windowKind === "calendar" && (
                  <p className="mt-2 text-xs text-slate-500">
                    {isKy
                      ? "Күндөр жана убакыт — платформанын кабыл алуу графигинен (Жөндөөлөр → календарь)."
                      : "Дни и время берутся из графика приёма платформы (Настройки → календарь)."}
                  </p>
                )}
                {p.windowKind === "fixed" && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-600">
                      {isKy ? "Күндөр" : "Дни приёма"}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map((d) => {
                        const on = leadershipDayWindows(p).some(
                          (w) => w.weekday === d.id
                        );
                        return (
                          <label
                            key={d.id}
                            className={cn(
                              "inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1 text-sm font-medium",
                              on
                                ? "border-court-navy bg-court-navy text-white"
                                : "border-slate-200 bg-white text-slate-600",
                              !canEdit && "cursor-not-allowed opacity-60"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              disabled={!canEdit}
                              checked={on}
                              onChange={(e) => {
                                const current = leadershipDayWindows(p);
                                const next = e.target.checked
                                  ? [
                                      ...current.filter(
                                        (w) => w.weekday !== d.id
                                      ),
                                      {
                                        weekday: d.id,
                                        startMinutes:
                                          state.calendar.dayStartMinutes,
                                        endMinutes:
                                          state.calendar.dayEndMinutes,
                                      },
                                    ]
                                  : current.filter((w) => w.weekday !== d.id);
                                setPersonWindows(i, next);
                              }}
                            />
                            {isKy ? d.ky : d.ru}
                          </label>
                        );
                      })}
                    </div>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200 ease-out",
                        leadershipDayWindows(p).length
                          ? "grid-rows-[1fr]"
                          : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        {leadershipDayWindows(p).length > 0 && (
                          <div className="mt-1 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-slate-50/80">
                            {leadershipDayWindows(p).map((win) => {
                              const day = WEEKDAYS.find(
                                (d) => d.id === win.weekday
                              );
                              return (
                                <div
                                  key={win.weekday}
                                  className="flex flex-wrap items-center gap-3 px-3 py-2"
                                >
                                  <span className="min-w-[2.5rem] text-sm font-semibold text-slate-800">
                                    {isKy ? day?.ky : day?.ru}
                                  </span>
                                  <label className="text-xs text-slate-600">
                                    {isKy ? "Башталышы" : "Начало"}
                                    <input
                                      type="time"
                                      className="input mt-0.5 !w-[8.5rem] !py-1"
                                      disabled={!canEdit}
                                      value={minutesToTime(win.startMinutes)}
                                      onChange={(e) => {
                                        const next = leadershipDayWindows(p).map(
                                          (w) =>
                                            w.weekday === win.weekday
                                              ? {
                                                  ...w,
                                                  startMinutes: timeToMinutes(
                                                    e.target.value
                                                  ),
                                                }
                                              : w
                                        );
                                        setPersonWindows(i, next);
                                      }}
                                    />
                                  </label>
                                  <label className="text-xs text-slate-600">
                                    {isKy ? "Аягы" : "Окончание"}
                                    <input
                                      type="time"
                                      className="input mt-0.5 !w-[8.5rem] !py-1"
                                      disabled={!canEdit}
                                      value={minutesToTime(win.endMinutes)}
                                      onChange={(e) => {
                                        const next = leadershipDayWindows(p).map(
                                          (w) =>
                                            w.weekday === win.weekday
                                              ? {
                                                  ...w,
                                                  endMinutes: timeToMinutes(
                                                    e.target.value
                                                  ),
                                                }
                                              : w
                                        );
                                        setPersonWindows(i, next);
                                      }}
                                    />
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {leadershipDayWindows(p).length === 0 && (
                      <p className="text-xs text-slate-400">
                        {isKy
                          ? "Күндү белгилеңиз — ошол күндүн убактысы төмөндө ачылат."
                          : "Отметьте дни: для каждого выбранного дня ниже откроется своё время."}
                      </p>
                    )}
                  </div>
                )}
              </section>
            ))}

            {canEdit && (
              <button
                type="button"
                className="btn-outline inline-flex items-center gap-2"
                onClick={() =>
                  patch({ leadership: [...draft.leadership, emptyPerson()] })
                }
              >
                <Plus className="h-4 w-4" />
                {isKy ? "Жетекчи кошуу" : "Добавить лицо руководства"}
              </button>
            )}
          </div>
        )}

        {tab === "book" && (
          <Pair title={isKy ? "Жазылуу барагы" : "Страница записи"}>
            <Field
              label="Заголовок (RU)"
              value={draft.bookTitleRu}
              onChange={(v) => patch({ bookTitleRu: v })}
              disabled={!canEdit}
            />
            <Field
              label="Баш аты (KY)"
              value={draft.bookTitleKy}
              onChange={(v) => patch({ bookTitleKy: v })}
              disabled={!canEdit}
            />
            <Field
              label="Подзаголовок (RU)"
              value={draft.bookSubtitleRu}
              onChange={(v) => patch({ bookSubtitleRu: v })}
              disabled={!canEdit}
            />
            <Field
              label="Кошумча аталыш (KY)"
              value={draft.bookSubtitleKy}
              onChange={(v) => patch({ bookSubtitleKy: v })}
              disabled={!canEdit}
            />
            <Field
              label="Подсказка к выбору лица (RU)"
              value={draft.bookTargetHintRu}
              onChange={(v) => patch({ bookTargetHintRu: v })}
              multiline
              rows={3}
              disabled={!canEdit}
            />
            <Field
              label="Тандоо боюнча эскертүү (KY)"
              value={draft.bookTargetHintKy}
              onChange={(v) => patch({ bookTargetHintKy: v })}
              multiline
              rows={3}
              disabled={!canEdit}
            />
          </Pair>
        )}

        {tab === "rules" && (
          <Pair title={isKy ? "Эрежелер" : "Правила записи"}>
            <Field
              label="Заголовок (RU)"
              value={draft.rules.titleRu}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, titleRu: v } })
              }
              disabled={!canEdit}
            />
            <Field
              label="Баш аты (KY)"
              value={draft.rules.titleKy}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, titleKy: v } })
              }
              disabled={!canEdit}
            />
            <Field
              label="Приветствие (RU)"
              value={draft.rules.welcomeRu}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, welcomeRu: v } })
              }
              multiline
              rows={4}
              disabled={!canEdit}
            />
            <Field
              label="Кош келүү (KY)"
              value={draft.rules.welcomeKy}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, welcomeKy: v } })
              }
              multiline
              rows={4}
              disabled={!canEdit}
            />
            <Field
              label="Правила (RU)"
              value={arrayToLines(draft.rules.rulesRu)}
              onChange={(v) =>
                patch({
                  rules: { ...draft.rules, rulesRu: linesToArray(v) },
                })
              }
              multiline
              rows={6}
              disabled={!canEdit}
            />
            <Field
              label="Эрежелер (KY)"
              value={arrayToLines(draft.rules.rulesKy)}
              onChange={(v) =>
                patch({
                  rules: { ...draft.rules, rulesKy: linesToArray(v) },
                })
              }
              multiline
              rows={6}
              disabled={!canEdit}
            />
            <Field
              label="Не можем — заголовок (RU)"
              value={draft.rules.cannotTitleRu}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, cannotTitleRu: v } })
              }
              disabled={!canEdit}
            />
            <Field
              label="Камсыздалбайт — баш аты (KY)"
              value={draft.rules.cannotTitleKy}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, cannotTitleKy: v } })
              }
              disabled={!canEdit}
            />
            <Field
              label="Не можем (RU)"
              value={arrayToLines(draft.rules.cannotRu)}
              onChange={(v) =>
                patch({
                  rules: { ...draft.rules, cannotRu: linesToArray(v) },
                })
              }
              multiline
              rows={4}
              disabled={!canEdit}
            />
            <Field
              label="Камсыздалбайт (KY)"
              value={arrayToLines(draft.rules.cannotKy)}
              onChange={(v) =>
                patch({
                  rules: { ...draft.rules, cannotKy: linesToArray(v) },
                })
              }
              multiline
              rows={4}
              disabled={!canEdit}
            />
            <Field
              label="Согласие (RU)"
              value={draft.rules.agreeRu}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, agreeRu: v } })
              }
              multiline
              rows={2}
              disabled={!canEdit}
            />
            <Field
              label="Макулдук (KY)"
              value={draft.rules.agreeKy}
              onChange={(v) =>
                patch({ rules: { ...draft.rules, agreeKy: v } })
              }
              multiline
              rows={2}
              disabled={!canEdit}
            />
          </Pair>
        )}

        <div className="sticky bottom-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2"
            disabled={!canEdit}
          >
            <Save className="h-4 w-4" />
            {isKy ? "Сактоо" : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="btn-outline inline-flex items-center gap-2"
            disabled={!canEdit}
          >
            <RotateCcw className="h-4 w-4" />
            {isKy ? "Тазалоо" : "Очистить"}
          </button>
          {msg && (
            <span
              className={`text-sm font-medium ${err ? "text-rose-700" : "text-emerald-700"}`}
            >
              {msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
