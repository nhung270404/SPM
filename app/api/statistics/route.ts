import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import User from '@/models/user.model';
import Project from '@/models/project.model';
import { getAIInsight } from '@/lib/gemini';

const cachedAIInsightMap = new Map<
  string,
  {
    insight: string;
    cachedAt: number;
  }
>();

const AI_CACHE_TIME = 10 * 60 * 1000;

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const projectMatch = projectId
      ? { project: new mongoose.Types.ObjectId(projectId) }
      : {};

    // 1. THỐNG KÊ TỔNG QUAN & DỮ LIỆU (Chạy song song)
    const [
      projects,
      totalTasks,
      completedTasks,
      overdueTasks,
      activeTasksCount,
      atRiskTasks,
      severelyOverdue,
      dueThisWeek,
      statusAgg,
      memberAgg,
      overdueTaskList,
      dueSoonTaskList
    ] = await Promise.all([
      Project.find().select('title _id key'),
      WorkItem.countDocuments(projectMatch),
      WorkItem.countDocuments({
        ...projectMatch,
        status: { $in: ['Done', 'Completed'] }
      }),
      WorkItem.countDocuments({
        ...projectMatch,
        status: { $nin: ['Done', 'Completed', 'Cancel'] },
        dueDate: { $lt: now }
      }),
      WorkItem.countDocuments({
        ...projectMatch,
        status: { $ne: 'Cancel' }
      }),
      WorkItem.countDocuments({
        ...projectMatch,
        status: { $nin: ['Done', 'Completed', 'Cancel'] },
        dueDate: { $gt: now, $lt: fortyEightHoursLater }
      }),
      WorkItem.countDocuments({
        ...projectMatch,
        status: { $nin: ['Done', 'Completed', 'Cancel'] },
        dueDate: { $lt: threeDaysAgo }
      }),
      WorkItem.countDocuments({
        ...projectMatch,
        status: { $nin: ['Done', 'Completed', 'Cancel'] },
        dueDate: { $gte: startOfWeek, $lte: endOfWeek }
      }),
      WorkItem.aggregate([
        { $match: projectMatch },
        { $group: { _id: '$status', value: { $sum: 1 } } }
      ]),
      WorkItem.aggregate([
        { $match: { ...projectMatch, assignee: { $ne: null } } },
        {
          $group: {
            _id: { $toString: '$assignee' },
            completed: {
              $sum: { $cond: [{ $in: ['$status', ['Done', 'Completed']] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $in: ['$status', ['In Progress', 'Doing']] }, 1, 0] }
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $not: { $in: ['$status', ['Done', 'Completed', 'Cancel']] } },
                      { $lt: ['$dueDate', now] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            total: {
              $sum: { $cond: [{ $ne: ['$status', 'Cancel'] }, 1, 0] }
            }
          }
        },
        { $sort: { completed: -1 } },
        { $limit: 10 }
      ]),
      WorkItem.find({
        ...projectMatch,
        status: { $nin: ['Done', 'Completed', 'Cancel'] },
        dueDate: { $lt: now }
      })
        .select('title status priority dueDate assignee')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),
      WorkItem.find({
        ...projectMatch,
        status: { $nin: ['Done', 'Completed', 'Cancel'] },
        dueDate: { $gt: now, $lt: fortyEightHoursLater }
      })
        .select('title status priority dueDate assignee')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean()
    ]);

    const efficiencyRate = activeTasksCount > 0 ? Math.round((completedTasks / activeTasksCount) * 100) : 0;
    const delayRisk = activeTasksCount > 0 ? Math.round((overdueTasks / activeTasksCount) * 100) : 0;

    const statusColors: Record<string, string> = {
      Done: '#06b6d4',
      'In Progress': '#3b82f6',
      Todo: '#8b5cf6',
      Backlog: '#64748b',
      Cancel: '#ef4444',
    };

    const statusDistribution = statusAgg.map((item) => ({
      name: item._id,
      value: item.value,
      color: statusColors[item._id] || '#cbd5e1',
    }));

    // Tối ưu việc lấy thông tin user (Bulk lookup thay vì từng người)
    const userIds = memberAgg.map(item => item._id).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('firstname lastname avatar fullName').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const memberLeaderboard = memberAgg.map(item => {
      const user = userMap.get(item._id);
      const fullName = user ? `${user.lastname} ${user.firstname}`.trim() : 'N/A';
      return {
        id: item._id,
        name: fullName,
        completed: item.completed,
        inProgress: item.inProgress,
        overdue: item.overdue,
        efficiency: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
        avatar: user?.firstname?.charAt(0) || '?'
      };
    });

    const filteredLeaderboard = memberLeaderboard.slice(0, 5);

    let aiInsight = '';
    let realAIInsight: string | null = null;

    const cacheKey = projectId || 'all';
    const cached = cachedAIInsightMap.get(cacheKey);

    const canUseCache =
      cached && Date.now() - cached.cachedAt < AI_CACHE_TIME;

    if (canUseCache) {
      console.log('Using cached AI Insight for:', cacheKey);
      realAIInsight = cached.insight;
    } else {
      console.log('Generating new AI Insight for:', cacheKey);

      realAIInsight = await getAIInsight({
        summary: {
          totalTasks,
          completedTasks,
          activeTasksCount,
          overdueTasks,
          atRiskTasks,
          severelyOverdue,
          dueThisWeek,
          efficiencyRate: `${efficiencyRate}%`,
          delayRisk: `${delayRisk}%`,
        },
        statusDistribution,
        memberLeaderboard: filteredLeaderboard,
        criticalTasks: overdueTaskList,
        upcomingTasks: dueSoonTaskList,
      });

      if (realAIInsight) {
        cachedAIInsightMap.set(cacheKey, {
          insight: realAIInsight,
          cachedAt: Date.now(),
        });
      }
    }

    if (realAIInsight) {
      aiInsight = realAIInsight;
    } else {
      aiInsight = 'AI Insight đang tạm thời không khả dụng. Vui lòng thử lại sau.';
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          overdueTasks,
          efficiencyRate: `${efficiencyRate}%`,
          riskMetrics: {
            atRiskTasks,
            severelyOverdue,
            dueThisWeek,
            delayRisk,
            aiInsight,
          },
        },
        statusDistribution,
        memberLeaderboard: filteredLeaderboard,
        projects,
      },
    });
  } catch (error) {
    console.error('Stats API Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}