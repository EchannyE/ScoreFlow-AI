export const DEFAULT_RUBRIC = [
  {
    id: 'innovation',
    label: 'Innovation',
    weight: 25,
    desc: 'Novelty and creativity',
  },
  {
    id: 'feasibility',
    label: 'Feasibility',
    weight: 30,
    desc: 'Technical viability',
  },
  {
    id: 'impact',
    label: 'Impact',
    weight: 25,
    desc: 'Social or economic impact',
  },
  {
    id: 'presentation',
    label: 'Presentation',
    weight: 20,
    desc: 'Clarity and communication',
  },
]

export function normalizeRubric(rubric) {
  if (!Array.isArray(rubric) || !rubric.length) {
    return DEFAULT_RUBRIC
  }

  return rubric
    .filter(item => item?.id)
    .map(item => ({
      id: item.id,
      label: item.label || item.id,
      weight: Number(item.weight) || 0,
      desc: item.description || item.desc || 'Score this criterion',
    }))
}

export function buildInitialScores(rubric) {
  return rubric.reduce((acc, item) => {
    acc[item.id] = 0
    return acc
  }, {})
}