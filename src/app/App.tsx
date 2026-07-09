import { useMemo, useState } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import { EmptyState } from "../components/EmptyState";
import { VersionSwitch } from "../components/VersionSwitch";
import { Phase0RawInfoPanel } from "../features/phase-0/Phase0RawInfoPanel";
import { createInitialDrafts } from "../features/phase-0/phase0-drafts";
import { Phase0Workbench } from "../features/phase-0/Phase0Workbench";
import { V1ActionDesk } from "../features/v1/V1ActionDesk";
import {
  phase0SortOptions,
  sortPhase0Records,
  type Phase0SortKey,
} from "../features/phase-0/phase0-sort";
import type { Phase0MessyRecord } from "../features/phase-0/phase0-types";

type TabKey = "raw" | "workbench";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "raw", label: "原始資訊" },
  { key: "workbench", label: "整理工作台" },
];

const phase0Records = messyReports satisfies Phase0MessyRecord[];

export function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isV1 =
    searchParams.get("view") === "v1" ||
    window.location.pathname.endsWith("/v1/");
  const [activeTab, setActiveTab] = useState<TabKey>("raw");
  const [selectedRecordId, setSelectedRecordId] = useState(
    phase0Records[0]?.id ?? "",
  );
  const [drafts, setDrafts] = useState(() =>
    createInitialDrafts(phase0Records),
  );
  const [sortKey, setSortKey] = useState<Phase0SortKey>("updatedAtDesc");
  const sortedRecords = useMemo(
    () => sortPhase0Records(phase0Records, sortKey, drafts),
    [sortKey, drafts],
  );

  function selectForWorkbench(recordId: string) {
    setSelectedRecordId(recordId);
    setActiveTab("workbench");
  }

  if (isV1) {
    return <V1ActionDesk records={phase0Records} />;
  }

  return (
    <main className="layout">
      <header className="hero">
        <div className="hero__top">
          <p className="eyebrow">SITCON Camp 2026</p>
          <VersionSwitch active="phase0" />
        </div>
        <h1>災害資訊整理工作台</h1>
        <p>
          第一階段先用 coding agent
          做出可展示的前端原型，再從成果中看見資料品質、角色、狀態與來源的限制。
        </p>
      </header>

      <nav className="tabs" aria-label="第一階段工作區">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="toolbar" aria-label="排序與分類">
        <label>
          <span>排序依據</span>
          <select
            value={sortKey}
            onChange={(event) =>
              setSortKey(event.target.value as Phase0SortKey)
            }
          >
            {phase0SortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="panel">
        {phase0Records.length === 0 ? (
          <EmptyState message="目前沒有資料" />
        ) : activeTab === "raw" ? (
          <Phase0RawInfoPanel
            records={sortedRecords}
            selectedRecordId={selectedRecordId}
            onSelect={selectForWorkbench}
            drafts={drafts}
          />
        ) : (
          <Phase0Workbench
            records={sortedRecords}
            selectedRecordId={selectedRecordId}
            onSelect={setSelectedRecordId}
            drafts={drafts}
            setDrafts={setDrafts}
          />
        )}
      </section>
    </main>
  );
}
