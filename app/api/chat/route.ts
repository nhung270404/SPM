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

            // Lấy lịch sử trò chuyện gần nhất (6 tin nhắn) để AI hiểu ngữ cảnh
            const historyMsgs = await ChatMessage.find({ user: userId })
                .sort({ timestamp: -1 })
                .limit(6);
            
            // Đảo ngược lại để theo thứ tự thời gian cũ -> mới
            const historyText = historyMsgs.reverse().map(msg => `${msg.sender === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}`).join('\n');

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

            const prompt = `Bạn là Trợ lý Ảo (AI Assistant) chính thức của hệ thống quản lý dự án Smart SPM. Nhiệm vụ của bạn là hỗ trợ người dùng theo dõi tiến độ, nhắc nhở công việc và cung cấp thông tin dự án một cách chuyên nghiệp, nhiệt tình và rõ ràng.

            Nguyên tắc cốt lõi:
            - CHUYÊN NGHIỆP & LỊCH SỰ: Xưng hô "Tôi" và "Bạn". Thái độ thân thiện, luôn sẵn sàng giúp đỡ.
            - HỖ TRỢ ĐA NĂNG: Hãy cứ trả lời các vấn đề ngoài lề (như thời tiết, kiến thức, giờ giấc) một cách tự nhiên và thông minh nhất. Không bao giờ nói "Tôi không có thông tin" hay "Tôi là AI".
            - NGẮN GỌN & TRỰC QUAN: Trình bày câu trả lời cực kỳ ngắn gọn, đi thẳng vào vấn đề. Không chào hỏi lặp lại ("Chào bạn, tôi là...").
            - HỖ TRỢ DỮ LIỆU CÔNG VIỆC: Sử dụng dữ liệu dự án được cung cấp để trả lời.

            THÔNG TIN THỰC TẾ LÚC NÀY:
            - Thời gian hiện tại: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}

            Dữ liệu hệ thống hiện tại của người dùng (chỉ dùng khi cần thiết để trả lời câu hỏi): 
            ${JSON.stringify({ totalTasks, completedTasks, projects, overdueTasks, dueSoonTasks }, null, 2)}

            LỊCH SỬ TRÒ CHUYỆN GẦN NHẤT (Để bạn hiểu ngữ cảnh nếu câu hỏi bị thiếu chủ ngữ):
            ${historyText}

            Câu hỏi HIỆN TẠI của người dùng: "${message}"`;

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