"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClipboardCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ControlPage() {
  const {
    state,
    currentUser,
    addControlLog,
    setAssignmentStatus,
    submitFinalAnswer,
  } = useStore();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction] = useState("Ход исполнения");
  const [comment, setComment] = useState("");
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");

  const items = useMemo(() => {
    let list = state.appeals.filter((a) =>
      ["in_control", "answered", "reception_done"].includes(a.stage)
    );
    if (currentUser?.role === "responsible") {
      list = list.filter(
        (a) => a.assignment?.responsibleUserId === currentUser.id
      );
    }
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [state.appeals, currentUser]);

  const selected = items.find((a) => a.id === selectedId);

  function onLog(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !selected) return;
    addControlLog(selected.id, currentUser, action, comment);
    setAssignmentStatus(selected.id, "in_progress");
    setComment("");
    setMsg("Запись в журнале контроля добавлена.");
  }

  function onAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !selected) return;
    submitFinalAnswer(selected.id, currentUser, answer);
    setAnswer("");
    setMsg(
      "Ответ направлен. Гражданин может оценить работу: /feedback/" +
        selected.code
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.control },
        ]}
      />
      <div>
        <h1 className="section-title">{t.admin.control}</h1>
        <p className="mt-1 text-base text-court-muted">
          Исполнение поручений, журнал контроля, направление ответа заявителю.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {msg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="card p-5">
          <h2 className="mb-4 font-display text-xl font-semibold text-court-navy">
            На контроле
          </h2>
          {items.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Нет поручений"
              description="После личного приёма обращения появятся здесь."
              className="border-0 shadow-none"
            />
          ) : (
            <ul className="space-y-2">
              {items.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(a.id);
                      setMsg("");
                    }}
                    className={`w-full rounded-xl border px-3 py-3 text-left ${
                      selectedId === a.id
                        ? "border-court-gold bg-court-goldPale"
                        : "border-court-line hover:bg-court-mist"
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <div className="font-mono text-xs text-court-muted">
                        {a.code}
                      </div>
                      <StageBadge stage={a.stage} />
                    </div>
                    <div className="font-semibold text-court-navy">
                      {a.fullName}
                    </div>
                    <div className="text-xs text-court-muted">
                      {a.assignment?.responsibleName || "—"} · срок{" "}
                      {a.assignment?.dueDate || "—"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          {!selected ? (
            <p className="text-sm text-court-muted">
              Выберите обращение для работы.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-court-navy">
                  {selected.code}
                </h2>
                <p className="text-sm text-court-muted">{selected.topic}</p>
                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  <strong>Поручение:</strong>{" "}
                  {selected.assignment?.text || "—"}
                </div>
                <Link
                  href={`/admin/appeals/${selected.id}`}
                  className="mt-2 inline-block text-xs font-semibold text-court-blue"
                >
                  Карточка →
                </Link>
              </div>

              <form onSubmit={onLog} className="space-y-3 border-t border-court-line pt-4">
                <h3 className="font-semibold text-court-navy">
                  Журнал исполнения
                </h3>
                <div>
                  <label className="label">Действие</label>
                  <input
                    className="input"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Комментарий / результат</label>
                  <textarea
                    className="input min-h-[70px]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-outline">
                  Добавить в журнал
                </button>
              </form>

              {selected.controlLog.length > 0 && (
                <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
                  {selected.controlLog.map((c) => (
                    <li key={c.id} className="rounded-lg bg-court-mist px-3 py-2">
                      <strong>{c.action}</strong> — {c.comment}
                      <div className="text-court-muted">
                        {c.authorName} ·{" "}
                        {new Date(c.at).toLocaleString("ru-RU")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {selected.stage === "in_control" && (
                <form
                  onSubmit={onAnswer}
                  className="space-y-3 border-t border-court-line pt-4"
                >
                  <h3 className="font-semibold text-court-navy">
                    Полный обоснованный ответ гражданину
                  </h3>
                  <textarea
                    className="input min-h-[120px]"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Текст ответа…"
                    required
                  />
                  <button type="submit" className="btn-primary">
                    Направить ответ и закрыть поручение
                  </button>
                </form>
              )}

              {selected.stage === "answered" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  Ответ направлен. Ссылка для оценки:{" "}
                  <Link
                    href={`/feedback/${selected.code}`}
                    className="font-semibold underline"
                  >
                    /feedback/{selected.code}
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
