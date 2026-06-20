import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

function cleanAIInsight(text: string) {
  return text
      .normalize('NFC')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 900);
}

function compactData(data: unknown) {
  return JSON.stringify(data, null, 2).slice(0, 12000);
}

export async function getAIInsight(data: unknown): Promise<string | null> {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing.');
    return null;
  }

  const prompt = `Bạn là AI phân tích dữ liệu cho hệ thống Smart SPM.

Nhiệm vụ:
Phân tích dữ liệu JSON bên dưới và đưa ra nhận xét quản trị dự án ngắn gọn, đúng trọng tâm và có hành động cụ thể.

DỮ LIỆU:
${compactData(data)}

TIÊU CHÍ BẮT BUỘC:
- Trả lời bằng tiếng Việt.
- Không bịa dữ liệu ngoài JSON.
- Không dùng markdown đậm dạng **...**.
- Không trả về key thô như totalTasks, completedTasks, completionRate, projects, overdueTasks.
- Chỉ ra vấn đề quan trọng nhất nếu có.
- Nêu nguyên nhân có khả năng cao nhất dựa trên số liệu.
- Đề xuất 1 hành động cụ thể có thể làm ngay.
- Tối đa 90 từ.

CẤU TRÚC TRẢ LỜI:
Nhận định: ...
Vấn đề cần chú ý: ...
Đề xuất: ...`;

  const modelsToTry = [GEMINI_MODEL];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${modelName}...`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 400,
        },
      });

      const result = await model.generateContent(prompt);
      const text = cleanAIInsight(result.response.text());

      console.log(`Success with model: ${modelName}`);
      return text || null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Model ${modelName} failed: ${message}`);
    }
  }

  return null;
}

export default getAIInsight;
