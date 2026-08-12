"use client";

import Link from "next/link";
import { RECEPTION_ALLOWED, RECEPTION_FORBIDDEN } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

export function BookSidebar() {
  const { lang } = useI18n();
  const isKy = lang === "ky";
  const L = (ru: string, ky: string) => (isKy ? ky : ru);

  return (
    <aside className="rounded-lg border border-court-line bg-white">
      <div className="border-b border-court-line p-4">
        <h2 className="text-sm font-semibold text-court-navy">
          {L("Порядок записи", "Жазылуу тартиби")}
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-court-muted">
          <li>{L("Правила и согласие", "Эрежелер жана макулдук")}</li>
          <li>
            {L(
              "Проверка предмета (можно / нельзя)",
              "Предметти текшерүү"
            )}
          </li>
          <li>{L("Сведения о заявителе и адресе", "Жеке маалымат жана дарек")}</li>
          <li>{L("Тема и содержание обращения", "Тема жана мазмун")}</li>
          <li>
            {L(
              "Дата и интервал 20 минут",
              "Күн жана 20 мүнөттүк интервал"
            )}
          </li>
        </ol>
      </div>
      <div className="border-b border-court-line p-4">
        <h2 className="text-sm font-semibold text-court-success">
          {L("Предмет приёма", "Кабыл алуу предмети")}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-court-muted">
          {RECEPTION_ALLOWED.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
      <div className="border-b border-court-line p-4">
        <h2 className="text-sm font-semibold text-court-danger">
          {L("Не рассматриваются", "Каралбайт")}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-court-muted">
          {RECEPTION_FORBIDDEN.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
      <div className="p-4 text-sm">
        <Link href="/rules" className="text-court-blue hover:underline">
          {L("Правила", "Эрежелер")}
        </Link>
        <span className="mx-2 text-court-line">|</span>
        <Link href="/my-appointment" className="text-court-blue hover:underline">
          {L("Моя запись", "Менин жазылууум")}
        </Link>
        <span className="mx-2 text-court-line">|</span>
        <Link href="/" className="text-court-blue hover:underline">
          {L("На главную раздела", "Бөлүмдүн башкы бети")}
        </Link>
      </div>
    </aside>
  );
}
