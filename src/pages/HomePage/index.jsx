import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useData } from '@/contexts/data'
import WorldMapCard from '@/components/cards/WorldMapCard'
import BarChartRaceCard from '@/components/cards/BarChartRaceCard'
import RadarChart from '@/components/d3/RadarChart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("tab1")
  const { lastYearData, isLoading } = useData()
  const [selectedCountry, setSelectedCountry] = useState("Finland")

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-4rem)]">
      <Tabs defaultValue="tab1" className="w-full h-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="tab1">Around the World</TabsTrigger>
          <TabsTrigger value="tab2">Country VS Country</TabsTrigger>
          <TabsTrigger value="tab3">Dashboard 3</TabsTrigger>
          <TabsTrigger value="tab4">Dashboard 4</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 grid grid-cols-1 md:grid-rows-2 gap-4">
              <Card className="border-primary">
                <CardContent className="p-4 md:p-6">
                  <Select onValueChange={setSelectedCountry} defaultValue={selectedCountry}>
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
              <Card className="border-primary">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Left Bottom Section</h2>
                  <p className="text-sm md:text-base">Content for the left bottom section goes here.</p>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              <WorldMapCard />
              <BarChartRaceCard />
            </div>
          </div>
        </TabsContent>
        {/* Other TabsContent remain unchanged */}
      </Tabs>
    </div>
  )
}