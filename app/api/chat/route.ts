import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import Project from '@/models/project.model';
import ChatMessage from '@/models/chat-message.model';
import { withApiHandler } from '@/lib/api-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

const MAX_USER_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_CONTENT_LENGTH = 200;
const MAX_REPLY_LENGTH = 2500;

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

type ProjectSummary = {
    _id?: string | mongoose.Types.ObjectId;
    title?: string;
    key?: string;
};

type AssigneeSummary = {
    firstname?: string;
    lastname?: string;
    fullName?: string;
    email?: string;
    avatar?: string;
};

type TaskSummary = {
    _id?: string | mongoose.Types.ObjectId;
    title?: string;
    status?: string;
    priority?: string;
    dueDate?: string | Date;
    assignee?: AssigneeSummary | string | null;
    project?: ProjectSummary | string | null;
};

type MongoFilter = Record<string, unknown>;

function limitText(value: unknown, maxLength = MAX_HISTORY_CONTENT_LENGTH) {
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

function formatAssignee(assignee?: TaskSummary['assignee']) {
    if (!assignee) return 'Chưa phân công';

    if (typeof assignee === 'string') {
        return assignee;
    }

    const fullName =
        assignee.fullName ||
        `${assignee.lastname || ''} ${assignee.firstname || ''}`.trim();

    return fullName || assignee.email || 'Chưa rõ người phụ trách';
}

function formatProject(project?: TaskSummary['project']) {
    if (!project) return 'Chưa gắn dự án';

    if (typeof project === 'string') {
        return project;
    }

    const key = project.key ? ` (${project.key})` : '';
    return `${project.title || 'Dự án chưa có tên'}${key}`;
}

function normalizeTask(task: TaskSummary) {
    return {
        title: task.title || 'Không có tiêu đề',
        status: task.status || 'Chưa rõ',
        priority: task.priority || 'Không rõ',
        dueDate: formatDate(task.dueDate),
        assignee: formatAssignee(task.assignee),
        project: formatProject(task.project),
    };
}

function cleanAIReply(text: string) {
    return text
        .normalize('NFC')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\*\*/g, '')
        .replace(/#{1,6}\s?/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, MAX_REPLY_LENGTH);
}

function buildHistoryText(historyMsgs: ChatHistoryMessage[]) {
    return historyMsgs
        .reverse()
        .map((msg) => {
            const sender = msg.sender === 'user' ? 'Người dùng' : 'Trợ lý';
            return `${sender}: ${limitText(msg.content)}`;
        })
        .join('\n');
}

function getQuickReply(message: string) {
    const text = message.toLowerCase().trim();

    if (['hello', 'hi', 'hey', 'xin chào', 'chào', 'chao', 'alo'].includes(text)) {
        return '👋 Chào Bạn! Tôi có thể hỗ trợ Bạn xem tiến độ, task trễ hạn, deadline, danh sách dự án và đề xuất việc cần ưu tiên.';
    }

    if (['cảm ơn', 'cam on', 'thanks', 'thank you'].includes(text)) {
        return '✅ Rất vui được hỗ trợ Bạn. Khi cần xem tiến độ, deadline hoặc task trễ hạn, Bạn cứ nhắn cho tôi.';
    }

    if (['ok', 'oke', 'được', 'duoc'].includes(text)) {
        return '👌 Tôi đã hiểu. Bạn có thể hỏi tiếp về tiến độ, deadline hoặc công việc cần ưu tiên.';
    }

    if (
        text.includes('thời tiết') ||
        text.includes('nhiệt độ') ||
        text.includes('bao nhiêu độ')
    ) {
        return '🌤️ Hiện tại Smart SPM chưa tích hợp API thời tiết. Tôi có thể hỗ trợ Bạn tốt nhất về tiến độ dự án, công việc, deadline và task trễ hạn.';
    }

    return null;
}

function needProjectContext(message: string) {
    const keywords = [
        'task',
        'công việc',
        'việc',
        'dự án',
        'tiến độ',
        'deadline',
        'trễ',
        'trễ hạn',
        'quá hạn',
        'sắp đến hạn',
        'ưu tiên',
        'hoàn thành',
        'rủi ro',
        'project',
        'thống kê',
        'báo cáo',
        'dashboard',
        'thành viên',
        'member',
        'người phụ trách',
        'phụ trách',
        'phân công',
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some((keyword) => lowerMessage.includes(keyword));
}

function isProjectListQuestion(message: string) {
    const text = message.toLowerCase();

    return (
        text.includes('liệt kê dự án') ||
        text.includes('liệt kê những dự án') ||
        text.includes('liệt kê tất cả dự án') ||
        text.includes('danh sách dự án') ||
        text.includes('những dự án') ||
        text.includes('các dự án') ||
        text.includes('dự án đó') ||
        text.includes('bao nhiêu dự án') ||
        text.includes('xem dự án')
    );
}

function isActiveTaskQuestion(message: string) {
    const text = message.toLowerCase();

    return (
        text.includes('công việc gì') ||
        text.includes('việc gì') ||
        text.includes('đang hoạt động') ||
        text.includes('đang làm') ||
        text.includes('task đang làm') ||
        text.includes('task hoạt động') ||
        text.includes('công việc hiện tại') ||
        text.includes('việc hiện tại') ||
        text.includes('đang có những công việc') ||
        text.includes('đang có việc') ||
        text.includes('công việc đang xử lý') ||
        text.includes('có mặt trong công việc')
    );
}

function isOverdueTaskQuestion(message: string) {
    const text = message.toLowerCase();

    return (
        text.includes('trễ hạn') ||
        text.includes('quá hạn') ||
        text.includes('bị trễ') ||
        text.includes('đang trễ') ||
        text.includes('công việc trễ') ||
        text.includes('task trễ')
    );
}

function isDueSoonTaskQuestion(message: string) {
    const text = message.toLowerCase();

    return (
        text.includes('sắp đến hạn') ||
        text.includes('gần đến hạn') ||
        text.includes('deadline gần') ||
        text.includes('đến hạn trong')
    );
}

function isPriorityQuestion(message: string) {
    const text = message.toLowerCase();

    return (
        text.includes('ưu tiên') ||
        text.includes('làm trước') ||
        text.includes('việc nào trước') ||
        text.includes('nên làm gì') ||
        text.includes('cần xử lý trước')
    );
}

function isProgressSummaryQuestion(message: string) {
    const text = message.toLowerCase();

    return (
        text.includes('tóm tắt tiến độ') ||
        text.includes('tiến độ công việc') ||
        text.includes('tổng quan công việc') ||
        text.includes('báo cáo công việc') ||
        text.includes('thống kê công việc')
    );
}

function buildTaskLines(tasks: TaskSummary[], icon = '•', maxDisplay = 8) {
    return tasks
        .slice(0, maxDisplay)
        .map((task, index) => {
            const item = normalizeTask(task);
            return `- ${icon} **${index + 1}. ${item.title}**\n  Dự án: ${item.project}\n  Người phụ trách: ${item.assignee}\n  Trạng thái: ${item.status} · Ưu tiên: ${item.priority} · Hạn: ${item.dueDate}`;
        })
        .join('\n');
}

function buildProjectListReply(projects: ProjectSummary[]) {
    if (!projects.length) {
        return '🗂️ **Danh sách dự án**\n\nHiện tại hệ thống chưa ghi nhận dự án nào liên quan đến tài khoản của Bạn.';
    }

    const maxDisplay = 20;

    const projectLines = projects
        .slice(0, maxDisplay)
        .map((project, index) => {
            const title = project.title || 'Dự án chưa có tên';
            const key = project.key ? ` · Mã: ${project.key}` : '';
            return `- 📁 **${index + 1}. ${title}**${key}`;
        })
        .join('\n');

    const moreText = projects.length > maxDisplay
        ? `\n\n_Ghi chú: Tôi đang hiển thị ${maxDisplay}/${projects.length} dự án đầu tiên._`
        : '';

    return `🗂️ **Danh sách dự án của tài khoản**\n\nHệ thống ghi nhận **${projects.length} dự án** liên quan đến Bạn:\n\n${projectLines}${moreText}`;
}

function buildActiveTaskReply(tasks: TaskSummary[]) {
    if (!tasks.length) {
        return '✅ **Công việc đang hoạt động**\n\nHiện tại hệ thống chưa ghi nhận công việc nào đang hoạt động liên quan đến tài khoản của Bạn.';
    }

    return `📌 **Công việc đang hoạt động**\n\nTôi tìm thấy **${tasks.length} công việc** liên quan đến tài khoản của Bạn:\n\n${buildTaskLines(tasks, '🔹')}\n\n💡 **Gợi ý:** Ưu tiên cập nhật trạng thái cho các việc có hạn gần nhất.`;
}

function buildOverdueTaskReply(tasks: TaskSummary[]) {
    if (!tasks.length) {
        return '✅ **Công việc trễ hạn**\n\nHiện tại Bạn không có công việc nào bị trễ hạn.';
    }

    return `⚠️ **Công việc đang trễ hạn**\n\nBạn có **${tasks.length} công việc trễ hạn** cần xử lý:\n\n${buildTaskLines(tasks, '🚨', 10)}\n\n🚀 **Đề xuất:** Xử lý các task có hạn cũ nhất trước, sau đó cập nhật trạng thái để giảm rủi ro tiến độ.`;
}

function buildDueSoonTaskReply(tasks: TaskSummary[]) {
    if (!tasks.length) {
        return '✅ **Công việc sắp đến hạn**\n\nHiện tại Bạn không có công việc nào sắp đến hạn trong 48 giờ tới.';
    }

    return `⏳ **Công việc sắp đến hạn**\n\nBạn có **${tasks.length} công việc** cần chú ý trong 48 giờ tới:\n\n${buildTaskLines(tasks, '📅', 10)}\n\n💡 **Gợi ý:** Kiểm tra tiến độ và cập nhật trạng thái trước khi quá hạn.`;
}

function buildPriorityReply(currentTasks: TaskSummary[], overdueTasks: TaskSummary[], dueSoonTasks: TaskSummary[]) {
    const map = new Map<string, TaskSummary>();

    [...overdueTasks, ...dueSoonTasks, ...currentTasks].forEach((task) => {
        const key = `${task.title || ''}-${task.status || ''}-${String(task.dueDate || '')}`;
        if (!map.has(key)) map.set(key, task);
    });

    const priorityTasks = Array.from(map.values()).slice(0, 5);

    if (!priorityTasks.length) {
        return '✅ **Ưu tiên công việc**\n\nHiện tại chưa có công việc cần ưu tiên rõ ràng. Bạn có thể tiếp tục cập nhật tiến độ các task đang làm.';
    }

    return `🚀 **Việc nên ưu tiên trước**\n\nTôi đề xuất Bạn xử lý theo thứ tự sau:\n\n${buildTaskLines(priorityTasks, '⭐', 5)}\n\n📌 **Nguyên tắc:** Task trễ hạn trước, tiếp theo là task sắp đến hạn, sau đó mới đến các việc còn lại.`;
}

function buildProgressSummaryReply(params: {
    totalTasks: number;
    completedTasks: number;
    currentTasks: TaskSummary[];
    overdueTasks: TaskSummary[];
    dueSoonTasks: TaskSummary[];
    projects: ProjectSummary[];
}) {
    const completionRate = params.totalTasks > 0
        ? Math.round((params.completedTasks / params.totalTasks) * 100)
        : 0;

    return `📊 **Tóm tắt tiến độ của tài khoản**\n\n- 🗂️ Dự án liên quan: **${params.projects.length}**\n- 📌 Tổng công việc: **${params.totalTasks}**\n- ✅ Đã hoàn thành: **${params.completedTasks}**\n- 🔄 Đang hoạt động: **${params.currentTasks.length}**\n- ⚠️ Trễ hạn: **${params.overdueTasks.length}**\n- ⏳ Sắp đến hạn: **${params.dueSoonTasks.length}**\n- 📈 Tỉ lệ hoàn thành: **${completionRate}%**\n\n🚀 **Đề xuất:** ${params.overdueTasks.length > 0 ? 'Ưu tiên xử lý công việc trễ hạn trước.' : 'Tiếp tục cập nhật tiến độ các task đang hoạt động.'}`;
}

function buildSystemPrompt(params: {
    message: string;
    historyText: string;
    totalTasks: number;
    completedTasks: number;
    projects: ProjectSummary[];
    currentTasks: TaskSummary[];
    overdueTasks: TaskSummary[];
    dueSoonTasks: TaskSummary[];
}) {
    const completionRate = params.totalTasks > 0
        ? Math.round((params.completedTasks / params.totalTasks) * 100)
        : 0;

    const systemData = {
        currentTime: new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
        }),
        totalTasks: params.totalTasks,
        completedTasks: params.completedTasks,
        completionRate: `${completionRate}%`,
        projectCount: params.projects.length,
        projects: params.projects.map((project) => ({
            title: project.title || 'Không có tên',
            key: project.key || 'N/A',
        })),
        currentTaskCount: params.currentTasks.length,
        currentTasks: params.currentTasks.map(normalizeTask),
        overdueTaskCount: params.overdueTasks.length,
        overdueTasks: params.overdueTasks.map(normalizeTask),
        dueSoonTaskCount: params.dueSoonTasks.length,
        dueSoonTasks: params.dueSoonTasks.map(normalizeTask),
    };

    return `Bạn là SPM AI Copilot, trợ lý thông minh chính thức của hệ thống quản lý dự án Smart SPM.

TIÊU CHÍ BẮT BUỘC:
1. Luôn xưng hô "Tôi" và "Bạn".
2. Giọng văn chuyên nghiệp, lịch sự, rõ ràng và thân thiện.
3. Trả lời ngắn gọn, đi thẳng vào vấn đề, không chào hỏi lặp lại.
4. Với câu hỏi liên quan dự án, task, tiến độ, rủi ro hoặc deadline: phải ưu tiên số liệu thật trong dữ liệu hệ thống.
5. Không bịa số liệu, không tự thêm tên dự án/task ngoài dữ liệu được cung cấp.
6. Nếu dữ liệu chưa đủ, nói theo hướng: "Dữ liệu hiện tại chưa thể hiện rõ..." và đề xuất cách kiểm tra tiếp theo.
7. Với câu hỏi ngoài hệ thống, vẫn trả lời tự nhiên, thông minh, ngắn gọn và có ích.
8. Không tự nhận "Tôi là AI". Không trả lời máy móc kiểu "Tôi không có thông tin".
9. Không dùng markdown đậm dạng **...**. Không dùng tiêu đề dài. Không viết thành một đoạn quá dài.
10. Câu trả lời nên dưới 120 từ, trừ khi người dùng yêu cầu liệt kê chi tiết.
11. Có thể dùng icon chuyên nghiệp như 📌 ⚠️ ✅ 🚀 📅 🗂️ nhưng không lạm dụng.

CÁCH TRÌNH BÀY LINH HOẠT:
- Không dùng cố định một mẫu trả lời cho mọi câu hỏi. Hãy tự chọn cách trình bày phù hợp với ý định của người dùng.
- Nếu người dùng hỏi câu đơn giản hoặc chào hỏi: trả lời tự nhiên trong 1 đến 2 câu, không cần chia mục.
- Nếu người dùng hỏi danh sách dự án, công việc hoặc thành viên: trình bày dạng tiêu đề ngắn + danh sách gạch đầu dòng rõ ràng.
- Nếu người dùng hỏi tiến độ, rủi ro hoặc tình trạng hệ thống: trình bày theo dạng báo cáo ngắn, có số liệu chính và nhận xét.
- Nếu người dùng hỏi nên làm gì trước hoặc cần ưu tiên việc nào: trả lời theo dạng danh sách ưu tiên, kèm lý do ngắn cho từng việc.
- Nếu dữ liệu hiện tại trống hoặc chưa đủ: nói rõ hệ thống chưa ghi nhận dữ liệu nào, sau đó gợi ý hành động tiếp theo một cách lịch sự.
- Nếu câu hỏi cần phân tích sâu: có thể dùng các mục như "📌 Nhận định", "⚠️ Vấn đề cần chú ý", "🚀 Đề xuất", nhưng không bắt buộc lúc nào cũng dùng.
- Có thể dùng icon chuyên nghiệp như 📌 ⚠️ ✅ 🚀 📅 🗂️ 👤 nhưng chỉ dùng vừa phải, không lạm dụng.
- Không được trả về key thô như totalTasks, completedTasks, completionRate, projects, currentTasks, overdueTasks, dueSoonTasks.
- Không trả lời thành một đoạn dài. Ưu tiên xuống dòng rõ ràng, dễ đọc, giống một trợ lý quản lý dự án chuyên nghiệp.

DỮ LIỆU HỆ THỐNG HIỆN TẠI:
${JSON.stringify(systemData, null, 2)}

LỊCH SỬ TRÒ CHUYỆN GẦN NHẤT:
${params.historyText || 'Chưa có lịch sử trong phiên gần đây.'}

CÂU HỎI HIỆN TẠI CỦA NGƯỜI DÙNG:
"${params.message}"

Hãy trả lời ngay, chuyên nghiệp, đúng trọng tâm và hữu ích.`;
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

async function getUserProjects(userId: string, projectId: string) {
    if (projectId && projectId !== 'all' && mongoose.Types.ObjectId.isValid(projectId)) {
        return Project.find({ _id: new mongoose.Types.ObjectId(projectId) })
            .select('title key')
            .limit(50)
            .lean() as Promise<ProjectSummary[]>;
    }

    const userProjects = await Project.find({
        $or: [
            { manager: userId },
            { members: userId },
            { owner: userId },
            { createdBy: userId },
        ],
    })
        .select('title key')
        .limit(50)
        .lean() as ProjectSummary[];

    if (userProjects.length > 0) return userProjects;

    return Project.find()
        .select('title key')
        .limit(50)
        .lean() as Promise<ProjectSummary[]>;
}

function getProjectIds(projects: ProjectSummary[]) {
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
        async (handlerReq: NextRequest, _user: unknown, userId: string) => {
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

                const quickReply = getQuickReply(message);

                if (quickReply) {
                    await ChatMessage.create({
                        user: userId,
                        content: message,
                        sender: 'user',
                        timestamp: new Date(),
                    });

                    return createBotResponse(userId, quickReply);
                }

                const historyMsgs = await ChatMessage.find({ user: userId })
                    .sort({ timestamp: -1 })
                    .limit(3)
                    .lean() as ChatHistoryMessage[];

                const historyText = buildHistoryText(historyMsgs);

                await ChatMessage.create({
                    user: userId,
                    content: message,
                    sender: 'user',
                    timestamp: new Date(),
                });

                const shouldLoadProjectData =
                    needProjectContext(message) ||
                    isProjectListQuestion(message) ||
                    isActiveTaskQuestion(message) ||
                    isOverdueTaskQuestion(message) ||
                    isDueSoonTaskQuestion(message) ||
                    isPriorityQuestion(message) ||
                    isProgressSummaryQuestion(message);

                let projects: ProjectSummary[] = [];
                let currentTasks: TaskSummary[] = [];
                let overdueTasks: TaskSummary[] = [];
                let dueSoonTasks: TaskSummary[] = [];
                let totalTasks = 0;
                let completedTasks = 0;

                if (shouldLoadProjectData) {
                    projects = await getUserProjects(userId, projectId);
                    const projectIds = getProjectIds(projects);

                    const now = new Date();
                    const dueSoonLimit = new Date(
                        Date.now() + 48 * 60 * 60 * 1000
                    );

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

                    [
                        currentTasks,
                        overdueTasks,
                        dueSoonTasks,
                        totalTasks,
                        completedTasks,
                    ] = await Promise.all([
                        WorkItem.find({
                            ...taskBaseMatch,
                            status: { $nin: CLOSED_STATUSES },
                        })
                            .select('title status priority dueDate assignee project')
                            .populate('assignee', 'firstname lastname fullName email avatar')
                            .populate('project', 'title key')
                            .sort({ dueDate: 1 })
                            .limit(30)
                            .lean(),

                        WorkItem.find({
                            ...taskBaseMatch,
                            status: { $nin: CLOSED_STATUSES },
                            dueDate: { $lt: now },
                        })
                            .select('title status priority dueDate assignee project')
                            .populate('assignee', 'firstname lastname fullName email avatar')
                            .populate('project', 'title key')
                            .sort({ dueDate: 1 })
                            .limit(15)
                            .lean(),

                        WorkItem.find({
                            ...taskBaseMatch,
                            status: { $nin: CLOSED_STATUSES },
                            dueDate: {
                                $gt: now,
                                $lte: dueSoonLimit,
                            },
                        })
                            .select('title status priority dueDate assignee project')
                            .populate('assignee', 'firstname lastname fullName email avatar')
                            .populate('project', 'title key')
                            .sort({ dueDate: 1 })
                            .limit(15)
                            .lean(),

                        WorkItem.countDocuments(taskBaseMatch),

                        WorkItem.countDocuments({
                            ...taskBaseMatch,
                            status: { $in: DONE_STATUSES },
                        }),
                    ]) as [TaskSummary[], TaskSummary[], TaskSummary[], number, number];
                }

                if (isProjectListQuestion(message)) {
                    return createBotResponse(userId, buildProjectListReply(projects));
                }

                if (isProgressSummaryQuestion(message)) {
                    return createBotResponse(
                        userId,
                        buildProgressSummaryReply({
                            totalTasks,
                            completedTasks,
                            currentTasks,
                            overdueTasks,
                            dueSoonTasks,
                            projects,
                        })
                    );
                }

                if (isOverdueTaskQuestion(message)) {
                    return createBotResponse(userId, buildOverdueTaskReply(overdueTasks));
                }

                if (isDueSoonTaskQuestion(message)) {
                    return createBotResponse(userId, buildDueSoonTaskReply(dueSoonTasks));
                }

                if (isPriorityQuestion(message)) {
                    return createBotResponse(
                        userId,
                        buildPriorityReply(currentTasks, overdueTasks, dueSoonTasks)
                    );
                }

                if (isActiveTaskQuestion(message)) {
                    return createBotResponse(userId, buildActiveTaskReply(currentTasks));
                }

                if (!apiKey) {
                    return createBotResponse(
                        userId,
                        '⚠️ AI chưa được cấu hình GEMINI_API_KEY. Tôi vẫn có thể hỗ trợ các câu hỏi dữ liệu như task trễ hạn, task sắp đến hạn, danh sách dự án hoặc công việc đang hoạt động.'
                    );
                }

                const prompt = buildSystemPrompt({
                    message,
                    historyText,
                    totalTasks,
                    completedTasks,
                    projects,
                    currentTasks,
                    overdueTasks,
                    dueSoonTasks,
                });

                const model = genAI.getGenerativeModel({
                    model: GEMINI_MODEL,
                    generationConfig: {
                        temperature: 0.25,
                        maxOutputTokens: 350,
                    },
                });

                const result = await model.generateContent(prompt);
                const text = cleanAIReply(result.response.text());

                const finalReply =
                    text ||
                    '⚠️ Tôi đã nhận được câu hỏi, nhưng hiện chưa tạo được phản hồi phù hợp. Bạn vui lòng thử lại.';

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
