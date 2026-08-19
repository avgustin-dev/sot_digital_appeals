"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Collapsible } from "@/components/ui/Collapsible";
import { AdminHeading } from "@/components/staff/AdminHeading";
import { ClipboardCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENT_STATUSES,
  assignmentStatusLabel,
} from "@/lib/assignmentStatus";

const ACTION_PRESETS = [
  { ru: "Ход исполнения", ky: "Аткаруунун жүрүшү" },
  { ru: "Запрос документов", ky: "Документтерди суроо" },
  { ru: "Согласование", ky: "Макулдашуу" },
  { ru: "Напоминание ответственному", ky: "Жооптууга эскертүү" },
  { ru: "Частичное исполнение", ky: "Жарым-жартылай аткаруу" },
  { ru: "Готово к ответу", ky: "Жоопко даяр" },
];

export default function ControlPage() {
  const {
    state,
    currentUser,
    addControlLog,
    setAssignmentStatus,
    submitFinalAnswer,
  } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "overdue" | "done">(
    "all"
  );
  const [action, setAction] = useState(ACTION_PRESETS[0].ru);
  const [comment, setComment] = useState("");
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const items = useMemo(() => {
    let list = state.appeals.filter((a) =>
      ["in_control", "answered", "reception_done", "closed"].includes(a.stage)
    );
    if (currentUser?.role === "responsible") {
      list = list.filter(
        (a) => a.assignment?.responsibleUserId === currentUser.id
      );
    }
    list = list.sort((a, b) => {
      const da = a.assignment?.dueDate || "9999";
      const db = b.assignment?.dueDate || "9999";
      return da.localeCompare(db);
    });
    if (filter === "open") {
      list = list.filter(
        (a) =>
          a.stage === "in_control" &&
          a.assignment &&
          a.assignment.status !== "done"
      );
    }
    if (filter === "overdue") {
      list = list.filter(
        (a) =>
          a.stage === "in_control" &&
          a.assignment?.dueDate &&
          a.assignment.dueDate < today &&
          a.assignment.status !== "done"
      );
    }
    if (filter === "done") {
      list = list.filter(
        (a) =>
          a.stage === "answered" ||
          a.stage === "closed" ||
          a.assignment?.status === "done"
      );
    }
    return list;
  }, [state.appeals, currentUser, filter, today]);

  const selected = items.find((a) => a.id === selectedId) ||
    state.appeals.find((a) => a.id === selectedId);

  const counts = useMemo(() => {
    const base = state.appeals.filter((a) =>
      ["in_control", "answered", "reception_done", "closed"].includes(a.stage)
    );
    const open = base.filter(
      (a) =>
        a.stage === "in_control" &&
        a.assignment &&
        a.assignment.status !== "done"
    ).length;
    const overdue = base.filter(
      (a) =>
        a.stage === "in_control" &&
        a.assignment?.dueDate &&
        a.assignment.dueDate < today &&
        a.assignment.status !== "done"
    ).length;
    const done = base.filter(
      (a) =>
        a.stage === "answered" ||
        a.stage === "closed" ||
        a.assignment?.status === "done"
    ).length;
    return { open, overdue, done, all: base.length };
  }, [state.appeals, today]);

  async function onLog(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !selected) return;
    const rec = await addControlLog(selected.id, currentUser, action, comment);
    if (rec && "ok" in rec && !rec.ok) {
      setErr(true);
      setMsg(rec.error);
      return;
    }
    await setAssignmentStatus(selected.id, "in_progress");
    setComment("");
    setErr(false);
    setMsg(isKy ? "Журналга жазуу кошулду." : "Запись в журнале добавлена.");
  }

  async function onAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !selected) return;
    if (answer.trim().length < 20) {
      setErr(true);
      setMsg(
        isKy
          ? "Жооп өтө кыска (кеминде ~20 белги)."
          : "Ответ слишком короткий (минимум ~20 символов)."
      );
      return;
    }
    const sent = await submitFinalAnswer(selected.id, currentUser, answer);
    if (sent && "ok" in sent && !sent.ok) {
      setErr(true);
      setMsg(sent.error);
      return;
    }
    setAnswer("");
    setErr(false);
    setMsg(
      isKy
        ? `Жооп жөнөтүлдү. Жаран баалай алат: ${routes.evaluationByCode(selected.code)}`
        : `Ответ направлен. Гражданин может оценить: ${routes.evaluationByCode(selected.code)}`
    );
  }

  function isOverdue(a: typeof selected) {
    if (!a?.assignment) return false;
    return (
      a.stage === "in_control" &&
      a.assignment.dueDate < today &&
      a.assignment.status !== "done"
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.control },
        ]}
      />
      <AdminHeading
        title={isKy ? "Тапшырмалар" : "Поручения"}
        lead={
          isKy
            ? "Журнал, мөөнөт, жооп жаранга."
            : "Журнал исполнения, срок, ответ заявителю."
        }
      />

      <div className="grid gap-2 sm:grid-cols-4">
        {(
          [
            { key: "all" as const, label: isKy ? "Баары" : "Все", n: counts.all, icon: ClipboardCheck },
            { key: "open" as const, label: isKy ? "Ачык" : "В работе", n: counts.open, icon: Clock },
            { key: "overdue" as const, label: isKy ? "Мөөнөтү өткөн" : "Просрочено", n: counts.overdue, icon: AlertTriangle },
            { key: "done" as const, label: isKy ? "Бүттү" : "Закрыто", n: counts.done, icon: CheckCircle2 },
          ] as const
        ).map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                filter === c.key
                  ? "border-court-navy bg-court-navy text-white shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  filter === c.key ? "text-white/90" : "text-slate-400"
                )}
              />
              <div>
                <div className="text-xs opacity-80">{c.label}</div>
                <div className="text-xl font-semibold tabular-nums">{c.n}</div>
              </div>
            </button>
          );
        })}
      </div>

      {msg && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            err
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          )}
        >
          {msg}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            {isKy ? "Тизме" : "Список поручений"}
          </h2>
          {items.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title={isKy ? "Бош" : "Нет поручений"}
              description={
                isKy
                  ? "Жеке кабыл алуудан кийин бул жерде пайда болот."
                  : "После личного приёма обращения появятся здесь."
              }
              className="border-0 shadow-none"
            />
          ) : (
            <ul className="max-h-[min(70vh,560px)] space-y-2 overflow-y-auto">
              {items.map((a) => {
                const overdue = isOverdue(a);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(a.id);
                        setMsg("");
                        setAnswer("");
                      }}
                      className={cn(
                        "w-full rounded-xl border px-3 py-3 text-left transition",
                        selectedId === a.id
                          ? "border-court-navy bg-slate-50 ring-1 ring-court-navy/20"
                          : overdue
                            ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50"
                            : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <div className="font-mono text-xs text-slate-500">
                          {a.code}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {overdue && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                              {isKy ? "Мөөнөт" : "Просрочка"}
                            </span>
                          )}
                          <StageBadge stage={a.stage} />
                        </div>
                      </div>
                      <div className="mt-0.5 font-semibold text-slate-900">
                        {a.fullName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {a.assignment?.responsibleName || "—"} ·{" "}
                        {isKy ? "мөөнөт" : "срок"}{" "}
                        {a.assignment?.dueDate || "—"}
                        {a.assignment?.status &&
                          ` · ${assignmentStatusLabel(a.assignment.status, isKy)}`}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          {!selected ? (
            <p className="py-12 text-center text-sm text-slate-400">
              {isKy
                ? "Солдо поручение тандаңыз."
                : "Выберите поручение слева."}
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selected.code}
                    </h2>
                    <p className="text-sm text-slate-500">{selected.topic}</p>
                  </div>
                  <Link
                    href={`/admin/appeals/${selected.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-court-blue hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isKy ? "Карточка" : "Полная карточка"}
                  </Link>
                </div>
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-950">
                  <strong>{isKy ? "Тапшырма:" : "Поручение:"}</strong>{" "}
                  {selected.assignment?.text || "—"}
                </div>
                {selected.assignment && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ASSIGNMENT_STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={async () => {
                          const res = await setAssignmentStatus(selected.id, st);
                          if (res && "ok" in res && !res.ok) {
                            setMsg(res.error);
                            return;
                          }
                          const label = assignmentStatusLabel(st, isKy);
                          setMsg(
                            isKy
                              ? `Статус: ${label}`
                              : `Статус поручения: ${label}`
                          );
                        }}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          selected.assignment?.status === st
                            ? "border-court-navy bg-court-navy text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {assignmentStatusLabel(st, isKy)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Collapsible
                title={isKy ? "Журнал аткаруу" : "Журнал исполнения"}
                subtitle={isKy ? "Жаңы жазуу" : "Добавить ход работ"}
                defaultOpen={selected.stage === "in_control"}
              >
                <form onSubmit={onLog} className="space-y-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-slate-600">
                      {isKy ? "Аракет" : "Действие"}
                    </span>
                    <select
                      className="input w-full"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                    >
                      {ACTION_PRESETS.map((p) => (
                        <option key={p.ru} value={p.ru}>
                          {isKy ? p.ky : p.ru}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-slate-600">
                      {isKy ? "Комментарий" : "Комментарий / результат"}
                    </span>
                    <textarea
                      className="input min-h-[70px] w-full"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </label>
                  <button type="submit" className="btn-outline !text-sm">
                    {isKy ? "Журналга кошуу" : "Добавить в журнал"}
                  </button>
                </form>
                {selected.controlLog.length > 0 && (
                  <ul className="mt-4 max-h-36 space-y-2 overflow-y-auto text-xs">
                    {selected.controlLog.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <strong>{c.action}</strong> — {c.comment}
                        <div className="text-slate-400">
                          {c.authorName} ·{" "}
                          {new Date(c.at).toLocaleString("ru-RU")}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Collapsible>

              {selected.stage === "in_control" && (
                <Collapsible
                  title={
                    isKy
                      ? "Жооп жаранга"
                      : "Полный ответ гражданину"
                  }
                  subtitle={
                    isKy
                      ? "Жөнөтүлгөндөн кийин баалоо жеткиликтүү"
                      : "После отправки доступна оценка сервиса"
                  }
                  defaultOpen
                >
                  <form onSubmit={onAnswer} className="space-y-3">
                    <textarea
                      className="input min-h-[120px] w-full"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={
                        isKy
                          ? "Жооптун тексти…"
                          : "Текст обоснованного ответа…"
                      }
                      required
                    />
                    <button type="submit" className="btn-primary !text-sm">
                      {isKy
                        ? "Жооп жөнөтүү"
                        : "Направить ответ и закрыть поручение"}
                    </button>
                  </form>
                </Collapsible>
              )}

              {(selected.stage === "answered" ||
                selected.stage === "closed") && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  {isKy ? "Жооп жөнөтүлдү." : "Ответ направлен."}{" "}
                  <Link
                    href={routes.evaluationByCode(selected.code)}
                    className="font-semibold underline"
                  >
                    {routes.evaluationByCode(selected.code)}
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
