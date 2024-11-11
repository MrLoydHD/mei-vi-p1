"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import { HappinessData } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TrendChartProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
}

const TrendChart: React.FC<TrendChartProps> = ({ selectedCountry, onCountryChange }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const { timeSeriesData } = useData()
  const [comparisonType, setComparisonType] = useState<'global' | 'europe' | 'asia' | 'africa' | 'northAmerica' | 'southAmerica' | 'oceania'>('global')
  const [criterion, setCriterion] = useState<'Life Ladder' | 'Log GDP per capita' | 'Social support' | 'Healthy life expectancy at birth' | 'Freedom to make life choices' | 'Perceptions of corruption'>('Life Ladder')

  const continents = {
    europe: ["Albania", "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "United Kingdom"],
    asia: ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"],
    africa: ["Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Swaziland", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"],
    northAmerica: ["Canada", "Mexico", "United States"],
    southAmerica: ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"],
    oceania: ["Australia", "Fiji", "New Zealand", "Papua New Guinea", "Solomon Islands", "Vanuatu"]
  }

  useEffect(() => {
    if (!svgRef.current || !timeSeriesData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 30, right: 100, bottom: 50, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const countryData = timeSeriesData.filter(d => d['Country name'] === selectedCountry)
    const years = Array.from(new Set(timeSeriesData.map(d => d.year))).sort()

    let comparisonData
    if (comparisonType === 'global') {
      comparisonData = years.map(year => {
        const yearData = timeSeriesData.filter(d => d.year === year)
        const avgScore = d3.mean(yearData, d => d[criterion] as number)
        return { year, [criterion]: avgScore || 0 }
      })
    } else {
      const continentCountries = continents[comparisonType]
      comparisonData = years.map(year => {
        const yearData = timeSeriesData.filter(d => d.year === year && continentCountries.includes(d['Country name']))
        const avgScore = d3.mean(yearData, d => d[criterion] as number)
        return { year, [criterion]: avgScore || 0 }
      })
    }

    const maxCountryValue = d3.max(countryData, d => d[criterion] as number) || 0
    const maxComparisonValue = d3.max(comparisonData, d => d[criterion] as number) || 0
    const maxValue = Math.max(maxCountryValue, maxComparisonValue)
    const yDomainMax = maxValue * 1.1 // Add 10% padding to the top of the chart

    const y = d3.scaleLinear()
      .domain([0, yDomainMax])
      .range([height, 0])

    const x = d3.scaleLinear()
      .domain([d3.min(years) || 0, d3.max(years) || 0])
      .range([0, width])

    const line = d3.line<HappinessData>()
      .x(d => x(d.year))
      .y(d => y(d[criterion] as number))

    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ""))

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .attr("opacity", 0.1)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(() => ""))

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d => d.toString()))

    const yAxis = g.append("g")
      .call(d3.axisLeft(y))

    // Add country line with animation
    const countryPath = g.append("path")
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("opacity", 0.6)
      .attr("stroke-width", 2)
      .attr("d", line)

    const countryPathLength = countryPath.node()?.getTotalLength() || 0
    countryPath
      .attr("stroke-dasharray", countryPathLength + " " + countryPathLength)
      .attr("stroke-dashoffset", countryPathLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0)

    // Add comparison line with animation (now dashed)
    const comparisonPath = g.append("path")
      .datum(comparisonData)
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.6)
      .attr("d", line)

    const comparisonPathLength = comparisonPath.node()?.getTotalLength() || 0
    comparisonPath
      .attr("stroke-dasharray", comparisonPathLength + " " + comparisonPathLength)
      .attr("stroke-dashoffset", comparisonPathLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0)

    // Add dots with animation
    g.selectAll(".dot")
      .data(countryData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d[criterion] as number))
      .attr("r", 0)
      .attr("fill", "hsl(var(--primary))")
      .transition()
      .duration(1000)
      .attr("r", 4)

    g.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`${criterion}: ${selectedCountry} vs ${comparisonType === 'global' ? 'Global' : comparisonType} Average`)

    // X-axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Year")

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(criterion)

    // Add legend (moved higher)
    const legend = g.append("g")
      .attr("transform", `translate(${width - 20}, ${height - 60})`)

    legend.append("line")
      .attr("x1", -40)
      .attr("y1", 0)
      .attr("x2", -10)
      .attr("y2", 0)
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 2)

    legend.append("text")
      .attr("x", -5)
      .attr("y", 4)
      .text(selectedCountry)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle")

    legend.append("line")
      .attr("x1", -40)
      .attr("y1", 20)
      .attr("x2", -10)
      .attr("y2", 20)
      .attr("stroke", "gray")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    legend.append("text")
      .attr("x", -5)
      .attr("y", 24)
      .text(`${comparisonType === 'global' ? 'Global' : comparisonType} Average`)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle")

  }, [selectedCountry, timeSeriesData, comparisonType, criterion])

  const countries = Array.from(new Set(timeSeriesData.map(d => d['Country name']))).sort()

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">
        Disclaimer: This comparison is based on data from 156 countries over multiple years, which may result in some discrepancies compared to the Comparasion to Averages 2024 chart.
      </p>
      <div className="flex space-x-6 mb-4">
        <Select value={selectedCountry} onValueChange={onCountryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
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
        <Select value={criterion} onValueChange={(value: typeof criterion) => setCriterion(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select criterion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Life Ladder">Life Ladder</SelectItem>
            <SelectItem value="Log GDP per capita">Log GDP per capita</SelectItem>
            <SelectItem value="Social support">Social support</SelectItem>
            <SelectItem value="Healthy life expectancy at birth">Healthy life expectancy at birth</SelectItem>
            <SelectItem value="Freedom to make life choices">Freedom to make life choices</SelectItem>
            <SelectItem value="Perceptions of corruption">Perceptions of corruption</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <svg ref={svgRef} width="600" height="400" />
    </div>
  )
}

export default TrendChart