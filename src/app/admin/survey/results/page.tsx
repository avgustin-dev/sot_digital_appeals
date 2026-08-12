"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageLoader } from "@/components/ui/PageLoader";

export default function SurveyResultsPage() {
  const { ready, state, clearSurveyResponses } = useStore();

  const questions = useMemo(
    () =>
      [...(state.surveyQuestions || [])]
        .filter((q) => q.enabled)
        .sort((a, b) => a.order - b.order),
    [state.surveyQuestions]
  );

  const responses = state.surveyResponses || [];

  const stats = useMemo(() => {
    return questions.map((q) => {
      if (q.type === "text") {
        const texts = responses
          .map((r) => r.answers[q.id]?.text?.trim())
          .filter(Boolean) as string[];
        return {
          question: q,
          kind: "text" as const,
          texts,
          total: texts.length,
        };
      }
      const counts: Record<string, number> = {};
      for (const o of q.options) counts[o.id] = 0;
      let answered = 0;
      for (const r of responses) {
        const a = r.answers[q.id];
        if (a?.optionId && counts[a.optionId] !== undefined) {
          counts[a.optionId] += 1;
          answered += 1;
        }
      }
      return {
        question: q,
        kind: "single" as const,
        counts,
        answered,
      };
    });
  }, [questions, responses]);

  if (!ready) return <PageLoader label="Загрузка…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-court-navy sm:text-2xl">
            Результаты опросника
          </h1>
          <p className="mt-1 text-sm text-court-muted">
            Демо-статистика по сохранённым ответам (local). Всего анкет:{" "}
            <strong className="text-court-navy">{responses.length}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/survey" className="btn-outline !text-sm">
            ← Вопросы
          </Link>
          <Link href="/survey" target="_blank" className="btn-outline !text-sm">
            Заполнить анкету
          </Link>
          <button
            type="button"
            className="btn-danger !text-sm"
            onClick={() => {
              if (confirm("Очистить все ответы (демо)?")) clearSurveyResponses();
            }}
          >
            Очистить ответы
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs uppercase text-court-muted">Анкет</div>
          <div className="text-2xl font-bold text-court-navy">
            {responses.length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase text-court-muted">Вопросов</div>
          <div className="text-2xl font-bold text-court-navy">
            {questions.length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase text-court-muted">Последняя</div>
          <div className="text-sm font-semibold text-court-navy">
            {responses[0]
              ? new Date(responses[0].at).toLocaleString("ru-RU")
              : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.question.id} className="card p-4 sm:p-5">
            <div className="text-xs font-semibold text-court-muted">
              Вопрос {s.question.order}
            </div>
            <h2 className="mt-1 text-base font-semibold text-court-ink">
              {s.question.textRu}
            </h2>

            {s.kind === "single" && (
              <ul className="mt-4 space-y-2">
                {s.question.options.map((o) => {
                  const n = s.counts[o.id] || 0;
                  const pct =
                    s.answered > 0
                      ? Math.round((n / s.answered) * 100)
                      : 0;
                  return (
                    <li key={o.id}>
                      <div className="mb-0.5 flex justify-between gap-2 text-sm">
                        <span className="text-court-ink">{o.textRu}</span>
                        <span className="shrink-0 font-mono text-court-muted">
                          {n} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden bg-court-mist">
                        <div
                          className="h-full bg-court-navy transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {s.kind === "text" && (
              <div className="mt-3">
                {s.texts.length === 0 ? (
                  <p className="text-sm text-court-muted">Нет текстовых ответов.</p>
                ) : (
                  <ul className="space-y-2">
                    {s.texts.map((t, i) => (
                      <li
                        key={i}
                        className="border border-court-line bg-court-mist px-3 py-2 text-sm text-court-ink"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
