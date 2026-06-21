import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function cleanAIInsight(text: string) {
  return text
      .normalize('NFC')
      .replace(/```(json|text|md)?/g, '') // Xóa block code
      .replace(/```/g, '')
      .replace(/\*\*/g, '') // Xóa in đậm
      .replace(/\*/g, '')   // Xóa bullet point (*)
      .replace(/#{1,6}\s?/g, '') // Xóa thẻ heading
      .replace(/\[|\]/g, '') // Xóa dấu ngoặc vuông
      .replace(/\n{3,}/g, '\n\n') // Xóa dòng trống thừa
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

  const prompt = `Bạn là chuyên gia phân tích dữ liệu dự án (Project Manager).
Hãy phân tích dữ liệu JSON bên dưới và đưa ra 1 đoạn nhận xét ngắn gọn.

DỮ LIỆU:
${compactData(data)}

YÊU CẦU BẮT BUỘC (NẾU VI PHẠM SẼ BỊ PHẠT):
1. CHỈ sử dụng TIẾNG VIỆT 100%. Tuyệt đối không dùng tiếng Anh (không dùng các từ như Critical Tasks, due).
2. KHÔNG DÙNG BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO (Không dùng dấu sao *, không dùng in đậm, không dùng gạch đầu dòng).
3. Chỉ xuất ra văn bản thuần túy (plain text).
4. Viết thành 3 câu ngắn gọn tương ứng với 3 phần: Nhận định, Nguyên nhân, Hành động. Bắt buộc phải có chữ "Nhận định:", "Nguyên nhân:" và "Hành động:".

MẪU ĐẦU RA BẮT BUỘC:
Nhận định: [Đánh giá tình hình...]
Nguyên nhân: [Lý do chính...]
Hành động: [Việc cần làm...]`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.1, // Giảm temperature để AI bớt sáng tạo linh tinh
        maxOutputTokens: 300,
      },
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = cleanAIInsight(text);

    return text || null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`AI Insight generation failed: ${message}`);
    return null;
  }
}

export default getAIInsight;
