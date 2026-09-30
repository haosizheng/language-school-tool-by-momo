"use client";

import React, { useState } from "react";
import { Volume2, ChevronDown, ChevronUp, Trash2, BookOpen } from "lucide-react";
import { WordCard } from "@/types/word";
import { speakWord } from "@/lib/tts";

interface ListViewProps {
  cards: WordCard[];
  onDeleteCard: (id: string) => void;
}

export function ListView({ cards, onDeleteCard }: ListViewProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSpeak = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    speakWord(word);
  };

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300 mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-stone-600">暂无单词卡片</p>
        <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
          点击上方按钮拍下课本，即可自动解析提炼生词表
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar pb-24">
      {cards.map((card, index) => {
        const isExpanded = !!expandedIds[card.id];

        return (
          <div
            key={card.id}
            onClick={() => toggleExpand(card.id)}
            className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:border-stone-300 transition-all cursor-pointer select-none active:bg-stone-50/50"
          >
            {/* 卡片头部核心信息 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-base sm:text-lg tracking-tight text-stone-900 break-words">
                    {card.word}
                  </span>

                  {/* 发音按钮 */}
                  <button
                    onClick={(e) => handleSpeak(e, card.word)}
                    title="发音朗读"
                    className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* 词性徽章 */}
                  {card.part_of_speech && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                      {card.part_of_speech}
                    </span>
                  )}
                </div>

                {/* 简短中文释义 */}
                <p className="text-sm text-stone-600 mt-1 font-normal">
                  {card.translation}
                </p>
              </div>

              {/* 展开/折叠指示图标 */}
              <div className="text-stone-300 pt-0.5">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* 展开后的上下文例句与详细信息 */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-stone-100 text-xs space-y-2 animate-in fade-in duration-150">
                {card.context_sentence && (
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100/80">
                    <div className="text-[11px] uppercase font-semibold tracking-wider text-stone-400 mb-1">
                      课本语境 / 例句
                    </div>
                    <div className="text-stone-700 leading-relaxed font-sans">
                      {card.context_sentence}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-400">
                    {card.createdAt
                      ? `提取时间: ${new Date(card.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCard(card.id);
                    }}
                    className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
