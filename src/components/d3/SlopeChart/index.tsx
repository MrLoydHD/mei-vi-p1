"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import { HappinessData } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface SlopeChartProps {
  country1: string
  country2: string
}

const SlopeChart: React.FC<SlopeChartProps> = ({ country1, country2 }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const { timeSeriesData } = useData()
  const [selectedMetric, setSelectedMetric] = useState('Life Ladder')

  const metrics = [
    'Life Ladder',
    'Log GDP per capita',
    'Social support',
    'Healthy life expectancy at birth',
    'Freedom to make life choices',
    'Perceptions of corruption'
  ]

  const getCountryColor = (country: string) => {
    return country === country1 ? "#7570b3" : "#1f77b4"
  }

  useEffect(() => {
    if (!svgRef.current || !timeSeriesData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 40, right: 100, bottom: 40, left: 100 }
    const width = 1600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const filteredData = timeSeriesData
      .filter(d => d['Country name'] === country1 || d['Country name'] === country2)

    const years = Array.from(new Set(filteredData.map(d => d.year))).sort()

    const x = d3.scalePoint()
      .domain(years as unknown as string[])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d[selectedMetric] as number) || 0])
      .range([height, 0])

    const line = d3.line<HappinessData>()
      .x(d => x(d.year as unknown as string)!)
      .y(d => y(d[selectedMetric] as number))

    const color = d3.scaleOrdinal()
      .domain([country1, country2])
      .range(["#7570b3", "#1f77b4"]) // Tableau10 purple and blue

    // Add vertical bars for each year with animation
    years.forEach((year, index) => {
      // Add vertical bar
      g.append("rect")
        .attr("x", x(year as unknown as string)! - 1)
        .attr("y", height)
        .attr("width", 3)
        .attr("height", 0)
        .attr("fill", "black")
        .attr("cursor", "pointer")
        .attr("opacity", 0.2)
        .transition()
        .delay(index * 100)
        .duration(500)
        .attr("y", 0)
        .attr("height", height)
        .on("end", function() {
          d3.select(this)
            .on("mouseover", function() {
              d3.select(this).attr("opacity", 0.6);  // Darker on hover
              const yearData = filteredData.filter(d => d.year === year);
              const tooltip = g.append("g")
                  .attr("class", "tooltip")
                  .attr("transform", `translate(${x(year as unknown as string)!}, ${height - 10})`)

              tooltip.append("rect")
                .attr("x", -60)
                .attr("y", -50)
                .attr("width", 120)
                .attr("height", 60)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("rx", 5)
                .attr("ry", 5)

              tooltip.append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("dy", "-2em")
                .text(`${year}:`)

              yearData.forEach((d, i) => {
                tooltip.append("text")
                  .attr("text-anchor", "middle")
                  .attr("font-size", "12px")
                  .attr("dy", `${-1 + i}em`)
                  .attr("fill", color(d['Country name']) as string)
                  .text(`${d['Country name']}: ${(d[selectedMetric] as number).toFixed(2)}`)
              })
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 0.2);  // Reset opacity
                g.select(".tooltip").remove()
            })
        })

      // Add y-axis for each year with animation
      const yAxis = g.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${x(year as unknown as string)},0)`)
        .style("opacity", 0)
      
      yAxis.call(d3.axisLeft(y).ticks(5))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "black").attr("stroke-opacity", 0.2).attr("stroke-width", 3))
        .call(g => g.selectAll(".tick text").attr("x", -10))
      
      yAxis.transition()
        .delay(index * 100)
        .duration(500)
        .style("opacity", 1)
      
      // Add year label with animation
      g.append("text")
        .attr("x", x(year as unknown as string)!)
        .attr("y", height + 20)
        .attr("text-anchor", "middle")
        .text(year)
        .style("opacity", 0)
        .transition()
        .delay(index * 100)
        .duration(500)
        .style("opacity", 1)
    })

    // Add lines with animation
    const countries = [country1, country2]
    countries.forEach(country => {
      const countryData = filteredData.filter(d => d['Country name'] === country)
      const path = g.append("path")
        .datum(countryData)
        .attr("fill", "none")
        .attr("stroke", color(country) as string)
        .attr("stroke-width", 3)
        .attr("class", `line-${country.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .attr("d", line)

      const totalLength = path.node()?.getTotalLength() || 0
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0)
    })

    // Add points with animation
    countries.forEach(country => {
      const countryData = filteredData.filter(d => d['Country name'] === country)
      g.selectAll(null)
        .data(countryData)
        .enter().append("circle")
        .attr("class", `point-${country.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .attr("cx", d => x(d.year as unknown as string)!)
        .attr("cy", d => y(d[selectedMetric] as number))
        .attr("r", 0)
        .attr("fill", color(country) as string)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .transition()
        .delay((d, i) => i * 200)
        .duration(500)
        .attr("r", 6)
        .on("end", function() {
          d3.select(this)
            .on("mouseover", function(event, d: HappinessData) {
              const tooltip = g.append("g")
                .attr("class", "tooltip")
                .attr("transform", `translate(${x(d.year as unknown as string)!}, ${y(d[selectedMetric] as number) - 10})`)

              tooltip.append("rect")
                .attr("x", -100)
                .attr("y", -25)
                .attr("width", 200)
                .attr("height", 30)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("rx", 5)
                .attr("ry", 5)

              tooltip.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("dy", "-0.5em")
                .text(`${d['Country name']} (${d.year}): ${(d[selectedMetric] as number).toFixed(2)}`)

              g.selectAll(`.line-${country.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr("stroke-width", 4)

              g.selectAll(`.point-${country.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr("r", 7)

              g.selectAll(`.line-${(country === country1 ? country2 : country1).replace(/[^a-zA-Z0-9]/g, '_')}, .point-${(country === country1 ? country2 : country1).replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr("opacity", 0.3)
            })
            .on("mouseout", function() {
              g.select(".tooltip").remove()
              g.selectAll(`.line-${country1.replace(/[^a-zA-Z0-9]/g, '_')}, .line-${country2.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr("stroke-width", 3)
              g.selectAll(`.point-${country1.replace(/[^a-zA-Z0-9]/g, '_')}, .point-${country2.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .attr("r", 6)
                .attr("opacity", 1)
            })
        })
    })

    // Add title with animation
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text(`${selectedMetric} Trend: ${country1} vs ${country2}`)
      .transition()
      .duration(1000)
      .style("opacity", 1)

  }, [timeSeriesData, country1, country2, selectedMetric])

  return (
    <div className="w-full p-4 flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
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
        <div className="flex items-center space-x-4">
          {[country1, country2].map(country => (
            <div key={country} className="flex items-center">
              <div
                className="w-4 h-4 mr-2"
                style={{ backgroundColor: getCountryColor(country) }}
              />
              <span>{country}</span>
            </div>
          ))}
        </div>
      </div>
      <ScrollArea className="w-full flex-grow relative">
        <div className="w-[1600px] h-[400px]">
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default SlopeChart