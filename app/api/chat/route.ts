import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import Project from '@/models/project.model';
import ChatMessage from '@/models/chat-message.model';
import { withApiHandler } from '@/lib/api-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

type ApiRouteContext = {
    params: Promise<Record<string, string | string[]>>;
};

type ChatRequestBody = {
    message?: string;
    projectId?: string;
};

type ChatHistoryMessage = {
    sender?: string;
    content?: string;
};

type ProjectSummary = {
    title?: string;
    key?: string;
};

type TaskSummary = {
    title?: string;
    status?: string;
    priority?: string;
    dueDate?: string | Date;
};

type WorkItemFilter = {
    project?: string;
    assignee: string;
    status?: {
        $nin?: string[];
        $in?: string[];
    };
    dueDate?: {
        $lt?: Date;
        $gte?: Date;
        $lte?: Date;
    };
};

export async function GET(
    req: NextRequest,
    context: ApiRouteContext
) {
    return withApiHandler(
        req,
        context,
        async (_handlerReq: Request, _user: unknown, userId: string) => {
            await connectDB();

            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const history = await ChatMessage.find({
                user: userId,
                timestamp: { $gte: startOfToday },
            })
                .sort({ timestamp: 1 })
                .limit(100)
                .lean();

            return NextResponse.json({
                success: true,
                data: history,
            });
        }
    );
}

export async function POST(
    req: NextRequest,
    context: ApiRouteContext
) {
    return withApiHandler(
        req,
        context,
        async (handlerReq: Request, _user: unknown, userId: string) => {
            try {
                if (!apiKey) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Missing GEMINI_API_KEY',
                        },
                        { status: 500 }
                    );
                }

                await connectDB();

                const body = await handlerReq.json() as ChatRequestBody;

                const message =
                    typeof body.message === 'string' ? body.message.trim() : '';

                const projectId =
                    typeof body.projectId === 'string' ? body.projectId : 'all';

                if (!message) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Vui lòng nhập nội dung tin nhắn.',
                        },
                        { status: 400 }
                    );
                }

                const historyMsgs = await ChatMessage.find({ user: userId })
                    .sort({ timestamp: -1 })
                    .limit(6)
                    .lean() as ChatHistoryMessage[];

                const historyText = historyMsgs
                    .reverse()
                    .map((msg) => {
                        const sender =
                            msg.sender === 'user' ? 'Người dùng' : 'Trợ lý';

                        return `${sender}: ${msg.content || ''}`;
                    })
                    .join('\n');

                await ChatMessage.create({
                    user: userId,
                    content: message,
                    sender: 'user',
                    timestamp: new Date(),
                });

                const projectMatch =
                    projectId && projectId !== 'all'
                        ? { project: projectId }
                        : {};

                const userMatch: WorkItemFilter = {
                    ...projectMatch,
                    assignee: userId,
                };

                const now = new Date();
                const dueSoonLimit = new Date(
                    Date.now() + 48 * 60 * 60 * 1000
                );

                const [
                    projects,
                    overdueTasks,
                    dueSoonTasks,
                    totalTasks,
                    completedTasks,
                ] = await Promise.all([
                    Project.find()
                        .select('title key')
                        .lean(),

                    WorkItem.find({
                        ...userMatch,
                        status: { $nin: ['Done', 'Cancel'] },
                        dueDate: { $lt: now },
                    })
                        .select('title status priority dueDate')
                        .limit(10)
                        .lean(),

                    WorkItem.find({
                        ...userMatch,
                        status: { $nin: ['Done', 'Cancel'] },
                        dueDate: {
                            $gte: now,
                            $lte: dueSoonLimit,
                        },
                    })
                        .select('title status priority dueDate')
                        .limit(10)
                        .lean(),

                    WorkItem.countDocuments(userMatch),

                    WorkItem.countDocuments({
                        ...userMatch,
                        status: { $in: ['Done'] },
                    }),
                ]) as [
                    ProjectSummary[],
                    TaskSummary[],
                    TaskSummary[],
                    number,
                    number
                ];

                const prompt = `Bạn là Trợ lý Ảo (AI Assistant) chính thức của hệ thống quản lý dự án Smart SPM. Nhiệm vụ của bạn là hỗ trợ người dùng theo dõi tiến độ, nhắc nhở công việc và cung cấp thông tin dự án một cách chuyên nghiệp, nhiệt tình và rõ ràng.

Nguyên tắc cốt lõi:
- CHUYÊN NGHIỆP & LỊCH SỰ: Xưng hô "Tôi" và "Bạn". Thái độ thân thiện, luôn sẵn sàng giúp đỡ.
- HỖ TRỢ ĐA NĂNG: Hãy cứ trả lời các vấn đề ngoài lề một cách tự nhiên và thông minh nhất. Không bao giờ nói "Tôi không có thông tin" hay "Tôi là AI".
- NGẮN GỌN & TRỰC QUAN: Trình bày câu trả lời cực kỳ ngắn gọn, đi thẳng vào vấn đề. Không chào hỏi lặp lại.
- HỖ TRỢ DỮ LIỆU CÔNG VIỆC: Sử dụng dữ liệu dự án được cung cấp để trả lời.

THÔNG TIN THỰC TẾ LÚC NÀY:
- Thời gian hiện tại: ${new Date().toLocaleString('vi-VN', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                })}

Dữ liệu hệ thống hiện tại của người dùng:
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

LỊCH SỬ TRÒ CHUYỆN GẦN NHẤT:
${historyText}

Câu hỏi HIỆN TẠI của người dùng: "${message}"`;

                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash-lite',
                });

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();

                const botMsg = await ChatMessage.create({
                    user: userId,
                    content: text,
                    sender: 'bot',
                    timestamp: new Date(),
                });

                return NextResponse.json({
                    success: true,
                    reply: text,
                    data: botMsg,
                });
            } catch (error: unknown) {
                console.error('Chat API Error:', error);

                return NextResponse.json(
                    {
                        success: false,
                        message: 'Chatbot hiện chưa phản hồi được.',
                    },
                    { status: 500 }
                );
            }
        }
    );
}