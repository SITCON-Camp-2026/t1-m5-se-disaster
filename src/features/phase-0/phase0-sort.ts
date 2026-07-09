import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

export type Phase0SortKey =
  | "updatedAtDesc"
  | "location"
  | "credibility"
  | "nextStep"
  | "draftStatus";

export const phase0SortOptions: Array<{ key: Phase0SortKey; label: string }> =
  [
    { key: "updatedAtDesc", label: "時間：最新在前" },
    { key: "location", label: "推測地點" },
    { key: "credibility", label: "可信度" },
    { key: "nextStep", label: "任務方式 / 下一步" },
    { key: "draftStatus", label: "草稿狀態" },
  ];

const locationPatterns: Array<{ label: string; pattern: RegExp }> = [
  { label: "光復車站", pattern: /光復車站|車站/u },
  { label: "溪畔活動中心", pattern: /溪畔活動中心|活動中心/u },
  { label: "老街", pattern: /老街/u },
  { label: "大進路口", pattern: /大進路口/u },
  { label: "學校", pattern: /學校|側門/u },
  { label: "A 區", pattern: /A 區/u },
];

const locationOrder = Object.fromEntries(
  locationPatterns.map((location, index) => [location.label, index]),
);

const credibilityOrder: Record<string, number> = {
  verified: 0,
  needs_review: 1,
  unverified: 2,
};

const nextStepOrder: Record<Phase0JudgementDraft["suggestedNextStep"], number> =
  {
    create_candidate_report: 0,
    create_site_update_suggestion: 1,
    ask_for_more_info: 2,
    send_to_human_review: 3,
    keep_raw: 4,
    do_not_use_yet: 5,
  };

function draftStatusOrder(draft?: Phase0JudgementDraft): number {
  if (draft?.humanReviewNote?.trim()) {
    return 0;
  }

  if (draft) {
    return 1;
  }

  return 2;
}

export function inferPhase0Location(record: Phase0MessyRecord): string {
  return (
    locationPatterns.find((location) => location.pattern.test(record.rawText))
      ?.label ?? "地點不明"
  );
}

export function sortPhase0Records(
  records: Phase0MessyRecord[],
  sortKey: Phase0SortKey,
  drafts: Record<string, Phase0JudgementDraft>,
): Phase0MessyRecord[] {
  return [...records].sort((left, right) => {
    if (sortKey === "updatedAtDesc") {
      return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    }

    if (sortKey === "location") {
      const leftLocation = inferPhase0Location(left);
      const rightLocation = inferPhase0Location(right);

      if (leftLocation === "地點不明" && rightLocation !== "地點不明") {
        return 1;
      }

      if (rightLocation === "地點不明" && leftLocation !== "地點不明") {
        return -1;
      }

      return (
        (locationOrder[leftLocation] ?? 99) -
        (locationOrder[rightLocation] ?? 99)
      );
    }

    if (sortKey === "credibility") {
      return (
        (credibilityOrder[left.verificationStatus] ?? 99) -
        (credibilityOrder[right.verificationStatus] ?? 99)
      );
    }

    if (sortKey === "draftStatus") {
      return (
        draftStatusOrder(drafts[left.id]) - draftStatusOrder(drafts[right.id])
      );
    }

    const leftStep = drafts[left.id]?.suggestedNextStep ?? "send_to_human_review";
    const rightStep =
      drafts[right.id]?.suggestedNextStep ?? "send_to_human_review";

    return (nextStepOrder[leftStep] ?? 99) - (nextStepOrder[rightStep] ?? 99);
  });
}
