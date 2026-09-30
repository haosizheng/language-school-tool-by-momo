import { WordCard, AISettings, DEFAULT_AI_SETTINGS } from "@/types/word";

const STORAGE_KEY_CARDS = "momo_language_word_cards_v1";
const STORAGE_KEY_SETTINGS = "momo_language_ai_settings_v1";

// 初始默认的韩语学习示例数据（以防刚打开应用是空页面）
export const INITIAL_DEMO_CARDS: WordCard[] = [
  {
    id: "demo-1",
    word: "피아노(를) 치다",
    part_of_speech: "동사 (动词)",
    translation: "弹钢琴",
    context_sentence: "주말마다 집에서 피아노를 쳐요. (每个周末在家里弹钢琴。)",
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: "demo-2",
    word: "예약하다",
    part_of_speech: "동사 (动词)",
    translation: "预约、预订",
    context_sentence: "식당을 미리 예약했어요. (提前预订了餐厅。)",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "demo-3",
    word: "가볍다",
    part_of_speech: "형용사 (形容词)",
    translation: "轻、轻便",
    context_sentence: "이 가방은 정말 가벼워요. (这个包真的很轻。)",
    createdAt: Date.now(),
  },
];

export function getStoredCards(): WordCard[] {
  if (typeof window === "undefined") return INITIAL_DEMO_CARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(INITIAL_DEMO_CARDS));
      return INITIAL_DEMO_CARDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read cards from localStorage", err);
    return INITIAL_DEMO_CARDS;
  }
}

export function saveCards(cards: WordCard[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  } catch (err) {
    console.error("Failed to save cards to localStorage", err);
  }
}

export function appendCards(newCards: WordCard[]): WordCard[] {
  const current = getStoredCards();
  // 按照 ID 去重或直接追加
  const existingIds = new Set(current.map((c) => c.id));
  const filteredNew = newCards.filter((c) => !existingIds.has(c.id));
  const updated = [...filteredNew, ...current]; // 最新的排在前面
  saveCards(updated);
  return updated;
}

export function getStoredSettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveStoredSettings(settings: AISettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings to localStorage", err);
  }
}
