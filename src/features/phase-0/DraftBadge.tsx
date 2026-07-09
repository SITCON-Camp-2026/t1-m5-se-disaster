import type { Phase0JudgementDraft } from "./phase0-types";

export function DraftBadge({ draft }: { draft?: Phase0JudgementDraft }) {
  if (!draft) {
    return <span className="draft-badge draft-badge--empty">未建立草稿</span>;
  }

  if (draft.humanReviewNote?.trim()) {
    return (
      <span className="draft-badge draft-badge--reviewed">有人類修正</span>
    );
  }

  return <span className="draft-badge draft-badge--exists">已有草稿</span>;
}
