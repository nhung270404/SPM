import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import Project from '@/models/project.model';
import User from '@/models/user.model';
import ChatMessage from '@/models/chat-message.model';
import { withApiHandler } from '@/lib/api-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const MAX_USER_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 6;
const MAX_REPLY_TOKENS = 600;

const DONE_STATUSES = ['Done', 'Completed'];
const CANCEL_STATUSES = ['Cancel', 'Cancelled'];
const CLOSED_STATUSES = [...DONE_STATUSES, ...CANCEL_STATUSES];

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

type ProjectData = {
    _id?: string | mongoose.Types.ObjectId;
    title?: string;
    key?: string;
    description?: string;
    status?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    manager?: AssigneeData | string | null;
    members?: (AssigneeData | string)[];
};

type AssigneeData = {
    _id?: string | mongoose.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    fullName?: string;
    email?: string;
    role?: string;
};

type TaskData = {
    _id?: string | mongoose.Types.ObjectId;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | Date;
    startDate?: string | Date;
    assignee?: AssigneeData | string | null;
    creator?: AssigneeData | string | null;
    project?: ProjectData | string | null;
    labels?: string[];
    storyPoints?: number;
};

type UserProfile = {
    _id?: string | mongoose.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    fullName?: string;
    email?: string;
    department?: string;
    position?: string;
    status?: string;
    isGod?: boolean;
    createdAt?: Date | string;
};

type MongoFilter = Record<string, unknown>;

