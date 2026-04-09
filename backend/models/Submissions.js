import mongoose from 'mongoose'
import { STATUSES } from '../config/constant.js'

const aiDoc = new mongoose.Schema(
  {
    summary: { type: String, default: '' },
    category: { type: String, default: '' },
    suggestedScore: { type: Number, default: 0 },
    confidence: { type: Number, default: 0.6 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    qualityFlag: { type: Boolean, default: false },
    processedAt: { type: Date, default: null },
  },
  { _id: false }
)

const submissionFieldsSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, default: '' },
    projectUrl: { type: String, trim: true, default: '' },
    demoUrl: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },
    fileUrl: { type: String, trim: true, default: '' },
    fileName: { type: String, trim: true, default: '' },
  },
  { _id: false }
)

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false }
)

const submissionSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },

    submitterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedEvaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    track: {
      type: String,
      required: true,
      trim: true,
    },

    fields: {
      type: submissionFieldsSchema,
      default: () => ({}),
    },

    files: {
      type: [fileSchema],
      default: [],
    },

    status: {
      type: String,
      enum: STATUSES,
      default: 'submitted',
    },

    ai: {
      type: aiDoc,
      default: () => ({}),
    },

    aiStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    finalScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    scoredAt: {
      type: Date,
      default: null,
    },

    flagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

submissionSchema.index({ title: 'text', 'fields.description': 'text' })
submissionSchema.index({ campaignId: 1, status: 1 })
submissionSchema.index({ submitterId: 1 })
submissionSchema.index({ assignedEvaluatorId: 1, status: 1 })

submissionSchema.virtual('submitter', {
  ref: 'User',
  localField: 'submitterId',
  foreignField: '_id',
  justOne: true,
})

submissionSchema.set('toObject', { virtuals: true })
submissionSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Submission', submissionSchema)
