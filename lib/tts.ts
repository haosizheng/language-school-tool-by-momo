/**
 * 多语种语音合成（TTS）服务
 * 1. 优先使用浏览器原生 Web Speech API
 * 2. 备用有道多语种词典纯正真人发音音频源（零配置、零鉴权、极佳准确度）
 */

// 检测语言
export function detectLanguage(text: string): { langCode: string; youdaoLe: string } {
  // 匹配韩文字符: Hangul Syllables \uAC00-\uD7AF, Hangul Jamo \u1100-\u11FF
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
    return { langCode: "ko-KR", youdaoLe: "ko" };
  }
  // 匹配日文字符: 平假名/片假名 \u3040-\u30FF
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return { langCode: "ja-JP", youdaoLe: "jap" };
  }
  // 匹配中文
  if (/[\u4E00-\u9FA5]/.test(text)) {
    return { langCode: "zh-CN", youdaoLe: "zh" };
  }
  // 默认英语
  return { langCode: "en-US", youdaoLe: "eng" };
}

// 清理单词中的括号注解以便发音更自然，例如 "피아노(치다)" -> "피아노" 或 "피아노 치다"
export function cleanWordForSpeech(word: string): string {
  return word.replace(/[()（）]/g, " ").trim();
}

let activeAudio: HTMLAudioElement | null = null;

export async function speakWord(word: string): Promise<void> {
  if (typeof window === "undefined" || !word) return;

  const cleanText = cleanWordForSpeech(word);
  const { langCode, youdaoLe } = detectLanguage(cleanText);

  // 尝试使用原生 Web Speech API
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langCode;
      utterance.rate = 0.9; // 略微放慢，适合语言初学者辨音

      // 检查是否有匹配当前语言的 Voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.startsWith(langCode.split("-")[0])
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch {
      // 降级到网络音频
    }
  }

  // 降级方案：使用高品质在线发音音频源
  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=${youdaoLe}`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;
    await audio.play();
  } catch (err) {
    console.warn("语音朗读失败:", err);
  }
}
