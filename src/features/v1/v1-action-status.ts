import { assessPhase0Quality } from "../phase-0/phase0-quality";
import { inferPhase0Location } from "../phase-0/phase0-sort";
import { inferPhase0WorkType } from "../phase-0/phase0-work-type";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";

export type V1ActionStatusKey =
  | "confirmed_task"
  | "do_not_go"
  | "confirm_first"
  | "verify_on_site"
  | "lead_only";

export type V1ActionStatus = {
  key: V1ActionStatusKey;
  label: string;
  nextStep: string;
  helperAction: string;
  reasons: string[];
};

export function assessV1ActionStatus(
  record: Phase0MessyRecord,
): V1ActionStatus {
  const quality = assessPhase0Quality(record);
  const reasons = [...quality.reasons];

  if (record.verificationStatus === "verified") {
    return {
      key: "confirmed_task",
      label: "已確認任務",
      nextStep:
        "依人工確認後的任務內容執行；若現場指揮更新，依最新人工指示調整。",
      helperAction: createConfirmedTaskAction(record),
      reasons:
        reasons.length > 0
          ? reasons
          : ["這筆資訊已標示為人工確認完成，可用確定任務語氣呈現。"],
    };
  }

  if (record.verificationStatus === "unverified") {
    return {
      key: "do_not_go",
      label: "先不要出發",
      nextStep: "先不要前往現場；把這筆資料交給整理者補來源、時間與地點。",
      helperAction: "留在待命狀態，不出發、不帶物資、不揪人。",
      reasons: reasons.length > 0 ? reasons : ["目前不是已查核資訊。"],
    };
  }

  if (canVerifyOnSite(record)) {
    return {
      key: "verify_on_site",
      label: "僅可前往核對",
      nextStep: "這不是正式派工，也不是安全保證；只代表資訊可被核對。",
      helperAction: createVerificationAction(record),
      reasons:
        reasons.length > 0
          ? reasons
          : ["來源是現場或志工更新，且文字中有明確時間與可核對地點。"],
    };
  }

  if (
    record.rawText.includes("不知道") ||
    record.rawText.includes("不確定") ||
    record.rawText.includes("尚未確認") ||
    record.rawText.includes("另一位") ||
    record.rawText.includes("留言") ||
    record.rawText.includes("可能") ||
    record.rawText.includes("疑似") ||
    record.rawText.includes("無法確認") ||
    record.rawText.includes("沒有說") ||
    record.sourceType === "social_post" ||
    record.sourceType === "phone_call"
  ) {
    return {
      key: "confirm_first",
      label: "先確認來源",
      nextStep:
        "若可聯絡，再請回報者或值守人員補充；若無法聯絡，交由整理者標記缺口。",
      helperAction: "打電話、傳訊息或請現場值守者回覆；不要自行前往處理。",
      reasons:
        reasons.length > 0
          ? reasons
          : ["原文含有轉述、不確定或仍待確認的內容。"],
    };
  }

  return {
    key: "lead_only",
    label: "只作為線索",
    nextStep: "整理者可以拿來排下一輪查證；現場幫手暫時不用動作。",
    helperAction: "等待整理者補資料或合併到其他已確認資訊，不要依此出發。",
    reasons:
      reasons.length > 0 ? reasons : ["資料線索較完整，但尚未進入可行動流程。"],
  };
}

export function createV1ActionCard(record: Phase0MessyRecord) {
  return {
    record,
    actionStatus: assessV1ActionStatus(record),
    location: inferPhase0Location(record),
    workType: inferPhase0WorkType(record),
  };
}

function canVerifyOnSite(record: Phase0MessyRecord) {
  const hasFieldSource =
    record.sourceType === "field_report" ||
    record.sourceType === "volunteer_update";
  const hasTime = /\d{1,2}:\d{2}/.test(record.rawText);
  const hasClearPlace =
    record.rawText.includes("光復車站") ||
    record.rawText.includes("溪畔活動中心") ||
    record.rawText.includes("大進路口");
  const hasBlockingUncertainty =
    record.rawText.includes("不知道") ||
    record.rawText.includes("不確定") ||
    record.rawText.includes("尚未確認") ||
    record.rawText.includes("另一位") ||
    record.rawText.includes("留言") ||
    record.rawText.includes("可能") ||
    record.rawText.includes("疑似") ||
    record.rawText.includes("無法確認") ||
    record.rawText.includes("沒有說");

  return hasFieldSource && hasTime && hasClearPlace && !hasBlockingUncertainty;
}

function createVerificationAction(record: Phase0MessyRecord) {
  const location = inferPhase0Location(record);
  const workType = inferPhase0WorkType(record);

  if (workType.tone === "supply") {
    return `若已由人工安排現場幫手，僅可核對 ${location} 的物資數量、尺寸與不收項目，再回報整理者更新。`;
  }

  if (workType.tone === "notice") {
    return `若已由人工安排現場幫手，僅可核對 ${location} 的現場公告是否仍有效，再回報整理者。`;
  }

  if (workType.tone === "action") {
    return `若已由人工安排現場幫手，僅可核對 ${location} 的集合點、報到規則與需求狀態。`;
  }

  return `若已由人工安排現場幫手，僅可核對 ${location} 相關資訊是否仍有效，再回報整理者。`;
}

function createConfirmedTaskAction(record: Phase0MessyRecord) {
  const location = inferPhase0Location(record);
  const workType = inferPhase0WorkType(record);

  if (workType.tone === "supply") {
    return `前往 ${location} 執行已確認的物資任務，依現場人工指示處理品項與數量。`;
  }

  if (workType.tone === "notice") {
    return `依已確認公告執行現場資訊更新，並同步回報公告狀態。`;
  }

  if (workType.tone === "action") {
    return `前往 ${location} 執行已確認的現場協助任務，依現場人工指揮行動。`;
  }

  return `依人工確認後的任務內容行動，並在完成或遇到變更時回報整理者。`;
}
