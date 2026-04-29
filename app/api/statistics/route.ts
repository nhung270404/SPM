import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import User from '@/models/user.model';
import Project from '@/models/project.model';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const now = new Date();
    
    // Khởi tạo query lọc theo dự án nếu có
    const projectMatch = projectId ? { project: new mongoose.Types.ObjectId(projectId) } : {};

    // Lấy danh sách projects để hiển thị bộ chọn ở Frontend
    const projects = await Project.find().select('title _id key');

    // 1. THỐNG KÊ TỔNG QUAN (Summary Stats)
    const totalTasks = await WorkItem.countDocuments(projectMatch);
    const completedTasks = await WorkItem.countDocuments({ ...projectMatch, status: 'Done' });
    const overdueTasks = await WorkItem.countDocuments({
      ...projectMatch,
      status: { $ne: 'Done' },
      dueDate: { $lt: now }
    });

    const efficiencyRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. PHÂN BỔ TRẠNG THÁI (Status Distribution)
    const statusAgg = await WorkItem.aggregate([
      { $match: projectMatch }, // Lọc theo dự án
      { $group: { _id: '$status', value: { $sum: 1 } } }
    ]);

    const statusColors: Record<string, string> = {
      'Done': '#06b6d4',
      'In Progress': '#3b82f6',
      'Todo': '#8b5cf6',
      'Backlog': '#64748b',
      'Cancel': '#ef4444'
    };

    const statusDistribution = statusAgg.map(item => ({
      name: item._id,
      value: item.value,
      color: statusColors[item._id] || '#cbd5e1'
    }));

    // 3. BẢNG XẾP HẠNG THÀNH VIÊN (Member Leaderboard)
    const memberAgg = await WorkItem.aggregate([
      { $match: { ...projectMatch, assignee: { $ne: null } } }, // Lọc theo dự án và chỉ tính task đã có người
      {
        $group: {
          _id: { $toString: '$assignee' }, // Ép kiểu về string để group chính xác
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { completed: -1 } },
      { $limit: 10 }
    ]);

    // Populate user info manually as aggregate doesn't do it easily with our setup
    const memberLeaderboard = await Promise.all(memberAgg.map(async (item, index) => {
      if (!item._id) return null;
      const user = await User.findById(item._id).select('firstname lastname avatar fullName');
      return {
        id: item._id.toString(),
        name: user?.fullName || 'N/A',
        completed: item.completed,
        inProgress: item.inProgress,
        efficiency: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
        avatar: user?.firstname?.charAt(0) || '?'
      };
    }));

    // Lọc bỏ null và đảm bảo danh sách duy nhất theo ID để tránh lặp lại giao diện
    const uniqueMembers = Array.from(new Map(
      memberLeaderboard
        .filter((m): m is any => !!m)
        .map(m => [m.id, m])
    ).values());

    const filteredLeaderboard = uniqueMembers.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          overdueTasks,
          efficiencyRate: `${efficiencyRate}%`
        },
        statusDistribution,
        memberLeaderboard: filteredLeaderboard,
        projects: projects // Trả về danh sách projects để FE hiển thị bộ chọn
      }
    });

  } catch (error) {
    console.error('Stats API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
