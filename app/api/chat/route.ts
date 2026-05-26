import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import WorkItem from "@/models/work-item.model";
import Project from "@/models/project.model";
import ChatMessage from "@/models/chat-message.model";
import { withApiHandler } from '@/lib/api-handler';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function GET(req: NextRequest, context: any) {
    return withApiHandler(req, context, async (req, user, userId) => {
        await connectDB();
        
        // Tính mốc thời gian bắt đầu ngày hôm nay (00:00:00)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const history = await ChatMessage.find({ 
            user: userId,
            timestamp: { $gte: startOfToday } // Chỉ lấy tin nhắn từ hôm nay
        })
        .sort({ timestamp: 1 })
        .limit(100);
        
        return NextResponse.json({ success: true, data: history });
    });
}

export async function POST(req: NextRequest, context: any) {
    return withApiHandler(req, context, async (req, user, userId) => {
        try {
            if (!apiKey) {
                return NextResponse.json({ success: false, message: "Missing GEMINI_API_KEY" }, { status: 500 });
            }

            await connectDB();
            const body = await req.json();
            const { message, projectId } = body;

            // 1. Lưu tin nhắn người dùng vào DB
            await ChatMessage.create({
                user: userId,
                content: message,
                sender: 'user',
                timestamp: new Date()
            });

            const projectMatch = projectId && projectId !== "all" ? { project: projectId } : {};
            const userMatch = { ...projectMatch, assignee: userId };

            const [projects, overdueTasks, dueSoonTasks, totalTasks, completedTasks] = await Promise.all([
                Project.find().select("title key").lean(),
                WorkItem.find({ ...userMatch, status: { $nin: ["Done", "Cancel"] }, dueDate: { $lt: new Date() } }).select("title status priority dueDate").limit(10).lean(),
                WorkItem.find({ ...userMatch, status: { $nin: ["Done", "Cancel"] }, dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 48 * 60 * 60 * 1000) } }).select("title status priority dueDate").limit(10).lean(),
                WorkItem.countDocuments(userMatch),
                WorkItem.countDocuments({ ...userMatch, status: { $in: ["Done"] } }),
            ]);

            const prompt = `Bạn là một người bạn trẻ, nói chuyện cực kỳ tự nhiên và "tỉnh". Bạn trò chuyện như đang nhắn tin Messenger, không dài dòng, không diễn.

            Nguyên tắc cốt lõi:
            - NGẮN GỌN: Chỉ trả lời 1-2 câu. Không viết sớ, không giải thích dài dòng.
            - KHÔNG ÉP CÔNG VIỆC: Tuyệt đối không tự ý lôi task hay dự án vào nếu bạn mình không hỏi tới. 
            - TỰ NHIÊN: Bỏ mấy từ cảm thán kiểu "Êyyy", "Ôi", "Hay quá". Cứ nói chuyện bình thường, nhẹ nhàng.
            - THÔNG TIN: Nếu không biết (như thời tiết), cứ nói khéo: "Vụ này mình không rành lắm, cậu check app thử xem nha" hoặc "Để mình xem lại sau nhé".
            - KHÔNG NÓI: "Tôi là AI", "Tôi không thể".

            Dữ liệu công việc (chỉ dùng khi được hỏi ĐÚNG VỀ CÔNG VIỆC): ${JSON.stringify({ totalTasks, completedTasks, projects, overdueTasks, dueSoonTasks })}.

            Câu hỏi của bạn mình: "${message}"`;

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            // 2. Lưu phản hồi của Bot vào DB
            const botMsg = await ChatMessage.create({
                user: userId,
                content: text,
                sender: 'bot',
                timestamp: new Date()
            });

            return NextResponse.json({ success: true, reply: text, data: botMsg });
        } catch (error) {
            console.error("Chat API Error:", error);
            return NextResponse.json({ success: false, message: "Chatbot hiện chưa phản hồi được." }, { status: 500 });
        }
    });
}