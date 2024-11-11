"use client"

import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'

interface CountriesComparasionChartProps {
  country1: string
  country2: string
  year1: number
  year2: number
}

export default function CountriesComparasionChart({ 
  country1,
  country2,
  year1,
  year2
}: CountriesComparasionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { timeSeriesData } = useData()

  const metrics = [
    { key: 'Social support', label: 'Social Support' },
    { key: 'Healthy life expectancy at birth', label: 'Healthy Life Expectancy' },
    { key: 'Freedom to make life choices', label: 'Freedom to make life choices' },
    { key: 'Log GDP per capita', label: 'Log GDP per capita' },
    { key: 'Perceptions of corruption', label: 'Perceptions of corruption' },
    { key: 'Life Ladder', label: 'Ladder Score' }
  ]

  const SCALE_PADDING_PERCENTAGE = 10 // 10% padding
  const blueColor = d3.schemeTableau10[0]  // Blue
  const purpleColor = d3.schemeTableau10[6]  // Purple

  const maxValues = useMemo(() => {
    return metrics.reduce((acc, { key }) => {
      const maxValue = d3.max(timeSeriesData, d => d[key]) || 0
      acc[key] = maxValue * (1 + SCALE_PADDING_PERCENTAGE / 100)
      return acc
    }, {} as Record<string, number>)
  }, [timeSeriesData])

  useEffect(() => {
    if (!svgRef.current || !timeSeriesData.length) return

    const country1Data = timeSeriesData.find(d => d['Country name'] === country1 && d.year === year1)
    const country2Data = timeSeriesData.find(d => d['Country name'] === country2 && d.year === year2)

    if (!country1Data || !country2Data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 60, right: 120, bottom: 60, left: 120 }
    const width = 1200 - margin.left - margin.right
    const height = 800 - margin.top - margin.bottom

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const y = d3.scaleBand()
      .domain(metrics.map(d => d.label))
      .range([0, height])
      .padding(0.4)

    metrics.forEach(({ key, label }) => {
      const value1 = country1Data[key] || 0
      const value2 = country2Data[key] || 0
      const maxValue = maxValues[key]

      const x = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, width / 2])
      

      // Background bars
      g.append("rect")
        .attr("x", 0)
        .attr("y", y(label))
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", "hsl(var(--muted))")
        .attr("opacity", 0.2)

      // Center line
      g.append("line")
        .attr("x1", width / 2)
        .attr("x2", width / 2)
        .attr("y1", y(label))
        .attr("y2", y(label) + y.bandwidth())
        .attr("stroke", "hsl(var(--foreground))")
        .attr("stroke-width", 2)


      // Country 1 bar
      const country1Bar = g.append("rect")
        .attr("x", width / 2)
        .attr("y", y(label))
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("fill", purpleColor)
        .transition()
        .duration(1000)
        .attr("x", width / 2 - x(value1))
        .attr("width", x(value1))
        .on("end", function() {
          if (value1 > value2) {
            d3.select(this).attr("opacity", 1);
            country2Bar.attr("opacity", 0.6);
          } else {
            d3.select(this).attr("opacity", 0.6);
            country2Bar.attr("opacity", 1);
          }
        });

      // Country 2 bar
      const country2Bar = g.append("rect")
        .attr("x", width / 2)
        .attr("y", y(label))
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("fill", blueColor)
        .transition()
        .duration(1000)
        .attr("width", x(value2))
        .on("end", function() {
          if (value2 > value1) {
            d3.select(this).attr("opacity", 1);
            country1Bar.attr("opacity", 0.6);
          } else {
            d3.select(this).attr("opacity", 0.6);
            country1Bar.attr("opacity", 1);
          }
        });

      // Add x-axis for each metric
      const xAxisLeft = d3.axisBottom(x.copy().range([width / 2, 0]))
      const xAxisRight = d3.axisBottom(x)

      g.append("g")
        .attr("transform", `translate(0,${y(label) + y.bandwidth()})`)
        .call(xAxisLeft)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("y2", -y.bandwidth()))
        .call(g => g.selectAll(".tick text").attr("y", 10))

      g.append("g")
        .attr("transform", `translate(${width / 2},${y(label) + y.bandwidth()})`)
        .call(xAxisRight)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("y2", -y.bandwidth()))
        .call(g => g.selectAll(".tick text").attr("y", 10))

      // Add values as text at the end of each bar
      g.append("text")
        .attr("x", width / 2)
        .attr("y", y(label) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", purpleColor)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("0")
        .transition()
        .duration(1000)
        .attr("x", width / 2 - x(value1) - 5)
        .tween("text", function() {
          const i = d3.interpolate(0, value1)
          return function(t) {
            this.textContent = i(t).toFixed(2)
          }
        })

      g.append("text")
        .attr("x", width / 2)
        .attr("y", y(label) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .attr("fill", blueColor)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("0")
        .transition()
        .duration(1000)
        .attr("x", width / 2 + x(value2) + 5)
        .tween("text", function() {
          const i = d3.interpolate(0, value2)
          return function(t) {
            this.textContent = i(t).toFixed(2)
          }
        })

      // Add metric name at the top center of each bar
      g.append("text")
        .attr("x", width / 2)
        .attr("y", y(label) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--foreground))")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(label)
    })

    // Add country names
    g.append("text")
      .attr("x", 210)
      .attr("y", -30)
      .attr("text-anchor", "start")
      .attr("fill", purpleColor)
      .text(country1)
      .attr("font-size", "25px")
      .attr("font-weight", "bold")

    g.append("text")
      .attr("x", width-210)
      .attr("y", -30)
      .attr("text-anchor", "end")
      .attr("fill", blueColor)
      .text(country2)
      .attr("font-size", "25px")
      .attr("font-weight", "bold")

  }, [timeSeriesData, country1, country2, year1, year2, maxValues])

  return (
    <div className="flex justify-center overflow-x-auto">
      <svg ref={svgRef} width="1200" height="800" />
    </div>
  )
}