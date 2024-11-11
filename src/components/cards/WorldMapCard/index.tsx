import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info } from "lucide-react"
import InteractiveGlobe from '@/components/d3/InteractiveGlobe'

interface WorldMapCardProps {
  onCountrySelect: (country: string) => void
  selectedCountry?: string
}

export default function WorldMapCard({ onCountrySelect, selectedCountry }: WorldMapCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  console.log('selectedCountry1:', selectedCountry)

  return (
    <Card className="border-primary h-full flex flex-col">
      <CardContent className="p-4 md:p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">World Happiness Map</h2>
          <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">What does this mean?</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium leading-none">About this Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  This interactive globe visualizes the World Happiness Report data, showing the Average Life Evaluation scores for countries around the world.
                </p>
                <h4 className="font-medium mt-2">Key Features:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>Color-coded countries based on their happiness scores</li>
                  <li>Interactive rotation and zoom functionality</li>
                  <li>Tooltip with country name and score on hover</li>
                </ul>
                <h4 className="font-medium mt-2">Legacy Mode:</h4>
                <p className="text-sm text-muted-foreground">
                  Legacy mode displays data for countries that don't have current year data, using their most recent available data point. This helps provide a more complete global picture.
                </p>
                <h4 className="font-medium mt-2">Data Source:</h4>
                <p className="text-sm text-muted-foreground">
                  Data is sourced from the annual World Happiness Report, which ranks national happiness based on citizens' quality of life.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-grow translate-y-4">
          <InteractiveGlobe onCountrySelect={onCountrySelect} selectedCountry={selectedCountry} />
        </div>
      </CardContent>
    </Card>
  )
}