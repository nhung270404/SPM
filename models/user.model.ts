import mongoose, { Document, Model, Schema} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  password: string;
  email: string;
  phone: string;
  address: string[];
  roles: mongoose.Types.ObjectId[];
  fullName: string;
  avatar?: string;
  cover?: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  isGod: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  expiresAt?: Date;


  setPassword(password: string): Promise<void>;
  validPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  isGod: {
    type: Boolean,
    required: true,
    default: true,
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
  ],
  address: {
    type: [String],
  },
  avatar: {
    type: String,
  },
  cover: {
    type: String,
  },
  department: {
    type: String,
    default: 'Chưa xác định',
  },
  position: {
    type: String,
    default: 'Nhân viên',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 },
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual('fullName').get(function () {
  return `${this.lastname} ${this.firstname}`.trim();
});

UserSchema.methods.setPassword = async function (password: string) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};
UserSchema.methods.validPassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre('save', function () {
  if (this.isModified('password')) {
    if (!this.password.startsWith('$2')) {
      throw new Error('Password must be hashed using setPassword() before saving');
    }
  }
});


const User = mongoose.models.User as Model<IUser> || mongoose.model<IUser>('User', UserSchema);

export default User;
