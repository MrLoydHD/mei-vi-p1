import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useData } from '@/contexts/data'
import WorldMapCard from '@/components/cards/WorldMapCard'
import BarChartRaceCard from '@/components/cards/BarChartRaceCard'
import PercentDifferenceCard from '@/components/cards/PercentDifferenceCard'
import CountriesComparasionCard from '@/components/cards/CountriesComparasionCard'
import CountryComparisonHeatmapCard from '@/components/cards/CountryComparisonHeatmapCard'
import { SuggestionForm } from '@/components/cards/SuggestionForms'
import TreeMapCard from '@/components/cards/TreeMapCard'
import RadarChart from '@/components/d3/RadarChart'
import TrendChart from '@/components/d3/TrendChart'
import StackedBarChart from '@/components/d3/StackedBarChart'
import SlopeChart from '@/components/d3/SlopeChart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


const comparisonOptions = [
  { value: 'global', label: 'Global Average' },
  { value: 'europe', label: 'Europe Average' },
  { value: 'asia', label: 'Asia Average' },
  { value: 'africa', label: 'Africa Average' },
  { value: 'northAmerica', label: 'North America Average' },
  { value: 'southAmerica', label: 'South America Average' },
  { value: 'oceania', label: 'Oceania Average' },
]

export default function HomePage() {
  const [, setActiveTab] = useState("tab1")
  const { lastYearData, isLoading, timeSeriesData } = useData()
  const [selectedCountry, setSelectedCountry] = useState("Finland")
  const [comparisonType, setComparisonType] = useState("global")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState({
    country1: "Finland",
    country2: "Denmark"
  });

  const countries = Array.from(new Set(timeSeriesData.map(d => d['Country name']))).sort()

  const handleCountrySelect = (country: React.SetStateAction<string>) => {
    setSelectedCountry(country)
  }

  const handleCountryChange = (country: string, index: number) => {
    setSelectedCountries(prev => ({
      ...prev,
      [`country${index}`]: country
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-4rem)]">
      <Tabs defaultValue="tab1" className="w-full h-full" onValueChange={setActiveTab}>
        <TabsList className="grid bg-primary bg-opacity-30 shadow-lg grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="tab1">Around the World</TabsTrigger>
          <TabsTrigger value="tab2">Country VS Country</TabsTrigger>
          <TabsTrigger value="tab3">Others</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-1 grid grid-cols-1 gap-4">
              <WorldMapCard onCountrySelect={setSelectedCountry} selectedCountry={selectedCountry} />
              <Card className="border-primary">
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-2 md:mb-4">
                    <h2 className="text-xl md:text-2xl font-bold">Trends Over the Years</h2>
                    <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline">What does this mean?</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h3 className="font-medium leading-none">About this Visualization</h3>
                          <p className="text-sm text-muted-foreground">
                            This chart shows trends in happiness indicators over time for the selected country and comparison group.
                          </p>
                          <h4 className="font-medium mt-2">Key Features:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            <li>Compare a country's trend with global or regional averages</li>
                            <li>View different happiness indicators over time</li>
                            <li>Interactive selection of countries and indicators</li>
                          </ul>
                          <h4 className="font-medium mt-2">How to Use:</h4>
                          <p className="text-sm text-muted-foreground">
                            Select a country, comparison group, and happiness indicator using the dropdown menus. The chart will update to show the trends over time.
                          </p>
                          <h4 className="font-medium mt-2">Data Source:</h4>
                          <p className="text-sm text-muted-foreground">
                            Data is sourced from the annual World Happiness Report, providing a time series of various happiness indicators for countries worldwide.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <TrendChart selectedCountry={selectedCountry} onCountryChange={handleCountrySelect} />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 grid grid-cols-1 gap-4">
            <Card className="border-primary">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {lastYearData.map((country) => (
                          <SelectItem key={country['Country name']} value={country['Country name']}>
                            {country['Country name']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={comparisonType} onValueChange={setComparisonType}>
                      <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select comparison type" />
                      </SelectTrigger>
                      <SelectContent>
                        {comparisonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-full mt-4">
                    <RadarChart 
                      country={selectedCountry} 
                      comparisonType={comparisonType}
                      comparisonLabel={comparisonOptions.find(o => o.value === comparisonType)?.label || ''}
                    />
                  </div>
                </CardContent>
              </Card>
              <PercentDifferenceCard 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tab2" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-12">
              <CountriesComparasionCard handleCountryChange={handleCountryChange} selectedCountries={selectedCountries} />
            </div>
            <div className="lg:col-span-5">
              <CountryComparisonHeatmapCard handleCountryChange={handleCountryChange} selectedCountries={selectedCountries} />
            </div>
            <div className="lg:col-span-7 border border-primary rounded-lg">
            <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Country Comparison</CardTitle>
                  <CardDescription>Compare happiness factors between two countries</CardDescription>
                  <div className="flex space-x-4 w-full">
                    <Select value={selectedCountries.country1} onValueChange={(country) => handleCountryChange(country, 1)}>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Select country 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedCountries.country2} onValueChange={(country) => handleCountryChange(country, 2)}>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Select country 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="bar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-primary bg-opacity-30">
                      <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                      <TabsTrigger value="slope">Slope Chart</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bar">
                      <StackedBarChart country1={selectedCountries.country1} country2={selectedCountries.country2} />
                    </TabsContent>
                    <TabsContent value="slope">
                      <SlopeChart country1={selectedCountries.country1} country2={selectedCountries.country2} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tab3" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className='lg:col-span-1'>
              <BarChartRaceCard />
            </div>
            <div className='lg:col-span-1'>
              <TreeMapCard />
            </div>
            <div className='lg:col-span-2'>
              <SuggestionForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}