
import React from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'

export default function AdminCampaignDetail() {
  const { id } = useParams()

  return (
    <div className="fade-up space-y-6">
      <div>
        <div className="text-[11px] text-green uppercase tracking-[0.18em] mb-2">
          // admin
        </div>
        <h2 className="font-display font-bold text-3xl tracking-tight">
          Campaign Management
        </h2>
      </div>

      <Card>
        <p className="text-sm text-text-3">
          Managing campaign ID:
        </p>
        <div className="text-lg font-mono mt-2 text-white">
          {id}
        </div>
      </Card>
    </div>
  )
}
