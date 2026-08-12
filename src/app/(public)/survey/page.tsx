"use client";

import Link from "next/link";
import { EmblemKR } from "@/components/brand/Emblem";
import { useI18n } from "@/lib/i18n";

/**
 * Публичная анкета судов здесь не размещается:
 * действующий сервис — opros.sot.kg.
 * В этой платформе — только редактирование вопросов в /admin/survey.
 */
export default function SurveyPlaceholderPage() {
  const { lang } = useI18n();
  const isKy = lang === "ky";

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-6 md:py-16">
      <div className="rounded-lg border border-court-line bg-white p-8 text-center shadow-sm">
        <EmblemKR size={56} className="mx-auto" />
        <h1 className="mt-4 text-lg font-semibold text-court-navy">
          {isKy
            ? "Соттордун ишин баалоо анкетасы"
            : "Анкета оценки работы судов"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-court-muted">
          {isKy
            ? "Анкета жана жыйынтыктар өзүнчө маалыматтык системада жайгаштырылган. Бул платформада кызматкерлер гана суроолорду түзөтө алышат (кызматтык кабинет)."
            : "Заполнение анкеты гражданами и учёт результатов осуществляются в действующей информационной системе. В настоящей платформе в служебном кабинете предусмотрено только редактирование формулировок вопросов анкеты."}
        </p>
        <p className="mt-4 text-sm">
          <a
            href="https://opros.sot.kg"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-court-blue hover:underline"
          >
            opros.sot.kg
          </a>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-outline !text-sm">
            {isKy ? "Башкы бет" : "На главную"}
          </Link>
          <Link href="/admin/survey" className="btn-primary !text-sm">
            {isKy ? "Суроолор (админ)" : "Вопросы (служебный кабинет)"}
          </Link>
        </div>
      </div>
    </div>
  );
}
