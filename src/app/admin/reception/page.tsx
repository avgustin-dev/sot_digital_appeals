"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { formatDateRu } from "@/lib/slots";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AdminHeading } from "@/components/staff/AdminHeading";
import { ReceptionTabs } from "@/components/staff/ReceptionTabs";
import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { targetShort } from "@/lib/targets";

export default function ReceptionPage() {
  const {
    state,
    currentUser,
    completeReception,
  } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
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
      .filter(
        (x) =>
          x.apt &&
          x.apt.status !== "cancelled" &&
          x.apt.status !== "rejected" &&
          x.apt.status !== "pending_review"
      )
      .sort((a, b) => {
        const da = `${a.apt!.date}${a.apt!.slotStart}`;
        const db = `${b.apt!.date}${b.apt!.slotStart}`;
        return da.localeCompare(db);
      });
  }, [state.appeals, state.appointments]);

  const prepQueue = queue.filter((q) =>
    ["registered", "under_review"].includes(q.appeal.stage)
  );
  const liveQueue = queue.filter(
    (q) => q.appeal.stage === "ready_for_reception"
  );

  const selected = queue.find((q) => q.appeal.id === selectedId);
  const responsibles = state.staff.filter(
    (s) => s.role === "responsible" || s.role === "admin"
  );

  const canConduct =
    currentUser &&
    ["leadership", "admin", "reception"].includes(currentUser.role);

  async function onSubmit(e: React.FormEvent) {
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
    const rec = await completeReception(selected.appeal.id, currentUser, {
      citizenStatement,
      leadershipExplanation,
      assignmentText,
      responsibleUserId: resp.id,
      responsibleName: resp.fullName,
      specialistsInvolved,
    });
    if (rec && "ok" in rec && !rec.ok) {
      setErr(rec.error);
      return;
    }
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
      <AdminHeading
        title={isKy ? "Кабыл алуу" : "Приём"}
        lead={
          isKy
            ? "Ырасталган жазылуулар. Даярдоо — карточка. Протокол — жетекчилик."
            : "Подтверждённые записи. Подготовка карточки. Протокол — руководство."
        }
      />
      <ReceptionTabs isKy={isKy} />

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
            {isKy ? "Кезек" : "Очередь"}
          </h2>
          {queue.length === 0 ? (
            <EmptyState
              icon={Users}
              title={isKy ? "Кезек бош" : "Очередь пуста"}
              description={
                isKy
                  ? "Ырасталган кайрылуулар жок."
                  : "Нет подтверждённых обращений."
              }
              className="border-0 shadow-none"
            />
          ) : (
            <div className="space-y-4">
              {prepQueue.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {isKy ? "Даярдоо" : "Подготовка"} ({prepQueue.length})
                  </p>
                  <ul className="space-y-2">
                    {prepQueue.map(({ appeal, apt }) => (
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
                              {targetShort(apt.targetId, isKy, state.serviceContent)} ·{" "}
                              {formatDateRu(apt.date)} · {apt.slotStart}–
                              {apt.slotEnd}
                            </div>
                          )}
                          <Link
                            href={`/admin/appeals/${appeal.id}`}
                            className="mt-2 inline-block text-[11px] font-semibold text-court-blue"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isKy ? "Карточка" : "Открыть карточку"}
                          </Link>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {liveQueue.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {isKy ? "Протокол" : "К протоколу"} ({liveQueue.length})
                  </p>
                  <ul className="space-y-2">
                    {liveQueue.map(({ appeal, apt }) => (
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
                              {targetShort(apt.targetId, isKy, state.serviceContent)} ·{" "}
                              {formatDateRu(apt.date)} · {apt.slotStart}–
                              {apt.slotEnd}
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-display text-xl font-semibold text-court-navy">
            Протокол приёма
          </h2>
          {!selected ? (
            <p className="text-sm text-court-muted">
              {isKy
                ? "Кезектен кайрылууну тандаңыз. Протоколду толтуруудан мурун карточканы изилдөө жүргүзүлөт."
                : "Выберите обращение из очереди. До заполнения протокола проводится изучение электронной карточки."}
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
