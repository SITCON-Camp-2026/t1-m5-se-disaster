import { SourceLabel } from "./SourceLabel";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../lib/date";
import { assessPhase0Quality } from "../features/phase-0/phase0-quality";
import { inferPhase0Location } from "../features/phase-0/phase0-sort";
import { DraftBadge } from "../features/phase-0/DraftBadge";
import {
  inferPhase0WorkType,
  toneForPhase0WorkType,
} from "../features/phase-0/phase0-work-type";
import type { Phase0JudgementDraft } from "../features/phase-0/phase0-types";

type RecordLike = {
  id: string;
  title?: string;
  name?: string;
  rawText?: string;
  description?: string;
  sourceType: string;
  verificationStatus: string;
  updatedAt: string;
};

export function RecordCard({
  record,
  draft,
}: {
  record: RecordLike;
  draft?: Phase0JudgementDraft;
}) {
  const title = record.title ?? record.name ?? record.id;
  const description = record.rawText ?? record.description;
  const quality =
    record.rawText === undefined
      ? null
      : assessPhase0Quality({
          id: record.id,
          rawText: record.rawText,
          sourceType: record.sourceType,
          verificationStatus: record.verificationStatus,
          updatedAt: record.updatedAt,
        });
  const inferredLocation =
    record.rawText === undefined
      ? null
      : inferPhase0Location({
          id: record.id,
          rawText: record.rawText,
          sourceType: record.sourceType,
          verificationStatus: record.verificationStatus,
          updatedAt: record.updatedAt,
        });
  const inferredWorkType =
    record.rawText === undefined
      ? null
      : inferPhase0WorkType({
          id: record.id,
          rawText: record.rawText,
          sourceType: record.sourceType,
          verificationStatus: record.verificationStatus,
          updatedAt: record.updatedAt,
        });
  const workTypeLabels =
    draft?.workTypeLabels.length && draft.workTypeLabels.length > 0
      ? draft.workTypeLabels
      : inferredWorkType
        ? [inferredWorkType.label]
        : [];
  const workTypeTone =
    workTypeLabels.length > 0
      ? toneForPhase0WorkType(workTypeLabels[0])
      : "review";

  return (
    <article
      className={
        quality
          ? `record-card record-card--risk-${quality.riskLevel}`
          : "record-card"
      }
    >
      <div className="record-card__header">
        <h3>{title}</h3>
        <div className="badge-stack">
          <StatusBadge status={record.verificationStatus} />
          <DraftBadge draft={draft} />
        </div>
      </div>
      {workTypeLabels.length > 0 ? (
        <div className={`work-type-banner work-type-banner--${workTypeTone}`}>
          <span>工種要求</span>
          <strong>{workTypeLabels.join("、")}</strong>
        </div>
      ) : null}
      {description ? <p>{description}</p> : null}
      {quality ? (
        <section className="record-card__quality" aria-label="資料品質提示">
          <strong>{quality.headline}</strong>
          {quality.reasons.length > 0 ? (
            <ul>
              {quality.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
      <div className="record-card__meta">
        <SourceLabel sourceType={record.sourceType} />
        {inferredLocation ? <span>推測地點：{inferredLocation}</span> : null}
        <span>更新：{formatDateTime(record.updatedAt)}</span>
      </div>
    </article>
  );
}
