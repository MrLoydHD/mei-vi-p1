import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import BarChartRace from '@/components/d3/BarChartRace'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { InfoIcon } from 'lucide-react'

export default function BarChartRaceCard() {
  return (
    <Card className="border-primary w-full h-full">
      <CardContent className="p-4 md:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Life Ladder Score Over Time (2005-2023)</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">What does this mean?</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium">About this Chart</h3>
                <p className="text-sm text-muted-foreground">
                  This animated bar chart race shows the top 15 countries by Life Ladder Score from 2005 to 2023. The Life Ladder Score is a measure of subjective well-being, asking respondents to rate their current life on a scale from 0 (worst possible life) to 10 (best possible life).
                </p>
                <p className="text-sm text-muted-foreground">
                  Watch how countries' rankings change over time, reflecting shifts in perceived quality of life across the world.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="h-[800px]">
          <BarChartRace />
        </div>
      </CardContent>
    </Card>
  )
}