"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PageLoader } from "@/components/ui/PageLoader";
import { generateId } from "@/lib/utils";
import type { SurveyOption, SurveyQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminSurveyPage() {
  const {
    ready,
    state,
    saveSurveyQuestion,
    deleteSurveyQuestion,
    reorderSurveyQuestion,
    updateSurveyMeta,
    resetSurveyQuestions,
  } = useStore();

  const questions = useMemo(
    () =>
      [...(state.surveyQuestions || [])].sort((a, b) => a.order - b.order),
    [state.surveyQuestions]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SurveyQuestion | null>(null);
  const [msg, setMsg] = useState("");

  if (!ready) return <PageLoader label="Загрузка…" />;

  const meta = state.surveyMeta;

  function selectQuestion(q: SurveyQuestion) {
    setSelectedId(q.id);
    setDraft(JSON.parse(JSON.stringify(q)) as SurveyQuestion);
    setMsg("");
  }

  function newQuestion() {
    const q: SurveyQuestion = {
      id: generateId("q"),
      order: questions.length + 1,
      type: "single",
      required: true,
      enabled: true,
      textRu: "Новый вопрос",
      textKy: "Жаңы суроо",
      options: [
        {
          id: generateId("o"),
          textRu: "Вариант 1",
          textKy: "Вариант 1",
        },
        {
          id: generateId("o"),
          textRu: "Вариант 2",
          textKy: "Вариант 2",
        },
      ],
    };
    saveSurveyQuestion(q);
    selectQuestion(q);
    setMsg("Вопрос создан. Отредактируйте и сохраните.");
  }

  function saveDraft() {
    if (!draft) return;
    if (!draft.textRu.trim()) {
      setMsg("Укажите текст вопроса (RU).");
      return;
    }
    if (draft.type === "single" && draft.options.length < 2) {
      setMsg("Для выбора нужно минимум 2 варианта.");
      return;
    }
    saveSurveyQuestion(draft);
    setMsg("Сохранено. Публичная анкета /survey обновится сразу.");
  }

  function addOption() {
    if (!draft) return;
    const o: SurveyOption = {
      id: generateId("o"),
      textRu: "Новый вариант",
      textKy: "Жаңы вариант",
    };
    setDraft({ ...draft, options: [...draft.options, o] });
  }

  function updateOption(id: string, patch: Partial<SurveyOption>) {
    if (!draft) return;
    setDraft({
      ...draft,
      options: draft.options.map((o) =>
        o.id === id ? { ...o, ...patch } : o
      ),
    });
  }

  function removeOption(id: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      options: draft.options.filter((o) => o.id !== id),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-court-navy sm:text-2xl">
            Вопросы анкеты (управление)
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-court-muted">
            Редактирование формулировок вопросов. Публичное заполнение анкеты
            и учёт ответов — в действующей системе{" "}
            <a
              href="https://opros.sot.kg"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-court-blue hover:underline"
            >
              opros.sot.kg
            </a>
            . Здесь — только CMS вопросов для интеграции.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://opros.sot.kg"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline !text-sm"
          >
            <Eye className="h-4 w-4" />
            opros.sot.kg
          </a>
          <Link href="/admin/survey/results" className="btn-outline !text-sm">
            Сводка (демо)
          </Link>
          <button type="button" className="btn-primary !text-sm" onClick={newQuestion}>
            <Plus className="h-4 w-4" />
            Вопрос
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-court-navy">
          Заголовок анкеты
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Название (RU)</label>
            <input
              className="input"
              value={meta.titleRu}
              onChange={(e) => updateSurveyMeta({ titleRu: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Аталышы (KY)</label>
            <input
              className="input"
              value={meta.titleKy}
              onChange={(e) => updateSurveyMeta({ titleKy: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Описание (RU)</label>
            <textarea
              className="input min-h-[64px] resize-y"
              value={meta.descriptionRu}
              onChange={(e) =>
                updateSurveyMeta({ descriptionRu: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Суд (демо, RU)</label>
            <input
              className="input"
              value={meta.courtNameRu}
              onChange={(e) =>
                updateSurveyMeta({ courtNameRu: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* List */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-court-line px-4 py-3">
            <span className="text-sm font-semibold text-court-navy">
              Вопросы ({questions.length})
            </span>
            <button
              type="button"
              className="text-xs text-court-muted hover:text-court-navy"
              onClick={() => {
                if (confirm("Сбросить вопросы к демо-набору (15 шт.)?")) {
                  resetSurveyQuestions();
                  setDraft(null);
                  setSelectedId(null);
                  setMsg("Вопросы сброшены к seed.");
                }
              }}
            >
              <span className="inline-flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" />
                Сброс seed
              </span>
            </button>
          </div>
          <ul className="max-h-[70vh] divide-y divide-court-line overflow-y-auto">
            {questions.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => selectQuestion(q)}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-3 text-left text-sm hover:bg-court-mist",
                    selectedId === q.id && "bg-court-light"
                  )}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-court-line text-xs font-semibold text-court-navy">
                    {q.order}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium text-court-ink">
                      {q.textRu}
                    </span>
                    <span className="mt-0.5 block text-xs text-court-muted">
                      {q.type === "single" ? "Выбор" : "Текст"} ·{" "}
                      {q.required ? "обяз." : "необяз."} ·{" "}
                      {q.enabled ? "вкл" : "выкл"} ·{" "}
                      {q.options.length} вар.
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col gap-0.5">
                    <span
                      role="button"
                      tabIndex={0}
                      className="rounded p-0.5 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderSurveyQuestion(q.id, "up");
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5 text-court-muted" />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="rounded p-0.5 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderSurveyQuestion(q.id, "down");
                      }}
                    >
                      <ArrowDown className="h-3.5 w-3.5 text-court-muted" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor */}
        <div className="card p-4 sm:p-5">
          {!draft ? (
            <p className="py-12 text-center text-sm text-court-muted">
              Выберите вопрос слева или создайте новый.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-court-navy">
                  Редактор · №{draft.order}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-primary !py-1.5 !text-sm"
                    onClick={saveDraft}
                  >
                    <Save className="h-4 w-4" />
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="btn-danger !py-1.5 !text-sm"
                    onClick={() => {
                      if (confirm("Удалить вопрос?")) {
                        deleteSurveyQuestion(draft.id);
                        setDraft(null);
                        setSelectedId(null);
                        setMsg("Вопрос удалён.");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {msg && (
                <div className="border border-court-line bg-court-mist px-3 py-2 text-sm text-court-ink">
                  {msg}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Тип</label>
                  <select
                    className="select input"
                    value={draft.type}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        type: e.target.value as "single" | "text",
                      })
                    }
                  >
                    <option value="single">Один выбор (radio)</option>
                    <option value="text">Свободный текст</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-court-navy"
                      checked={draft.required}
                      onChange={(e) =>
                        setDraft({ ...draft, required: e.target.checked })
                      }
                    />
                    Обязательный
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-court-navy"
                      checked={draft.enabled}
                      onChange={(e) =>
                        setDraft({ ...draft, enabled: e.target.checked })
                      }
                    />
                    Включён
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Текст (RU) *</label>
                <textarea
                  className="input min-h-[72px] resize-y"
                  value={draft.textRu}
                  onChange={(e) =>
                    setDraft({ ...draft, textRu: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Текст (KY)</label>
                <textarea
                  className="input min-h-[72px] resize-y"
                  value={draft.textKy}
                  onChange={(e) =>
                    setDraft({ ...draft, textKy: e.target.value })
                  }
                />
              </div>

              {draft.type === "single" && (
                <div className="space-y-2 border border-court-line p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-court-navy">
                      Варианты ответа
                    </span>
                    <button
                      type="button"
                      className="text-sm font-medium text-court-blue hover:underline"
                      onClick={addOption}
                    >
                      + вариант
                    </button>
                  </div>
                  {draft.options.map((o, i) => (
                    <div
                      key={o.id}
                      className="grid gap-2 border-t border-court-line pt-2 sm:grid-cols-[1fr_1fr_auto_auto]"
                    >
                      <input
                        className="input !text-sm"
                        value={o.textRu}
                        onChange={(e) =>
                          updateOption(o.id, { textRu: e.target.value })
                        }
                        placeholder={`Вариант ${i + 1} RU`}
                      />
                      <input
                        className="input !text-sm"
                        value={o.textKy}
                        onChange={(e) =>
                          updateOption(o.id, { textKy: e.target.value })
                        }
                        placeholder={`Вариант ${i + 1} KY`}
                      />
                      <label className="flex items-center gap-1 text-xs text-court-muted">
                        <input
                          type="checkbox"
                          className="accent-court-navy"
                          checked={!!o.isOther}
                          onChange={(e) =>
                            updateOption(o.id, { isOther: e.target.checked })
                          }
                        />
                        Другое
                      </label>
                      <button
                        type="button"
                        className="text-court-danger hover:underline"
                        onClick={() => removeOption(o.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
