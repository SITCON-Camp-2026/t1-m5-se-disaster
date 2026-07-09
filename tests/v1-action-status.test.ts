import { describe, expect, it } from "vitest";
import { assessV1ActionStatus } from "../src/features/v1/v1-action-status";
import type { Phase0MessyRecord } from "../src/features/phase-0/phase0-types";

function record(overrides: Partial<Phase0MessyRecord>): Phase0MessyRecord {
  return {
    id: "T-001",
    rawText:
      "14:20 現場志工在光復車站東側出口回報：臨時集合點目前仍開放，只接受已完成報到的清淤志工。",
    sourceType: "field_report",
    verificationStatus: "needs_review",
    updatedAt: "2026-07-20T14:20:00+08:00",
    ...overrides,
  };
}

describe("v1 action status", () => {
  it("shows verified records as confirmed tasks", () => {
    const status = assessV1ActionStatus(
      record({ verificationStatus: "verified" }),
    );

    expect(status.key).toBe("confirmed_task");
    expect(status.label).toBe("已確認任務");
    expect(status.helperAction).toContain("執行已確認");
  });

  it("keeps unverified records from becoming tasks", () => {
    const status = assessV1ActionStatus(
      record({ verificationStatus: "unverified" }),
    );

    expect(status.key).toBe("do_not_go");
  });

  it("does not allow uncertain text to become on-site verification", () => {
    const status = assessV1ActionStatus(
      record({
        rawText:
          "14:20 現場志工在光復車站東側出口回報：臨時集合點可能仍開放，但尚未確認。",
      }),
    );

    expect(status.key).toBe("confirm_first");
  });

  it("allows clear field reports only as verification before confirmation", () => {
    const status = assessV1ActionStatus(record({}));

    expect(status.key).toBe("verify_on_site");
    expect(status.label).toBe("僅可前往核對");
    expect(status.nextStep).toContain("不是正式派工");
  });
});
