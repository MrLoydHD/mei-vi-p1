import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useData } from '@/contexts/data'
import InteractiveGlobe from '@/components/d3/InteractiveGlobe'
import WorldMapCard from '@/components/cards/WorldMapCard'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("tab1")
  const { lastYearData, isLoading } = useData()

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
        <TabsContent value="tab1" className="space-y-4 md:space-y-0 md:h-[calc(100vh-11rem)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-1 grid grid-cols-1 md:grid-rows-2 gap-4">
              <Card className="md:row-span-1 border-primary">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Left Top Section</h2>
                  <p className="text-sm md:text-base">Content for the left top section goes here.</p>
                </CardContent>
              </Card>
              <Card className="md:row-span-1 border-primary">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Left Bottom Section</h2>
                  <p className="text-sm md:text-base">Content for the left bottom section goes here.</p>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-rows-3 gap-4">
              <WorldMapCard/>
              <Card className="md:row-span-1 border-primary">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Bottom Right Strip</h2>
                  <p className="text-sm md:text-base">Content for the bottom right strip goes here.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        {/* Other TabsContent remain unchanged */}
      </Tabs>
    </div>
  )
}