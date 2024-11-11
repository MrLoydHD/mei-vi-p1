"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CountryComparisonHeatmapProps {
  country1: string
  country2: string
}

const metrics = [
  'Explained by: Log GDP per capita',
  'Explained by: Social support',
  'Explained by: Healthy life expectancy',
  'Explained by: Freedom to make life choices',
  'Explained by: Perceptions of corruption'
]

export default function CountryComparisonHeatmap({ country1, country2 }: CountryComparisonHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { lastYearData } = useData()
  const [tooltipData, setTooltipData] = useState<{ x: string; y: string; value1: number; value2: number; position: { x: number; y: number } } | null>(null)

  useEffect(() => {
    if (!svgRef.current || !lastYearData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = 500
    const margin = { top: 100, right: 100, bottom: 100, left: 150 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const data1 = lastYearData.find(d => d['Country name'] === country1)
    const data2 = lastYearData.find(d => d['Country name'] === country2)

    if (!data1 || !data2) return

    const heatmapData = metrics.flatMap(metric1 => 
      metrics.map(metric2 => ({
        x: metric1,
        y: metric2,
        value: d3.min([
          parseFloat(data1[metric1 as keyof typeof data1] as string),
          parseFloat(data2[metric2 as keyof typeof data2] as string)
        ]) || 0
      }))
    )

    const x = d3.scaleBand()
      .range([0, innerWidth])
      .domain(metrics)
      .padding(0.05)

    const y = d3.scaleBand()
      .range([0, innerHeight])
      .domain(metrics)
      .padding(0.05)

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(heatmapData, d => d.value) || 0])

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    g.selectAll("rect")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x) || 0)
      .attr("y", d => y(d.y) || 0)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => colorScale(d.value))
      .on("mousemove", (event, d) => {
        const [mouseX, mouseY] = d3.pointer(event)
        setTooltipData({
          x: d.x,
          y: d.y,
          value1: parseFloat(data1[d.x as keyof typeof data1] as string),
          value2: parseFloat(data2[d.y as keyof typeof data2] as string),
          position: { x: mouseX + margin.left, y: mouseY + margin.top }
        })
      })
      .on("mouseout", () => {
        setTooltipData(null)
      })

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start")

    g.append("g")
      .call(d3.axisLeft(y))

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Metric Comparison: ${country1} vs ${country2}`)

    svg.append("text")
      .attr("transform", `translate(${width - margin.right + 40}, ${height/2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text(country1)

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text(country2)

  }, [country1, country2, lastYearData])

  return (
    <TooltipProvider>
      <div className="relative">
        <svg ref={svgRef} width="100%" height="500" />
        {tooltipData && (
          <Tooltip open={true}>
            <TooltipTrigger asChild>
              <div
                style={{
                  position: 'absolute',
                  left: `${tooltipData.position.x}px`,
                  top: `${tooltipData.position.y}px`,
                  width: '1px',
                  height: '1px'
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p><strong>{country1} {tooltipData.x}:</strong> {tooltipData.value1.toFixed(3)}</p>
              <p><strong>{country2} {tooltipData.y}:</strong> {tooltipData.value2.toFixed(3)}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}