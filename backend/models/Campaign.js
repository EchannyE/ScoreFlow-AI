import mongoose from 'mongoose'
import { DEFAULT_RUBRIC } from '../config/constant.js'
 
const rubricItem = new mongoose.Schema({
  id:          String,
  label:       String,
  weight:      { type: Number, min: 0, max: 100 },
  description: String,
}, { _id: false })
 
const campaignSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: String,
  status:      { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  tracks:      [String],
  deadline:    Date,
  rubric: {
    type:    [rubricItem],
    default: DEFAULT_RUBRIC,
    validate: {
      validator: arr => arr.reduce((sum, r) => sum + r.weight, 0) === 100,
      message:   'Rubric weights must sum to 100',
    },
  },
  formSchema:       [mongoose.Schema.Types.Mixed],
  evaluatorIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionsCount: { type: Number, default: 0 },
  evaluatorsCount:  { type: Number, default: 0 },
  completionPct:    { type: Number, default: 0 },
  color:            { type: String, default: '#00D4AA' },
}, { timestamps: true })
 
export default mongoose.model('Campaign', campaignSchema)