"use client";

import { COURT_CONTACTS } from "@/lib/constants";
import { mergeServiceContent, pickLocale } from "@/lib/serviceContent";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/slots";
import { targetShort } from "@/lib/targets";
import { EmblemKR } from "@/components/brand/Emblem";

export function VisitTicket({
  code,
  pin,
  fullName,
  date,
  slotStart,
  slotEnd,
  targetId,
  pending,
  isKy,
}: {
  code: string;
  pin: string;
  fullName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  targetId: string;
  pending?: boolean;
  isKy?: boolean;
}) {
  const { state } = useStore();
  const sc = mergeServiceContent(state.serviceContent);
  const contacts = sc.contacts;
  const org = pickLocale(!!isKy, sc.orgNameRu, sc.orgNameKy);
  const apt = state.appointments.find((a) => a.code === code);
  const appeal = state.appeals.find(
    (a) => a.code === code || a.appointmentId === apt?.id
  );
  const latest = appeal?.notifications?.[0];
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(code)}`;
  return (
    <div
      id="booking-slip"
      className="overflow-hidden rounded-xl border border-court-line bg-white text-left"
    >
      <div className="flex items-center gap-3 border-b border-court-line bg-court-mist px-4 py-3">
        <EmblemKR size={40} />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-court-navy">
            {org}
          </div>
          <div className="text-sm font-medium text-court-ink">
            {pending
              ? isKy
                ? "Талон өтүнмө (текшерүүдө)"
                : "Талон заявки (на проверке)"
              : isKy
                ? "Талон жазылуу"
                : "Талон записи на приём"}
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_140px] sm:items-start">
        <div className="space-y-2 text-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {isKy ? "Код" : "Код записи"}
            </div>
            <div className="font-mono text-xl font-bold text-court-navy">
              {code}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                PIN
              </div>
              <div className="font-mono text-lg font-bold">{pin}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {isKy ? "Кимге" : "К кому"}
              </div>
              <div className="font-medium">
                {targetShort(targetId, isKy, sc)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {isKy ? "Кайрылуучу" : "Заявитель"}
            </div>
            <div className="font-semibold">{fullName}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {isKy ? "Күн / убакыт" : "Дата и время"}
            </div>
            <div className="font-semibold">
              {formatDateRu(date)}, {slotStart}–{slotEnd}
            </div>
          </div>
        </div>
        <div className="mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt={code}
            width={140}
            height={140}
            className="mx-auto border border-court-line bg-white"
          />
          <div className="mt-1 font-mono text-[10px] text-slate-500">{code}</div>
        </div>
      </div>
      {latest && (
        <div className="border-t border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
            {isKy ? "Уведомление" : "Уведомление"}
          </div>
          <div className="mt-0.5 font-semibold">{latest.title}</div>
          <p className="mt-1 text-xs leading-relaxed">{latest.body}</p>
          {apt?.email ? (
            <p className="mt-2 text-[11px] text-sky-800">
              {isKy
                ? `Көчүрмө электрондук почтага жөнөтүлөт: ${apt.email}`
                : `Копия направляется на электронную почту: ${apt.email}`}
            </p>
          ) : null}
        </div>
      )}
      <div className="border-t border-court-line bg-court-mist px-4 py-3 text-xs leading-relaxed text-slate-700">
        <p className="font-semibold text-court-navy">
          {isKy ? "Кабыл алууга эскертме" : "Памятка к визиту"}
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>
            {isKy
              ? `${contacts.receptionOfficeKy || COURT_CONTACTS.receptionOfficeKy}. Паспорт керек.`
              : `${contacts.receptionOfficeRu || COURT_CONTACTS.receptionOfficeRu}. При себе — документ, удостоверяющий личность.`}
          </li>
          <li>
            {isKy
              ? "Телефон жана техника киргизилбейт."
              : "Мобильные телефоны и иная техника в зал приёма не вносятся."}
          </li>
          <li>
            {isKy
              ? "Коштоочулар — эки адамдан көп эмес."
              : "Сопровождающих — не более двух человек."}
          </li>
          <li>
            {pending
              ? isKy
                ? "Өтүнмө. Жазылуу ырасталгандан кийин гана күчүнө кирет."
                : "Заявка. Явка допускается после подтверждения записи."
              : isKy
                ? "Кабыл алуу жазылган маселе боюнча гана."
                : "Приём проводится строго по вопросу, указанному при записи."}
          </li>
        </ul>
      </div>
    </div>
  );
}
