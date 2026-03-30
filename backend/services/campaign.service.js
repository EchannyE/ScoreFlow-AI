import Campaign   from '../models/Campaign.js'
import Submission from '../models/Submissions.js'
 
async function hydrateCampaignMetrics(campaigns) {
  if (!campaigns.length) return campaigns

  const campaignIds = campaigns.map(campaign => campaign._id)
  const submissionStats = await Submission.aggregate([
    { $match: { campaignId: { $in: campaignIds } } },
    {
      $group: {
        _id: '$campaignId',
        total: { $sum: 1 },
        scored: {
          $sum: {
            $cond: [
              { $ne: [{ $ifNull: ['$finalScore', null] }, null] },
              1,
              0,
            ],
          },
        },
      },
    },
  ])

  const statsByCampaignId = new Map(
    submissionStats.map(stat => [String(stat._id), stat])
  )

  return campaigns.map(campaign => {
    const stat = statsByCampaignId.get(String(campaign._id))
    const submissionsCount = stat?.total ?? 0
    const scoredCount = stat?.scored ?? 0
    const evaluatorsCount = campaign.evaluatorIds?.length ?? campaign.evaluatorsCount ?? 0

    return {
      ...campaign,
      submissionsCount,
      evaluatorsCount,
      completionPct: submissionsCount
        ? Math.round((scoredCount / submissionsCount) * 100)
        : 0,
    }
  })
}

export const list = async (filters = {}) => {
  const campaigns = await Campaign.find(filters).sort({ createdAt: -1 }).lean()
  return hydrateCampaignMetrics(campaigns)
}
 
export async function getById(id) {
  const [campaign] = await hydrateCampaignMetrics(
    await Campaign.find({ _id: id }).lean()
  )
  if (!campaign) throw Object.assign(new Error('Campaign not found'), { status: 404 })
  return campaign
}
 
export const create = (data, userId) =>
  Campaign.create({ ...data, createdBy: userId })
 
export async function update(id, data) {
  const campaign = await Campaign.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!campaign) throw Object.assign(new Error('Campaign not found'), { status: 404 })
  return campaign
}
 
export const remove = id => Campaign.findByIdAndDelete(id)
 
export async function getStats(campaignId) {
  const subs   = await Submission.find({ campaignId }).lean()
  const total  = subs.length
  const scored = subs.filter(s => s.finalScore != null).length
  const campaign = await Campaign.findById(campaignId).lean()
  return {
    total,
    scored,
    judges: campaign?.evaluatorIds?.length ?? campaign?.evaluatorsCount ?? 0,
    completionPct: total ? Math.round((scored / total) * 100) : 0,
    byStatus: subs.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1
      return acc
    }, {}),
  }
}