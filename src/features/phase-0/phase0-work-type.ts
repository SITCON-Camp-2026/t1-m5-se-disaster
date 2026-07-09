import type { Phase0MessyRecord } from "./phase0-types";

export type Phase0WorkTypeTone = "action" | "supply" | "notice" | "review";

export type Phase0WorkType = {
  label: string;
  tone: Phase0WorkTypeTone;
};

const workTypeRules: Array<{
  label: string;
  tone: Phase0WorkTypeTone;
  pattern: RegExp;
}> = [
  { label: "清淤 / 挖土", tone: "action", pattern: /清泥|清淤|鏟子/u },
  { label: "水電支援", tone: "action", pattern: /水電|檢修/u },
  { label: "物資補給", tone: "supply", pattern: /雨鞋|飲用水|物資|二手衣物/u },
  { label: "公告 / 交通資訊", tone: "notice", pattern: /公告|封閉|開放|不要送/u },
  { label: "集合點確認", tone: "review", pattern: /集合點|報到|入口/u },
  { label: "搬運協助", tone: "action", pattern: /搬動|家具/u },
  { label: "藥品協助", tone: "supply", pattern: /藥品/u },
];

export const phase0WorkTypeOptions = workTypeRules.map((rule) => rule.label);

export function inferPhase0WorkType(record: Phase0MessyRecord): Phase0WorkType {
  const matchedRule = workTypeRules.find((rule) =>
    rule.pattern.test(record.rawText),
  );

  if (matchedRule) {
    return {
      label: matchedRule.label,
      tone: matchedRule.tone,
    };
  }

  return {
    label: "工種待確認",
    tone: "review",
  };
}

export function toneForPhase0WorkType(label: string): Phase0WorkTypeTone {
  return workTypeRules.find((rule) => rule.label === label)?.tone ?? "review";
}
