"use client";

import React, { useState, useEffect } from "react";
import { Volume2, ArrowLeft, ArrowRight, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import { WordCard } from "@/types/word";
import { speakWord } from "@/lib/tts";

interface SwipeViewProps {
  cards: WordCard[];
}

export function SwipeView({ cards }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // 当外部 cards 列表发生变化（如新上传或重置）时，安全修正当前索引
  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0) {
      setCurrentIndex(0);
    }
  }, [cards.length, currentIndex]);

  const activeCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  // 纯原生触摸/鼠标轻扫监听，端正无歪斜，绝对可靠
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    // 划动超过 50px 切换卡片
    if (diff < -50) {
      handleNext(); // 向左滑 -> 看下一个
    } else if (diff > 50) {
      handlePrev(); // 向右滑 -> 看上一个
    }
    setTouchStartX(null);
  };

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300 mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-stone-600">暂无卡片</p>
        <p className="text-xs text-stone-400 mt-1">请先上传课本截图提取词汇</p>
      </div>
    );
  }

  // 已经浏览完所有卡片
  if (currentIndex >= cards.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-700 mb-4 shadow-inner">
          <Sparkles className="w-8 h-8 text-stone-600" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900">恭喜！全部浏览完毕</h3>
        <p className="text-xs text-stone-500 mt-1.5 max-w-[240px]">
          本批次共 {cards.length} 个重点词汇已通读。可以从头再看一遍，或在右上角导出为 Excel 表格复习。
        </p>

        <button
          onClick={handleReset}
          className="mt-6 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重新从头浏览
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between p-4 pb-20 overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 顶部进度条 */}
      <div className="w-full flex items-center justify-between px-2 pt-1 pb-3 text-xs text-stone-400 font-mono">
        <span>卡片进度</span>
        <span>
          <strong className="text-stone-800 font-semibold">{currentIndex + 1}</strong> / {cards.length}
        </span>
      </div>

      {/* 核心卡片展示区 - 端正居中，无任何歪斜 */}
      <div className="w-full flex-1 flex items-center justify-center max-h-[460px] my-auto px-2">
        <div
          key={activeCard.id}
          className="w-full h-[400px] max-w-[340px] bg-white rounded-3xl border border-stone-200 shadow-md p-6 flex flex-col justify-between transition-all duration-200"
        >
          {/* 卡片头部：词性与发音 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 tracking-wide">
                {activeCard.part_of_speech || "重点生词"}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(activeCard.word);
                }}
                title="朗读"
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center active:scale-90 transition-all shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* 核心原形单词 */}
            <div className="my-5 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-sans break-words leading-tight">
                {activeCard.word}
              </h2>
              <p className="text-base text-stone-600 font-medium mt-3">
                {activeCard.translation}
              </p>
            </div>
          </div>

          {/* 卡片下部：例句与上下文 */}
          <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
              语境例句
            </span>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              {activeCard.context_sentence || "暂无例句上下文"}
            </p>
          </div>

          {/* 底部轻量提示 */}
          <div className="text-center text-[11px] text-stone-300 font-normal pt-1">
            ← 左右轻扫或使用下方按钮翻页 →
          </div>
        </div>
      </div>

      {/* 底部控制操作栏：上一个、朗读、下一个 */}
      <div className="w-full max-w-[320px] flex items-center justify-around pt-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          title="上一个"
          className="w-11 h-11 rounded-full border border-stone-200 bg-white text-stone-600 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => speakWord(activeCard.word)}
          title="发音"
          className="px-5 py-2.5 rounded-full bg-stone-900 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
        >
          <Volume2 className="w-4 h-4" />
          <span>读音</span>
        </button>

        <button
          onClick={handleNext}
          title="下一个"
          className="w-11 h-11 rounded-full border border-stone-200 bg-white text-stone-600 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
