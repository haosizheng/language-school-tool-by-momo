import { WordCard } from "@/types/word";

/**
 * 导出卡片数据为 Excel 友好的 CSV 文件（附带 UTF-8 BOM，防止 Windows/Mac Excel 打开韩文/中文乱码）
 */
export function exportCardsToCSV(cards: WordCard[], filename = "korean-vocabulary.csv") {
  if (cards.length === 0) return;

  const headers = ["序号", "核心单词", "词性", "中文释义", "例句 / 上下文", "添加时间"];
  
  const rows = cards.map((card, idx) => {
    const dateStr = card.createdAt ? new Date(card.createdAt).toLocaleDateString() : "";
    // 转义逗号与双引号
    const sanitize = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;

    return [
      idx + 1,
      sanitize(card.word),
      sanitize(card.part_of_speech),
      sanitize(card.translation),
      sanitize(card.context_sentence),
      sanitize(dateStr),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
