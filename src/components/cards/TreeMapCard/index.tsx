"use client"

import React, { useEffect, useState } from 'react'
import { useData } from '@/contexts/data'
import { HappinessData } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TreeMapChart from '@/components/d3/TreeMapChart'
import * as d3 from 'd3'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TreeMapNode {
  name: string
  value: number
  children?: TreeMapNode[]
}

const TreeMapCard: React.FC = () => {
  const { timeSeriesData } = useData()
  const [selectedMetric, setSelectedMetric] = useState('Life Ladder')
  const [currentView, setCurrentView] = useState<TreeMapNode | null>(null)
  const [showingContinent, setShowingContinent] = useState(true)

  const metrics = [
    'Life Ladder',
    'Log GDP per capita',
    'Social support',
    'Healthy life expectancy at birth',
    'Freedom to make life choices',
    'Generosity',
    'Perceptions of corruption'
  ]

  const continents = {
    Europe: ["Finland", "Denmark", "Iceland", "Sweden", "Netherlands", "Norway", "Luxembourg", "Switzerland", "Austria", "Belgium", "Ireland", "Czechia", "Lithuania", "United Kingdom", "Slovenia", "Germany", "France", "Romania", "Estonia", "Poland", "Spain", "Serbia", "Malta", "Italy", "Slovakia", "Latvia", "Cyprus", "Portugal", "Hungary", "Croatia", "Greece", "Bosnia and Herzegovina", "Moldova", "Russia", "Montenegro", "Bulgaria", "North Macedonia", "Albania", "Ukraine"],
    Asia: ["Israel", "Kuwait", "United Arab Emirates", "Saudi Arabia", "Singapore", "Taiwan Province of China", "Japan", "South Korea", "Philippines", "Vietnam", "Thailand", "Malaysia", "China", "Bahrain", "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Mongolia", "Indonesia", "Armenia", "Tajikistan", "Georgia", "Iraq", "Nepal", "Laos", "Turkiye", "Iran", "Azerbaijan", "State of Palestine", "Pakistan", "Myanmar", "Cambodia", "Jordan", "India", "Sri Lanka", "Bangladesh", "Yemen", "Lebanon", "Afghanistan"],
    Africa: ["Mauritius", "Libya", "South Africa", "Algeria", "Congo (Brazzaville)", "Mozambique", "Gabon", "Ivory Coast", "Guinea", "Senegal", "Nigeria", "Cameroon", "Namibia", "Morocco", "Niger", "Burkina Faso", "Mauritania", "Gambia", "Chad", "Kenya", "Tunisia", "Benin", "Uganda", "Ghana", "Liberia", "Mali", "Madagascar", "Togo", "Egypt", "Ethiopia", "Tanzania", "Comoros", "Zambia", "Eswatini", "Malawi", "Botswana", "Zimbabwe", "Congo (Kinshasa)", "Sierra Leone", "Lesotho"],
    "North America": ["Canada", "United States", "Mexico"],
    "South America": ["Costa Rica", "Uruguay", "Chile", "Panama", "Brazil", "Argentina", "Guatemala", "Nicaragua", "El Salvador", "Paraguay", "Peru", "Dominican Republic", "Bolivia", "Ecuador", "Venezuela", "Colombia", "Honduras"],
    Oceania: ["Australia", "New Zealand"]
  }

  const prepareData = (data: HappinessData[]): TreeMapNode => {
    const latestYear = Math.max(...data.map(d => d.year))
    const latestData = data.filter(d => d.year === latestYear)

    const root: TreeMapNode = {
      name: "World",
      value: 0,
      children: Object.entries(continents).map(([continent, countries]) => {
        const continentData = latestData.filter(d => countries.includes(d['Country name']))
        const countryValues = continentData.map(d => d[selectedMetric] as number)
        const continentAvg = countryValues.reduce((a, b) => a + b, 0) / countryValues.length || 0

        return {
          name: continent,
          value: continentAvg,
          children: continentData.map(d => ({
            name: d['Country name'],
            value: d[selectedMetric] as number
          }))
        }
      }).filter(continent => continent.children && continent.children.length > 0)
    }

    root.value = d3.mean(root.children!, d => d.value) || 0
    return root
  }

  useEffect(() => {
    if (timeSeriesData.length) {
      const data = prepareData(timeSeriesData)
      setCurrentView(data)
      setShowingContinent(true)
    }
  }, [timeSeriesData, selectedMetric])

  const handleNodeClick = (node: TreeMapNode) => {
    setCurrentView(node)
    setShowingContinent(false)
  }

  const handleBackClick = () => {
    const data = prepareData(timeSeriesData)
    setCurrentView(data)
    setShowingContinent(true)
  }

  return (
    <Card className="w-full h-full border-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Continent and Country Rankings 2024</CardTitle>
        <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">What does this mean?</Button>
            </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h3 className="font-medium">About this Chart</h3>
              <p className="text-sm text-muted-foreground">
                This treemap visualizes the selected happiness metric across continents and countries. The size of each rectangle represents the value of the metric.
              </p>
              <p className="text-sm text-muted-foreground">
                Click on a continent to zoom in and see individual country data. Use the 'Back to Continents' button to return to the continent view.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(metric => (
                <SelectItem key={metric} value={metric}>{metric}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!showingContinent && (
            <Button onClick={handleBackClick}>
              Back to Continents
            </Button>
          )}
        </div>
        {currentView && (
          <TreeMapChart
            data={currentView}
            onNodeClick={handleNodeClick}
            metric={selectedMetric}
            showingContinent={showingContinent}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default TreeMapCard