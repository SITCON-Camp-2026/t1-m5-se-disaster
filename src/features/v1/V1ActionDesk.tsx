import { VersionSwitch } from "../../components/VersionSwitch";
import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import { createV1ActionCard, type V1ActionStatusKey } from "./v1-action-status";

const filterOptions: Array<{ key: V1ActionStatusKey | "all"; label: string }> =
  [
    { key: "all", label: "全部" },
    { key: "do_not_go", label: "先不要出發" },
    { key: "confirm_first", label: "先確認來源" },
    { key: "verify_on_site", label: "可以出發確認資訊" },
    { key: "lead_only", label: "只作為線索" },
  ];

export function V1ActionDesk({ records }: { records: Phase0MessyRecord[] }) {
  const cards = records.map(createV1ActionCard);
  const counts = countByActionStatus(cards);
  const activeFilter = getFilterFromUrl();
  const visibleCards =
    activeFilter === "all"
      ? cards
      : cards.filter((card) => card.actionStatus.key === activeFilter);

  return (
    <main className="layout">
      <header className="hero">
        <div className="hero__top">
          <p className="eyebrow">V1 行動者視角</p>
          <VersionSwitch active="v1" />
        </div>
        <h1>先判斷能不能行動</h1>
        <p>
          這個版本仍只使用 Phase 0
          原始資訊。畫面目標是避免行動者把推測地點、工種或草稿誤認成可直接出發的任務。
        </p>
      </header>

      <section className="v1-summary" aria-label="行動狀態摘要">
        <div className="v1-summary__item v1-summary__item--stop">
          <span>先不要出發</span>
          <strong>{counts.do_not_go}</strong>
        </div>
        <div className="v1-summary__item v1-summary__item--confirm">
          <span>先確認來源</span>
          <strong>{counts.confirm_first}</strong>
        </div>
        <div className="v1-summary__item v1-summary__item--verify">
          <span>可以出發確認資訊</span>
          <strong>{counts.verify_on_site}</strong>
        </div>
        <div className="v1-summary__item v1-summary__item--lead">
          <span>只作為線索</span>
          <strong>{counts.lead_only}</strong>
        </div>
      </section>

      <nav className="tabs" aria-label="行動狀態篩選">
        {filterOptions.map((option) => (
          <a
            className={activeFilter === option.key ? "active" : ""}
            href={`${import.meta.env.BASE_URL}?view=v1&filter=${option.key}`}
            key={option.key}
          >
            {option.label}
          </a>
        ))}
      </nav>

      <section className="v1-list" aria-label="行動者資訊列表">
        {visibleCards.map((card) => (
          <article className="v1-card" key={card.record.id}>
            <div
              className={`v1-action-banner v1-action-banner--${card.actionStatus.key}`}
            >
              <span>目前判斷</span>
              <strong>{card.actionStatus.label}</strong>
            </div>

            <div className="v1-card__header">
              <h2>{card.record.id}</h2>
              <div className="badge-stack">
                <StatusBadge status={card.record.verificationStatus} />
                <SourceLabel sourceType={card.record.sourceType} />
              </div>
            </div>

            <dl className="v1-card__facts">
              <div>
                <dt>可能工種</dt>
                <dd>{card.workType.label}</dd>
              </div>
              <div>
                <dt>推測地點</dt>
                <dd>{card.location}，不是可直接前往地址</dd>
              </div>
              <div>
                <dt>下一步</dt>
                <dd>{card.actionStatus.nextStep}</dd>
              </div>
              <div>
                <dt>現場幫手要做什麼</dt>
                <dd>{card.actionStatus.helperAction}</dd>
              </div>
            </dl>

            <p className="v1-card__raw">{card.record.rawText}</p>

            <section className="v1-card__warnings">
              <h3>行動前要看到的提醒</h3>
              <ul>
                {card.actionStatus.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
                <li>更新：{formatDateTime(card.record.updatedAt)}</li>
              </ul>
            </section>
          </article>
        ))}
      </section>
    </main>
  );
}

function getFilterFromUrl(): V1ActionStatusKey | "all" {
  const filter = new URLSearchParams(window.location.search).get("filter");

  if (
    filter === "do_not_go" ||
    filter === "confirm_first" ||
    filter === "verify_on_site" ||
    filter === "lead_only"
  ) {
    return filter;
  }

  return "all";
}

function countByActionStatus(
  cards: Array<ReturnType<typeof createV1ActionCard>>,
) {
  return cards.reduce(
    (counts, card) => ({
      ...counts,
      [card.actionStatus.key]: counts[card.actionStatus.key] + 1,
    }),
    {
      do_not_go: 0,
      confirm_first: 0,
      verify_on_site: 0,
      lead_only: 0,
    },
  );
}
