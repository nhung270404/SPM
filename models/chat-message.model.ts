import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// Index để tìm kiếm nhanh theo user và sắp xếp theo thời gian
ChatMessageSchema.index({ user: 1, timestamp: 1 });

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
