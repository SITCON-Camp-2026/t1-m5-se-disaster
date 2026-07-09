import { useMemo, type Dispatch, type SetStateAction } from "react";
import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { DraftBadge } from "./DraftBadge";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { createPhase0Judgement } from "./phase0-heuristics";
import { inferPhase0WorkType } from "./phase0-work-type";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

export function createInitialDrafts(
  records: Phase0MessyRecord[],
): Record<string, Phase0JudgementDraft> {
  return Object.fromEntries(
    records.slice(0, 6).map((record) => [
      record.id,
      {
        ...createPhase0Judgement(record),
        workTypeLabels: [inferPhase0WorkType(record).label],
        evidence: [],
        blockers: [],
        humanReviewNote: "",
      },
    ]),
  );
}

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
  drafts,
  setDrafts,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  drafts: Record<string, Phase0JudgementDraft>;
  setDrafts: Dispatch<SetStateAction<Record<string, Phase0JudgementDraft>>>;
}) {
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const fallbackDraft = useMemo(
    () => createPhase0Judgement(selectedRecord),
    [selectedRecord],
  );
  const selectedDraft = drafts[selectedRecord.id] ?? fallbackDraft;

  function createDraft(record: Phase0MessyRecord) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [record.id]: {
        ...createPhase0Judgement(record),
        workTypeLabels: [inferPhase0WorkType(record).label],
        evidence: [],
        blockers: [],
        humanReviewNote: "",
      },
    }));
  }

  function updateSelectedDraft(nextDraft: Phase0JudgementDraft) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedRecord.id]: nextDraft,
    }));
  }

  function deleteSelectedDraft() {
    setDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[selectedRecord.id];
      return nextDrafts;
    });
  }

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <h2>第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。</h2>
        <p>
          這裡先只標示安全邊界，真正的候選判斷要由小組和 coding agent
          補上；這不是 runtime LLM 分析，也不是正式資料模型。
        </p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          {records.map((record) => (
            <button
              className={record.id === selectedRecord.id ? "active" : ""}
              key={record.id}
              type="button"
              onClick={() => onSelect(record.id)}
            >
              <span>{record.id}</span>
              <StatusBadge status={record.verificationStatus} />
              <DraftBadge draft={drafts[record.id]} />
            </button>
          ))}
        </aside>

        <div className="workbench__main">
          <RecordCard record={selectedRecord} draft={drafts[selectedRecord.id]} />

          <Phase0JudgementCard
            judgement={selectedDraft}
            record={selectedRecord}
            hasDraft={selectedRecord.id in drafts}
            onCreate={() => createDraft(selectedRecord)}
            onChange={updateSelectedDraft}
            onDelete={deleteSelectedDraft}
            onReset={() => createDraft(selectedRecord)}
          />
        </div>
      </div>
    </div>
  );
}
