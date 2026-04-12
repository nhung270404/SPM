import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import WorkItem from '@/models/work-item.model';
import { Types } from 'mongoose';

// Hàm helper để map màu cho trạng thái (Cậu có thể chỉnh theo ý thích)
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'done': return '#22c55e'; // Green
    case 'completed': return '#22c55e';
    case 'in progress': return '#eab308'; // Yellow
    case 'doing': return '#eab308';
    case 'todo': return '#3b82f6'; // Blue
    case 'new': return '#3b82f6';
    case 'backlog': return '#94a3b8'; // Gray
    case 'cancel': return '#ef4444'; // Red
    default: return '#8b5cf6'; // Purple (Unknown)
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const projectId = params.id;

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
    }

    // 1. Lấy tất cả Task của dự án + thông tin người được assign
    // Lưu ý: Cậu cần đảm bảo model WorkItem có field 'assignee' ref tới User
    const tasks = await WorkItem.find({ project: projectId })
      .populate('assignee', 'firstname lastname email') // Chỉ lấy tên và email
      .lean();

    const now = new Date();

    // 2. Tính toán các chỉ số cơ bản (Counters)
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;

    // Map để đếm status cho biểu đồ tròn
    const statusCountMap: Record<string, number> = {};

    // Map để tính hiệu suất thành viên
    const memberMap: Record<string, { name: string; done: number; total: number }> = {};

    tasks.forEach((task: any) => {
      const status = task.status || 'Unknown';

      // Đếm status distribution
      statusCountMap[status] = (statusCountMap[status] || 0) + 1;

      // Đếm chỉ số tổng quan
      if (['done', 'completed'].includes(status.toLowerCase())) {
        completedTasks++;
      } else if (['in progress', 'doing'].includes(status.toLowerCase())) {
        inProgressTasks++;
      }

      // Check quá hạn (Chưa xong VÀ ngày deadline < hiện tại)
      if (
        !['done', 'completed', 'cancel'].includes(status.toLowerCase()) &&
        task.dueDate &&
        new Date(task.dueDate) < now
      ) {
        overdueTasks++;
      }

      // Tính hiệu suất thành viên
      if (task.assignee) {
        const userId = task.assignee._id.toString();
        // Ghép họ tên
        const fullName = `${task.assignee.lastname || ''} ${task.assignee.firstname || ''}`.trim() || task.assignee.email;

        if (!memberMap[userId]) {
          memberMap[userId] = { name: fullName, done: 0, total: 0 };
        }

        memberMap[userId].total++;
        if (['done', 'completed'].includes(status.toLowerCase())) {
          memberMap[userId].done++;
        }
      }
    });

    // 3. Chuẩn hóa dữ liệu Status Distribution (Biểu đồ cột dọc)
    const statusDistribution = Object.entries(statusCountMap).map(([name, value]) => ({
      name,
      value: Math.round((value / tasks.length) * 100), // Tính %
      color: getStatusColor(name)
    }));

    // 4. Chuẩn hóa dữ liệu Member Performance (Bảng thành viên)
    const memberPerformance = Object.values(memberMap).map((m) => ({
      name: m.name,
      done: m.done,
      total: m.total,
      perf: m.total > 0 ? `${Math.round((m.done / m.total) * 100)}%` : '0%'
    })).sort((a, b) => b.total - a.total); // Sắp xếp người làm nhiều nhất lên đầu

    // 5. Tính toán Progress Data (Velocity - 7 ngày gần nhất)
    // Logic: Duyệt 7 ngày qua, đếm task được tạo (ongoing/new) và task hoàn thành trong ngày đó
    const progressData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...

      // Đếm task hoàn thành trong ngày này (dựa vào updatedAt hoặc completedAt nếu có)
      // Ở đây tớ dùng tạm updatedAt cho đơn giản
      const completedCount = tasks.filter((t: any) => {
        if (!['done', 'completed'].includes(t.status.toLowerCase())) return false;
        const taskDate = new Date(t.updatedAt).toISOString().split('T')[0];
        return taskDate === dateString;
      }).length;

      // Đếm task đang chạy (hoặc mới tạo) trong ngày
      // Logic tạm: Task được tạo vào ngày này
      const createdCount = tasks.filter((t: any) => {
        const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
        return taskDate === dateString;
      }).length;

      progressData.push({
        name: dayName,
        completed: completedCount,
        ongoing: createdCount // Hoặc đổi tên thành 'created' tùy logic cậu muốn
      });
    }

    // 6. Trả về kết quả JSON đúng format Frontend cần
    return NextResponse.json({
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      memberCount: Object.keys(memberMap).length,
      progressData,
      statusDistribution,
      memberPerformance
    });

  } catch (error) {
    console.error('[STATISTICS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}