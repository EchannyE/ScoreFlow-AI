import 'dotenv/config'
import mongoose   from 'mongoose'
import User       from '../models/User.js'
import Campaign   from '../models/Campaign.js'
import Submission from '../models/Submissions.js'
 
async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected - seeding...')

  try {
    await Promise.all([
      User.deleteMany({}),
      Campaign.deleteMany({}),
      Submission.deleteMany({}),
    ])

    const [admin, , submitter] = await User.create([
      { name: 'Alex Rivera',    email: 'admin@scoreflow.ai',     password: 'admin123',  role: 'admin' },
      { name: 'Dr. Sarah Chen', email: 'evaluator@scoreflow.ai', password: 'eval123',   role: 'evaluator', expertise: ['AI/ML', 'HealthTech'] },
      { name: 'Priya Nair',     email: 'submit@scoreflow.ai',    password: 'submit123', role: 'submitter' },
    ])

    const [campaign] = await Campaign.create([{
      title:            'TechFest 2025 Hackathon',
      status:           'active',
      tracks:           ['AI/ML', 'Web3', 'HealthTech', 'CleanEnergy'],
      deadline:         new Date('2025-04-15'),
      submissionsCount: 3,
      completionPct:    20,
      color:            '#00D4AA',
      createdBy:        admin._id,
    }])

    await Submission.create([
      {
        campaignId:  campaign._id,
        submitterId: submitter._id,
        title:       'AquaMonitor - Ocean Health AI',
        track:       'AI/ML',
        fields:      { description: 'ML platform predicting coral bleaching 72h in advance.' },
        ai: {
          summary:        'Predicts coral bleaching with 91% accuracy via satellite + IoT data.',
          suggestedScore: 84,
          processedAt:    new Date(),
        },
      },
      {
        campaignId:  campaign._id,
        submitterId: submitter._id,
        title:       'GreenGrid - P2P Solar Trading',
        track:       'CleanEnergy',
        fields:      { description: 'P2P marketplace for residential solar energy.' },
        ai: {
          summary:        'Peer-to-peer solar energy marketplace that bypasses utility markups.',
          suggestedScore: 91,
          processedAt:    new Date(),
        },
      },
      {
        campaignId:  campaign._id,
        submitterId: submitter._id,
        title:       'ScholarBot - Offline AI Tutor',
        track:       'AI/ML',
        flagged:     true,
        fields:      { description: 'Offline AI tutor for low-bandwidth environments.' },
        ai: {
          summary:        'Supports 12 local languages for rural students without internet.',
          suggestedScore: 79,
          processedAt:    new Date(),
        },
      },
    ])

    console.log('\nSeed complete!')
    console.log('  admin@scoreflow.ai     / admin123')
    console.log('  evaluator@scoreflow.ai / eval123')
    console.log('  submit@scoreflow.ai    / submit123')
  } finally {
    await mongoose.disconnect()
  }
}
 
seed().catch(e => { console.error(e); process.exit(1) })