import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import { phase0WorkTypeOptions } from "./phase0-work-type";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

const kindLabels: Record<Phase0JudgementDraft["possibleKind"], string> = {
  help_request_candidate: "求助候選",
  site_status_candidate: "地點狀態候選",
  task_candidate: "任務候選",
  assignment_candidate: "人員指派候選",
  announcement_candidate: "公告候選",
  unknown: "候選類型待判斷",
};

const confidenceLabels: Record<Phase0JudgementDraft["confidence"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const nextStepLabels: Record<
  Phase0JudgementDraft["suggestedNextStep"],
  string
> = {
  keep_raw: "先保留原始資訊",
  ask_for_more_info: "補問來源或現場資訊",
  send_to_human_review: "交給人工確認",
  create_candidate_report: "建立候選通報",
  create_site_update_suggestion: "建立地點更新建議",
  do_not_use_yet: "暫時不要使用",
};

const evidenceOptions = [
  "原文有明確地點",
  "原文有明確時間",
  "原文有現場回報者",
  "原文有具體需求或狀態",
  "原文指出仍需確認",
];

const blockerOptions = [
  "來源不明或二手轉述",
  "時間不明或可能過期",
  "地點不足以派工",
  "需求內容不夠具體",
  "資訊互相衝突",
  "涉及當事人同意或隱私",
];

function splitChecklistValues(values: string[], options: string[]) {
  return {
    selected: values.filter((value) => options.includes(value)),
    other: values.filter((value) => !options.includes(value)).join("\n"),
  };
}

export function Phase0JudgementCard({
  judgement,
  record,
  hasDraft,
  onCreate,
  onChange,
  onDelete,
  onReset,
}: {
  judgement: Phase0JudgementDraft;
  record: Phase0MessyRecord;
  hasDraft: boolean;
  onCreate: () => void;
  onChange: (judgement: Phase0JudgementDraft) => void;
  onDelete: () => void;
  onReset: () => void;
}) {
  const [editingDraft, setEditingDraft] = useState(judgement);

  useEffect(() => {
    setEditingDraft(judgement);
  }, [judgement, record.id]);

  const hasUnsavedChanges =
    JSON.stringify(editingDraft) !== JSON.stringify(judgement);

  function updateField<Key extends keyof Phase0JudgementDraft>(
    key: Key,
    value: Phase0JudgementDraft[Key],
  ) {
    setEditingDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  }

  function updateChecklist(
    key: "workTypeLabels" | "evidence" | "blockers",
    option: string,
    checked: boolean,
  ) {
    setEditingDraft((currentDraft) => {
      const currentValues = currentDraft[key];
      const nextValues = checked
        ? [...currentValues, option]
        : currentValues.filter((value) => value !== option);

      return { ...currentDraft, [key]: nextValues };
    });
  }

  function updateOtherChecklistValue(
    key: "workTypeLabels" | "evidence" | "blockers",
    options: string[],
    value: string,
  ) {
    const otherValues = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setEditingDraft((currentDraft) => ({
      ...currentDraft,
      [key]: [
        ...currentDraft[key].filter((item) => options.includes(item)),
        ...otherValues,
      ],
    }));
  }

  function saveDraft() {
    onChange(editingDraft);
  }

  return (
    <article className="judgement-card">
      <div className="judgement-card__header">
        <div>
          <p className="eyebrow">整理草稿</p>
          <h3>{hasDraft ? "可編輯候選判斷" : "尚未建立整理草稿"}</h3>
        </div>
        <StatusBadge status={record.verificationStatus} />
      </div>

      {hasDraft ? (
        <p>請只根據原文填寫。若不確定，保留低信心並寫進卡住的地方。</p>
      ) : (
        <p>
          這筆資料還沒有整理草稿。建立後可以編輯候選類型、證據、卡住原因與下一步。
        </p>
      )}

      {!hasDraft ? (
        <button className="primary-action" type="button" onClick={onCreate}>
          建立整理草稿
        </button>
      ) : (
        <>
          <div className="draft-form">
            <label>
              <span>候選類型</span>
              <select
                value={editingDraft.possibleKind}
                onChange={(event) =>
                  updateField(
                    "possibleKind",
                    event.target.value as Phase0JudgementDraft["possibleKind"],
                  )
                }
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>信心程度</span>
              <select
                value={editingDraft.confidence}
                onChange={(event) =>
                  updateField(
                    "confidence",
                    event.target.value as Phase0JudgementDraft["confidence"],
                  )
                }
              >
                {Object.entries(confidenceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>下一步</span>
              <select
                value={editingDraft.suggestedNextStep}
                onChange={(event) =>
                  updateField(
                    "suggestedNextStep",
                    event.target
                      .value as Phase0JudgementDraft["suggestedNextStep"],
                  )
                }
              >
                {Object.entries(nextStepLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <ChecklistGroup
              label="工種要求"
              options={phase0WorkTypeOptions}
              values={editingDraft.workTypeLabels}
              onToggle={(option, checked) =>
                updateChecklist("workTypeLabels", option, checked)
              }
              onOtherChange={(value) =>
                updateOtherChecklistValue(
                  "workTypeLabels",
                  phase0WorkTypeOptions,
                  value,
                )
              }
              placeholder="未列出的工種可填在這裡。"
            />

            <label className="draft-form__wide draft-form__checkbox">
              <span>不可直接行動</span>
              <input
                checked={editingDraft.unsafeToActDirectly}
                type="checkbox"
                onChange={(event) =>
                  updateField("unsafeToActDirectly", event.target.checked)
                }
              />
            </label>

            <ChecklistGroup
              label="整理依據"
              options={evidenceOptions}
              values={editingDraft.evidence}
              onToggle={(option, checked) =>
                updateChecklist("evidence", option, checked)
              }
              onOtherChange={(value) =>
                updateOtherChecklistValue("evidence", evidenceOptions, value)
              }
              placeholder="未列出的整理依據可填在這裡。"
            />

            <ChecklistGroup
              label="卡住的地方"
              options={blockerOptions}
              values={editingDraft.blockers}
              onToggle={(option, checked) =>
                updateChecklist("blockers", option, checked)
              }
              onOtherChange={(value) =>
                updateOtherChecklistValue("blockers", blockerOptions, value)
              }
              placeholder="未列出的卡住原因可填在這裡。"
            />

            <label className="draft-form__wide">
              <span>人工修正或質疑</span>
              <textarea
                placeholder="例如：人工判斷這筆不能直接採取行動，原因是..."
                rows={3}
                value={editingDraft.humanReviewNote ?? ""}
                onChange={(event) =>
                  updateField("humanReviewNote", event.target.value)
                }
              />
            </label>
          </div>

          <div className="draft-actions">
            <button
              className="primary-action"
              disabled={!hasUnsavedChanges}
              type="button"
              onClick={saveDraft}
            >
              儲存草稿
            </button>
            <span className="draft-save-state">
              {hasUnsavedChanges ? "有未儲存變更" : "已儲存"}
            </span>
            <button type="button" onClick={onReset}>
              重設為安全預設
            </button>
            <button type="button" onClick={onDelete}>
              清除草稿
            </button>
          </div>
        </>
      )}
    </article>
  );
}

function ChecklistGroup({
  label,
  options,
  values,
  onToggle,
  onOtherChange,
  placeholder,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (option: string, checked: boolean) => void;
  onOtherChange: (value: string) => void;
  placeholder: string;
}) {
  const { selected, other } = splitChecklistValues(values, options);

  return (
    <fieldset className="draft-form__wide checklist-group">
      <legend>{label}</legend>
      <div className="checklist-options">
        {options.map((option) => (
          <label key={option}>
            <span>{option}</span>
            <input
              checked={selected.includes(option)}
              type="checkbox"
              onChange={(event) => onToggle(option, event.target.checked)}
            />
          </label>
        ))}
      </div>
      <label className="checklist-other">
        <span>其他</span>
        <textarea
          placeholder={placeholder}
          rows={2}
          value={other}
          onChange={(event) => onOtherChange(event.target.value)}
        />
      </label>
    </fieldset>
  );
}
