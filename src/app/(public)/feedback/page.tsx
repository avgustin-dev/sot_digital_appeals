"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FEEDBACK_QUESTIONS } from "@/lib/constants";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useI18n } from "@/lib/i18n";

export default function FeedbackIndexPage() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs
        items={[
          { label: t.crumbs.home, href: "/" },
          { label: t.crumbs.feedback },
        ]}
      />

      <div className="card p-6 sm:p-8">
        <h1 className="section-title">{t.feedback.title}</h1>
        <p className="mt-2 text-base text-court-muted">{t.feedback.lead}</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim())
              router.push(`/feedback/${code.trim().toUpperCase()}`);
          }}
        >
          <div>
            <label className="label" htmlFor="code">
              {t.feedback.code}
            </label>
            <input
              id="code"
              className="input !min-h-12 !text-base font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VS-2026-...."
              required
            />
          </div>
          <button type="submit" className="btn-primary !min-h-12">
            {t.feedback.go}
          </button>
        </form>
        <ul className="mt-6 space-y-2 border-t border-court-line pt-5 text-base text-court-muted">
          {FEEDBACK_QUESTIONS.map((q) => (
            <li key={q.key}>— {q.label}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-court-muted">
          {t.my.demo}:{" "}
          <button
            type="button"
            className="font-mono text-court-blue underline"
            onClick={() => router.push("/feedback/VS-2026-0910")}
          >
            VS-2026-0910
          </button>
        </p>
        <Link
          href="/my-appointment"
          className="mt-4 inline-block text-sm font-semibold text-court-blue hover:underline"
        >
          {t.nav.myAppointment} →
        </Link>
      </div>
    </div>
  );
}