function limitText(value: unknown, maxLength = 500) {
    return String(value || '')
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function formatDate(value?: string | Date) {
    if (!value) return 'Chưa có hạn';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa có hạn';
    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatPerson(person?: AssigneeData | string | null) {
    if (!person) return 'Chưa xác định';
    if (typeof person === 'string') return person;
    const name = person.fullName || `${person.lastname || ''} ${person.firstname || ''}`.trim();
    return name || person.email || 'Chưa rõ';
}

function normalizeTask(task: TaskData) {
    const project = task.project;
    let projectStr = 'Chưa gắn dự án';
    if (project && typeof project !== 'string') {
        const key = project.key ? ` (${project.key})` : '';
        projectStr = `${project.title || 'Dự án chưa có tên'}${key}`;
    } else if (typeof project === 'string') {
        projectStr = project;
    }

    return {
        title: task.title || 'Không có tiêu đề',
        status: task.status || 'Chưa rõ',
        priority: task.priority || 'Không rõ',
        startDate: formatDate(task.startDate),
        dueDate: formatDate(task.dueDate),
        assignee: formatPerson(task.assignee as AssigneeData),
        creator: formatPerson(task.creator as AssigneeData),
        project: projectStr,
        labels: (task.labels || []).join(', ') || 'Không có nhãn',
        storyPoints: task.storyPoints ?? 0,
        description: limitText(task.description, 120),
    };
}

function normalizeProject(project: ProjectData) {
    return {
        title: project.title || 'Chưa có tên',
        key: project.key || 'N/A',
        status: project.status || 'Chưa rõ',
        description: limitText(project.description, 100),
        startDate: formatDate(project.startDate),
        endDate: formatDate(project.endDate),
        manager: formatPerson(project.manager as AssigneeData),
        memberCount: Array.isArray(project.members) ? project.members.length : 0,
    };
}

function buildHistoryText(historyMsgs: ChatHistoryMessage[]) {
    return [...historyMsgs]
        .reverse()
        .map((msg) => {
            const sender = msg.sender === 'user' ? 'Người dùng' : 'Trợ lý';
            return `${sender}: ${limitText(msg.content, 300)}`;
        })
        .join('\n');
}

function buildSystemPrompt(params: {
    message: string;
    historyText: string;
    userProfile: UserProfile | null;
    totalTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    projects: ProjectData[];
    currentTasks: TaskData[];
    overdueTasks: TaskData[];
    dueSoonTasks: TaskData[];
    allUserTasks: TaskData[];
}) {
    const now = new Date();
    const completionRate =
        params.totalTasks > 0
            ? Math.round((params.completedTasks / params.totalTasks) * 100)
            : 0;

    const userName = params.userProfile
        ? params.userProfile.fullName ||
          `${params.userProfile.lastname || ''} ${params.userProfile.firstname || ''}`.trim() ||
          params.userProfile.email
        : 'Người dùng';

    const systemData = {
        currentTime: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        currentUser: {
            name: userName,
            email: params.userProfile?.email || 'Chưa rõ',
            department: params.userProfile?.department || 'Chưa xác định',
            position: params.userProfile?.position || 'Nhân viên',
            status: params.userProfile?.status || 'active',
            isAdmin: params.userProfile?.isGod ?? false,
            memberSince: formatDate(params.userProfile?.createdAt),
        },
        statistics: {
            totalProjects: params.projects.length,
            totalTasks: params.totalTasks,
            completedTasks: params.completedTasks,
            cancelledTasks: params.cancelledTasks,
            activeTasks: params.currentTasks.length,
            overdueTasks: params.overdueTasks.length,
            dueSoonTasks: params.dueSoonTasks.length,
            completionRate: `${completionRate}%`,
        },
        projects: params.projects.map(normalizeProject),
        activeTasks: params.currentTasks.map(normalizeTask),
        overdueTasks: params.overdueTasks.map(normalizeTask),
        tasksDueSoon: params.dueSoonTasks.map(normalizeTask),
        allTasksOverview: params.allUserTasks.slice(0, 20).map(normalizeTask),
    };

    return `Bạn là **SPM AI Copilot**, trợ lý thông minh chính thức của hệ thống quản lý dự án Smart SPM.

## THÔNG TIN VỀ BẠN
- Tên: SPM AI Copilot
- Bạn có thể trả lời MỌI câu hỏi: từ dữ liệu dự án, công việc cá nhân đến kiến thức chung, lập trình, kỹ thuật PM, v.v.
- Bạn có quyền truy cập đầy đủ vào dữ liệu của người dùng hiện tại trong hệ thống.
- Tên người dùng hiện tại: ${userName}

## QUY TẮC GIAO TIẾP — BẮT BUỘC TUÂN THỦ
1. Xưng hô: "Tôi" và "Bạn". Nếu người dùng hỏi công việc, đi thẳng vào câu trả lời, KHÔNG chào hỏi vòng vo.
2. NẾU người dùng chỉ chào hỏi (ví dụ: "xin chào", "hello") mà không hỏi gì thêm: Hãy đáp lại bằng một lời chào ngắn gọn, thân thiện (dưới 20 chữ) và hỏi họ cần giúp gì. TUYỆT ĐỐI KHÔNG tự động liệt kê báo cáo hay dữ liệu nếu họ chưa yêu cầu.
3. Khi trả lời câu hỏi công việc: Đi thẳng vào nội dung trọng tâm — không có phần mở đầu xã giao.
4. Giọng văn chuyên nghiệp, lịch sự, thân thiện, tự nhiên.
5. Trả lời đúng trọng tâm câu hỏi, không dài dòng không cần thiết.
6. Với câu hỏi về dữ liệu: dùng số liệu thực từ dữ liệu hệ thống bên dưới. Không bịa số liệu.
7. Với câu hỏi chung (lập trình, kiến thức, tư vấn PM, ...): trả lời từ kiến thức của bạn.
8. **ĐỊNH DẠNG VÀ TRÌNH BÀY (RẤT QUAN TRỌNG)**:
   - Sử dụng Markdown để làm nổi bật nội dung: dùng **in đậm** cho từ khóa/tên task quan trọng, *in nghiêng* cho ghi chú.
   - Luôn phân chia các ý lớn bằng tiêu đề (\\\`###\\\`, \\\`####\\\`).
   - Sử dụng danh sách (bullet points \\\`-\\\` hoặc đánh số \\\`1.\\\`) khi liệt kê các công việc, dự án hoặc các bước thực hiện.
   - Thêm khoảng trắng (xuống dòng) hợp lý giữa các đoạn văn để tạo cảm giác thoáng, dễ đọc.
   - Sử dụng blockquote (\\\`>\\\`) cho các trích dẫn hoặc tóm tắt quan trọng.
   - Nếu có code, hãy dùng code block với đúng ngôn ngữ.
9. Dùng icon phù hợp: 📌 ⚠️ ✅ 🚀 📅 🗂️ 👤 📊 tinh tế ở đầu mỗi phần hoặc mục để giao diện sinh động và trực quan hơn.
10. Nếu dữ liệu trống/không đủ: nói thẳng và gợi ý hành động tiếp theo.
11. **TUYỆT ĐỐI KHÔNG** tự động nhắc nhở, giải thích về chức vụ, vai trò hay quyền hạn (ví dụ: "Với vai trò Admin...") của người dùng trừ khi họ trực tiếp hỏi.
## DỮ LIỆU HỆ THỐNG HIỆN TẠI (dành riêng cho người dùng đang đăng nhập)
\`\`\`json
${JSON.stringify(systemData, null, 2)}
\`\`\`

## LỊCH SỬ TRÒ CHUYỆN GẦN NHẤT
${params.historyText || 'Chưa có lịch sử trong phiên này.'}

## CÂU HỎI HIỆN TẠI
"${params.message}"

Hãy trả lời ngay, đi thẳng vào vấn đề, KHÔNG chào hỏi, KHÔNG lặp tên người dùng ở đầu câu.`;
}

async function createBotResponse(userId: string, finalReply: string) {
    const botMsg = await ChatMessage.create({
        user: userId,
        content: finalReply,
        sender: 'bot',
        timestamp: new Date(),
    });

    return NextResponse.json({
        success: true,
        reply: finalReply,
        data: botMsg,
    });
}

async function getUserProjects(userId: string, projectId: string, isGod: boolean): Promise<ProjectData[]> {
    if (projectId && projectId !== 'all' && mongoose.Types.ObjectId.isValid(projectId)) {
        return Project.find({ _id: new mongoose.Types.ObjectId(projectId) })
            .select('title key description status startDate endDate manager members')
            .populate('manager', 'firstname lastname fullName email')
            .limit(1)
            .lean() as Promise<ProjectData[]>;
    }

    const matchFilter = isGod ? {} : {
        $or: [
            { manager: userId },
            { members: userId },
            { owner: userId },
            { createdBy: userId },
        ],
    };

    const userProjects = await Project.find(matchFilter)
        .select('title key description status startDate endDate manager members')
        .populate('manager', 'firstname lastname fullName email')
        .limit(50)
        .lean() as ProjectData[];

    return userProjects;
}

function getProjectIds(projects: ProjectData[]) {
    return projects
        .map((project) => project._id)
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(String(id)));
}

export async function GET(
    req: NextRequest,
    context: ApiRouteContext
) {
    return withApiHandler(
        req,
        context,
        async (_handlerReq: NextRequest, _user: unknown, userId: string) => {
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
        async (handlerReq: NextRequest, user: unknown, userId: string) => {
            try {
                await connectDB();

                const body = await handlerReq.json() as ChatRequestBody;
                const message = limitText(body.message, MAX_USER_MESSAGE_LENGTH);

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

                // Save user message
                await ChatMessage.create({
                    user: userId,
                    content: message,
                    sender: 'user',
                    timestamp: new Date(),
                });

                // Load recent chat history
                const historyMsgs = await ChatMessage.find({ user: userId })
                    .sort({ timestamp: -1 })
                    .limit(MAX_HISTORY_MESSAGES)
                    .lean() as ChatHistoryMessage[];

                const historyText = buildHistoryText(historyMsgs);

                // Load user profile
                let userProfile: UserProfile | null = null;
                try {
                    userProfile = await User.findById(userId)
                        .select('firstname lastname email department position status isGod createdAt')
                        .lean() as UserProfile | null;
                } catch {
                    // non-blocking
                }

                // Always load full project & task context
                const projects = await getUserProjects(userId, projectId, userProfile?.isGod || false);
                const projectIds = getProjectIds(projects);

                const now = new Date();
                const dueSoonLimit = new Date(Date.now() + 48 * 60 * 60 * 1000);

                const taskBaseMatch: MongoFilter =
                    projectId && projectId !== 'all' && mongoose.Types.ObjectId.isValid(projectId)
                        ? { project: new mongoose.Types.ObjectId(projectId) }
                        : {
                            $or: [
                                { assignee: userId },
                                { creator: userId },
                                { createdBy: userId },
                                ...(projectIds.length ? [{ project: { $in: projectIds } }] : []),
                            ],
                        };

                const [
                    currentTasks,
                    overdueTasks,
                    dueSoonTasks,
                    allUserTasks,
                    totalTasks,
                    completedTasks,
                    cancelledTasks,
                ] = await Promise.all([
                    // Active tasks
                    WorkItem.find({
                        ...taskBaseMatch,
                        status: { $nin: CLOSED_STATUSES },
                    })
                        .select('title description status priority dueDate startDate assignee creator project labels storyPoints')
                        .populate('assignee', 'firstname lastname fullName email')
                        .populate('creator', 'firstname lastname fullName email')
                        .populate('project', 'title key')
                        .sort({ dueDate: 1 })
                        .limit(30)
                        .lean(),

                    // Overdue tasks
                    WorkItem.find({
                        ...taskBaseMatch,
                        status: { $nin: CLOSED_STATUSES },
                        dueDate: { $lt: now },
                    })
                        .select('title description status priority dueDate startDate assignee creator project labels storyPoints')
                        .populate('assignee', 'firstname lastname fullName email')
                        .populate('creator', 'firstname lastname fullName email')
                        .populate('project', 'title key')
                        .sort({ dueDate: 1 })
                        .limit(15)
                        .lean(),

                    // Due soon tasks (next 48h)
                    WorkItem.find({
                        ...taskBaseMatch,
                        status: { $nin: CLOSED_STATUSES },
                        dueDate: { $gt: now, $lte: dueSoonLimit },
                    })
                        .select('title description status priority dueDate startDate assignee creator project labels storyPoints')
                        .populate('assignee', 'firstname lastname fullName email')
                        .populate('creator', 'firstname lastname fullName email')
                        .populate('project', 'title key')
                        .sort({ dueDate: 1 })
                        .limit(15)
                        .lean(),

                    // All tasks overview (recent 20)
                    WorkItem.find(taskBaseMatch)
                        .select('title status priority dueDate assignee project')
                        .populate('assignee', 'firstname lastname fullName email')
                        .populate('project', 'title key')
                        .sort({ dueDate: 1 })
                        .limit(20)
                        .lean(),

                    // Total count
                    WorkItem.countDocuments(taskBaseMatch),

                    // Completed count
                    WorkItem.countDocuments({
                        ...taskBaseMatch,
                        status: { $in: DONE_STATUSES },
                    }),

                    // Cancelled count
                    WorkItem.countDocuments({
                        ...taskBaseMatch,
                        status: { $in: CANCEL_STATUSES },
                    }),
                ]) as [TaskData[], TaskData[], TaskData[], TaskData[], number, number, number];

                if (!apiKey) {
                    return createBotResponse(
                        userId,
                        '⚠️ AI chưa được cấu hình GEMINI_API_KEY. Vui lòng liên hệ quản trị viên hệ thống.'
                    );
                }

                const prompt = buildSystemPrompt({
                    message,
                    historyText,
                    userProfile,
                    totalTasks,
                    completedTasks,
                    cancelledTasks,
                    projects,
                    currentTasks,
                    overdueTasks,
                    dueSoonTasks,
                    allUserTasks,
                });

                const model = genAI.getGenerativeModel({
                    model: GEMINI_MODEL,
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: MAX_REPLY_TOKENS,
                    },
                });

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();

                const finalReply =
                    text ||
                    '⚠️ Tôi đã nhận được câu hỏi nhưng chưa tạo được phản hồi phù hợp. Bạn vui lòng thử lại.';

                return createBotResponse(userId, finalReply);
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
