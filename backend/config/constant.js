export const STATUSES = ['submitted', 'under_review', 'scored']

export const DEFAULT_RUBRIC = [
  {
    id: 'innovation',
    label: 'Innovation',
    weight: 25,
    description: 'Originality and novelty of the idea.',
  },
  {
    id: 'feasibility',
    label: 'Feasibility',
    weight: 30,
    description: 'Practicality and technical viability.',
  },
  {
    id: 'impact',
    label: 'Impact',
    weight: 25,
    description: 'Potential value for users or the market.',
  },
  {
    id: 'presentation',
    label: 'Presentation',
    weight: 20,
    description: 'Clarity and quality of the submission.',
  },
]