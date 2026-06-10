'use client';

import {
  Folder,
  User,
  LifeBuoy, // 👈 Nhớ import LifeBuoy
  Send,     // 👈 Nhớ import Send
  Settings,
  LucideIcon
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

// Tạo một bảng map từ Tên Chuỗi -> Component Icon
const iconMap: Record<string, LucideIcon> = {
  User: User,
  Folder: Folder,
  LifeBuoy: LifeBuoy, // Map chuỗi 'LifeBuoy' -> Icon LifeBuoy
  Lifebuoy: LifeBuoy, // (Dự phòng trường hợp viết thường)
  Send: Send,         // Map chuỗi 'Send' -> Icon Send
  Settings: Settings,
  // Thêm các icon khác nếu cần...
};

interface DynamicIconProps extends React.ComponentProps<'svg'> {
  icon?: string | LucideIcon; // Chấp nhận cả string hoặc component (để tránh lỗi TS)
}

const DynamicIcon = ({ name, className, ...props }: DynamicIconProps) => {
  if (!name) return null;

  // Nếu name là String thì lấy từ map
  if (typeof name === 'string') {
    const IconComponent = iconMap[name];
    if (!IconComponent) return null; // Hoặc return icon mặc định
    return <IconComponent className={className} {...props} />;
  }

  // Nếu name đã là Component (trường hợp dùng ở client thuần)
  // const IconComponent = name;
  // return <IconComponent className={className} {...props} />;
  const IconComponent = name as ComponentType<SVGProps<SVGSVGElement>>;
  return <IconComponent className={className} {...props} />;
};

export default DynamicIcon;