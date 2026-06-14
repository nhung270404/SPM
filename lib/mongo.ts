import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Vui lòng định nghĩa biến MONGODB_URI trong file .env');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// --- HÀM KẾT NỐI (CORE) ---
async function dbConnect() {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log('🔄 Đang kết nối tới MongoDB...');
        cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('✅ Kết nối MongoDB thành công!');
            return mongoose;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn;
}

// 1. Dạng Default (Cho các file cũ như config.service.ts)
export default dbConnect;

// 2. Dạng Named (Cho file route.ts mới)
export const connectToDatabase = dbConnect;