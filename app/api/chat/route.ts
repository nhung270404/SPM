import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import WorkItem from "@/models/work-item.model";
import Project from "@/models/project.model";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json(
                { success: false, message: "Missing GEMINI_API_KEY" },
                { status: 500 }
            );
        }

        await connectDB();

        const body = await req.json();
        const { message, projectId } = body;

        const projectMatch = projectId && projectId !== "all"
            ? { project: projectId }
            : {};

        const [projects, overdueTasks, dueSoonTasks, totalTasks, completedTasks] =
            await Promise.all([
                Project.find().select("title key").lean(),

                WorkItem.find({
                    ...projectMatch,
                    status: { $nin: ["Done", "Completed", "Cancel"] },
                    dueDate: { $lt: new Date() },
                })
                    .select("title status priority dueDate")
                    .limit(10)
                    .lean(),

                WorkItem.find({
                    ...projectMatch,
                    status: { $nin: ["Done", "Completed", "Cancel"] },
                    dueDate: {
                        $gte: new Date(),
                        $lte: new Date(Date.now() + 48 * 60 * 60 * 1000),
                    },
                })
                    .select("title status priority dueDate")
                    .limit(10)
                    .lean(),

                WorkItem.countDocuments(projectMatch),

                WorkItem.countDocuments({
                    ...projectMatch,
                    status: { $in: ["Done", "Completed"] },
                }),
            ]);

        const prompt = `Bạn là chatbot AI quản lý dự án phần mềm.
        Người dùng hỏi:
        ${message}
        Dữ liệu hệ thống:
        ${JSON.stringify(
            {
                totalTasks,
                completedTasks,
                projects,
                overdueTasks,
                dueSoonTasks,
            },
            null,
            2
        )}

        Quy tắc:
        - Trả lời dựa trên dữ liệu thật.
        - Không bịa task, người dùng, project nếu không có trong JSON.
        - Trả lời tiếng Việt.
        - Ngắn gọn, thực tế.
        - Nếu người dùng hỏi ngoài dữ liệu, hãy nói rõ là chưa có đủ dữ liệu.
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        return NextResponse.json({
            success: true,
            reply: text,
        });
    } catch (error) {
        console.error("Chat API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Chatbot hiện chưa phản hồi được.",
            },
            { status: 500 }
        );
    }
}