"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Globe, Cpu, Check, AlertCircle, Trash2 } from "lucide-react";
import { AISettings, DEFAULT_AI_SETTINGS } from "@/types/word";
import { getStoredSettings, saveStoredSettings, saveCards, INITIAL_DEMO_CARDS } from "@/lib/storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllCards: () => void;
  onResetDemoCards: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  onClearAllCards,
  onResetDemoCards,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredSettings());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-stone-900">AI 模型设置</h2>
            <p className="text-xs text-stone-500">配置用于课本识图提取的大模型凭证</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-500" />
                Kimi (Moonshot) API Key (明文显示)
              </span>
              {settings.apiKey && (
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, apiKey: "" })}
                  className="text-[11px] text-stone-400 hover:text-red-500"
                >
                  清空
                </button>
              )}
            </label>
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="在此粘贴 sk- 开头的完整密钥"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value.trim() })}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stone-800 bg-stone-50/50"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              密钥直接明文展示，保存在本地浏览器中，用于调用 Kimi 视觉模型提取生词。
            </p>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-stone-500" />
              视觉模型名称
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              placeholder="kimi-k2.6"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, model: "kimi-k2.6" })
                }
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                  settings.model === "kimi-k2.6"
                    ? "bg-stone-900 text-white font-medium shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                kimi-k2.6 (默认推荐)
              </button>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, model: "kimi-k3" })
                }
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                  settings.model === "kimi-k3"
                    ? "bg-stone-900 text-white font-medium shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                kimi-k3 (最新旗舰)
              </button>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, model: "kimi-k2.7-code" })
                }
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                  settings.model === "kimi-k2.7-code"
                    ? "bg-stone-900 text-white font-medium shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                kimi-k2.7-code
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
              * 已同步 Kimi 官方最新规范：老版 <code className="font-mono text-stone-400">moonshot-v1</code> 已全线下线，当前多模态视觉统一调用 <strong className="font-mono text-stone-700">kimi-k2.6</strong> 或 <strong className="font-mono text-stone-700">kimi-k3</strong>。
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              API 基础端点 (Base URL)
            </label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              placeholder="https://api.moonshot.cn/v1"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
          </div>

          {/* 数据重置与清空 */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <div className="text-xs font-medium text-stone-600">本地卡包操作</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("确定要载入内置演示生词卡片吗？")) {
                    onResetDemoCards();
                    onClose();
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 active:scale-95"
              >
                重置为韩语演示词库
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("确定要清空所有已提取的卡片数据吗？")) {
                    onClearAllCards();
                    onClose();
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空全部卡片
              </button>
            </div>
          </div>
        </div>

        {/* 底部保存按钮 */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                已保存
              </>
            ) : (
              "保存设置"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
