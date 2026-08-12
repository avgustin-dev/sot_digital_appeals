"use client";

import Link from "next/link";
import { PIPELINE_STEPS } from "@/lib/constants";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useI18n } from "@/lib/i18n";

const details = [
  {
    stage: "Этап 1",
    title: "Онлайн-запись",
    points: [
      "ФИО, тема обращения, контактные данные",
      "Календарь: интервалы по 20 минут с 08:00",
      "Подтверждение, код записи и PIN-код",
      "Перенос и отмена заявителем",
    ],
  },
  {
    stage: "Этап 2",
    title: "Предварительное изучение",
    points: [
      "Электронная карточка обращения",
      "Сведения о заявителе, содержание, категория",
      "История и предыдущие обращения",
      "Разъяснения в соответствии с законодательством",
    ],
  },
  {
    stage: "Этап 3",
    title: "Личный приём",
    points: [
      "Изложение существа обращения",
      "Разъяснение порядка дальнейших действий",
      "Поручение в пределах компетенции",
      "Назначение ответственного лица",
    ],
  },
  {
    stage: "Этап 4",
    title: "Контроль исполнения",
    points: [
      "Роль «Ответственный по обращению»",
      "Контроль исполнения поручения",
      "Взаимодействие с подразделениями",
      "Направление обоснованного ответа",
    ],
  },
  {
    stage: "Обратная связь",
    title: "Оценка работы приёмной",
    points: [
      "Форма оценки после приёма",
      "Уважительное отношение",
      "Ясность дальнейших действий",
      "Соблюдение сроков",
    ],
  },
  {
    stage: "Мониторинг",
    title: "Анализ повторных обращений",
    points: [
      "Количество и темы повторных обращений",
      "Выявление системных проблем",
      "Сводка для руководства",
    ],
  },
];

export default function ProcessPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs
        items={[
          { label: t.crumbs.home, href: "/" },
          { label: t.crumbs.process },
        ]}
      />
      <h1 className="section-title mb-2">{t.home.cycle}</h1>
      <p className="mb-8 max-w-3xl text-base text-court-muted">
        {t.home.cycleLead}
      </p>

      <ProgressSteps
        steps={PIPELINE_STEPS.map((s) => ({ title: s.title, desc: s.desc }))}
        current={-1}
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {details.map((d) => (
          <article key={d.title} className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-court-gold">
              {d.stage}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-court-navy">
              {d.title}
            </h2>
            <ul className="mt-4 space-y-2 text-base text-court-muted">
              {d.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-gold" />
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/book" className="btn-primary !min-h-12">
          {t.nav.bookCta}
        </Link>
        <Link href="/rules" className="btn-outline !min-h-12">
          {t.footer.rules}
        </Link>
      </div>
    </div>
  );
}
