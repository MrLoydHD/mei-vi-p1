import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import BarChartRace from '@/components/d3/BarChartRace'

export default function BarChartRaceCard() {
  return (
    <Card className="border-primary w-full h-full">
      <CardContent className="p-4 md:p-6 flex flex-col h-full">
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Life Ladder Score Over Time</h2>
        <div className="h-[800px]">
          <BarChartRace />
        </div>
      </CardContent>
    </Card>
  )
}