import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useData } from '@/contexts/data'
import WorldMapCard from '@/components/cards/WorldMapCard'
import BarChartRaceCard from '@/components/cards/BarChartRaceCard'
import PercentDifferenceCard from '@/components/cards/PercentDifferenceCard'
import CountriesComparasionCard from '@/components/cards/CountriesComparasionCard'
import RadarChart from '@/components/d3/RadarChart'
import TrendChart from '@/components/d3/TrendChart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("tab1")
  const { lastYearData, isLoading } = useData()
  const [selectedCountry, setSelectedCountry] = useState("Finland")
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
  }

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
                  <Select value={selectedCountry} onValueChange={setSelectedCountry} defaultValue={selectedCountry}>
                    <SelectTrigger className="w-full mb-4">
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
                  <div className="h-full mt-4">
                    <RadarChart country={selectedCountry} />
                  </div>
              </CardContent>
              </Card>
              <PercentDifferenceCard 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
              {/* <PercentDifferenceDebug 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              /> */}

            </div>
          </div>
        </TabsContent>
        <TabsContent value="tab2" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <CountriesComparasionCard />
            </div>
            <div className="lg:col-span-1">
              <Card className="border-primary h-full">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">Comparison Details</h2>
                  {/* Add content for the first small card here */}
                  <p>This card will show detailed comparisons between countries.</p>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="border-primary h-full">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">Additional Insights</h2>
                  {/* Add content for the second small card here */}
                  <p>This card will provide additional insights or metrics for the comparison.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tab3" className="space-y-4">
          {/* Content for tab3 remains unchanged */}
        </TabsContent>
      </Tabs>
    </div>
  )
}