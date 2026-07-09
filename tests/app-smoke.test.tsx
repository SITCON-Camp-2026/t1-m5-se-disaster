import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "排序依據" })).toHaveValue(
      "updatedAtDesc",
    );
  });

  it("sorts phase 0 records by inferred location", () => {
    render(<App />);

    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "M-012",
    );

    fireEvent.change(screen.getByRole("combobox", { name: "排序依據" }), {
      target: { value: "location" },
    });

    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "M-001",
    );
    expect(screen.getAllByText(/推測地點：/).length).toBeGreaterThan(0);
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText(
        "第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("shows editable phase 0 drafts in the workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("可編輯候選判斷")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "候選類型" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "重設為安全預設" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "儲存草稿" }),
    ).toBeDisabled();
    expect(screen.getByText("整理依據")).toBeInTheDocument();
    expect(screen.getByLabelText("原文有明確地點")).toBeInTheDocument();
    expect(screen.getByText("卡住的地方")).toBeInTheDocument();
    expect(screen.getByLabelText("地點不足以派工")).toBeInTheDocument();
    expect(screen.getAllByText("已有草稿").length).toBeGreaterThan(0);
  });

  it("marks records by draft status", () => {
    render(<App />);

    expect(screen.getAllByText("已有草稿").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未建立草稿").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.change(screen.getByLabelText("人工修正或質疑"), {
      target: { value: "人工判斷：不能直接採取行動。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "儲存草稿" }));

    expect(screen.getAllByText("有人類修正").length).toBeGreaterThan(0);
  });

  it("sorts records by draft status", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.change(screen.getByLabelText("人工修正或質疑"), {
      target: { value: "人工修正：優先確認。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "儲存草稿" }));

    fireEvent.change(screen.getByRole("combobox", { name: "排序依據" }), {
      target: { value: "draftStatus" },
    });
    fireEvent.click(screen.getByRole("button", { name: "原始資訊" }));

    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "M-001",
    );
    expect(screen.getAllByText("有人類修正")[0]).toBeInTheDocument();
  });

  it("keeps draft edits when switching between phase 0 tabs", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    const confidenceSelect = screen.getByRole("combobox", {
      name: "信心程度",
    });
    fireEvent.change(confidenceSelect, { target: { value: "medium" } });
    expect(screen.getByText("有未儲存變更")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "儲存草稿" }));

    fireEvent.click(screen.getByRole("button", { name: "原始資訊" }));
    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByRole("combobox", { name: "信心程度" }),
    ).toHaveValue("medium");
  });
});
