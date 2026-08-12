"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Collapsible } from "@/components/ui/Collapsible";

/**
 * Понятная инструкция для сотрудников приёмной / руководства.
 * Без «демо-жаргона» — только рабочий порядок.
 */
export default function AdminHelpPage() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";

  return (
    <div className="mx-auto max-w-3xl space-y-5 page-enter">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: isKy ? "Нускама" : "Инструкция" },
        ]}
      />

      <div>
        <h1 className="section-title">
          {isKy
            ? "Нускама кызматкерлер үчүн"
            : "Инструкция для сотрудников"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isKy
            ? "Бул бөлүм — жарандарды кабыл алуу сервисинде ким эмне кылат. Кыска жана тартип боюнча."
            : "Этот раздел объясняет, кто что делает в сервисе приёма граждан. Коротко и по порядку."}
        </p>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <strong>
          {isKy ? "Эки дүйнө:" : "Две стороны:"}
        </strong>{" "}
        {isKy
          ? "1) жарандар — сайтта жазылат; 2) сиз — /admin ичинде иштейсиз. Жаран «код» жана «PIN» алат."
          : "1) граждане работают на публичном сайте; 2) вы — в служебном кабинете /admin. После записи у гражданина есть код и PIN."}
      </div>

      <Collapsible
        title={isKy ? "1. Жаран эмне кылат?" : "1. Что делает гражданин?"}
        defaultOpen
      >
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            {isKy ? (
              <>
                <Link href="/book" className="font-medium text-court-blue">
                  /book
                </Link>{" "}
                — жазылуу (эрежелер → допуск → маалымат → күн).
              </>
            ) : (
              <>
                Записывается на{" "}
                <Link href="/book" className="font-medium text-court-blue">
                  /book
                </Link>
                : правила → допуск (можно / нельзя) → ФИО → дата и время.
              </>
            )}
          </li>
          <li>
            {isKy
              ? "Алат: каттоо коду (мисалы VS-2026-1001) жана PIN (4 сан)."
              : "Получает: регистрационный код (например VS-2026-1001) и PIN (4 цифры)."}
          </li>
          <li>
            {isKy ? (
              <>
                <strong>Статус</strong> (главная) — <em>только код</em>, PIN
                керек эмес.
              </>
            ) : (
              <>
                <strong>Статус на главной</strong> — только{" "}
                <em>код</em>, PIN не нужен.
              </>
            )}
          </li>
          <li>
            {isKy ? (
              <>
                <strong>Менин жазылууум</strong> (/my-appointment) — код +{" "}
                <em>PIN</em>: которуу, жокко чыгаруу.
              </>
            ) : (
              <>
                <strong>«Моя запись»</strong> (/my-appointment) — код +{" "}
                <em>PIN</em>: перенос и отмена.
              </>
            )}
          </li>
          <li>
            {isKy
              ? "Баалоо — код боюнча (/feedback), кабыл алуудан кийин."
              : "Оценка сервиса — по коду (/feedback), после приёма (или раньше — про запись)."}
          </li>
        </ol>
      </Collapsible>

      <Collapsible
        title={
          isKy
            ? "2. Код жана PIN — кайда сизде?"
            : "2. Где у вас код и PIN?"
        }
        defaultOpen
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            {isKy
              ? "Мурун админкада PIN көрүнбөй калган. Эми:"
              : "Раньше PIN в админке почти не показывался. Сейчас:"}
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link
                href="/admin/appeals"
                className="font-medium text-court-blue"
              >
                {isKy ? "Кайрылуулар" : "Обращения"}
              </Link>
              {isKy
                ? " — таблицада тилке «PIN»."
                : " — колонка «PIN» в таблице."}
            </li>
            <li>
              {isKy
                ? "Карточканын ичинде — чоң блок «Код + PIN» (жаранга айтуу үчүн)."
                : "В карточке обращения — крупный блок «Код + PIN» (чтобы подсказать гражданину по телефону)."}
            </li>
            <li>
              {isKy
                ? "Издөө: код, ФИО, телефон, PIN."
                : "Поиск: код, ФИО, телефон, PIN."}
            </li>
          </ul>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            {isKy
              ? "Статус текшерүү = код. Башкаруу жазылуу = код + PIN. Айырманы жаранга түшүндүрүңүз."
              : "Проверка статуса = только код. Управление записью = код + PIN. Объясните гражданину разницу."}
          </div>
        </div>
      </Collapsible>

      <Collapsible
        title={
          isKy
            ? "3. Сиздин иш тартиби (этаптар)"
            : "3. Ваш рабочий порядок (этапы)"
        }
        defaultOpen
      >
        <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-700">
          <li>
            <strong>
              {isKy ? "Жазылуу келди" : "Пришла запись"}
            </strong>
            <br />
            <Link href="/admin" className="text-court-blue">
              {isKy ? "Иш тактасы" : "Рабочий стол"}
            </Link>
            {" · "}
            <Link href="/admin/calendar" className="text-court-blue">
              {isKy ? "Календарь" : "Календарь"}
            </Link>
            {" · "}
            <Link href="/admin/appeals" className="text-court-blue">
              {isKy ? "Кайрылуулар" : "Обращения"}
            </Link>
            <br />
            <span className="text-xs text-slate-500">
              {isKy
                ? "Ким, качан, тема. Записьти ачып караңыз."
                : "Кто, когда, тема. Откройте карточку."}
            </span>
          </li>
          <li>
            <strong>
              {isKy ? "Даярдоо (этап 2)" : "Подготовка (этап 2)"}
            </strong>
            <br />
            <Link href="/admin/reception" className="text-court-blue">
              {isKy ? "Даярдоо / кабыл алуу" : "Подготовка и приём"}
            </Link>
            {" / "}
            {isKy ? "карточка" : "карточка обращения"}
            <br />
            <span className="text-xs text-slate-500">
              {isKy
                ? "Изучение баштаңыз, кыскача мазмун, «даяр» деңгээлге чыгарыңыз. Конкреттүү сот иштери — жок."
                : "Начните изучение, краткое содержание, выведите в «готово к приёму». Конкретные судебные дела — не предмет приёма."}
            </span>
          </li>
          <li>
            <strong>
              {isKy ? "Жеке кабыл алуу (этап 3)" : "Личный приём (этап 3)"}
            </strong>
            <br />
            <Link href="/admin/reception" className="text-court-blue">
              {isKy ? "Кабыл алуу" : "Подготовка и приём"}
            </Link>
            <br />
            <span className="text-xs text-slate-500">
              {isKy
                ? "Протокол: эмне айтты, эмне түшүндүрүлдү, тапшырма, жооптуу адам."
                : "Протокол: что сказал гражданин, что разъяснили, поручение, ответственный."}
            </span>
          </li>
          <li>
            <strong>
              {isKy ? "Көзөмөл (этап 4)" : "Контроль (этап 4)"}
            </strong>
            <br />
            <Link href="/admin/control" className="text-court-blue">
              {isKy ? "Көзөмөл" : "Контроль поручений"}
            </Link>
            <br />
            <span className="text-xs text-slate-500">
              {isKy
                ? "Журнал, мөөнөт, акырында жооп жаранга."
                : "Журнал хода, сроки, в конце — ответ гражданину."}
            </span>
          </li>
          <li>
            <strong>
              {isKy ? "Мониторинг" : "Мониторинг"}
            </strong>
            <br />
            <Link href="/admin/analytics" className="text-court-blue">
              {isKy ? "Мониторинг" : "Мониторинг"}
            </Link>
            <br />
            <span className="text-xs text-slate-500">
              {isKy
                ? "Кайталанма кайрылуулар, темалар, баалар."
                : "Повторные обращения, темы, оценки."}
            </span>
          </li>
        </ol>
      </Collapsible>

      <Collapsible
        title={
          isKy
            ? "4. Жаран чалып: «статусумду билгим келет»"
            : "4. Гражданин звонит: «хочу узнать статус»"
        }
        defaultOpen
      >
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            {isKy
              ? "Сураңыз: код (VS-…) же телефон / ФИО."
              : "Спросите код (VS-…) или телефон / ФИО."}
          </li>
          <li>
            {isKy ? (
              <>
                Ачыңыз{" "}
                <Link href="/admin/appeals" className="text-court-blue">
                  Кайрылуулар
                </Link>{" "}
                — издеңиз.
              </>
            ) : (
              <>
                Откройте{" "}
                <Link href="/admin/appeals" className="text-court-blue">
                  Обращения
                </Link>{" "}
                — найдите запись.
              </>
            )}
          </li>
          <li>
            {isKy
              ? "Айтыңыз этапты (мисалы: даярдоо, кабыл алууга даяр, көзөмөл)."
              : "Назовите этап (например: на подготовке, готов к приёму, на контроле)."}
          </li>
          <li>
            {isKy
              ? "Эгер код/PIN унутулса — карточкадан код жана PIN айтыңыз (же кайра жөнөтүү — кийинки версияда SMS)."
              : "Если забыл код/PIN — с карточки продиктуйте код и PIN (в проде позже — SMS)."}
          </li>
          <li>
            {isKy
              ? "Статус өзү текшерүү: сайттын башкы бети → «Проверка состояния» + код."
              : "Самостоятельно статус: главная сайта → «Проверка состояния» + код (без PIN)."}
          </li>
        </ol>
      </Collapsible>

      <Collapsible
        title={
          isKy
            ? "5. Жазылууну жокко / которуу / неявка"
            : "5. Отмена / перенос / неявка"
        }
        defaultOpen={false}
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            {isKy
              ? "Карточка же календарь → «Отмена», «Неявка», «Вернуть»."
              : "Карточка или календарь → «Отмена», «Неявка», «Вернуть»."}
          </li>
          <li>
            {isKy
              ? "Жаран өзү: /my-appointment + код + PIN."
              : "Гражданин сам: /my-appointment + код + PIN."}
          </li>
          <li>
            {isKy
              ? "Датаны өзгөртүү — карточкада «Дата, время и статусы»."
              : "Смена даты — в карточке блок «Дата, время и статусы»."}
          </li>
        </ul>
      </Collapsible>

      <Collapsible
        title={
          isKy
            ? "6. Тексттер, эрежелер, допуск"
            : "6. Тексты, правила, допуск"
        }
        defaultOpen={false}
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            <Link href="/admin/content" className="text-court-blue">
              {isKy ? "Контент" : "Контент сервиса"}
            </Link>
            {isKy
              ? " — башкы бет, эрежелердин тексттери."
              : " — тексты главной и правил записи."}
          </li>
          <li>
            <Link href="/admin/eligibility" className="text-court-blue">
              {isKy ? "Допуск дарагы" : "Дерево допуска"}
            </Link>
            {isKy
              ? " — эмнеге жазылууга болот / баш тартуу."
              : " — по каким вопросам можно записаться / отказ."}
          </li>
          <li>
            <Link href="/admin/settings" className="text-court-blue">
              {isKy ? "График" : "График приёма"}
            </Link>
            {isKy
              ? " — күндөр, 24-саат убакыт, жабык күндөр."
              : " — дни, время 24ч, закрытые даты."}
          </li>
        </ul>
      </Collapsible>

      <Collapsible
        title={isKy ? "7. Опросник модулу" : "7. Модуль «Опросник»"}
        defaultOpen={false}
      >
        <p className="text-sm text-slate-700">
          {isKy
            ? "Солдо «Опросник» — суроолорду түзөтүү. Жарандар анкетаны opros.sot.kg толтурат. Бул жерде негизги иш — кабыл алуу модулу."
            : "Слева переключатель «Опросник» — правка вопросов. Граждане заполняют анкету на opros.sot.kg. Основная работа здесь — модуль «Приём граждан»."}
        </p>
      </Collapsible>

      <Collapsible
        title={isKy ? "8. Демо кирүү" : "8. Вход (демо)"}
        defaultOpen={false}
      >
        <ul className="space-y-1 font-mono text-sm text-slate-700">
          <li>priemnaya / priem123 — {isKy ? "кабыл алуу" : "приёмная"}</li>
          <li>rukovodstvo / sud2026 — {isKy ? "жетекчилик" : "руководство"}</li>
          <li>otvet1 / otvet123 — {isKy ? "жооптуу" : "ответственный"}</li>
          <li>admin / admin123 — {isKy ? "админ" : "администратор"}</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          {isKy
            ? "Демо: маалымат браузерде (localStorage). Проддо — сервер болот."
            : "Демо: данные в браузере (localStorage). В проде — сервер и SMS."}
        </p>
      </Collapsible>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <div className="font-semibold text-slate-900">
          {isKy ? "Бир сүйлөмдө" : "В одном предложении"}
        </div>
        <p className="mt-2 text-slate-600">
          {isKy
            ? "Жаран жазылат → сиз даярдайсыз жана кабыл аласыз → тапшырманы көзөмөлдөйсүз → жооп → баалоо. Код — статус; код+PIN — башкаруу жазылуу."
            : "Гражданин записывается → вы готовите и проводите приём → контролируете поручение → ответ → оценка. Код — статус; код+PIN — управление записью."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin" className="btn-primary !text-sm">
            {isKy ? "Иш тактасы" : "К рабочему столу"}
          </Link>
          <Link href="/admin/appeals" className="btn-outline !text-sm">
            {isKy ? "Кайрылуулар + PIN" : "Обращения + PIN"}
          </Link>
          <Link href="/" className="btn-outline !text-sm" target="_blank">
            {isKy ? "Жарандардын сайты" : "Сайт граждан"}
          </Link>
        </div>
      </div>
    </div>
  );
}
