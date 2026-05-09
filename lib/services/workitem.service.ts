import WorkItem from '@/models/work-item.model';
import Project from '@/models/project.model';
import User from '@/models/user.model';
import Notification from '@/models/notification.model';
import { connectToDatabase } from '@/lib/mongo';

// Helper: Chuẩn hóa Status từ Frontend (todo -> Todo, in_progress -> In Progress)
const normalizeStatus = (status: string) => {
    const map: Record<string, string> = {
        'todo': 'Todo',
        'backlog': 'Backlog',
        'in_progress': 'In Progress',
        'in progress': 'In Progress',
        'done': 'Done',
        'canceled': 'Cancel',
        'cancel': 'Cancel',
    };

    if (['Backlog', 'Todo', 'In Progress', 'Done', 'Cancel'].includes(status)) return status;
    return map[status.toLowerCase()] || 'Todo';
};

const toFrontendStatus = (status: string) => {
    return status;
};

export const getWorkItems = async (projectId: string) => {
    await connectToDatabase();
    const tasks = await WorkItem.find({ project: projectId })
        .populate('assignee', 'firstname lastname email avatar')
        .populate('creator', 'firstname lastname email avatar')
        .populate('activities.user', 'firstname lastname email avatar')
        .sort({ createdAt: -1 });

    return tasks.map(t => ({
        ...t.toObject(),
        status: t.status
    }));
};

