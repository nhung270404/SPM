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
  avatar?: string;
  cover?: string;
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
}, { timestamps: true });

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


if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.model('User', UserSchema);

export default User;
