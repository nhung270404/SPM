import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import { getAIInsight } from '@/lib/gemini';
import { Types } from 'mongoose';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TaskAssignee = {
  _id: Types.ObjectId | string;
  firstname?: string;
  lastname?: string;
  email?: string;
};

type StatisticsTask = {
  status?: string;
  dueDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  assignee?: TaskAssignee | null;
};

type MemberStatistic = {
  name: string;
  done: number;
  total: number;
  overdue: number;
};

type ProgressItem = {
  name: string;
  completed: number;
  ongoing: number;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'done':
    case 'completed':
      return '#22c55e';
    case 'in progress':
    case 'doing':
      return '#eab308';
    case 'todo':
    case 'new':
      return '#3b82f6';
    case 'backlog':
      return '#94a3b8';
    case 'cancel':
      return '#ef4444';
    default:
      return '#8b5cf6';
  }
};

const isCompletedStatus = (status: string) => {
  return ['done', 'completed'].includes(status);
};

const isActiveStatus = (status: string) => {
  return !['done', 'completed', 'cancel'].includes(status);
};

const toDateKey = (value?: string | Date) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const projectId = id;

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
          { error: 'Invalid Project ID' },
          { status: 400 }
      );
    }

    const tasks = await WorkItem.find({ project: projectId })
        .populate('assignee', 'firstname lastname email')
        .lean() as StatisticsTask[];

    const now = new Date();

    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
    let atRiskTasks = 0;
    let severelyOverdue = 0;
    let dueThisWeek = 0;

    const fortyEightHoursLater = new Date(
        now.getTime() + 48 * 60 * 60 * 1000
    );

    const threeDaysAgo = new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
    );

    const startOfWeek = new Date(now);

    startOfWeek.setDate(
        now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const statusCountMap: Record<string, number> = {};
    const memberMap: Record<string, MemberStatistic> = {};

    tasks.forEach((task) => {
      const status = task.status || 'Unknown';
      const normalizedStatus = status.toLowerCase();

      statusCountMap[status] = (statusCountMap[status] || 0) + 1;

      if (isCompletedStatus(normalizedStatus)) {
        completedTasks++;
      } else if (['in progress', 'doing'].includes(normalizedStatus)) {
        inProgressTasks++;
      }

      if (isActiveStatus(normalizedStatus) && task.dueDate) {
        const dueDate = new Date(task.dueDate);

        if (dueDate < now) {
          overdueTasks++;

          if (dueDate < threeDaysAgo) {
            severelyOverdue++;
          }
        } else if (dueDate < fortyEightHoursLater) {
          atRiskTasks++;
        }

        if (dueDate >= startOfWeek && dueDate <= endOfWeek) {
          dueThisWeek++;
        }
      }

      if (task.assignee) {
        const userId = task.assignee._id.toString();

        const fullName =
            `${task.assignee.lastname || ''} ${task.assignee.firstname || ''}`.trim() ||
            task.assignee.email ||
            'Không xác định';

        if (!memberMap[userId]) {
          memberMap[userId] = {
            name: fullName,
            done: 0,
            total: 0,
            overdue: 0,
          };
        }

        if (normalizedStatus !== 'cancel') {
          memberMap[userId].total++;

          if (isCompletedStatus(normalizedStatus)) {
            memberMap[userId].done++;
          }

          if (
              isActiveStatus(normalizedStatus) &&
              task.dueDate &&
              new Date(task.dueDate) < now
          ) {
            memberMap[userId].overdue++;
          }
        }
      }
    });

    const totalTasks = tasks.length;

    const totalActiveTasks = tasks.filter((task) => {
      const normalizedStatus = (task.status || '').toLowerCase();

      return isActiveStatus(normalizedStatus);
    }).length;

    const delayRisk =
        totalActiveTasks > 0
            ? Math.round(((overdueTasks + atRiskTasks) / totalActiveTasks) * 100)
            : 0;

    const statusDistribution = Object.entries(statusCountMap).map(
        ([name, value]) => ({
          name,
          value: totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0,
          color: getStatusColor(name),
        })
    );

    const memberPerformance = Object.values(memberMap)
        .map((member) => ({
          name: member.name,
          done: member.done,
          total: member.total,
          overdue: member.overdue,
          perf:
              member.total > 0
                  ? `${Math.round((member.done / member.total) * 100)}%`
                  : '0%',
        }))
        .sort((a, b) => b.total - a.total);

    const progressData: ProgressItem[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();

      d.setDate(d.getDate() - i);

      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const completedCount = tasks.filter((task) => {
        const normalizedStatus = (task.status || '').toLowerCase();

        if (!isCompletedStatus(normalizedStatus)) {
          return false;
        }

        return toDateKey(task.updatedAt) === dateString;
      }).length;

      const createdCount = tasks.filter((task) => {
        return toDateKey(task.createdAt) === dateString;
      }).length;

      progressData.push({
        name: dayName,
        completed: completedCount,
        ongoing: createdCount,
      });
    }

    const efficiencyRate =
        totalActiveTasks > 0
            ? Math.round((completedTasks / totalActiveTasks) * 100)
            : 0;

    const realAIInsight = await getAIInsight({
      totalTasks,
      completedTasks,
      overdueTasks,
      atRiskTasks,
      severelyOverdue,
      efficiencyRate: `${efficiencyRate}%`,
    });

    const aiInsight =
        realAIInsight ||
        'AI Insight đang tạm thời không khả dụng. Vui lòng kiểm tra cấu hình API Key.';

    return NextResponse.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      riskMetrics: {
        atRiskTasks,
        severelyOverdue,
        dueThisWeek,
        delayRisk,
        aiInsight,
      },
      memberCount: Object.keys(memberMap).length,
      progressData,
      statusDistribution,
      memberPerformance,
    });
  } catch (error: unknown) {
    console.error('[STATISTICS_GET]', error);

    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    );
  }
}