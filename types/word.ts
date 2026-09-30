export interface WordCard {
  id: string;
  word: string; // 提取的核心单词，例如 "피아노(치다)"
  part_of_speech: string; // 词性
  translation: string; // 中文释义
  context_sentence: string; // 根据上下文生成的例句或原图中的上下文
  source_image_url?: string; // (可选)
  createdAt?: number;
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: "",
  baseUrl: "https://api.moonshot.cn/v1",
  model: "kimi-k2.6",
};
