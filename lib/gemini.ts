import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function getAIInsight(data: any) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing.");
    return null;
  }

  const prompt = `
Bạn là AI quản trị dự án phần mềm.

Nhiệm vụ:
Phân tích dữ liệu JSON bên dưới và đưa ra đề xuất thông minh dựa trên số liệu thật.

Dữ liệu:
${JSON.stringify(data, null, 2)}

Quy tắc:
- Không dùng câu gợi ý chung chung.
- Không bịa dữ liệu không có trong JSON.
- Chỉ ra vấn đề nghiêm trọng nhất.
- Nêu nguyên nhân có khả năng cao nhất dựa trên dữ liệu.
- Đề xuất 1 hành động cụ thể có thể làm ngay.
- Tiếng Việt.
- Dưới 50 từ.
- Text thuần, không markdown.
`;
  const modelsToTry = [
    "gemini-2.5-flash",
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${modelName}...`);

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      console.log(`Success with model: ${modelName}`);
      return text.replace(/^["']|["']$/g, "");
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
    }
  }

  return null;
}