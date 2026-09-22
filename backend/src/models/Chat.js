/**
 * @module models/Chat
 * @description Mongoose model for Conversation Nodes (Report Co-Pilots and General Assistant threads).
 * Conforms to Master Technical Specification Section 4.2.5 and Section 5.
 */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Chat must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      enum: ['report', 'general'],
      default: 'report',
      required: [true, 'Chat type is required'],
    },
    report: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Chat title is required'],
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

// Compound indexes
chatSchema.index({ user: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
chatSchema.index({ user: 1, report: 1 });

chatSchema.plugin(mongoosePaginate);

export const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
