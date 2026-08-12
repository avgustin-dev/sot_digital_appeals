"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { formatDateRu } from "@/lib/slots";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ReceptionPage() {
  const {
    state,
    currentUser,
    completeReception,
  } = useStore();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string>("");
  const [citizenStatement, setCitizenStatement] = useState("");
  const [leadershipExplanation, setLeadershipExplanation] = useState("");
  const [assignmentText, setAssignmentText] = useState("");
  const [responsibleUserId, setResponsibleUserId] = useState("u-resp-1");
  const [specialistsInvolved, setSpecialistsInvolved] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const queue = useMemo(() => {
    return state.appeals
      .filter((a) =>
        ["ready_for_reception", "under_review", "registered"].includes(a.stage)
      )
      .map((a) => ({
        appeal: a,
        apt: state.appointments.find((x) => x.id === a.appointmentId),
      }))
      .filter((x) => x.apt && x.apt.status !== "cancelled")
      .sort((a, b) => {
        const da = `${a.apt!.date}${a.apt!.slotStart}`;
        const db = `${b.apt!.date}${b.apt!.slotStart}`;
        return da.localeCompare(db);
      });
  }, [state.appeals, state.appointments]);

  const selected = queue.find((q) => q.appeal.id === selectedId);
  const responsibles = state.staff.filter(
    (s) => s.role === "responsible" || s.role === "admin"
  );

  const canConduct =
    currentUser &&
    ["leadership", "admin", "reception"].includes(currentUser.role);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!currentUser || !selected) return;
    if (!canConduct) {
      setErr("Недостаточно прав для фиксации приёма.");
      return;
    }
    const resp = state.staff.find((s) => s.id === responsibleUserId);
    if (!resp) {
      setErr("Выберите ответственного.");
      return;
    }
    completeReception(selected.appeal.id, currentUser, {
      citizenStatement,
      leadershipExplanation,
      assignmentText,
      responsibleUserId: resp.id,
      responsibleName: resp.fullName,
      specialistsInvolved,
    });
    setMsg("Приём зафиксирован. Поручение передано на контроль.");
    setSelectedId("");
    setCitizenStatement("");
    setLeadershipExplanation("");
    setAssignmentText("");
    setSpecialistsInvolved("");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.reception },
        ]}
      />
      <div>
        <h1 className="section-title">{t.admin.reception}</h1>
        <p className="mt-1 text-base text-court-muted">
          Фиксация личного приёма, поручение и назначение ответственного.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="card p-5">
          <h2 className="mb-4 font-display text-xl font-semibold text-court-navy">
            Очередь на приём
          </h2>
          {queue.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Очередь пуста"
              description="Нет обращений, ожидающих личного приёма."
              className="border-0 shadow-none"
            />
          ) : (
            <ul className="space-y-2">
              {queue.map(({ appeal, apt }) => (
                <li key={appeal.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(appeal.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      selectedId === appeal.id
                        ? "border-court-gold bg-court-goldPale"
                        : "border-court-line hover:bg-court-mist"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs text-court-muted">
                          {appeal.code}
                        </div>
                        <div className="font-semibold text-court-navy">
                          {appeal.fullName}
                        </div>
                        <div className="text-xs text-court-muted">
                          {appeal.topic}
                        </div>
                      </div>
                      <StageBadge stage={appeal.stage} />
                    </div>
                    {apt && (
                      <div className="mt-2 text-xs font-medium text-court-blue">
                        {formatDateRu(apt.date)} · {apt.slotStart}–{apt.slotEnd}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-display text-xl font-semibold text-court-navy">
            Протокол приёма
          </h2>
          {!selected ? (
            <p className="text-sm text-court-muted">
              Выберите обращение из очереди. До фиксации приёма рекомендуется
              завершить предварительное изучение электронной карточки.
            </p>
          ) : (
            <>
              <div className="mb-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="grid gap-1 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Заявитель
                    </div>
                    <div className="font-semibold text-court-navy">
                      {selected.appeal.fullName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Рег. код / телефон
                    </div>
                    <div className="font-mono text-sm">
                      {selected.appeal.code} · {selected.appeal.phone}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Тема обращения
                    </div>
                    <div className="text-slate-800">{selected.appeal.topic}</div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2 text-court-muted">
                  {selected.appeal.summary}
                </div>
                {selected.appeal.prepNotes && (
                  <div className="border-t border-slate-200 pt-2 text-xs">
                    <strong>Материалы подготовки:</strong>{" "}
                    {selected.appeal.prepNotes}
                  </div>
                )}
                <Link
                  href={`/admin/appeals/${selected.appeal.id}`}
                  className="inline-block text-xs font-semibold text-court-blue"
                >
                  Открыть полную карточку →
                </Link>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="label">
                    ФИО заявителя (как в протоколе)
                  </label>
                  <input
                    className="input bg-slate-50"
                    value={selected.appeal.fullName}
                    readOnly
                  />
                </div>
                <div>
                  <label className="label">
                    Изложение заявителя (суть проблемы / предложения)
                  </label>
                  <textarea
                    className="input min-h-[80px]"
                    value={citizenStatement}
                    onChange={(e) => setCitizenStatement(e.target.value)}
                    required
                    placeholder="Краткое изложение по существу, без ссылок на конкретные дела…"
                  />
                </div>
                <div>
                  <label className="label">
                    Разъяснение руководства (права и порядок дальнейших действий)
                  </label>
                  <textarea
                    className="input min-h-[80px]"
                    value={leadershipExplanation}
                    onChange={(e) => setLeadershipExplanation(e.target.value)}
                    required
                    placeholder="Разъяснение в соответствии с законодательством КР…"
                  />
                </div>
                <div>
                  <label className="label">
                    Поручение (в пределах компетенции общественной приёмной)
                  </label>
                  <textarea
                    className="input min-h-[70px]"
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    required
                    placeholder="Содержание поручения ответственному…"
                  />
                </div>
                <div>
                  <label className="label">
                    Ответственный по обращению
                  </label>
                  <select
                    className="input"
                    value={responsibleUserId}
                    onChange={(e) => setResponsibleUserId(e.target.value)}
                  >
                    {responsibles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName} — {r.position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    Привлечённые профильные специалисты (при необходимости)
                  </label>
                  <input
                    className="input"
                    value={specialistsInvolved}
                    onChange={(e) => setSpecialistsInvolved(e.target.value)}
                    placeholder="ФИО, подразделение"
                  />
                </div>
                <div>
                  <label className="label">Дата и время приёма</label>
                  <input
                    className="input bg-slate-50 font-mono"
                    readOnly
                    value={
                      selected.apt
                        ? `${selected.apt.date.split("-").reverse().join(".")} · ${selected.apt.slotStart}–${selected.apt.slotEnd}`
                        : "—"
                    }
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={!canConduct}>
                  Зафиксировать приём и передать на контроль исполнения
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
