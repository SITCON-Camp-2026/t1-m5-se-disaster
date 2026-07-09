import type { Phase0MessyRecord } from "./phase0-types";

export type Phase0RiskLevel = "danger" | "warning" | "info" | "ok";

export type Phase0QualitySignal = {
  riskLevel: Phase0RiskLevel;
  headline: string;
  reasons: string[];
  missingSignals: string[];
};

const missingChecks: Array<{
  label: string;
  pattern: RegExp;
}> = [
  {
    label: "明確地點",
    pattern:
      /車站|活動中心|老街|路口|學校|側門|集合點|住家|地址|A 區|東側出口|服務台/u,
  },
  {
    label: "可判斷時間",
    pattern: /早上|下午|中午|昨天|今天|剛剛|\d{1,2}:\d{2}|更新|預計/u,
  },
  {
    label: "當事人或回報者",
    pattern: /現場|志工|值守|回報者|長者|家屬|來電者|工班|有人/u,
  },
  {
    label: "具體需求或狀態",
    pattern:
      /需要|不缺|還有|剩|開放|封閉|支援|協助|不要|不再|登記|確認|任務/u,
  },
];

export function assessPhase0Quality(
  record: Phase0MessyRecord,
): Phase0QualitySignal {
  const reasons: string[] = [];
  const missingSignals = missingChecks
    .filter((check) => !check.pattern.test(record.rawText))
    .map((check) => check.label);

  if (record.sourceType === "social_post") {
    reasons.push("社群轉錄容易遺失原始脈絡，需要追來源。");
  }

  if (missingSignals.length > 0) {
    reasons.push(`缺少或不明確：${missingSignals.join("、")}。`);
  }

  if (record.rawText.includes("不知道") || record.rawText.includes("不確定")) {
    reasons.push("原文已表明有不確定資訊。");
  }

  if (record.rawText.includes("尚未確認")) {
    reasons.push("原文指出仍有事項尚未確認。");
  }

  if (record.rawText.includes("另一位") || record.rawText.includes("留言")) {
    reasons.push("原文含有互相衝突或二手說法。");
  }

  if (record.verificationStatus === "verified" && missingSignals.length === 0) {
    return {
      riskLevel: "ok",
      headline: "已確認資料",
      reasons: reasons.length > 0 ? reasons : ["欄位訊號較完整，仍需人工判斷用途。"],
      missingSignals,
    };
  }

  if (record.verificationStatus === "unverified") {
    return {
      riskLevel: "danger",
      headline: "未查核，不可直接行動",
      reasons,
      missingSignals,
    };
  }

  if (record.verificationStatus === "needs_review") {
    return {
      riskLevel: "warning",
      headline: "待人工確認",
      reasons,
      missingSignals,
    };
  }

  return {
    riskLevel: "info",
    headline: "需要補充判斷",
    reasons,
    missingSignals,
  };
}
