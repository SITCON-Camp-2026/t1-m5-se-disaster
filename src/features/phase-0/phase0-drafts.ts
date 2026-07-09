import { createPhase0Judgement } from "./phase0-heuristics";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";
import { inferPhase0WorkType } from "./phase0-work-type";

export function createPhase0Draft(
  record: Phase0MessyRecord,
): Phase0JudgementDraft {
  return {
    ...createPhase0Judgement(record),
    workTypeLabels: [inferPhase0WorkType(record).label],
    evidence: [],
    blockers: [],
    humanReviewNote: "",
  };
}

export function createInitialDrafts(
  records: Phase0MessyRecord[],
): Record<string, Phase0JudgementDraft> {
  return Object.fromEntries(
    records.slice(0, 6).map((record) => [record.id, createPhase0Draft(record)]),
  );
}
