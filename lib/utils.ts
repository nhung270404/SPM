import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const colClassMap: Record<number, string> = {
    1: `grid-cols-1`,
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
};

export const formatVND = (amount: number): string => {
    if (isNaN(amount)) return '';
    return amount.toLocaleString('vi-VN') + 'đ';
};

// Tạo slug chuẩn từ chuỗi input
export const generateSlug = (text: string): string => {
    return text
        .normalize('NFD')                  // tách ký tự có dấu thành base + dấu
        .toLowerCase()                     // lowercase
        .replace(/đĐ/g, 'd')                // thay tất cả 'đ'
        .replace(/[\u0300-\u036f]/g, '')   // loại bỏ dấu (diacritics)
        .replace(/[^a-z0-9\s-]/g, '')      // giữ a-z, 0-9, khoảng trắng và dấu '-'
        .trim()                            // loại khoảng trắng đầu/cuối
        .replace(/\s+/g, '-')              // chuyển một hoặc nhiều khoảng trắng thành '-'
        .replace(/-+/g, '-')               // gộp nhiều '-' thành 1
        .replace(/^-+|-+$/g, '');          // bỏ '-' ở đầu hoặc cuối
};