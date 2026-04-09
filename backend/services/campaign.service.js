import Campaign   from '../models/Campaign.js'
import Submission from '../models/Submissions.js'

// ================================
// 📌 HYDRATE CAMPAIGN METRICS
// ================================
async function hydrateCampaignMetrics(campaigns) {
  if (!campaigns.length) return campaigns

  const campaignIds = campaigns.map(c => c._id)

  const stats = await Submission.aggregate([
    { $match: { campaignId: { $in: campaignIds } } },

    {
      $group: {
        _id: '$campaignId',
        total: { $sum: 1 },

        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
          },
        },

        highPriority: {
          $sum: {
            $cond: [{ $eq: ['$ai.priority', 'high'] }, 1, 0],
          },
        },

        avgScore: { $avg: '$finalScore' },
      },
    },
  ])

  const map = new Map(stats.map(s => [String(s._id), s]))

  return campaigns.map(campaign => {
    const stat = map.get(String(campaign._id))

    const total = stat?.total ?? 0
    const completed = stat?.completed ?? 0

    return {
      ...campaign,
      submissionsCount: total,
      completedCount: completed,
      highPriorityCount: stat?.highPriority ?? 0,
      avgScore: Math.round(stat?.avgScore ?? 0),

      evaluatorsCount:
        campaign.evaluatorIds?.length ??
        campaign.evaluatorsCount ??
        0,

      completionPct: total
        ? Math.round((completed / total) * 100)
        : 0,
    }
  })
}

// ================================
// 📌 LIST CAMPAIGNS
// ================================
export const list = async (filters = {}) => {
  const campaigns = await Campaign.find(filters)
    .sort({ createdAt: -1 })
    .lean()

  return hydrateCampaignMetrics(campaigns)
}

// ================================
// 📌 GET SINGLE CAMPAIGN
// ================================
export async function getById(id) {
  const [campaign] = await hydrateCampaignMetrics(
    await Campaign.find({ _id: id }).lean()
  )

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { status: 404 })
  }

  return campaign
}

// ================================
// 📌 CREATE CAMPAIGN
// ================================
export const create = (data, userId) =>
  Campaign.create({ ...data, createdBy: userId })

// ================================
// 📌 UPDATE CAMPAIGN
// ================================
export async function update(id, data) {
  const campaign = await Campaign.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { status: 404 })
  }

  return campaign
}

// ================================
// 📌 DELETE CAMPAIGN
// ================================
export const remove = id => Campaign.findByIdAndDelete(id)

// ================================
// 📌 CAMPAIGN STATS (AGGREGATED)
// ================================
export async function getStats(campaignId) {
  const [stats] = await Submission.aggregate([
    { $match: { campaignId } },

    {
      $group: {
        _id: null,
        total: { $sum: 1 },

        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
          },
        },

        avgScore: { $avg: '$finalScore' },

        byStatus: {
          $push: '$status',
        },
      },
    },
  ])

  const campaign = await Campaign.findById(campaignId).lean()

  const byStatus = (stats?.byStatus ?? []).reduce((acc, status) => {
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})

  return {
    total: stats?.total ?? 0,
    completed: stats?.completed ?? 0,
    avgScore: Math.round(stats?.avgScore ?? 0),

    judges:
      campaign?.evaluatorIds?.length ??
      campaign?.evaluatorsCount ??
      0,

    completionPct: stats?.total
      ? Math.round((stats.completed / stats.total) * 100)
      : 0,

    byStatus,
  }
}