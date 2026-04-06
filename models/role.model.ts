import mongoose, {Document, Model} from 'mongoose';

export interface IRole extends Document {
  name: string;
  title: string;
  level: number;
}

const RoleSchema = new mongoose.Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    set: function(value: string) {
      // Chuyển name thành lowercase, bỏ ký tự đặc biệt, thay khoảng trắng bằng "_"
      return value
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');
    }
  },
  title: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
});

// Thêm phương thức tĩnh để kiểm tra quyền
RoleSchema.statics.hasPermission = async function(userRoleName: string, requiredRoleName: string) {
  // Chuẩn hóa tên role để tìm kiếm
  const normalizedUserRole = userRoleName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');

  const normalizedRequiredRole = requiredRoleName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');

  // Tìm cả hai role
  const userRole = await this.findOne({ name: normalizedUserRole });
  const requiredRole = await this.findOne({ name: normalizedRequiredRole });

  if (!userRole || !requiredRole) {
    return false;
  }

  // Kiểm tra level, nếu level của user nhỏ hơn hoặc bằng level của role yêu cầu thì có quyền
  // (Giả sử level càng nhỏ thì quyền càng cao, ví dụ admin = 1)
  return userRole.level <= requiredRole.level;
};


const RoleModel: Model<IRole> = mongoose.models.Role || mongoose.model('Role', RoleSchema);

export default RoleModel;