import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import { DraftBadge } from "./DraftBadge";
import { assessPhase0Quality } from "./phase0-quality";
import { inferPhase0Location } from "./phase0-sort";
import { inferPhase0WorkType, toneForPhase0WorkType } from "./phase0-work-type";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

export function Phase0RawInfoPanel({
  records,
  selectedRecordId,
  onSelect,
  drafts,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  drafts: Record<string, Phase0JudgementDraft>;
}) {
  return (
    <div className="phase0-raw">
      <div className="panel__header">
        <div>
          <h2>原始資訊</h2>
          <p>這些還不是整理後資料，不能直接當成行動依據。</p>
        </div>
        <p>{records.length} 筆資料</p>
      </div>

      <div className="grid">
        {records.map((record) => {
          const quality = assessPhase0Quality(record);
          const inferredLocation = inferPhase0Location(record);
          const inferredWorkType = inferPhase0WorkType(record);
          const workTypeLabels =
            drafts[record.id]?.workTypeLabels.length &&
            drafts[record.id].workTypeLabels.length > 0
              ? drafts[record.id].workTypeLabels
              : [inferredWorkType.label];
          const workTypeTone = toneForPhase0WorkType(workTypeLabels[0]);

          return (
            <article
              className={`record-card record-card--risk-${quality.riskLevel} ${
                record.id === selectedRecordId ? "record-card--selected" : ""
              }`}
              key={record.id}
            >
              <div className="record-card__header">
                <h3>{record.id}</h3>
                <div className="badge-stack">
                  <StatusBadge status={record.verificationStatus} />
                  <DraftBadge draft={drafts[record.id]} />
                </div>
              </div>
              <div
                className={`work-type-banner work-type-banner--${workTypeTone}`}
              >
                <span>工種要求</span>
                <strong>{workTypeLabels.join("、")}</strong>
              </div>
              <p>{record.rawText}</p>
              <section
                className="record-card__quality"
                aria-label="資料品質提示"
              >
                <strong>{quality.headline}</strong>
                {quality.reasons.length > 0 ? (
                  <ul>
                    {quality.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
              <div className="record-card__meta">
                <SourceLabel sourceType={record.sourceType} />
                <span>推測地點：{inferredLocation}</span>
                <span>更新：{formatDateTime(record.updatedAt)}</span>
              </div>
              <button type="button" onClick={() => onSelect(record.id)}>
                送到整理工作台
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