export const createWorkItem = async (projectId: string, body: any) => {
    await connectToDatabase();

    if (body.startDate && body.dueDate) {
        const start = new Date(body.startDate);
        const end = new Date(body.dueDate);
        if (start > end) {
            throw new Error('Ngày kết thúc không được trước ngày bắt đầu');
        }
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const currentCount = project.taskCount || 0;
    const newCount = currentCount + 1;
    const projectKey = project.key || project.title.substring(0, 3).toUpperCase();
    const newTaskId = `${projectKey}-${newCount}`;

    const dbStatus = normalizeStatus(body.status || 'todo');
    const dbPriority = body.priority ?
        (body.priority.charAt(0).toUpperCase() + body.priority.slice(1).toLowerCase()) : 'Medium';

    const initialActivities: any[] = [];
    if (body.creator) {
        initialActivities.push({
            type: 'create',
            user: body.creator,
            content: 'đã tạo công việc này'
        });
    }

    if (body.assignee && body.creator) {
        const assignedUser = await User.findById(body.assignee);
        const assignedName = assignedUser ? `${assignedUser.lastname} ${assignedUser.firstname}`.trim() : 'Nhân viên';
        initialActivities.push({
            type: 'assign',
            user: body.creator,
            content: `đã giao công việc cho <b>${assignedName}</b>`
        });
    }

    const newTask = await WorkItem.create({
        title: body.title,
        description: body.description || '',
        priority: dbPriority,
        status: dbStatus,
        project: projectId,
        taskId: newTaskId,
        startDate: body.startDate,
        dueDate: body.dueDate,
        estimate: body.estimate,
        parentId: body.parentId || null,
        assignee: body.assignee || null,
        creator: body.creator || null,
        activities: initialActivities
    });
    
    // Gửi thông báo cho người được giao việc
    if (body.assignee && body.assignee !== body.creator) {
        try {
            await Notification.create({
                recipient: body.assignee,
                type: 'task',
                title: 'Công việc mới được giao',
                message: `Bạn đã được giao công việc mới: "${body.title}" trong dự án ${project.title}`,
                link: `/control/projects`
            });
        } catch (error) {
            console.error('Failed to send assignment notification:', error);
        }
    }

    await Project.findByIdAndUpdate(projectId, { taskCount: newCount });

    // Populate assignee and creator before returning
    const populatedTask = await WorkItem.findById(newTask._id)
        .populate('assignee', 'firstname lastname email avatar')
        .populate('creator', 'firstname lastname email avatar')
        .populate('activities.user', 'firstname lastname email avatar');

    if (!populatedTask) return newTask.toObject();

    return {
        ...populatedTask.toObject(),
        status: toFrontendStatus(populatedTask.status),
    };
};

export const updateWorkItem = async (projectId: string, body: any, userId?: string) => {
    await connectToDatabase();
    const { workItemId, ...fields } = body;

    if (!workItemId) {
        throw new Error('Missing workItemId');
    }

    const updateData: any = {};
    for (const key in fields) {
        const value = fields[key];
        if (key === 'status') {
            updateData.status = normalizeStatus(value);
        } else if (key === 'priority' && value) {
            updateData.priority =
                value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        } else if (key === 'assignee') {
            updateData.assignee = value || null;
        } else {
            updateData[key] = value;
        }
    }

    const existingTask = await WorkItem.findOne({ _id: workItemId, project: projectId });
    if (!existingTask) {
        throw new Error('Task not found');
    }

    // Time Tracking Logic
    if (updateData.status && updateData.status !== existingTask.status) {
        const newStatus = updateData.status;

        if (newStatus === 'In Progress') {
            // Chỉ ghi nhận lần đầu tiên hoặc nếu chưa có
            if (!existingTask.actualStartDate) {
                updateData.actualStartDate = new Date();
            }
        }

        if (newStatus === 'Done') {
            updateData.actualEndDate = new Date();
            const start = existingTask.actualStartDate || new Date();
            const end = updateData.actualEndDate;
            const diffMs = end.getTime() - start.getTime();
            updateData.timeLogged = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
        }
    }

    const startDate = updateData.startDate ? new Date(updateData.startDate) : existingTask.startDate;
    const dueDate = updateData.dueDate ? new Date(updateData.dueDate) : existingTask.dueDate;

    if (startDate && dueDate && startDate > dueDate) {
        throw new Error('Ngày kết thúc không được trước ngày bắt đầu');
    }

    const activities: any[] = [];

    // Track status change
    if (updateData.status && updateData.status !== existingTask.status && userId) {
        activities.push({
            type: 'state',
            user: userId,
            content: `đã đổi trạng thái thành <b>${updateData.status}</b>`
        });
    }

    // Track assignee change
    if ('assignee' in updateData && userId) {
        const oldAssigneeStr = existingTask.assignee?.toString() || null;
        const newAssigneeStr = updateData.assignee?.toString() || null;
        if (oldAssigneeStr !== newAssigneeStr) {
            if (updateData.assignee) {
                const assignedUser = await User.findById(updateData.assignee);
                const assignedName = assignedUser ? `${assignedUser.lastname} ${assignedUser.firstname}`.trim() : 'Nhân viên';
                activities.push({
                    type: 'assign',
                    user: userId,
                    content: `đã giao công việc cho <b>${assignedName}</b>`
                });
            } else {
                activities.push({
                    type: 'assign',
                    user: userId,
                    content: `đã gỡ bỏ người phụ trách`
                });
            }
        }
    }

    // Track comment
    if (fields.comment && userId) {
        activities.push({
            type: 'comment',
            user: userId,
            content: fields.comment
        });
    }

    // --- GỬI THÔNG BÁO ---
    
    // 1. Thông báo khi được giao việc mới (Re-assign)
    if ('assignee' in updateData && updateData.assignee && updateData.assignee.toString() !== (existingTask.assignee?.toString() || '')) {
        try {
            await Notification.create({
                recipient: updateData.assignee,
                type: 'task',
                title: 'Bạn được giao công việc mới',
                message: `Bạn vừa được chỉ định phụ trách công việc: "${existingTask.title}"`,
                link: `/control/projects`
            });
        } catch (e) { console.error(e); }
    }

    // 2. Nhắc nhở khi kéo vào In Progress (Sắp đến hạn)
    if (updateData.status === 'In Progress' && existingTask.status !== 'In Progress') {
        const recipient = updateData.assignee || existingTask.assignee;
        if (recipient) {
            try {
                await Notification.create({
                    recipient,
                    type: 'warning',
                    title: 'Bắt đầu thực hiện & Nhắc deadline',
                    message: `Công việc "${existingTask.title}" đã bắt đầu. Thời gian ước tính: ${existingTask.estimate || 0}h. Hãy chú ý hoàn thành đúng hạn!`,
                    link: `/control/projects`
                });
            } catch (e) { console.error(e); }
        }
    }

    const finalUpdate: any = { $set: updateData };
    if (activities.length > 0) {
        finalUpdate.$push = { activities: { $each: activities } };
    }

    const updatedTask = await WorkItem.findOneAndUpdate(
        { _id: workItemId, project: projectId },
        finalUpdate,
        { new: true }
    )
        .populate('assignee', 'firstname lastname email avatar')
        .populate('creator', 'firstname lastname email avatar')
        .populate('activities.user', 'firstname lastname email avatar');

    if (!updatedTask) {
        throw new Error('Task not found');
    }

    const obj = updatedTask.toObject();
    return {
        ...obj,
        status: toFrontendStatus(obj.status),
    };
};

export const getOverdueWorkItems = async (userId: string) => {
    await connectToDatabase();
    const now = new Date();
    
    const tasks = await WorkItem.find({
        assignee: userId,
        status: { $nin: ['Done', 'Cancel'] },
        dueDate: { $lt: now }
    })
    .populate('project', 'title key')
    .sort({ dueDate: 1 });

    return tasks.map(t => t.toObject());
};

export const getTodayStats = async (userId: string) => {
    await connectToDatabase();
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await WorkItem.find({
        assignee: userId,
        dueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;

    return { total, completed };
};
