/**
 * @module models/Report
 * @description Mongoose model for Daily Supervisory Reports.
 * Implements full subdocument schemas (visits, activities, issues, audio),
 * pre-save chronological visit sorting, shift boundary synchronization,
 * dynamic Ethiopian Date virtuals, and compound indexes.
 * Conforms to Master Technical Specification Section 4.2.3.
 */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { gregorianToEthiopian } from '../utils/ethiopianDate.js';
import { env } from '../config/env.js';

const { Schema } = mongoose;

const visitSchema = new Schema(
  {
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Visited branch reference is required'],
    },
    branchName: {
      type: String,
      required: [true, 'Visited branch name snapshot is required'],
      trim: true,
    },
    clockIn: {
      type: String,
      required: [true, 'Visit clock-in time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Branch visit clock-in must follow HH:mm 24-hour format'],
    },
    clockOut: {
      type: String,
      required: [true, 'Visit clock-out time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Branch visit clock-out must follow HH:mm 24-hour format'],
    },
  },
  { _id: true }
);

const activitySchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'in_progress'],
      default: 'completed',
    },
  },
  { _id: true }
);

const issueSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['reported', 'in_progress', 'completed', 'no_issue'],
      default: 'reported',
    },
  },
  { _id: true }
);

const audioSchema = new Schema(
  {
    originalName: {
      type: String,
      required: [true, 'Original audio file name is required'],
    },
    fileName: {
      type: String,
      required: [true, 'Stored audio file name is required'],
    },
    path: {
      type: String,
      required: [true, 'Audio file path is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'Audio MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'Audio file size is required'],
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const reportSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Report must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      enum: ['single', 'multi'],
      default: 'single',
      required: [true, 'Report type is required'],
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Primary branch is required'],
    },
    branchName: {
      type: String,
      required: [true, 'Primary branch name snapshot is required'],
      trim: true,
    },
    supervisorName: {
      type: String,
      required: [true, 'Supervisor name snapshot is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Report calendar date is required'], // UTC midnight
    },
    clockIn: {
      type: String,
      required: [true, 'Shift clock-in time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Shift clock-in must follow HH:mm 24-hour format'],
    },
    clockOut: {
      type: String,
      required: [true, 'Shift clock-out time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Shift clock-out must follow HH:mm 24-hour format'],
    },
    visits: [visitSchema],
    activities: [activitySchema],
    issues: [issueSchema],
    comments: [
      {
        type: String,
        trim: true,
      },
    ],
    generated: {
      type: String,
      default: '', // Locked plain-text Amharic output rendered by reportFormatter.js
    },
    transcription: {
      type: String,
      default: '',
    },
    audioFiles: [audioSchema],
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },
    preset: {
      type: Schema.Types.ObjectId,
      ref: 'Preset',
      default: null,
    },
    aiMetadata: {
      provider: {
        type: String,
        enum: ['addis', 'google', 'nvidia'],
        default: 'google',
      },
      model: {
        type: String,
        default: 'gemini-2.5-flash',
      },
      language: {
        type: String,
        enum: ['am', 'en'],
        default: 'am',
      },
      reasoning: {
        type: String,
        default: null,
      },
      duration: {
        type: Number,
        default: 0,
      },
      tokensUsed: {
        promptTokens: { type: Number, default: 0 },
        completionTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 },
      },
      providerMetadata: {
        type: Schema.Types.Mixed,
        default: null,
      },
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

// Dynamic Ethiopian Date Virtual
reportSchema.virtual('ethiopianDate').get(function () {
  if (!this.date) return '';
  return gregorianToEthiopian(this.date).formattedDate;
});

// Pre-save lifecycle hook: Visit chronological sorting & shift boundary synchronization
reportSchema.pre('save', function (next) {
  if (this.visits && this.visits.length > 0) {
    this.type = 'multi';
    // 1. Sort visits chronologically by arrival time (clockIn)
    this.visits.sort((a, b) => a.clockIn.localeCompare(b.clockIn));
    // 2. Synchronize shift boundaries with visit timeline extremes
    this.clockIn = this.visits[0].clockIn;
    this.clockOut = this.visits[this.visits.length - 1].clockOut;
    // 3. Verify primary branch membership in visited list
    const primaryId = this.branch ? this.branch.toString() : '';
    const hasPrimary = this.visits.some(
      (v) => (v.branch ? v.branch.toString() : '') === primaryId
    );
    if (!hasPrimary && primaryId) {
      return next(
        new Error('The primary report branch must be included in the visited branches itinerary')
      );
    }
  } else {
    this.type = 'single';
  }
  next();
});

// Schema-level composite & query indexes
reportSchema.index({ user: 1, date: -1 });
reportSchema.index({ user: 1, branch: 1, date: -1 });
reportSchema.index({ user: 1, type: 1, date: -1 });
reportSchema.index({ user: 1, isArchived: 1, date: -1 });

reportSchema.plugin(mongoosePaginate);

export const Report = mongoose.model('Report', reportSchema);
export default Report;
