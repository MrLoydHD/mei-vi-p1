"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from '@/contexts/data'
import CountryComparisonHeatmap from '@/components/d3/CountryComparisonHeatmap'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CountriesComparasionCardProps {
  handleCountryChange: (value: string, index: number) => void;
  selectedCountries: { country1: string; country2: string };
}


export default function CountryComparisonHeatmapCard({ handleCountryChange, selectedCountries }: CountriesComparasionCardProps) {
  const { lastYearData } = useData()
  const { country1, country2 } = selectedCountries

  const countries = lastYearData.map(d => d['Country name']).sort()

  return (
    <Card className="border-primary">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Country Comparison Radar</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">What does this mean?</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <h3 className="font-semibold mb-2">Understanding the Happiness Factors Chart</h3>
              <p className="text-sm text-muted-foreground">
                This chart compares the impact of various factors on the overall happiness score (Ladder score) for {country1} and {country2}. 
                Each axis represents a different factor, and the area of each shape indicates the country's performance across these factors.
                The sum of these factors, along with the dystopia value and residual, equals the total Ladder score for each country.
                Each factor has its own scale, with the maximum value being the highest observed value for that factor across all countries.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Select value={country1} onValueChange={(value) => handleCountryChange(value, 1)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select country 1" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={country2} onValueChange={(value) => handleCountryChange(value, 2)}>            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select country 2" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CountryComparisonHeatmap country1={country1} country2={country2} />
      </CardContent>
    </Card>
  )
}