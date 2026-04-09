import mongoose from 'mongoose'
import { STATUSES } from '../config/constant.js'
 
const aiDoc = new mongoose.Schema({
  summary:        String,
  category:       String,
  suggestedScore: Number,
  qualityFlag:    Boolean,
  processedAt:    Date,
}, { _id: false })
 
const submissionSchema = new mongoose.Schema({
  campaignId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  submitterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  assignedEvaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt:  Date,
  title:       { type: String, required: true, trim: true },
  track:       { type: String, required: true },
  fields:      mongoose.Schema.Types.Mixed,
  files:       [{ name: String, url: String, size: Number }],
  status:      { type: String, enum: STATUSES, default: 'submitted' },
  ai:          { type: aiDoc, default: {} },
  aiStatus:    { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  finalScore:  Number,
  flagged:     { type: Boolean, default: false },
}, { timestamps: true })
 
submissionSchema.index({ title: 'text', 'fields.description': 'text' })
submissionSchema.index({ campaignId: 1, status: 1 })
submissionSchema.index({ submitterId: 1 })
submissionSchema.index({ assignedEvaluatorId: 1, status: 1 })
 
// Virtual populate — auto-joins User on submitterId
submissionSchema.virtual('submitter', {
  ref: 'User', localField: 'submitterId', foreignField: '_id', justOne: true,
})
submissionSchema.set('toObject', { virtuals: true })
submissionSchema.set('toJSON',   { virtuals: true })
 
export default mongoose.model('Submission', submissionSchema)
 