"use client";

import React, { useState, useEffect } from "react";
import { List, Layers, CheckCircle2 } from "lucide-react";
import { WordCard } from "@/types/word";
import {
  getStoredCards,
  saveCards,
  appendCards,
  INITIAL_DEMO_CARDS,
} from "@/lib/storage";
import { Navbar } from "@/components/Navbar";
import { Uploader } from "@/components/Uploader";
import { ListView } from "@/components/ListView";
import { SwipeView } from "@/components/SwipeView";
import { SettingsModal } from "@/components/SettingsModal";

type ViewMode = "list" | "swipe";

export default function Home() {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("swipe");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 初始化从 LocalStorage 读取
  useEffect(() => {
    const stored = getStoredCards();
    setCards(stored);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 模式 A: 上传图片后追加新单词
  const handleUploadSuccess = (newCards: WordCard[]) => {
    const updated = appendCards(newCards);
    setCards(updated);
    showToast(`成功提取并追加了 ${newCards.length} 个重点单词！`);
  };

  // 删除单张卡片
  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    saveCards(updated);
  };

  // 清空所有卡片
  const handleClearAll = () => {
    setCards([]);
    saveCards([]);
    showToast("卡片已全部清空");
  };

  // 重置回韩语演示词库
  const handleResetDemo = () => {
    setCards(INITIAL_DEMO_CARDS);
    saveCards(INITIAL_DEMO_CARDS);
    showToast("已重置为韩语演示词库");
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 顶部导航 */}
      <Navbar
        cards={cards}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 拍照 / 上传课本区域 */}
      <Uploader
        onSuccess={handleUploadSuccess}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 视图切换 Toggle 导航条 */}
      <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200/70 flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500">浏览视图</span>
        <div className="bg-stone-200/80 p-0.5 rounded-xl flex items-center shadow-inner">
          <button
            onClick={() => setViewMode("swipe")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "swipe"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>卡片滑动</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>列表查看</span>
          </button>
        </div>
      </div>

      {/* 主视图区域 */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-stone-50/50">
        {viewMode === "swipe" ? (
          <SwipeView
            key={cards.length > 0 ? `${cards[0].id}-${cards.length}` : "empty"}
            cards={cards}
          />
        ) : (
          <ListView cards={cards} onDeleteCard={handleDeleteCard} />
        )}
      </main>

      {/* Toast 提示弹条 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearAllCards={handleClearAll}
        onResetDemoCards={handleResetDemo}
      />
    </div>
  );
}
