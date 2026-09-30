"use client";

import React from "react";
import { Settings, FileSpreadsheet, Sparkles } from "lucide-react";
import { WordCard } from "@/types/word";
import { exportCardsToCSV } from "@/lib/excel";

interface NavbarProps {
  cards: WordCard[];
  onOpenSettings: () => void;
}

export function Navbar({ cards, onOpenSettings }: NavbarProps) {
  const handleExport = () => {
    if (cards.length === 0) {
      alert("当前没有词汇卡片可导出");
      return;
    }
    const filename = `korean_vocab_${new Date().toISOString().slice(0, 10)}.csv`;
    exportCardsToCSV(cards, filename);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
          M
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-semibold tracking-tight text-stone-900">
              SnapWord
            </h1>
            <span className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
              MVP
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-normal">
            课本生词极速提取 · 共 {cards.length} 词
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* 导出到 Excel 按钮 */}
        <button
          onClick={handleExport}
          title="导出到 Excel (CSV)"
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors active:scale-95 flex items-center gap-1 text-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline font-medium text-stone-700">导出</span>
        </button>

        {/* 设置按钮 */}
        <button
          onClick={onOpenSettings}
          title="AI 接口与密钥设置"
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
