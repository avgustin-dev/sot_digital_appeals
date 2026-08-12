"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FEEDBACK_QUESTIONS } from "@/lib/constants";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageLoader } from "@/components/ui/PageLoader";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export default function FeedbackByCodePage() {
  const params = useParams();
  const code = String(params.code || "").toUpperCase();
  const { ready, getAppealByCode, submitFeedback } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";

  const appeal = useMemo(
    () => (ready ? getAppealByCode(code) : undefined),
    [ready, code, getAppealByCode]
  );

  const [scores, setScores] = useState<Record<string, number>>({
    respectful: 0,
    clearNextSteps: 0,
    convenient: 0,
    deadlinesMet: 0,
  });
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!ready) return <PageLoader label={t.common.loading} />;

  if (!appeal) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="card p-6">
          <h1 className="text-lg font-semibold text-court-ink">
            {isKy ? "Кайрылуу табылган жок" : "Обращение не найдено"}
          </h1>
          <Link href="/feedback" className="btn-primary mt-4 inline-flex">
            {isKy ? "Артка" : "К вводу кода"}
          </Link>
        </div>
      </div>
    );
  }

  if (appeal.feedback || done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="card p-6 text-center">
          <h1 className="text-xl font-semibold text-court-ink">
            {t.feedback.thanks}
          </h1>
          <p className="mt-2 text-sm text-court-muted">
            {appeal.feedback ? t.feedback.already : t.feedback.thanks}
          </p>
          <Link href="/" className="btn-outline mt-4 inline-flex">
            {t.book.toHome}
          </Link>
        </div>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    for (const q of FEEDBACK_QUESTIONS) {
      if (!scores[q.key] || scores[q.key] < 1) {
        setError(
          isKy
            ? "Бардык суроолорго жооп бериңиз (1–5)."
            : "Ответьте на все вопросы (оценка 1–5)."
        );
        return;
      }
    }
    const res = submitFeedback(code, {
      respectful: scores.respectful,
      clearNextSteps: scores.clearNextSteps,
      convenient: scores.convenient,
      deadlinesMet: scores.deadlinesMet,
      comment: comment.trim() || undefined,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: t.crumbs.home, href: "/" },
          { label: t.crumbs.feedback, href: "/feedback" },
          { label: code },
        ]}
      />
      <form onSubmit={onSubmit} className="card p-5 sm:p-6">
        <h1 className="text-xl font-semibold text-court-ink">
          {t.feedback.title}
        </h1>
        <p className="mt-1 text-sm text-court-muted">
          {appeal.fullName} · {code}
        </p>

        <div className="mt-6 space-y-5">
          {FEEDBACK_QUESTIONS.map((q) => (
            <div key={q.key}>
              <div className="mb-2 text-sm font-medium text-court-ink">
                {q.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, [q.key]: n }))}
                    className={
                      scores[q.key] === n
                        ? "min-w-[2.5rem] border border-court-navy bg-court-navy px-3 py-2 text-sm font-semibold text-white"
                        : "min-w-[2.5rem] border border-court-line bg-white px-3 py-2 text-sm text-court-ink hover:border-court-navy"
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="label" htmlFor="comment">
            {t.feedback.comment}
          </label>
          <textarea
            id="comment"
            className="input min-h-[88px] resize-y"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && (
          <div className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary mt-5">
          {t.feedback.submit}
        </button>
      </form>
    </div>
  );
}
