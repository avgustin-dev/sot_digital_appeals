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
import { WizardSteps } from "@/components/ui/WizardSteps";
import { PageLoader } from "@/components/ui/PageLoader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { AppealCategory } from "@/lib/types";
import { formatDateRu } from "@/lib/slots";
import {
  APPLICANT_TYPES,
  COURT_CONTACTS,
  REGIONS_KR,
  RECEPTION_TARGETS,
} from "@/lib/constants";
import {
  BOOKING_RULES,
  cloneEligibilityTree,
  getLeaf,
  getPathRefusal,
  isPathAllowed,
  resolvePath,
  type EligibilityNode,
  type RefusalMessage,
} from "@/lib/eligibility";
import { defaultServiceContent } from "@/lib/serviceContent";

/**
 * Запись: правила + допуск (KZ) + правдоподобные поля (UX УЗ) + слоты 20 мин (КР).
 * Без полей судебного дела.
 */
export default function BookPage() {
  const { ready, bookAppointment, state } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";

  const sc = state.serviceContent ?? defaultServiceContent();
  const rules = sc.rules ?? BOOKING_RULES;
  const eligibilityTree = (state.eligibilityTree?.length
    ? state.eligibilityTree
    : cloneEligibilityTree()) as EligibilityNode[];
  const bookTitle = isKy
    ? sc.bookTitleKy || sc.bookTitleRu
    : sc.bookTitleRu || sc.bookTitleKy;
  const bookSubtitle = isKy
    ? sc.bookSubtitleKy || sc.bookSubtitleRu
    : sc.bookSubtitleRu || sc.bookSubtitleKy;

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
  const [phoneAlt, setPhoneAlt] = useState("");
  const [email, setEmail] = useState("");
  const [applicantType, setApplicantType] = useState("citizen");
  const [orgName, setOrgName] = useState("");
  const [orgInn, setOrgInn] = useState("");
  const [position, setPosition] = useState("");
  const [docType, setDocType] = useState("passport");
  const [docNumber, setDocNumber] = useState("");
  const [citizenship, setCitizenship] = useState("kg");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [residenceType, setResidenceType] = useState("registration");

  const [target, setTarget] = useState("reception");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<AppealCategory>("organization");
  const [description, setDescription] = useState("");
  const [companion, setCompanion] = useState("");
  const [companionPhone, setCompanionPhone] = useState("");
  const [expectedResult, setExpectedResult] = useState("");

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

  const pathNodes = resolvePath(path, eligibilityTree);
  const leaf = getLeaf(path, eligibilityTree);
  const refusalMsg = getPathRefusal(path, eligibilityTree);
  const blocked = Boolean(refusalMsg);
  const canProceedEligibility = isPathAllowed(path, eligibilityTree);

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
    options: eligibilityTree,
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
        return L(
          "Укажите фамилию и имя заявителя.",
          "Кайрылуучунун фамилиясы менен атын жазыңыз."
        );
      if (!phone.trim() || phone.replace(/\D/g, "").length < 9)
        return L(
          "Укажите корректный номер телефона заявителя.",
          "Кайрылуучунун телефон номерин туура киргизиңиз."
        );
      if (applicantType === "legal" && !orgName.trim())
        return L(
          "Укажите полное наименование организации.",
          "Уюмдун толук аталышын жазыңыз."
        );
      if (applicantType === "rep" && !orgName.trim())
        return L(
          "Укажите организацию, от имени которой действуете.",
          "Кимдин атынан иштеп жатканыңызды көрсөтүңүз."
        );
    }
    if (s === 3) {
      if (!region)
        return L("Выберите регион (область / город).", "Аймакты тандаңыз.");
      if (!city.trim())
        return L(
          "Укажите населённый пункт.",
          "Калаа же айылды жазыңыз."
        );
      if (!street.trim() && !address.trim())
        return L(
          "Укажите улицу или полный адрес.",
          "Көчөнү же толук даректи жазыңыз."
        );
    }
    if (s === 4) {
      if (!target)
        return L(
          "Укажите должностное лицо, к которому записываетесь.",
          "Кимге жазыла турганыңызды көрсөтүңүз."
        );
      if (!topic.trim())
        return L(
          "Укажите тему обращения.",
          "Кайрылуунун темасын жазыңыз."
        );
      if (!description.trim() || description.trim().length < 20)
        return L(
          "Изложите содержание обращения (не менее 20 символов).",
          "Кайрылуунун мазмунун жазыңыз (20 белгиден кем эмес)."
        );
      if (!agree)
        return L(
          "Подтвердите соответствие предмета обращения правилам приёма.",
          "Кайрылуунун предмети эрежелерге туура келерин ырастаңыз."
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

    const addrParts = [
      regionLabel,
      district.trim() && `р-н ${district.trim()}`,
      city.trim(),
      street.trim() && `ул. ${street.trim()}`,
      house.trim() && `д. ${house.trim()}`,
      apartment.trim() && `кв. ${apartment.trim()}`,
      postalCode.trim() && `индекс ${postalCode.trim()}`,
      address.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const extra = [
      `Заявитель: ${fullName}`,
      gender
        ? `Пол: ${gender === "m" ? "мужской" : gender === "f" ? "женский" : gender}`
        : "",
      birthDate.trim() ? `Дата рождения: ${birthDate.trim()}` : "",
      `Тип заявителя: ${typeLabel}`,
      orgName.trim() ? `Организация: ${orgName.trim()}` : "",
      orgInn.trim() ? `ИНН / рег. номер: ${orgInn.trim()}` : "",
      position.trim() ? `Должность: ${position.trim()}` : "",
      citizenship
        ? `Гражданство: ${citizenship === "kg" ? "Кыргызская Республика" : citizenship === "other" ? "иное" : citizenship}`
        : "",
      docNumber.trim()
        ? `Документ: ${docType} № ${docNumber.trim()}`
        : "",
      `Телефон: ${phone.trim()}`,
      phoneAlt.trim() ? `Доп. телефон: ${phoneAlt.trim()}` : "",
      email.trim() ? `E-mail: ${email.trim()}` : "",
      `Адрес (${residenceType === "actual" ? "фактический" : "по регистрации"}): ${addrParts}`,
      `К кому: ${targetLabel}`,
      companion.trim()
        ? `Сопровождающий: ${companion.trim()}${companionPhone.trim() ? `, тел. ${companionPhone.trim()}` : ""}`
        : "",
      expectedResult.trim()
        ? `Ожидаемый результат: ${expectedResult.trim()}`
        : "",
      `Допуск: ${pathNote}`,
      `Содержание обращения:\n${description.trim()}`,
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
    <div className="page-enter bg-court-mist min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
        <Breadcrumbs
          items={[
            { label: t.crumbs.home, href: "/" },
            { label: t.crumbs.book },
          ]}
        />

        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-court-navy sm:text-2xl">
            {bookTitle ||
              L(
                "Электронная запись на личный приём",
                "Жеке кабыл алууга электрондук жазылуу"
              )}
          </h1>
          <p className="mt-1 text-sm font-medium text-court-ink">
            {bookSubtitle ||
              L(
                "Верховный суд Кыргызской Республики",
                "Кыргыз Республикасынын Жогорку соту"
              )}
          </p>
          <p className="mt-0.5 text-xs text-court-muted">
            {L(
              "Приём граждан руководством в установленном порядке",
              "Жетекчилик тарабынан жарандарды белгиленген тартипте кабыл алуу"
            )}
          </p>
        </div>

        <div className="mb-6">
          <WizardSteps steps={STEPS} current={step} mode="dots" />
        </div>

        <div className="rounded-lg border border-court-line bg-white p-5 shadow-sm sm:p-6">
          <div key={step} className="wizard-step-enter">
          {/* 0 Правила */}
          {step === 0 && (
            <div className="space-y-4 text-sm leading-relaxed text-court-ink">
              <p>{L(rules.welcomeRu, rules.welcomeKy)}</p>
              <h2 className="text-center text-xs font-bold uppercase tracking-wide text-court-navy">
                {L(rules.titleRu, rules.titleKy)}
              </h2>
              <ol className="list-decimal space-y-1.5 pl-5">
                {(
                  (isKy ? rules.rulesKy : rules.rulesRu) ??
                  (isKy ? BOOKING_RULES.rulesKy : BOOKING_RULES.rulesRu)
                ).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="font-semibold text-amber-900">
                  {L(rules.cannotTitleRu, rules.cannotTitleKy)}
                </div>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-amber-950/90">
                  {(
                    (isKy ? rules.cannotKy : rules.cannotRu) ??
                    (isKy ? BOOKING_RULES.cannotKy : BOOKING_RULES.cannotRu)
                  ).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <p className="font-medium text-court-danger">
                {L(rules.deleteNoteRu, rules.deleteNoteKy)}
              </p>
              <label className="flex cursor-pointer items-start gap-3 rounded border border-court-line px-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-court-blue"
                  checked={rulesAgree}
                  onChange={(e) => setRulesAgree(e.target.checked)}
                />
                <span>
                  {L(rules.agreeRu, rules.agreeKy)}{" "}
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
                {L(
                  "Сведения о заявителе",
                  "Кайрылуучу жөнүндө маалымат"
                )}
              </h2>
              <p className="text-xs text-court-muted">
                {L(
                  "Указываются данные лица, которое явится на приём. Сведения заполняются полностью и достоверно.",
                  "Кабыл алууга келе турган адамдын маалыматтары толук жана туура толтурулат."
                )}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
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
                  <label className="label">{L("Пол", "Жынысы")}</label>
                  <select
                    className="input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">
                      {L("— Не указано —", "— Көрсөтүлгөн жок —")}
                    </option>
                    <option value="m">{L("Мужской", "Эркек")}</option>
                    <option value="f">{L("Женский", "Аял")}</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    {L("Дата рождения (дд.мм.гггг)", "Туулган күнү (кк.аа.жжжж)")}
                  </label>
                  <input
                    className="input font-mono"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="15.03.1985"
                    lang="ru"
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Гражданство", "Жарандык")}
                  </label>
                  <select
                    className="input"
                    value={citizenship}
                    onChange={(e) => setCitizenship(e.target.value)}
                  >
                    <option value="kg">
                      {L("Кыргызская Республика", "Кыргыз Республикасы")}
                    </option>
                    <option value="other">
                      {L("Иное", "Башка")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    {L("Документ, удостоверяющий личность", "Өздүк документ")}
                  </label>
                  <select
                    className="input"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="passport">
                      {L("Паспорт / ID-карта", "Паспорт / ID-карта")}
                    </option>
                    <option value="foreign">
                      {L("Документ иностранного гражданина", "Чет өлкөлүк документ")}
                    </option>
                    <option value="other">
                      {L("Иной документ", "Башка документ")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    {L("Серия и номер документа", "Документтин сериясы жана номери")}
                  </label>
                  <input
                    className="input font-mono"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="ID …"
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Контактный телефон", "Байланыш телефону")}{" "}
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
                <div>
                  <label className="label">
                    {L("Дополнительный телефон", "Кошумча телефон")}
                  </label>
                  <input
                    className="input"
                    value={phoneAlt}
                    onChange={(e) => setPhoneAlt(e.target.value)}
                    placeholder="+996 …"
                  />
                </div>
                <div>
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
                <div className="sm:col-span-3">
                  <label className="label">
                    {L("Категория заявителя", "Кайрылуучунун категориясы")}{" "}
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
                {(applicantType === "legal" || applicantType === "rep") && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="label">
                        {L(
                          "Полное наименование организации",
                          "Уюмдун толук аталышы"
                        )}{" "}
                        <span className="text-court-danger">*</span>
                      </label>
                      <input
                        className="input"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">
                        {L("ИНН / рег. номер", "ИНН / каттоо номери")}
                      </label>
                      <input
                        className="input font-mono"
                        value={orgInn}
                        onChange={(e) => setOrgInn(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="label">
                        {L("Должность представителя", "Өкүлдүн кызматы")}
                      </label>
                      <input
                        className="input"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 3 Адрес */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-court-navy">
                {L(
                  "Место проживания / нахождения заявителя",
                  "Кайрылуучунун жашаган / жайгашкан жери"
                )}
              </h2>
              {fullName && (
                <div className="rounded border border-court-line bg-court-mist px-3 py-2 text-sm">
                  <span className="text-xs uppercase tracking-wide text-court-muted">
                    {L("Заявитель", "Кайрылуучу")}:
                  </span>{" "}
                  <strong className="text-court-navy">{fullName}</strong>
                  {phone && (
                    <span className="text-court-muted"> · {phone}</span>
                  )}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">
                    {L("Тип адреса", "Дарек түрү")}
                  </label>
                  <select
                    className="input"
                    value={residenceType}
                    onChange={(e) => setResidenceType(e.target.value)}
                  >
                    <option value="registration">
                      {L("По месту регистрации", "Катталган жери боюнча")}
                    </option>
                    <option value="actual">
                      {L("Фактическое проживание", "Иш жүзүндө жашаган жери")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    {L("Регион (область / город)", "Аймак (облус / шаар)")}{" "}
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
                    {L("Район", "Район")}
                  </label>
                  <input
                    className="input"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={L("район", "район")}
                  />
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
                    placeholder={L("город, село, посёлок", "шаар, айыл")}
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Улица / микрорайон", "Көчө / микрорайон")}{" "}
                    <span className="text-court-danger">*</span>
                  </label>
                  <input
                    className="input"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{L("Дом", "Үй")}</label>
                    <input
                      className="input"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">{L("Квартира", "Батир")}</label>
                    <input
                      className="input"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">
                    {L("Почтовый индекс", "Почта индекси")}
                  </label>
                  <input
                    className="input font-mono"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="720000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">
                    {L(
                      "Адрес дополнительно (ориентир, корпус и т.п.)",
                      "Кошумча дарек (багыт, корпус ж.б.)"
                    )}
                  </label>
                  <input
                    className="input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={L(
                      "при необходимости — полный адрес одной строкой",
                      "керек болсо — толук дарек"
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4 Содержание (без дела!) */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-court-navy">
                {L("Сведения об обращении", "Кайрылуу жөнүндө маалымат")}
              </h2>
              {fullName && (
                <div className="rounded border border-court-line bg-court-mist px-3 py-2 text-sm">
                  <div>
                    <span className="text-xs uppercase text-court-muted">
                      {L("Заявитель", "Кайрылуучу")}:
                    </span>{" "}
                    <strong className="text-court-navy">{fullName}</strong>
                  </div>
                  <div className="mt-0.5 text-xs text-court-muted">
                    {phone}
                    {city && ` · ${city}`}
                    {street && ` · ${street}`}
                  </div>
                </div>
              )}
              {pathNodes.length > 0 && (
                <div className="rounded border border-court-line bg-court-mist px-3 py-2 text-xs text-court-muted">
                  <span className="font-medium text-court-navy">
                    {L("Результат проверки допуска:", "Допуск текшерүүсү:")}
                  </span>{" "}
                  {pathNodes.map(labelOf).join(" → ")}
                </div>
              )}
              <div>
                <label className="label">
                  {L(
                    "К должностному лицу / подразделению",
                    "Кызмат адамы / бөлүм"
                  )}{" "}
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
                <p className="mt-1.5 text-[11px] leading-relaxed text-court-muted">
                  {L(
                    `График и ФИО — с раздела «График приёма граждан» (sot.kg). Предварительная запись: ${COURT_CONTACTS.receptionOfficeRu}. Телефон доверия: ${COURT_CONTACTS.trustPhone}.`,
                    `График жана ФИО — «Жарандарды кабыл алуу графиги» (sot.kg). Алдын ала жазылуу: ${COURT_CONTACTS.receptionOfficeKy}. Ишеним телефону: ${COURT_CONTACTS.trustPhone}.`
                  )}{" "}
                  <Link href="/rules" className="text-court-blue hover:underline">
                    {L("Подробнее", "Толугураак")}
                  </Link>
                </p>
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
                    "Содержание обращения (без указания конкретных судебных дел и актов)",
                    "Кайрылуунун мазмуну (конкреттүү сот иштери жана актылары көрсөтүлбөстөн)"
                  )}{" "}
                  <span className="text-court-danger">*</span>
                </label>
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, 2000))
                  }
                  placeholder={t.book.descriptionPh}
                />
                <p className="mt-1 text-xs text-court-muted">
                  {description.length}/2000
                </p>
              </div>
              <div>
                <label className="label">
                  {L(
                    "Ожидаемый результат рассмотрения",
                    "Карап чыгуунун күтүлгөн натыйжасы"
                  )}
                </label>
                <textarea
                  className="input min-h-[64px] resize-y"
                  value={expectedResult}
                  onChange={(e) =>
                    setExpectedResult(e.target.value.slice(0, 500))
                  }
                  placeholder={L(
                    "Кратко: разъяснение, организационные меры, учёт предложения…",
                    "Кыскача: түшүндүрмө, уюштуруу чаралары…"
                  )}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">
                    {L(
                      "Сопровождающее лицо (ФИО, не более одного)",
                      "Коштоочу (ФИО, бир адам)"
                    )}
                  </label>
                  <input
                    className="input"
                    value={companion}
                    onChange={(e) => setCompanion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    {L("Телефон сопровождающего", "Коштоочунун телефону")}
                  </label>
                  <input
                    className="input"
                    value={companionPhone}
                    onChange={(e) => setCompanionPhone(e.target.value)}
                    placeholder="+996 …"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-medium">
                  {L(
                    "На личном приёме не рассматриваются конкретные судебные дела, законность судебных актов и результаты рассмотрения дел. Независимость судей обеспечивается в полном объёме.",
                    "Жеке кабыл алууда конкреттүү сот иштери, сот актыларынын мыйзамдуулугу жана иштерди кароонун натыйжалары талкууланбайт. Соттордун көз карандысыздыгы толук сакталат."
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
              {fullName && (
                <div className="rounded border border-court-line bg-court-mist px-3 py-2 text-sm">
                  <span className="text-xs uppercase text-court-muted">
                    {L("Заявитель", "Кайрылуучу")}:
                  </span>{" "}
                  <strong className="text-court-navy">{fullName}</strong>
                  {topic && (
                    <span className="block text-xs text-court-muted mt-0.5">
                      {L("Тема", "Тема")}: {topic}
                    </span>
                  )}
                </div>
              )}
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
          </div>

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

        <p className="mt-6 text-center text-sm text-court-muted">
          <Link href="/" className="text-court-blue hover:underline">
            {L("← На главную раздела", "← Бөлүмдүн башкы бетине")}
          </Link>
          {" · "}
          <Link href="/rules" className="text-court-blue hover:underline">
            {L("Правила", "Эрежелер")}
          </Link>
          {" · "}
          <Link
            href="/my-appointment"
            className="text-court-blue hover:underline"
          >
            {L("Моя запись", "Менин жазылууум")}
          </Link>
        </p>
      </div>
    </div>
  );
}
