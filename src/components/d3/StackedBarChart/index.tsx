"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ComparativeBarChartProps {
  country1: string
  country2: string
}

const ComparativeBarChart: React.FC<ComparativeBarChartProps> = ({ country1, country2 }) => {
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

    const margin = { top: 40, right: 30, bottom: 60, left: 60 }
    const width = 1600 - margin.left - margin.right
    const height = 460 - margin.top - margin.bottom

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const filteredData = timeSeriesData
      .filter(d => d['Country name'] === country1 || d['Country name'] === country2)

    const years = Array.from(new Set(filteredData.map(d => d.year))).sort()

    const x0 = d3.scaleBand()
      .domain(years as unknown as string[])
      .range([0, width])
      .padding(0.1)

    const x1 = d3.scaleBand()
      .domain([country1, country2])
      .range([0, x0.bandwidth()])
      .padding(0.05)

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d[selectedMetric] as number) || 0])
      .range([height, 0])

    const color = d3.scaleOrdinal()
      .domain([country1, country2])
      .range(["#7570b3", "#1f77b4"]) // Tableau10 purple and blue

    // Add grid with animation
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)

      .call(g => g.select(".domain").remove())
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)

    g.append("g")
      .attr("class", "grid")
      .call(g => g.select(".domain").remove())
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)

    // Style the grid lines
    g.selectAll(".grid line")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-opacity", 0.7)
      .attr("shape-rendering", "crispEdges")


    years.forEach(year => {
      const yearData = filteredData.filter(d => d.year === year)

      g.selectAll(`.bars-${year}`)
        .data(yearData)
        .enter().append("rect")
          .attr("class", `bars-${year}`)
          .attr("x", d => x0(year as unknown as string)! + x1(d['Country name'])!)
          .attr("y", height)
          .attr("width", x1.bandwidth())
          .attr("fill", d => color(d['Country name']) as string)
          .attr("cursor", "pointer")
          .on("mouseover", function(event, d) {
            const tooltip = g.append("g")
              .attr("class", "tooltip")
              .attr("transform", `translate(${x0(year as unknown as string)! + x1(d['Country name'])! + x1.bandwidth() / 2}, ${y(d[selectedMetric] as number) - 10})`)

            tooltip.append("rect")
              .attr("x", -60)
              .attr("y", -25)
              .attr("width", 120)
              .attr("height", 30)
              .attr("fill", "white")
              .attr("stroke", "black")
              .attr("rx", 5)
              .attr("ry", 5)

            tooltip.append("text")
              .attr("text-anchor", "middle")
              .attr("font-size", "12px")
              .attr("dy", "-0.5em")
              .text(`${d['Country name']}: ${(d[selectedMetric] as number).toFixed(2)}`)

            g.selectAll("rect")
              .attr("opacity", function(dd: d3.DSVRowArray<string>) {
                return dd['Country name'] === d['Country name'] ? 1 : 0.3;
              })
              .attr("stroke", function(dd: d3.DSVRowArray<string>) {
                return dd['Country name'] === d['Country name'] ? d3.rgb(color(dd['Country name']) as string).darker(0.5).toString() : "none";
              })
              .attr("stroke-width", function(dd: d3.DSVRowArray<string>) {
                return dd['Country name'] === d['Country name'] ? 2 : 0;
              });
          })
          .on("mouseout", function() {
            g.select(".tooltip").remove()
            g.selectAll("rect")
              .attr("opacity", 1)
              .attr("stroke", "none");
          })
          .transition()
          .duration(1000)
          .delay((d, i) => i * 100)
          .attr("y", d => y(d[selectedMetric] as number))
          .attr("height", d => height - y(d[selectedMetric] as number))

    })

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("font-size", 14)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1)

    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
          .attr("font-size", 14)
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .style("opacity", 1)


    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(selectedMetric)
      .style("opacity", 0)
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
      <div className="w-full flex-grow relative overflow-x-auto">
        <div className="w-[1600px] h-[440px] relative">
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
      </div>
    </div>
  )
}

export default ComparativeBarChart