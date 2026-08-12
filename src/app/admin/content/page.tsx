"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
import { useStore } from "@/lib/store";
import { defaultServiceContent } from "@/lib/serviceContent";
import type { BookingRulesContent, ServiceContent } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { PageLoader } from "@/components/ui/PageLoader";

function linesToArray(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToLines(arr: string[] | undefined): string {
  return (arr ?? []).join("\n");
}

type Draft = {
  hubTitleRu: string;
  hubTitleKy: string;
  hubLeadRu: string;
  hubLeadKy: string;
  hubCtaRu: string;
  hubCtaKy: string;
  memoTitleRu: string;
  memoTitleKy: string;
  memoItemsRu: string;
  memoItemsKy: string;
  allowedRu: string;
  allowedKy: string;
  forbiddenRu: string;
  forbiddenKy: string;
  bookTitleRu: string;
  bookTitleKy: string;
  bookSubtitleRu: string;
  bookSubtitleKy: string;
  rules: {
    titleRu: string;
    titleKy: string;
    welcomeRu: string;
    welcomeKy: string;
    rulesRu: string;
    rulesKy: string;
    cannotTitleRu: string;
    cannotTitleKy: string;
    cannotRu: string;
    cannotKy: string;
    deleteNoteRu: string;
    deleteNoteKy: string;
    agreeRu: string;
    agreeKy: string;
  };
};

function fromContent(sc: ServiceContent): Draft {
  const r = sc.rules ?? defaultServiceContent().rules;
  return {
    hubTitleRu: sc.hubTitleRu ?? "",
    hubTitleKy: sc.hubTitleKy ?? "",
    hubLeadRu: sc.hubLeadRu ?? "",
    hubLeadKy: sc.hubLeadKy ?? "",
    hubCtaRu: sc.hubCtaRu ?? "",
    hubCtaKy: sc.hubCtaKy ?? "",
    memoTitleRu: sc.memoTitleRu ?? "",
    memoTitleKy: sc.memoTitleKy ?? "",
    memoItemsRu: arrayToLines(sc.memoItemsRu),
    memoItemsKy: arrayToLines(sc.memoItemsKy),
    allowedRu: arrayToLines(sc.allowedRu),
    allowedKy: arrayToLines(sc.allowedKy),
    forbiddenRu: arrayToLines(sc.forbiddenRu),
    forbiddenKy: arrayToLines(sc.forbiddenKy),
    bookTitleRu: sc.bookTitleRu ?? "",
    bookTitleKy: sc.bookTitleKy ?? "",
    bookSubtitleRu: sc.bookSubtitleRu ?? "",
    bookSubtitleKy: sc.bookSubtitleKy ?? "",
    rules: {
      titleRu: r.titleRu ?? "",
      titleKy: r.titleKy ?? "",
      welcomeRu: r.welcomeRu ?? "",
      welcomeKy: r.welcomeKy ?? "",
      rulesRu: arrayToLines(r.rulesRu),
      rulesKy: arrayToLines(r.rulesKy),
      cannotTitleRu: r.cannotTitleRu ?? "",
      cannotTitleKy: r.cannotTitleKy ?? "",
      cannotRu: arrayToLines(r.cannotRu),
      cannotKy: arrayToLines(r.cannotKy),
      deleteNoteRu: r.deleteNoteRu ?? "",
      deleteNoteKy: r.deleteNoteKy ?? "",
      agreeRu: r.agreeRu ?? "",
      agreeKy: r.agreeKy ?? "",
    },
  };
}

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

function PairBlock({
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

export default function ContentCmsPage() {
  const {
    ready,
    state,
    currentUser,
    updateServiceContent,
    updateBookingRules,
    resetServiceContent,
  } = useStore();
  const { lang } = useI18n();
  const isKy = lang === "ky";

  const canEdit =
    !!currentUser &&
    ["admin", "reception", "leadership"].includes(currentUser.role);

  const [draft, setDraft] = useState<Draft>(() =>
    fromContent(state.serviceContent ?? defaultServiceContent())
  );
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    setDraft(fromContent(state.serviceContent ?? defaultServiceContent()));
  }, [state.serviceContent]);

  if (!ready) return <PageLoader label={isKy ? "Жүктөө…" : "Загрузка…"} />;

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setMsg("");
  }

  function setRuleField<K extends keyof Draft["rules"]>(
    key: K,
    value: Draft["rules"][K]
  ) {
    setDraft((d) => ({ ...d, rules: { ...d.rules, [key]: value } }));
    setMsg("");
  }

  function onSave(e: React.FormEvent) {
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

    const rulesPatch: Partial<BookingRulesContent> = {
      titleRu: draft.rules.titleRu.trim(),
      titleKy: draft.rules.titleKy.trim(),
      welcomeRu: draft.rules.welcomeRu.trim(),
      welcomeKy: draft.rules.welcomeKy.trim(),
      rulesRu: linesToArray(draft.rules.rulesRu),
      rulesKy: linesToArray(draft.rules.rulesKy),
      cannotTitleRu: draft.rules.cannotTitleRu.trim(),
      cannotTitleKy: draft.rules.cannotTitleKy.trim(),
      cannotRu: linesToArray(draft.rules.cannotRu),
      cannotKy: linesToArray(draft.rules.cannotKy),
      deleteNoteRu: draft.rules.deleteNoteRu.trim(),
      deleteNoteKy: draft.rules.deleteNoteKy.trim(),
      agreeRu: draft.rules.agreeRu.trim(),
      agreeKy: draft.rules.agreeKy.trim(),
    };

    updateServiceContent({
      hubTitleRu: draft.hubTitleRu.trim(),
      hubTitleKy: draft.hubTitleKy.trim(),
      hubLeadRu: draft.hubLeadRu.trim(),
      hubLeadKy: draft.hubLeadKy.trim(),
      hubCtaRu: draft.hubCtaRu.trim(),
      hubCtaKy: draft.hubCtaKy.trim(),
      memoTitleRu: draft.memoTitleRu.trim(),
      memoTitleKy: draft.memoTitleKy.trim(),
      memoItemsRu: linesToArray(draft.memoItemsRu),
      memoItemsKy: linesToArray(draft.memoItemsKy),
      allowedRu: linesToArray(draft.allowedRu),
      allowedKy: linesToArray(draft.allowedKy),
      forbiddenRu: linesToArray(draft.forbiddenRu),
      forbiddenKy: linesToArray(draft.forbiddenKy),
      bookTitleRu: draft.bookTitleRu.trim(),
      bookTitleKy: draft.bookTitleKy.trim(),
      bookSubtitleRu: draft.bookSubtitleRu.trim(),
      bookSubtitleKy: draft.bookSubtitleKy.trim(),
    });
    updateBookingRules(rulesPatch);

    setErr(false);
    setMsg(isKy ? "Сакталды." : "Сохранено.");
  }

  function onReset() {
    if (!canEdit) return;
    if (
      !window.confirm(
        isKy
          ? "Бардык тексттерди демейкиге кайтаруу?"
          : "Вернуть все тексты к значениям по умолчанию?"
      )
    ) {
      return;
    }
    resetServiceContent();
    setDraft(fromContent(defaultServiceContent()));
    setErr(false);
    setMsg(isKy ? "Демейкиге кайтарылды." : "Сброшено к значениям по умолчанию.");
  }

  return (
    <div className="animate-fade-up mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            CMS
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {isKy ? "Сервис контенти" : "Контент сервиса"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            {isKy
              ? "Жарандар бөлүмүнүн тексттери, эскертме, эрежелер. localStorage демо."
              : "Тексты раздела граждан, памятка, правила записи. Демо через localStorage."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isKy ? "Алдын ала көрүү /" : "Превью /"}
          </Link>
          <Link
            href="/book"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isKy ? "Превью /book" : "Превью /book"}
          </Link>
        </div>
      </div>

      {!canEdit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {isKy
            ? "Көрүү гана. Түзөтүү: admin, reception, leadership."
            : "Только просмотр. Редактирование доступно ролям admin, reception, leadership."}
        </div>
      )}

      <form onSubmit={onSave} className="space-y-5">
        <PairBlock
          title={isKy ? "Башкы бет (хаб)" : "Главная страница (хаб)"}
        >
          <Field
            label="Заголовок (RU)"
            value={draft.hubTitleRu}
            onChange={(v) => setField("hubTitleRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="Баш аты (KY)"
            value={draft.hubTitleKy}
            onChange={(v) => setField("hubTitleKy", v)}
            disabled={!canEdit}
          />
          <Field
            label="Лид (RU)"
            value={draft.hubLeadRu}
            onChange={(v) => setField("hubLeadRu", v)}
            multiline
            rows={3}
            disabled={!canEdit}
          />
          <Field
            label="Лид (KY)"
            value={draft.hubLeadKy}
            onChange={(v) => setField("hubLeadKy", v)}
            multiline
            rows={3}
            disabled={!canEdit}
          />
          <Field
            label="CTA кнопка (RU)"
            value={draft.hubCtaRu}
            onChange={(v) => setField("hubCtaRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="CTA кнопка (KY)"
            value={draft.hubCtaKy}
            onChange={(v) => setField("hubCtaKy", v)}
            disabled={!canEdit}
          />
        </PairBlock>

        <PairBlock title={isKy ? "Эскертме" : "Памятка"}>
          <Field
            label="Заголовок (RU)"
            value={draft.memoTitleRu}
            onChange={(v) => setField("memoTitleRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="Баш аты (KY)"
            value={draft.memoTitleKy}
            onChange={(v) => setField("memoTitleKy", v)}
            disabled={!canEdit}
          />
          <Field
            label="Пункты (RU)"
            hint={isKy ? "Бир сап — бир пункт" : "Один пункт — одна строка"}
            value={draft.memoItemsRu}
            onChange={(v) => setField("memoItemsRu", v)}
            multiline
            rows={5}
            disabled={!canEdit}
          />
          <Field
            label="Пункттер (KY)"
            hint={isKy ? "Бир сап — бир пункт" : "Один пункт — одна строка"}
            value={draft.memoItemsKy}
            onChange={(v) => setField("memoItemsKy", v)}
            multiline
            rows={5}
            disabled={!canEdit}
          />
        </PairBlock>

        <PairBlock
          title={
            isKy
              ? "Кабыл алуу предмети (уруксат / тыюу)"
              : "Предмет приёма (разрешено / запрещено)"
          }
        >
          <Field
            label="Разрешено (RU)"
            hint={isKy ? "Бир сап — бир пункт" : "Один пункт — одна строка"}
            value={draft.allowedRu}
            onChange={(v) => setField("allowedRu", v)}
            multiline
            rows={5}
            disabled={!canEdit}
          />
          <Field
            label="Уруксат (KY)"
            value={draft.allowedKy}
            onChange={(v) => setField("allowedKy", v)}
            multiline
            rows={5}
            disabled={!canEdit}
          />
          <Field
            label="Не допускается (RU)"
            value={draft.forbiddenRu}
            onChange={(v) => setField("forbiddenRu", v)}
            multiline
            rows={5}
            disabled={!canEdit}
          />
          <Field
            label="Тыюу (KY)"
            value={draft.forbiddenKy}
            onChange={(v) => setField("forbiddenKy", v)}
            multiline
            rows={5}
            disabled={!canEdit}
          />
        </PairBlock>

        <PairBlock title={isKy ? "Жазылуу барагы" : "Страница записи"}>
          <Field
            label="Заголовок (RU)"
            value={draft.bookTitleRu}
            onChange={(v) => setField("bookTitleRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="Баш аты (KY)"
            value={draft.bookTitleKy}
            onChange={(v) => setField("bookTitleKy", v)}
            disabled={!canEdit}
          />
          <Field
            label="Подзаголовок (RU)"
            value={draft.bookSubtitleRu}
            onChange={(v) => setField("bookSubtitleRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="Кошумча аталыш (KY)"
            value={draft.bookSubtitleKy}
            onChange={(v) => setField("bookSubtitleKy", v)}
            disabled={!canEdit}
          />
        </PairBlock>

        <PairBlock
          title={
            isKy
              ? "Жазылуу эрежелери (кадам 0)"
              : "Правила записи (шаг 0 мастера)"
          }
        >
          <Field
            label="Заголовок правил (RU)"
            value={draft.rules.titleRu}
            onChange={(v) => setRuleField("titleRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="Эрежелердин аталышы (KY)"
            value={draft.rules.titleKy}
            onChange={(v) => setRuleField("titleKy", v)}
            disabled={!canEdit}
          />
          <Field
            label="Приветствие (RU)"
            value={draft.rules.welcomeRu}
            onChange={(v) => setRuleField("welcomeRu", v)}
            multiline
            rows={4}
            disabled={!canEdit}
          />
          <Field
            label="Кош келүү (KY)"
            value={draft.rules.welcomeKy}
            onChange={(v) => setRuleField("welcomeKy", v)}
            multiline
            rows={4}
            disabled={!canEdit}
          />
          <Field
            label="Правила — список (RU)"
            hint={isKy ? "Бир сап — бир пункт" : "Один пункт — одна строка"}
            value={draft.rules.rulesRu}
            onChange={(v) => setRuleField("rulesRu", v)}
            multiline
            rows={6}
            disabled={!canEdit}
          />
          <Field
            label="Эрежелер — тизме (KY)"
            value={draft.rules.rulesKy}
            onChange={(v) => setRuleField("rulesKy", v)}
            multiline
            rows={6}
            disabled={!canEdit}
          />
          <Field
            label="Блок «не можем» — заголовок (RU)"
            value={draft.rules.cannotTitleRu}
            onChange={(v) => setRuleField("cannotTitleRu", v)}
            disabled={!canEdit}
          />
          <Field
            label="«Камсыздалбайт» — баш аты (KY)"
            value={draft.rules.cannotTitleKy}
            onChange={(v) => setRuleField("cannotTitleKy", v)}
            disabled={!canEdit}
          />
          <Field
            label="Не можем — список (RU)"
            value={draft.rules.cannotRu}
            onChange={(v) => setRuleField("cannotRu", v)}
            multiline
            rows={4}
            disabled={!canEdit}
          />
          <Field
            label="Камсыздалбайт — тизме (KY)"
            value={draft.rules.cannotKy}
            onChange={(v) => setRuleField("cannotKy", v)}
            multiline
            rows={4}
            disabled={!canEdit}
          />
          <Field
            label="Примечание об удалении (RU)"
            value={draft.rules.deleteNoteRu}
            onChange={(v) => setRuleField("deleteNoteRu", v)}
            multiline
            rows={2}
            disabled={!canEdit}
          />
          <Field
            label="Өчүрүү эскертүүсү (KY)"
            value={draft.rules.deleteNoteKy}
            onChange={(v) => setRuleField("deleteNoteKy", v)}
            multiline
            rows={2}
            disabled={!canEdit}
          />
          <Field
            label="Согласие с правилами (RU)"
            value={draft.rules.agreeRu}
            onChange={(v) => setRuleField("agreeRu", v)}
            multiline
            rows={2}
            disabled={!canEdit}
          />
          <Field
            label="Эрежелерге макулдук (KY)"
            value={draft.rules.agreeKy}
            onChange={(v) => setRuleField("agreeKy", v)}
            multiline
            rows={2}
            disabled={!canEdit}
          />
        </PairBlock>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
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
            {isKy ? "Демейкиге" : "Сбросить"}
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
