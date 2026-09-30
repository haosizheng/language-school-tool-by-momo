import { NextRequest, NextResponse } from "next/server";
import { WordCard } from "@/types/word";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 系统提示词：自动检测语言并提取结构化单词
const SYSTEM_PROMPT = `你是一个专业的语言教学助手。请仔细观察用户上传的语言教材/课本截图。
任务目标：
1. 自动检测图片中的目标学习语言（例如韩语、日语、英语、德语、法语等，尤其是韩语）。
2. 提取图片中作为核心生词、语法短语或重点词汇的内容。
3. 对每个提取的词汇，生成符合以下 JSON 结构的列表：
[
  {
    "word": "提取的核心原形单词或词组，例如 '피아노(를) 치다' 或 '예약하다'",
    "part_of_speech": "词性（如：동사 (动词)、형용사 (形容词)、명사 (名词) 等）",
    "translation": "精准简洁的中文释义",
    "context_sentence": "课本原图中的例句；若原图无完整句子，请根据当前词汇生成一句地道实用的日常韩语/目标语例句，并附带中文翻译"
  }
]

严格要求：
- 只返回合法的纯 JSON 数组，严禁包含任何前缀、解释、说明文字或 Markdown 标签以外的内容。
- 提取数量：提取图中所有清晰可见的学习重点词汇（建议 3~15 个）。`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`\n[API /extract] 收到新的课本提取请求 @ ${new Date().toLocaleTimeString()}`);

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const clientApiKey = formData.get("apiKey") as string | null;
    const clientBaseUrl = formData.get("baseUrl") as string | null;
    const clientModel = formData.get("model") as string | null;

    if (!imageFile) {
      console.warn("[API /extract] 未接收到图片文件");
      return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
    }

    const apiKey =
      clientApiKey?.trim() ||
      process.env.KIMI_API_KEY ||
      process.env.MOONSHOT_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("[API /extract] 未配置 API Key");
      return NextResponse.json(
        {
          error:
            "未检测到 API Key。请点击右上角【设置】填入您的 Kimi (Moonshot) API Key，即可开启课本 AI 识别！",
          needKey: true,
        },
        { status: 400 }
      );
    }

    const baseUrl = (clientBaseUrl?.trim() || "https://api.moonshot.cn/v1").replace(/\/+$/, "");
    const model = clientModel?.trim() || "kimi-k2.6";

    console.log(`[API /extract] 图片尺寸: ${(imageFile.size / 1024).toFixed(1)} KB, 类型: ${imageFile.type}`);
    console.log(`[API /extract] 即将调用端点: ${baseUrl}/chat/completions, 模型: ${model}, 温度: 1`);

    // 将图片转为 Base64 Data URL
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageFile.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // 构建符合 OpenAI 兼容标准的视觉请求
    const requestPayload: Record<string, any> = {
      model: model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请提取这张语言课本图片中的单词和例句，严格按照指定的 JSON 数组格式返回：",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    };

    // 关键提速：Kimi k2.6 默认为深度思考模式（Thinking），导致长时间长考挂起超过 60 秒。
    // 在课本生词提取任务中，设置 thinking.type = "disabled"，让其跳过长思考、极速秒级返回结果！
    if (model.toLowerCase().includes("k2.6")) {
      requestPayload.thinking = { type: "disabled" };
      console.log("[API /extract] 检测到 kimi-k2.6 模型，已自动关闭思考模式 (thinking=disabled) 以实现极速响应");
    } else if (model.toLowerCase().includes("k3")) {
      requestPayload.reasoning_effort = "low";
      console.log("[API /extract] 检测到 kimi-k3 模型，已设置推理强度为 low 以实现极速响应");
    }

    console.log("[API /extract] 正在向 Kimi 发送多模态请求，等待响应中...");
    const callStart = Date.now();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const callDuration = ((Date.now() - callStart) / 1000).toFixed(2);
    console.log(`[API /extract] Kimi 返回 HTTP 状态: ${response.status} (耗时: ${callDuration}s)`);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const jsonErr = JSON.parse(errorText);
        parsedError = jsonErr.error?.message || errorText;
      } catch {
        // ignore
      }
      console.error(`[API /extract] Kimi 返回错误:`, parsedError);
      return NextResponse.json(
        { error: `大模型接口调用失败 (${response.status}): ${parsedError}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const rawContent = result.choices?.[0]?.message?.content || "";
    console.log(`[API /extract] 原始响应内容长度: ${rawContent.length} 字符`);

    // 清洗模型可能输出的 markdown 标签或外围说明文字
    let cleaned = rawContent.trim();
    if (cleaned.includes("```json")) {
      const match = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) cleaned = match[1].trim();
    } else if (cleaned.includes("```")) {
      const match = cleaned.match(/```\s*([\s\S]*?)\s*```/);
      if (match) cleaned = match[1].trim();
    }

    // 寻找最外层的 [ ... ] JSON 数组
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }

    let parsedList: Array<Omit<WordCard, "id">> = [];
    try {
      parsedList = JSON.parse(cleaned);
      if (!Array.isArray(parsedList)) {
        throw new Error("返回结果不是数组");
      }
    } catch {
      console.error("[API /extract] JSON 解析失败，原始输出为:", rawContent);
      return NextResponse.json(
        {
          error: "AI 识别完成但数据格式解析失败，请尝试重新拍摄或调清晰原图",
          rawContent,
        },
        { status: 500 }
      );
    }

    // 格式化卡片数据，生成唯一 id
    const timestamp = Date.now();
    const wordCards: WordCard[] = parsedList.map((item, index) => ({
      id: `card-${timestamp}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      word: item.word || "未命名单词",
      part_of_speech: item.part_of_speech || "词汇",
      translation: item.translation || "",
      context_sentence: item.context_sentence || "",
      createdAt: timestamp,
    }));

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[API /extract] 成功提炼出 ${wordCards.length} 个单词，总用时 ${totalDuration}s\n`);

    return NextResponse.json({
      success: true,
      count: wordCards.length,
      cards: wordCards,
    });
  } catch (err: unknown) {
    console.error("[API /extract] 运行时异常:", err);
    let message = err instanceof Error ? err.message : String(err);
    if (err instanceof Error && (err as any).cause) {
      const cause = (err as any).cause;
      message += ` (${cause?.message || cause?.code || String(cause)})`;
    }
    return NextResponse.json(
      { error: `请求大模型失败: ${message}。请检查 API Key 是否有效或网络是否畅通。` },
      { status: 500 }
    );
  }
}
