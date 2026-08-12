"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bell, ClipboardList, History, UserCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { AppealCategory } from "@/lib/types";
import { formatDateRu } from "@/lib/slots";
import { stageProgress } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useI18n } from "@/lib/i18n";

export default function AppealDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const {
    state,
    currentUser,
    startPrep,
    completePrep,
    getPreviousAppeals,
  } = useStore();
  const { t } = useI18n();

  const appeal = state.appeals.find((a) => a.id === id);
  const appointment = state.appointments.find(
    (a) => a.id === appeal?.appointmentId
  );
  const previous = useMemo(
    () => (appeal ? getPreviousAppeals(appeal) : []),
    [appeal, getPreviousAppeals]
  );

  const [summary, setSummary] = useState(appeal?.summary || "");
  const [prepNotes, setPrepNotes] = useState(appeal?.prepNotes || "");
  const [category, setCategory] = useState<AppealCategory>(
    appeal?.category || "organization"
  );
  const [msg, setMsg] = useState("");

  if (!appeal) {
    return (
      <div className="card p-8 text-center">
        <p className="text-court-muted">Карточка не найдена.</p>
        <Link href="/admin/appeals" className="btn-outline mt-4">
          К списку
        </Link>
      </div>
    );
  }

  const progress = stageProgress(appeal.stage);
  const canPrep =
    currentUser &&
    ["reception", "admin", "leadership"].includes(currentUser.role) &&
    ["registered", "under_review"].includes(appeal.stage);

  function onStartPrep() {
    if (!currentUser) return;
    startPrep(appeal!.id, currentUser);
    setMsg("Карточка переведена в предварительное изучение.");
  }

  function onCompletePrep(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    completePrep(appeal!.id, currentUser, { summary, prepNotes, category });
    setMsg("Подготовка завершена. Обращение готово к личному приёму.");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.appeals, href: "/admin/appeals" },
          { label: appeal.code },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-court-navy">
              {appeal.code}
            </h1>
            <StageBadge stage={appeal.stage} />
          </div>
          <p className="mt-1 text-court-muted">{appeal.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/reception" className="btn-outline">
            Личный приём
          </Link>
          <Link href="/admin/control" className="btn-outline">
            Контроль
          </Link>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {msg}
        </div>
      )}

      <div className="card p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-court-muted">Прогресс цикла</span>
          <span className="font-semibold text-court-navy">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-court-ribbon transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-court-gold" />
              <h2 className="font-display text-xl font-semibold text-court-navy">
                Электронная карточка
              </h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-court-muted">
                  Тема
                </dt>
                <dd className="font-medium text-court-ink">{appeal.topic}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-court-muted">
                  Категория
                </dt>
                <dd className="font-medium text-court-ink">
                  {CATEGORY_LABELS[appeal.category]}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-court-muted">
                  Телефон
                </dt>
                <dd className="font-medium text-court-ink">{appeal.phone}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-court-muted">
                  Email
                </dt>
                <dd className="font-medium text-court-ink">
                  {appeal.email || "—"}
                </dd>
              </div>
              {appointment && (
                <>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-court-muted">
                      Дата приёма
                    </dt>
                    <dd className="font-medium text-court-ink">
                      {formatDateRu(appointment.date)}, {appointment.slotStart}–
                      {appointment.slotEnd}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-court-muted">
                      Статус записи
                    </dt>
                    <dd className="font-medium text-court-ink">
                      {appointment.status}
                    </dd>
                  </div>
                </>
              )}
            </dl>
            <div className="mt-4 rounded-xl bg-court-mist p-4 text-sm">
              <div className="mb-1 text-xs uppercase tracking-wider text-court-muted">
                Краткое содержание
              </div>
              {appeal.summary}
            </div>
          </section>

          {canPrep && (
            <section className="card p-5">
              <div className="mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-court-gold" />
                <h2 className="font-display text-xl font-semibold text-court-navy">
                  Этап 2 · Предварительное изучение
                </h2>
              </div>
              {appeal.stage === "registered" && (
                <button type="button" className="btn-primary mb-4" onClick={onStartPrep}>
                  Начать изучение
                </button>
              )}
              <form onSubmit={onCompletePrep} className="space-y-4">
                <div>
                  <label className="label">Категория</label>
                  <select
                    className="input"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as AppealCategory)
                    }
                  >
                    {(Object.keys(CATEGORY_LABELS) as AppealCategory[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {CATEGORY_LABELS[k]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="label">Краткое содержание (для руководства)</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    Заметки предварительной беседы / разъяснения
                  </label>
                  <textarea
                    className="input min-h-[100px]"
                    value={prepNotes}
                    onChange={(e) => setPrepNotes(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-gold">
                  Завершить подготовку к приёму
                </button>
              </form>
            </section>
          )}

          {appeal.prepNotes && (
            <section className="card p-5">
              <h2 className="font-display text-xl font-semibold text-court-navy">
                Материалы подготовки
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-court-muted">
                {appeal.prepNotes}
              </p>
              {appeal.prepCompletedBy && (
                <p className="mt-3 text-xs text-court-muted">
                  Подготовил: {appeal.prepCompletedBy}
                  {appeal.prepCompletedAt &&
                    ` · ${new Date(appeal.prepCompletedAt).toLocaleString("ru-RU")}`}
                </p>
              )}
            </section>
          )}

          {appeal.receptionProtocol && (
            <section className="card p-5">
              <h2 className="font-display text-xl font-semibold text-court-navy">
                Протокол приёма
              </h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase text-court-muted">Заявление гражданина</dt>
                  <dd>{appeal.receptionProtocol.citizenStatement}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-court-muted">Разъяснение руководства</dt>
                  <dd>{appeal.receptionProtocol.leadershipExplanation}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-court-muted">Поручение</dt>
                  <dd>{appeal.receptionProtocol.assignmentText}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-court-muted">Ответственный</dt>
                  <dd>{appeal.receptionProtocol.responsibleName}</dd>
                </div>
              </dl>
            </section>
          )}

          {appeal.finalAnswer && (
            <section className="card border-emerald-200 bg-emerald-50/40 p-5">
              <h2 className="font-display text-xl font-semibold text-court-navy">
                Ответ гражданину
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm">{appeal.finalAnswer}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-5 w-5 text-court-gold" />
              <h2 className="font-semibold text-court-navy">Предыдущие обращения</h2>
            </div>
            <p className="mb-3 text-xs text-court-muted">{appeal.previousNotes}</p>
            {previous.length === 0 ? (
              <p className="text-sm text-court-muted">Нет связанных обращений.</p>
            ) : (
              <ul className="space-y-2">
                {previous.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/appeals/${p.id}`}
                      className="block rounded-lg border border-court-line px-3 py-2 text-sm hover:bg-court-mist"
                    >
                      <div className="font-mono font-semibold text-court-blue">
                        {p.code}
                      </div>
                      <div className="text-court-muted">{p.topic}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-court-gold" />
              <h2 className="font-semibold text-court-navy">Уведомления</h2>
            </div>
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {appeal.notifications.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-court-line px-3 py-2 text-xs"
                >
                  <div className="font-semibold text-court-navy">{n.title}</div>
                  <div className="mt-1 text-court-muted">{n.body}</div>
                </li>
              ))}
            </ul>
          </section>

          {appeal.controlLog.length > 0 && (
            <section className="card p-5">
              <h2 className="mb-3 font-semibold text-court-navy">Журнал контроля</h2>
              <ul className="space-y-2 text-xs">
                {appeal.controlLog.map((c) => (
                  <li key={c.id} className="rounded-lg bg-court-mist px-3 py-2">
                    <div className="font-semibold">{c.action}</div>
                    <div className="text-court-muted">{c.comment}</div>
                    <div className="mt-1 text-[10px] text-court-muted">
                      {c.authorName} ·{" "}
                      {new Date(c.at).toLocaleString("ru-RU")}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {appeal.feedback && (
            <section className="card p-5">
              <h2 className="mb-2 font-semibold text-court-navy">Оценка гражданина</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Уважение: {appeal.feedback.respectful}/5</div>
                <div>Ясность: {appeal.feedback.clearNextSteps}/5</div>
                <div>Удобство: {appeal.feedback.convenient}/5</div>
                <div>Сроки: {appeal.feedback.deadlinesMet}/5</div>
              </div>
              {appeal.feedback.comment && (
                <p className="mt-2 text-xs text-court-muted">
                  {appeal.feedback.comment}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
