"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { WordCard } from "@/types/word";
import { getStoredSettings } from "@/lib/storage";
import { compressImage } from "@/lib/utils";

interface UploaderProps {
  onSuccess: (cards: WordCard[]) => void;
  onOpenSettings: () => void;
}

export function Uploader({ onSuccess, onOpenSettings }: UploaderProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("AI 正在极速分析课本生词...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 两个独立的隐藏 input：一个强制调起后置摄像头，一个调起相册/文件选择
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 清空 input 允许再次选择同一张图片
    e.target.value = "";

    await processImage(file);
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);
    setStatusText("正在优化课本图片尺寸...");

    console.log(`[SnapWord] 用户选择图片: ${file.name}, 原始体积: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    const abortController = new AbortController();
    // 90秒超时保护
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 90000);

    try {
      // 1. 客户端轻量高质量压缩（高兼容处理，若环境受限自动降级使用原文件）
      let readyBlob: Blob | File = file;
      try {
        readyBlob = await compressImage(file, 1600, 0.85);
        console.log(`[SnapWord] 图片预处理完毕，上传体积: ${(readyBlob.size / 1024).toFixed(1)} KB`);
      } catch (e) {
        console.warn("[SnapWord] 预压缩跳过，直接上传原图:", e);
        readyBlob = file;
      }

      const settings = getStoredSettings();
      const currentModel = settings.model || "kimi-k2.6";
      setStatusText(`正在调用 ${currentModel} 提取生词...`);

      const formData = new FormData();
      // 传参第三个参数作为文件名，完美兼容所有移动端 Safari/WebKit
      formData.append("image", readyBlob, "textbook_snap.jpg");

      if (settings.apiKey) formData.append("apiKey", settings.apiKey);
      if (settings.baseUrl) formData.append("baseUrl", settings.baseUrl);
      if (settings.model) formData.append("model", settings.model);

      console.log(`[SnapWord] 开始向后端 /api/extract 发起网络请求...`);
      const reqStart = Date.now();

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);
      const reqDuration = ((Date.now() - reqStart) / 1000).toFixed(1);
      console.log(`[SnapWord] 后端返回响应，状态码: ${res.status}, 耗时: ${reqDuration}s`);

      const data = await res.json();

      if (!res.ok) {
        if (data.needKey) {
          setErrorMessage("请先点击右上角设置输入 Kimi API Key，或体验下方模拟演示。");
        } else {
          setErrorMessage(data.error || "识别遇到问题，请重试");
        }
        return;
      }

      if (data.cards && Array.isArray(data.cards)) {
        console.log(`[SnapWord] 成功提取到 ${data.cards.length} 个单词卡片`);
        onSuccess(data.cards);
      } else {
        setErrorMessage("未能提取到有效生词，请确保课本文字清晰可见");
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      console.error("[SnapWord] 提取过程出错:", err);

      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorMessage("请求超时（超过 90 秒），Kimi 接口无响应。请检查网络环境或尝试换一张较清晰的截图。");
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`提取失败: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 模拟快速体验提取流程
  const handleSimulateExtraction = () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusText("正在载入课本模拟生词...");

    setTimeout(() => {
      const timestamp = Date.now();
      const mockCards: WordCard[] = [
        {
          id: `mock-${timestamp}-1`,
          word: "약속을 지키다",
          part_of_speech: "관용구 (惯用语/动词)",
          translation: "遵守约定、守约",
          context_sentence: "친구와의 약속을 반드시 지켜야 해요. (一定要遵守和朋友的约定。)",
          createdAt: timestamp,
        },
        {
          id: `mock-${timestamp}-2`,
          word: "신청서(를) 작성하다",
          part_of_speech: "동사 (动词)",
          translation: "填写申请书",
          context_sentence: "여기에 한국어 어학당 신청서를 작성해 주세요. (请在这里填写韩国语语学堂申请表。)",
          createdAt: timestamp + 1,
        },
        {
          id: `mock-${timestamp}-3`,
          word: "복잡하다",
          part_of_speech: "형용사 (形容词)",
          translation: "复杂、拥挤",
          context_sentence: "출근 시간 지하철은 사람이 너무 많아서 복잡해요. (上班时间的地铁人太多了，非常拥挤。)",
          createdAt: timestamp + 2,
        },
      ];
      onSuccess(mockCards);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4 bg-white border-b border-stone-100">
      {/* 隐藏的拍照专有 Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 隐藏的相册导入专有 Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col gap-2">
        {loading ? (
          // 加载状态统一大按钮
          <div className="w-full bg-stone-900 text-white font-medium py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
            <span className="text-sm font-medium tracking-wide">
              {statusText}
            </span>
          </div>
        ) : (
          // 极简双按钮：左侧现场拍照，右侧相册选图
          <div className="grid grid-cols-2 gap-2.5">
            {/* 拍照按钮 */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 px-3 rounded-2xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">
                拍照识词
              </span>
            </button>

            {/* 相册按钮 */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-3 px-3 rounded-2xl border border-stone-200/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-lg bg-stone-200 flex items-center justify-center text-stone-700 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">
                从相册选择
              </span>
            </button>
          </div>
        )}

        {/* 错误提示 */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {errorMessage}
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={onOpenSettings}
                  className="font-semibold text-stone-900 underline hover:opacity-80"
                >
                  前往配置 Key
                </button>
                <span className="text-stone-300">|</span>
                <button
                  onClick={handleSimulateExtraction}
                  className="font-semibold text-amber-800 underline hover:opacity-80 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  免 Key 体验模拟提取
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
