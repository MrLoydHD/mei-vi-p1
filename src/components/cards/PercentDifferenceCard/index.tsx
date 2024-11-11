import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useData } from '@/contexts/data'
import PercentDifferenceChart from '@/components/d3/PercentDifferenceChart'
import { InfoIcon } from 'lucide-react'

interface PercentDifferenceCardProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
}

export default function PercentDifferenceCard({ selectedCountry, onCountryChange }: PercentDifferenceCardProps) {
  const [comparisonType, setComparisonType] = useState<'global' | 'europe' | 'asia' | 'africa' | 'northAmerica' | 'southAmerica' | 'oceania'>('global')
  const { lastYearData } = useData()

  return (
    <Card className="border-primary w-full h-[600px]">
      <CardContent className="p-4 md:p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Comparison to Averages 2024</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">What does this mean?</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <h3 className="font-semibold mb-2">
                About this Visualization
              </h3>
              <p className="text-sm text-muted-foreground">
                This graph shows how the selected country compares to the chosen average (global or regional) across various happiness factors. 
                Bars extending upwards indicate the country is performing better than average, while downward bars show areas where it's below average. 
                The percentage difference is shown for each factor.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Disclaimer: This comparison is based on data from 151 countries, which may result in some discrepancies compared to the trend chart.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Select value={selectedCountry} onValueChange={onCountryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {lastYearData.map((country) => (
                <SelectItem key={country['Country name']} value={country['Country name']}>
                  {country['Country name']}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={comparisonType} onValueChange={(value: typeof comparisonType) => setComparisonType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global Average</SelectItem>
              <SelectItem value="europe">Europe Average</SelectItem>
              <SelectItem value="asia">Asia Average</SelectItem>
              <SelectItem value="africa">Africa Average</SelectItem>
              <SelectItem value="northAmerica">North America Average</SelectItem>
              <SelectItem value="southAmerica">South America Average</SelectItem>
              <SelectItem value="oceania">Oceania Average</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full h-[420px]"> {/* Adjusted height to accommodate the new button */}
          <PercentDifferenceChart selectedCountry={selectedCountry} comparisonType={comparisonType} />
        </div>
      </CardContent>
    </Card>
  )
}