import type { AppealCard, Appointment } from "./types";
import { STAGE_LABELS, CATEGORY_LABELS, ORG_NAME } from "./constants";
import { average, normalizePhone } from "./utils";

type ReportInput = {
  appeals: AppealCard[];
  appointments: Appointment[];
  title?: string;
  subtitle?: string;
  orgName?: string;
};

/**
 * Отчёт для руководства: открывает окно печати.
 * В диалоге печати: «Сохранить как PDF» (работает с кириллицей).
 */
export function downloadAppealsReport(input: ReportInput) {
  const appeals = input.appeals.filter((a) => a.stage !== "cancelled");
  const appointments = input.appointments;
  const orgName = input.orgName || ORG_NAME;
  const title = input.title || "Отчёт по приёму граждан";
  const subtitle =
    input.subtitle || "Сводка для руководства Верховного суда КР";
  const now = new Date().toLocaleString("ru-RU");

  const groups = new Map<string, AppealCard[]>();
  for (const a of appeals) {
    const key = normalizePhone(a.phone) || a.fullName.toLowerCase();
    const list = groups.get(key) || [];
    list.push(a);
    groups.set(key, list);
  }
  const repeated = Array.from(groups.values()).filter((g) => g.length > 1);

  const feedbacks = appeals.filter((a) => a.feedback).map((a) => a.feedback!);
  const overall = feedbacks.length
    ? average(
        feedbacks.flatMap((f) => [
          f.respectful,
          f.clearNextSteps,
          f.convenient,
          f.deadlinesMet,
        ])
      )
    : 0;

  const byStage = Object.entries(
    appeals.reduce<Record<string, number>>((acc, a) => {
      acc[a.stage] = (acc[a.stage] || 0) + 1;
      return acc;
    }, {})
  );

  const rows = appeals
    .slice(0, 50)
    .map(
      (a) => `
    <tr>
      <td>${esc(a.code)}</td>
      <td>${esc(a.fullName)}</td>
      <td>${esc(a.topic)}</td>
      <td>${esc(CATEGORY_LABELS[a.category] || a.category)}</td>
      <td>${esc(STAGE_LABELS[a.stage] || a.stage)}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>
  body { font-family: "Segoe UI", "Times New Roman", Arial, sans-serif; color: #1a2332; padding: 22px; font-size: 12px; line-height: 1.45; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #0B1F3A; }
  h2 { font-size: 13px; margin: 18px 0 8px; color: #0B1F3A; border-bottom: 2px solid #B8954A; padding-bottom: 4px; }
  .meta { color: #5A6B7D; margin-bottom: 14px; }
  .kpis { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0 16px; }
  .kpi { border: 1px solid #D5DEE8; border-radius: 8px; padding: 8px 12px; min-width: 110px; }
  .kpi b { display: block; font-size: 18px; color: #0B1F3A; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #D5DEE8; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #F4F7FB; font-size: 11px; }
  ul { margin: 0; padding-left: 18px; }
  .foot { margin-top: 20px; color: #5A6B7D; font-size: 10px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style>
</head>
<body>
  <p class="noprint" style="background:#E8F0F8;padding:10px;border-radius:8px;margin-bottom:16px;">
    <strong>Как сохранить PDF:</strong> в окне печати выберите «Сохранить как PDF» / «Microsoft Print to PDF».
  </p>
  <h1>${esc(title)}</h1>
  <div class="meta">${esc(orgName)}<br/>${esc(subtitle)}<br/>Сформировано: ${esc(now)}</div>
  <div class="kpis">
    <div class="kpi"><span>Обращений</span><b>${appeals.length}</b></div>
    <div class="kpi"><span>Записей</span><b>${appointments.length}</b></div>
    <div class="kpi"><span>Повторные граждане</span><b>${repeated.length}</b></div>
    <div class="kpi"><span>Средняя оценка</span><b>${overall ? overall.toFixed(1) : "—"} / 5</b></div>
    <div class="kpi"><span>Оценок</span><b>${feedbacks.length}</b></div>
  </div>
  <h2>По этапам</h2>
  <table>
    <thead><tr><th>Этап</th><th>Кол-во</th></tr></thead>
    <tbody>
      ${byStage
        .map(
          ([k, n]) =>
            `<tr><td>${esc(STAGE_LABELS[k as keyof typeof STAGE_LABELS] || k)}</td><td>${n}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
  <h2>Повторные обращения</h2>
  ${
    repeated.length === 0
      ? "<p>Нет повторных обращений.</p>"
      : `<ul>${repeated
          .map(
            (g) =>
              `<li><strong>${esc(g[0].fullName)}</strong> (${g.length}): ${esc(
                g.map((x) => x.code).join(", ")
              )} — ${esc(g.map((x) => x.topic).join("; "))}</li>`
          )
          .join("")}</ul>`
  }
  <h2>Реестр обращений</h2>
  <table>
    <thead><tr><th>Код</th><th>ФИО</th><th>Тема</th><th>Категория</th><th>Этап</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='5'>Нет данных</td></tr>"}</tbody>
  </table>
  <p class="foot">Цифровая платформа приёма граждан руководством Верховного суда Кыргызской Республики</p>
  <script>window.onload=function(){setTimeout(function(){window.print();},250);}</script>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer,width=920,height=720");
  if (!w) {
    alert(
      "Разрешите всплывающие окна. Затем: Печать → «Сохранить как PDF»."
    );
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
