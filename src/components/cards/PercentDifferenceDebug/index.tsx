import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from '@/contexts/data'
import * as d3 from 'd3'

interface PercentDifferenceCardProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
}

export default function PercentDifferenceCard({ selectedCountry, onCountryChange }: PercentDifferenceCardProps) {
  const [comparisonType, setComparisonType] = useState<'global' | 'europe' | 'asia' | 'africa' | 'northAmerica' | 'southAmerica' | 'oceania'>('global')
  const { lastYearData } = useData()
  const chartRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const metrics = [
    'Ladder score',
    'Explained by: Log GDP per capita',
    'Explained by: Social support',
    'Explained by: Healthy life expectancy',
    'Explained by: Freedom to make life choices',
    'Explained by: Generosity',
    'Explained by: Perceptions of corruption'
  ]

  const continents = {
    europe: ["Finland", "Denmark", "Iceland", "Sweden", "Netherlands", "Norway", "Luxembourg", "Switzerland", "Austria", "Belgium", "Ireland", "Czechia", "Lithuania", "United Kingdom", "Slovenia", "Germany", "France", "Romania", "Estonia", "Poland", "Spain", "Serbia", "Malta", "Italy", "Slovakia", "Latvia", "Cyprus", "Portugal", "Hungary", "Croatia", "Greece", "Bosnia and Herzegovina", "Moldova", "Russia", "Montenegro", "Bulgaria", "North Macedonia", "Albania", "Ukraine"],
    asia: ["Israel", "Kuwait", "United Arab Emirates", "Saudi Arabia", "Singapore", "Taiwan Province of China", "Japan", "South Korea", "Philippines", "Vietnam", "Thailand", "Malaysia", "China", "Bahrain", "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Mongolia", "Indonesia", "Armenia", "Tajikistan", "Georgia", "Iraq", "Nepal", "Laos", "Turkiye", "Iran", "Azerbaijan", "State of Palestine", "Pakistan", "Myanmar", "Cambodia", "Jordan", "India", "Sri Lanka", "Bangladesh", "Yemen", "Lebanon", "Afghanistan"],
    africa: ["Mauritius", "Libya", "South Africa", "Algeria", "Congo (Brazzaville)", "Mozambique", "Gabon", "Ivory Coast", "Guinea", "Senegal", "Nigeria", "Cameroon", "Namibia", "Morocco", "Niger", "Burkina Faso", "Mauritania", "Gambia", "Chad", "Kenya", "Tunisia", "Benin", "Uganda", "Ghana", "Liberia", "Mali", "Madagascar", "Togo", "Egypt", "Ethiopia", "Tanzania", "Comoros", "Zambia", "Eswatini", "Malawi", "Botswana", "Zimbabwe", "Congo (Kinshasa)", "Sierra Leone", "Lesotho"],
    northAmerica: ["Canada", "United States", "Mexico"],
    southAmerica: ["Costa Rica", "Uruguay", "Chile", "Panama", "Brazil", "Argentina", "Guatemala", "Nicaragua", "El Salvador", "Paraguay", "Peru", "Dominican Republic", "Bolivia", "Ecuador", "Venezuela", "Colombia", "Honduras"],
    oceania: ["Australia", "New Zealand"]
  }

  useEffect(() => {
    if (!chartRef.current || !containerRef.current || !lastYearData.length) return

    const { width, height } = containerRef.current.getBoundingClientRect()
    const svg = d3.select(chartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 60, right: 20, bottom: 40, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const countryData = lastYearData.find(d => d['Country name'] === selectedCountry)
    
    const getAverages = () => {
      let filteredData = lastYearData
      if (comparisonType !== 'global' && continents[comparisonType as keyof typeof continents]) {
        const continentCountries = continents[comparisonType as keyof typeof continents]
        filteredData = lastYearData.filter(d => continentCountries.includes(d['Country name']))
      }
      return metrics.reduce((acc, metric) => {
        acc[metric] = d3.mean(filteredData, d => parseFloat(d[metric as keyof typeof d] as string)) || 0
        return acc
      }, {} as Record<string, number>)
    }

    const averages = getAverages()
    
    const data = metrics.map(metric => ({
      metric,
      percentDifference: countryData && averages[metric] !== undefined && averages[metric] !== 0
        ? ((parseFloat(countryData[metric as keyof typeof countryData] as string) - averages[metric]) / averages[metric]) * 100
        : 0
    }))

    const x = d3.scaleBand()
      .domain(metrics)
      .range([0, chartWidth])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([-100, 100])
      .range([chartHeight, 0])

    chart.append("g")
      .attr("transform", `translate(0,${chartHeight / 2})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text").remove()

    chart.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`))

    chart.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.metric)!)
      .attr("y", d => d.percentDifference > 0 ? y(d.percentDifference) : y(0))
      .attr("width", x.bandwidth())
      .attr("height", d => Math.abs(y(d.percentDifference) - y(0)))
      .attr("fill", d => d.percentDifference >= 0 ? "rgb(134, 239, 172)" : "rgb(252, 165, 165)")

    chart.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    chart.selectAll(".value")
      .data(data)
      .join("text")
      .attr("class", "value")
      .attr("x", d => x(d.metric)! + x.bandwidth() / 2)
      .attr("y", d => d.percentDifference > 0 ? y(d.percentDifference) - 5 : y(d.percentDifference) + 15)
      .attr("text-anchor", "middle")
      .text(d => `${d.percentDifference.toFixed(1)}%`)
      .attr("fill", "black")
      .attr("font-size", "12px")

    chart.selectAll(".metric-label")
      .data(data)
      .join("text")
      .attr("class", "metric-label")
      .attr("x", d => x(d.metric)! + x.bandwidth() / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `rotate(-45, ${x(d.metric)! + x.bandwidth() / 2}, -10)`)
      .text(d => d.metric)
      .attr("fill", "black")
      .attr("font-size", "10px")

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percentage Difference")

  }, [selectedCountry, comparisonType, lastYearData])

  return (
    <Card className="border-primary w-full h-[600px]">
      <CardContent className="p-4 md:p-6 flex flex-col h-full">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Comparison to Averages</h2>
        <div className="flex gap-4 mb-4">
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
        <div ref={containerRef} className="w-full h-[500px]">
          <svg ref={chartRef} width="100%" height="100%" />
        </div>
      </CardContent>
    </Card>
  )
}