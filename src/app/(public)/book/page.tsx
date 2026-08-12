"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Printer,
  Scale,
} from "lucide-react";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { BookSidebar } from "@/components/booking/BookSidebar";
import { WizardSteps } from "@/components/ui/WizardSteps";
import { PageLoader } from "@/components/ui/PageLoader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { AppealCategory } from "@/lib/types";
import { formatDateRu } from "@/lib/slots";
import {
  APPLICANT_TYPES,
  REGIONS_KR,
  RECEPTION_TARGETS,
} from "@/lib/constants";
import {
  BOOKING_RULES,
  ELIGIBILITY_TREE,
  getLeaf,
  getPathRefusal,
  isPathAllowed,
  resolvePath,
  type EligibilityNode,
  type RefusalMessage,
} from "@/lib/eligibility";

/**
 * Запись: правила + допуск (KZ) + правдоподобные поля (UX УЗ) + слоты 20 мин (КР).
 * Без полей судебного дела.
 */
export default function BookPage() {
  const { ready, bookAppointment } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";

  const STEPS = useMemo(
    () =>
      isKy
        ? ["Эрежелер", "Допуск", "Жеке маалымат", "Дарек", "Мазмун", "Убакыт"]
        : [
            "Правила",
            "Допуск",
            "Заявитель",
            "Адрес",
            "Обращение",
            "Дата и время",
          ],
    [isKy]
  );

  const [step, setStep] = useState(0);
  const [rulesAgree, setRulesAgree] = useState(false);
  const [path, setPath] = useState<string[]>([]);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [applicantType, setApplicantType] = useState("citizen");
  const [orgName, setOrgName] = useState("");

  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [target, setTarget] = useState("reception");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<AppealCategory>("organization");
  const [description, setDescription] = useState("");
  const [companion, setCompanion] = useState("");

  const [date, setDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    code: string;
    pin: string;
    date: string;
    slotStart: string;
    slotEnd: string;
  } | null>(null);

  const pathNodes = resolvePath(path);
  const leaf = getLeaf(path);
  const refusalMsg = getPathRefusal(path);
  const blocked = Boolean(refusalMsg);
  const canProceedEligibility = isPathAllowed(path);

  const fullName = [lastName, firstName, middleName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");

  if (!ready) {
    return <PageLoader label={t.common.loading} />;
  }

  function L(ru: string, ky: string) {
    return isKy ? ky : ru;
  }

  function labelOf(n: { labelRu: string; labelKy: string }) {
    return isKy ? n.labelKy : n.labelRu;
  }

  function pickLevel(levelIndex: number, id: string) {
    setError("");
    setPath((prev) => {
      const next = prev.slice(0, levelIndex);
      next[levelIndex] = id;
      return next;
    });
  }

  const levels: {
    title: string;
    options: EligibilityNode[];
    levelIndex: number;
  }[] = [];

  levels.push({
    title: L(
      "1. Выберите категорию вопроса для записи на приём:",
      "1. Кабыл алууга жазылуу үчүн категорияны тандаңыз:"
    ),
    options: ELIGIBILITY_TREE,
    levelIndex: 0,
  });

  for (let i = 0; i < pathNodes.length; i++) {
    const node = pathNodes[i];
    if (!node.children?.length) break;
    const qNum = i + 2;
    const title =
      i === 0
        ? L(
            "2. Уточните суть вопроса:",
            "2. Маселени тактаңыз:"
          )
        : `${qNum}. ${labelOf(node)}:`;
    levels.push({
      title,
      options: node.children,
      levelIndex: i + 1,
    });
  }

  function validateStep(s: number): string | null {
    if (s === 0 && !rulesAgree) {
      return L(
        "Подтвердите согласие с Правилами записи.",
        "Жазылуу Эрежелерине макулдук керек."
      );
    }
    if (s === 1) {
      if (path.length === 0)
        return L("Выберите категорию.", "Категорияны тандаңыз.");
      if (blocked)
        return L(
          "По выбранному варианту запись невозможна.",
          "Бул вариант боюнча жазылуу мүмкүн эмес."
        );
      if (!canProceedEligibility)
        return L(
          "Выберите вариант до конца.",
          "Вариантты аягына чейин тандаңыз."
        );
    }
    if (s === 2) {
      if (!lastName.trim() || !firstName.trim())
        return L("Укажите фамилию и имя.", "Фамилия жана атыңызды жазыңыз.");
      if (!phone.trim() || phone.replace(/\D/g, "").length < 9)
        return L(
          "Укажите корректный номер телефона.",
          "Телефон номерин туура киргизиңиз."
        );
      if (
        (applicantType === "legal" || applicantType === "rep") &&
        !orgName.trim() &&
        applicantType === "legal"
      )
        return L(
          "Укажите наименование организации.",
          "Уюмдун аталышын жазыңыз."
        );
    }
    if (s === 3) {
      if (!region)
        return L("Выберите регион.", "Аймакты тандаңыз.");
      if (!city.trim())
        return L("Укажите населённый пункт.", "Калаа/айылды жазыңыз.");
    }
    if (s === 4) {
      if (!target)
        return L("Укажите, к кому записываетесь.", "Кимге жазыласыз?");
      if (!topic.trim())
        return L(
          "Укажите тему (краткое содержание) обращения.",
          "Кайрылуунун темасын жазыңыз."
        );
      if (!description.trim() || description.trim().length < 15)
        return L(
          "Опишите суть обращения (не менее 15 символов).",
          "Кайрылуунун маңызын жазыңыз (15 белгиден кем эмес)."
        );
      if (!agree)
        return L(
          "Подтвердите, что предмет соответствует правилам приёма.",
          "Предмет эрежелерге туура келерин ырастаңыз."
        );
    }
    if (s === 5 && (!date || !slotStart)) {
      return L(
        "Выберите дату и время приёма.",
        "Күн жана убакытты тандаңыз."
      );
    }
    return null;
  }

  function next() {
    setError("");
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    if (step === 1 && leaf?.allowed) {
      setCategory(leaf.category || "other");
      const auto = isKy ? leaf.topicKy : leaf.topicRu;
      if (auto && !topic) setTopic(auto);
    }
    setStep((x) => Math.min(5, x + 1));
  }

  function back() {
    setError("");
    setStep((x) => Math.max(0, x - 1));
  }

  function onSubmit() {
    setError("");
    const err = validateStep(5);
    if (err) {
      setError(err);
      return;
    }
    const pathNote = pathNodes.map(labelOf).join(" → ");
    const regionLabel =
      REGIONS_KR.find((r) => r.id === region)?.[isKy ? "ky" : "ru"] || region;
    const typeLabel =
      APPLICANT_TYPES.find((r) => r.id === applicantType)?.[
        isKy ? "ky" : "ru"
      ] || applicantType;
    const targetLabel =
      RECEPTION_TARGETS.find((r) => r.id === target)?.[
        isKy ? "ky" : "ru"
      ] || target;

    const extra = [
      `Тип заявителя: ${typeLabel}`,
      orgName.trim() ? `Организация: ${orgName.trim()}` : "",
      `Регион: ${regionLabel}`,
      `Населённый пункт: ${city.trim()}`,
      address.trim() ? `Адрес: ${address.trim()}` : "",
      `К кому: ${targetLabel}`,
      companion.trim() ? `Сопровождающий: ${companion.trim()}` : "",
      `Допуск: ${pathNote}`,
      `Суть:\n${description.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = bookAppointment({
      fullName,
      phone,
      email,
      topic,
      category,
      description: extra,
      date,
      slotStart,
      slotEnd,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult({
      code: res.appointment.code,
      pin: res.pin,
      date: res.appointment.date,
      slotStart: res.appointment.slotStart,
      slotEnd: res.appointment.slotEnd,
    });
  }

  function RadioBlock({
    name,
    options,
    value,
    onChange,
  }: {
    name: string;
    options: EligibilityNode[];
    value: string;
    onChange: (id: string) => void;
  }) {
    return (
      <ul className="space-y-1.5">
        {options.map((opt) => (
          <li key={opt.id}>
            <label className="flex cursor-pointer items-start gap-2.5 rounded border border-transparent px-2 py-1.5 text-[15px] leading-snug hover:bg-court-mist">
              <input
                type="radio"
                name={name}
                className="mt-1 h-4 w-4 shrink-0 accent-court-blue"
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
              />
              <span>{labelOf(opt)}</span>
            </label>
          </li>
        ))}
      </ul>
    );
  }

  function RefusalBlock({ msg }: { msg: RefusalMessage }) {
    const greeting = isKy ? msg.greetingKy : msg.greetingRu;
    const body = isKy ? msg.bodyKy : msg.bodyRu;
    const closing = isKy ? msg.closingKy : msg.closingRu;
    return (
      <div className="mt-6 rounded-lg border border-court-line bg-court-mist px-4 py-5 sm:px-6">
        <div className="mb-3 flex items-center gap-2 text-court-navy">
          <Scale className="h-4 w-4 text-court-gold" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {t.orgName}
          </span>
        </div>
        <p className="text-center text-[15px] font-semibold">{greeting}</p>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed">
          {body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-5 text-center text-[15px] font-medium">{closing}</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="card p-6 text-center sm:p-8" id="booking-slip">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-court-navy">
            {t.book.success}
          </h1>
          <p className="mt-2 text-sm text-court-muted">{t.book.successLead}</p>
          <div className="mt-5 grid gap-3 rounded-lg bg-court-mist p-4 text-left text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-court-muted">
                {t.book.code}
              </div>
              <div className="font-mono text-lg font-bold text-court-navy">
                {result.code}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-court-muted">
                {t.book.pin}
              </div>
              <div className="font-mono text-lg font-bold text-court-navy">
                {result.pin}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs uppercase text-court-muted">
                {t.book.datetime}
              </div>
              <div className="font-semibold text-court-navy">
                {formatDateRu(result.date)}, {result.slotStart} –{" "}
                {result.slotEnd}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs uppercase text-court-muted">
                {t.book.applicant}
              </div>
              <div className="font-semibold">{fullName}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              {t.book.printSlip}
            </button>
            <Link href="/my-appointment" className="btn-primary">
              {t.book.manage}
            </Link>
            <Link href="/" className="btn-outline">
              {t.book.toHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-court-mist min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
        <Breadcrumbs
          items={[
            { label: t.crumbs.home, href: "/" },
            { label: t.crumbs.book },
          ]}
        />

        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-court-navy sm:text-2xl">
            {L(
              "Электронная запись на личный приём",
              "Жеке кабыл алууга электрондук жазылуу"
            )}
          </h1>
          <p className="mt-1 text-sm text-court-muted">
            {L(
              "Руководство Верховного суда Кыргызской Республики",
              "Кыргыз Республикасынын Жогорку сотунун жетекчилиги"
            )}
          </p>
        </div>

        <div className="mb-6">
          <WizardSteps steps={STEPS} current={step} mode="dots" />
        </div>

        <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm sm:p-6">
          {/* 0 Правила */}
          {step === 0 && (
            <div className="space-y-4 text-sm leading-relaxed text-court-ink">
              <p>{L(BOOKING_RULES.welcomeRu, BOOKING_RULES.welcomeKy)}</p>
              <h2 className="text-center text-xs font-bold uppercase tracking-wide text-court-navy">
                {L(BOOKING_RULES.titleRu, BOOKING_RULES.titleKy)}
              </h2>
              <ol className="list-decimal space-y-1.5 pl-5">
                {(isKy ? BOOKING_RULES.rulesKy : BOOKING_RULES.rulesRu).map(
                  (r) => (
                    <li key={r}>{r}</li>
                  )
                )}
              </ol>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="font-semibold text-amber-900">
                  {L(BOOKING_RULES.cannotTitleRu, BOOKING_RULES.cannotTitleKy)}
                </div>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-amber-950/90">
                  {(isKy
                    ? BOOKING_RULES.cannotKy
                    : BOOKING_RULES.cannotRu
                  ).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <p className="font-medium text-court-danger">
                {L(BOOKING_RULES.deleteNoteRu, BOOKING_RULES.deleteNoteKy)}
              </p>
              <label className="flex cursor-pointer items-start gap-3 rounded border border-court-line px-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-court-blue"
                  checked={rulesAgree}
                  onChange={(e) => setRulesAgree(e.target.checked)}
                />
                <span>
                  {L(BOOKING_RULES.agreeRu, BOOKING_RULES.agreeKy)}{" "}
                  <span className="text-court-danger">*</span>
                </span>
              </label>
            </div>
          )}

          {/* 1 Допуск KZ */}
          {step === 1 && (
            <div className="space-y-5">
              {levels.map((lvl) => (
                <div key={lvl.levelIndex}>
                  <h2 className="mb-2 text-sm font-semibold text-court-ink">
                    {lvl.title} <span className="text-court-danger">*</span>
                  </h2>
                  <RadioBlock
                    name={`elig-${lvl.levelIndex}`}
                    options={lvl.options}
                    value={path[lvl.levelIndex] || ""}
                    onChange={(id) => pickLevel(lvl.levelIndex, id)}
                  />
                </div>
              ))}
              {blocked && refusalMsg && <RefusalBlock msg={refusalMsg} />}
            </div>
          )}

          {/* 2 Заявитель */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-court-navy">
                {L("Информация о заявителе", "Кайрылуучу жөнүндө маалымат")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">
                    {L("Фамилия", "Фамилия")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <input
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Имя", "Аты")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <input
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Отчество", "Атасынын аты")}
                  </label>
                  <input
                    className="input"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    autoComplete="additional-name"
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Номер телефона", "Телефон")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+996 XXX XXX XXX"
                    autoComplete="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">
                    {L("Адрес электронной почты", "Электрондук почта")}
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mail@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">
                    {L("Кем Вы являетесь", "Сиз кимсиз")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <select
                    className="input"
                    value={applicantType}
                    onChange={(e) => setApplicantType(e.target.value)}
                  >
                    {APPLICANT_TYPES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {isKy ? r.ky : r.ru}
                      </option>
                    ))}
                  </select>
                </div>
                {applicantType === "legal" && (
                  <div className="sm:col-span-2">
                    <label className="label">
                      {L("Наименование организации", "Уюмдун аталышы")}{" "}
                      <span className="text-court-danger">*</span>
                    </label>
                    <input
                      className="input"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3 Адрес */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-court-navy">
                {L(
                  "Место проживания / нахождения",
                  "Жашаган / жайгашкан жери"
                )}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">
                    {L("Регион", "Аймак")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <select
                    className="input"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">
                      {L("— Выберите —", "— Тандаңыз —")}
                    </option>
                    {REGIONS_KR.map((r) => (
                      <option key={r.id} value={r.id}>
                        {isKy ? r.ky : r.ru}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    {L("Населённый пункт", "Калаа / айыл")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <input
                    className="input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">
                    {L("Адрес", "Дарек")}
                  </label>
                  <input
                    className="input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={L("улица, дом", "көчө, үй")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4 Содержание (без дела!) */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-court-navy">
                {L("Сведения об обращении", "Кайрылуу жөнүндө")}
              </h2>
              {pathNodes.length > 0 && (
                <div className="rounded border border-court-line bg-court-mist px-3 py-2 text-xs text-court-muted">
                  <span className="font-medium text-court-navy">
                    {L("Допуск:", "Допуск:")}
                  </span>{" "}
                  {pathNodes.map(labelOf).join(" → ")}
                </div>
              )}
              <div>
                <label className="label">
                  {L("К кому хотите записаться", "Кимге жазыласыз")}{" "}
                  <span className="text-court-danger">*</span>
                </label>
                <select
                  className="input"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  {RECEPTION_TARGETS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {isKy ? r.ky : r.ru}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  {L("Тема обращения", "Кайрылуунун темасы")}{" "}
                  <span className="text-court-danger">*</span>
                </label>
                <input
                  className="input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.book.topicPh}
                />
              </div>
              <div>
                <label className="label">
                  {L(
                    "Содержание обращения (без указания конкретных дел)",
                    "Кайрылуунун мазмуну (конкреттүү иштерсиз)"
                  )}{" "}
                  <span className="text-court-danger">*</span>
                </label>
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, 1500))
                  }
                  placeholder={t.book.descriptionPh}
                />
                <p className="mt-1 text-xs text-court-muted">
                  {description.length}/1500
                </p>
              </div>
              <div>
                <label className="label">
                  {L(
                    "Сопровождающее лицо (ФИО, до 1 человека)",
                    "Коштоочу (ФИО, 1 адам)"
                  )}
                </label>
                <input
                  className="input"
                  value={companion}
                  onChange={(e) => setCompanion(e.target.value)}
                />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-medium">
                  {L(
                    "Напоминание: на приёме не рассматриваются конкретные дела и законность судебных актов.",
                    "Эскертүү: кабыл алууда конкреттүү иштер жана сот актыларынын мыйзамдуулугу каралбайт."
                  )}
                </p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded border border-court-line px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-court-blue"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>{t.book.agree}</span>
              </label>
            </div>
          )}

          {/* 5 Календарь */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-court-navy">
                {t.book.calendarTitle}
              </h2>
              <p className="text-sm text-court-muted">{t.book.calendarLead}</p>
              <SlotPicker
                date={date}
                slotStart={slotStart}
                onDateChange={setDate}
                onSlotChange={(s, e) => {
                  setSlotStart(s);
                  setSlotEnd(e);
                }}
              />
            </div>
          )}

          {error && (
            <div className="mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-court-line pt-5">
            <button
              type="button"
              className="btn-outline"
              onClick={back}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              {L("Назад", "Артка")}
            </button>
            {step === 1 && blocked ? null : step < 5 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={next}
                disabled={step === 1 && !canProceedEligibility}
              >
                {L("Следующий", "Кийинки")}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={onSubmit}>
                {t.book.submit}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 hidden lg:block">
          <BookSidebar />
        </div>
      </div>
    </div>
  );
}
