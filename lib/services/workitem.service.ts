import WorkItem from '@/models/work-item.model';
import Project from '@/models/project.model';
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
        .populate('assignee', 'firstname lastname email')
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
        assignee: body.assignee || null
    });

    await Project.findByIdAndUpdate(projectId, { taskCount: newCount });

    // Populate assignee before returning
    const populatedTask = await WorkItem.findById(newTask._id)
        .populate('assignee', 'firstname lastname email avatar');

    if (!populatedTask) return newTask.toObject();

    return {
        ...populatedTask.toObject(),
        status: toFrontendStatus(populatedTask.status),
    };
};

export const updateWorkItem = async (projectId: string, body: any) => {
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

    const startDate = updateData.startDate ? new Date(updateData.startDate) : existingTask.startDate;
    const dueDate = updateData.dueDate ? new Date(updateData.dueDate) : existingTask.dueDate;

    if (startDate && dueDate && startDate > dueDate) {
        throw new Error('Ngày kết thúc không được trước ngày bắt đầu');
    }

    const updatedTask = await WorkItem.findOneAndUpdate(
        { _id: workItemId, project: projectId },
        { $set: updateData },
        { new: true }
    ).populate('assignee', 'firstname lastname email avatar');

    if (!updatedTask) {
        throw new Error('Task not found');
    }

    const obj = updatedTask.toObject();
    return {
        ...obj,
        status: toFrontendStatus(obj.status),
    };
};
