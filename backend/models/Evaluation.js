import mongoose from 'mongoose'

const scoreSchema = new mongoose.Schema(
  {
    innovation: { type: Number, min: 0, max: 100, default: 0 },
    feasibility: { type: Number, min: 0, max: 100, default: 0 },
    impact: { type: Number, min: 0, max: 100, default: 0 },
    presentation: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
)

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },

    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    scores: {
      type: scoreSchema,
      required: true,
      default: () => ({}),
    },

    weightedScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    note: {
      type: String,
      trim: true,
      default: '',
    },

    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'submitted',
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// One evaluation per evaluator per submission
evaluationSchema.index({ submissionId: 1, evaluatorId: 1 }, { unique: true })

// Auto-calculate weighted score before save
evaluationSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('scores')) {
      if (this.status === 'submitted' && !this.submittedAt) {
        this.submittedAt = new Date()
      }
      return next()
    }

    const scores = this.scores || {}

    // Dynamic import avoids circular dependency between models
    const { default: Campaign } = await import('./Campaign.js')
    const campaign = await Campaign.findById(this.campaignId).lean()

    if (campaign?.rubric?.length) {
      this.weightedScore = Math.round(
        campaign.rubric.reduce((acc, r) => {
          const scoreValue = Number(scores?.[r.id] ?? 0)
          return acc + scoreValue * (r.weight / 100)
        }, 0)
      )
    } else {
      const values = Object.values(scores)
        .map(Number)
        .filter(v => !Number.isNaN(v))

      this.weightedScore = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0
    }

    if (this.status === 'submitted' && !this.submittedAt) {
      this.submittedAt = new Date()
    }

    next()
  } catch (err) {
    const scores = this.scores || {}
    const values = Object.values(scores)
      .map(Number)
      .filter(v => !Number.isNaN(v))

    this.weightedScore = values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0

    if (this.status === 'submitted' && !this.submittedAt) {
      this.submittedAt = new Date()
    }

    next()
  }
})

export default mongoose.model('Evaluation', evaluationSchema)
