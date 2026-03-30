import mongoose from 'mongoose'
 
const evaluationSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  campaignId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign',   required: true },
  evaluatorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  scores: {
    innovation:   { type: Number, min: 0, max: 100 },
    feasibility:  { type: Number, min: 0, max: 100 },
    impact:       { type: Number, min: 0, max: 100 },
    presentation: { type: Number, min: 0, max: 100 },
  },
  weightedScore: Number,
  note:          String,
  status:        { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
}, { timestamps: true })
 
// One evaluation per evaluator per submission
evaluationSchema.index({ submissionId: 1, evaluatorId: 1 }, { unique: true })
 
// Auto-calculate weighted score before save
evaluationSchema.pre('save', async function () {
  if (!this.isModified('scores')) return
 
  try {
    // Dynamic import avoids circular dependency between models
    const { default: Campaign } = await import('./Campaign.js')
    const campaign = await Campaign.findById(this.campaignId).lean()
 
    if (campaign) {
      this.weightedScore = Math.round(
        campaign.rubric.reduce(
          (acc, r) => acc + (this.scores[r.id] ?? 0) * (r.weight / 100),
          0
        )
      )
    }
  } catch {
    const vals = Object.values(this.scores).filter(Boolean)
    this.weightedScore = vals.length
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0
  }
})
 
export default mongoose.model('Evaluation', evaluationSchema)
 