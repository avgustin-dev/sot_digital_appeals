"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmblemKR } from "@/components/brand/Emblem";
import { PageLoader } from "@/components/ui/PageLoader";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { SurveyAnswerValue } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Публичная анкета (макет opros.sot) — вопросы из админки.
 */
export default function PublicSurveyPage() {
  const {
    ready,
    state,
    submitSurveyResponse,
  } = useStore();
  const { lang } = useI18n();
  const isKy = lang === "ky";

  const [answers, setAnswers] = useState<Record<string, SurveyAnswerValue>>(
    {}
  );
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const meta = state.surveyMeta;
  const allQuestions = useMemo(
    () =>
      [...(state.surveyQuestions || [])]
        .filter((q) => q.enabled)
        .sort((a, b) => a.order - b.order),
    [state.surveyQuestions]
  );

  /** Условный показ (как Q9–11 при посещении суда) */
  const visible = useMemo(() => {
    return allQuestions.filter((q) => {
      if (!q.showIf) return true;
      const a = answers[q.showIf.questionId];
      if (!a?.optionId) return true; // показывать до ответа на родителя — или false?
      return q.showIf.optionIds.includes(a.optionId);
    });
  }, [allQuestions, answers]);

  if (!ready) return <PageLoader label="Загрузка…" />;

  function setAnswer(qid: string, value: SurveyAnswerValue) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setError("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const q of visible) {
      if (!q.required) continue;
      const a = answers[q.id];
      if (q.type === "text") {
        if (!a?.text?.trim()) {
          setError(
            isKy
              ? `Суроо ${q.order} милдеттүү.`
              : `Вопрос ${q.order} обязателен.`
          );
          return;
        }
      } else {
        if (!a?.optionId) {
          setError(
            isKy
              ? `Суроо ${q.order} милдеттүү.`
              : `Вопрос ${q.order} обязателен.`
          );
          return;
        }
        const opt = q.options.find((o) => o.id === a.optionId);
        if (opt?.isOther && !a.text?.trim()) {
          setError(
            isKy
              ? `Суроо ${q.order}: «Башка» үчүн текст жазыңыз.`
              : `Вопрос ${q.order}: укажите текст для «Другое».`
          );
          return;
        }
      }
    }
    const res = submitSurveyResponse(
      answers,
      isKy ? meta.courtNameKy : meta.courtNameRu
    );
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-slate-800 to-slate-900 px-4 py-12">
        <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
          <EmblemKR size={56} className="mx-auto" />
          <h1 className="mt-4 text-xl font-bold text-court-navy">
            {isKy ? "Рахмат!" : "Спасибо!"}
          </h1>
          <p className="mt-2 text-sm text-court-muted">
            {isKy
              ? "Сиздин жоопторуңуз кабыл алынды (демо)."
              : "Ваши ответы сохранены (демо)."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn-outline">
              {isKy ? "Башкы бет" : "На главную"}
            </Link>
            <Link href="/admin/survey/results" className="btn-primary">
              {isKy ? "Жыйынтыктар (админ)" : "Результаты (админ)"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = isKy ? meta.titleKy : meta.titleRu;
  const desc = isKy ? meta.descriptionKy : meta.descriptionRu;
  const court = isKy ? meta.courtNameKy : meta.courtNameRu;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 px-3 py-8 sm:px-4">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl space-y-4 pb-16"
      >
        {/* Header card */}
        <div className="rounded-lg bg-white px-5 py-6 text-center shadow-md sm:px-8">
          <EmblemKR size={64} className="mx-auto" />
          <h1 className="mt-3 text-sm font-bold uppercase tracking-wide text-court-navy sm:text-base">
            {title}
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase text-court-ink sm:text-sm">
            {court}
          </p>
          <p className="mx-auto mt-4 max-w-md text-left text-xs leading-relaxed text-court-muted sm:text-sm">
            {desc}
          </p>
          <p className="mt-3 text-[11px] text-court-muted">
            {isKy
              ? "Демо-макет · суроолор админкадан"
              : "Демо-макет · вопросы из админки"}{" "}
            ·{" "}
            <Link href="/admin/survey" className="text-court-blue underline">
              {isKy ? "Админ" : "Админ"}
            </Link>
          </p>
        </div>

        {visible.map((q, idx) => {
          const label = isKy ? q.textKy || q.textRu : q.textRu;
          const a = answers[q.id] || {};
          return (
            <div
              key={q.id}
              className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
            >
              <h2 className="text-sm font-semibold text-court-ink sm:text-base">
                <span className="text-court-navy">{idx + 1}.</span> {label}
                {q.required && (
                  <span className="ml-1 text-court-danger">*</span>
                )}
              </h2>

              {q.type === "text" ? (
                <textarea
                  className="input mt-3 min-h-[88px] resize-y"
                  value={a.text || ""}
                  onChange={(e) =>
                    setAnswer(q.id, { text: e.target.value })
                  }
                  placeholder={
                    isKy ? "Жообуңузду жазыңыз…" : "Введите ваш ответ…"
                  }
                />
              ) : (
                <ul className="mt-3 space-y-2">
                  {q.options.map((o) => {
                    const ot = isKy ? o.textKy || o.textRu : o.textRu;
                    const selected = a.optionId === o.id;
                    return (
                      <li key={o.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-2.5 rounded border px-3 py-2.5 text-sm transition",
                            selected
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-court-line bg-white hover:border-court-navy/40"
                          )}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            className="mt-0.5 h-4 w-4 accent-emerald-600"
                            checked={selected}
                            onChange={() =>
                              setAnswer(q.id, {
                                optionId: o.id,
                                text: o.isOther ? a.text : undefined,
                              })
                            }
                          />
                          <span className="leading-snug text-court-ink">
                            {ot}
                          </span>
                        </label>
                        {selected && o.isOther && (
                          <input
                            className="input mt-2 ml-7"
                            value={a.text || ""}
                            onChange={(e) =>
                              setAnswer(q.id, {
                                optionId: o.id,
                                text: e.target.value,
                              })
                            }
                            placeholder={
                              isKy ? "Көрсөтүңүз…" : "Укажите…"
                            }
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="sticky bottom-4 flex justify-center gap-2">
          <button type="submit" className="btn-primary !px-8 !py-3 shadow-lg">
            {isKy ? "Жөнөтүү" : "Отправить"}
          </button>
        </div>
      </form>
    </div>
  );
}
