import React, { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface RadarChartProps {
  country: string
}

const RadarChart: React.FC<RadarChartProps> = ({ country }) => {
  const { lastYearData } = useData()
  const svgRef = useRef<SVGSVGElement>(null)

  const features = useMemo(() => [
    "Explained by: Log GDP per capita",
    "Explained by: Social support",
    "Explained by: Healthy life expectancy",
    "Explained by: Freedom to make life choices",
    "Explained by: Generosity",
    "Explained by: Perceptions of corruption"
  ], [])

  const parseValue = (value: any): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      return parseFloat(value.replace(',', '.'))
    }
    console.error('Unexpected value type:', value)
    return 0
  }

  const scales = useMemo(() => {
    if (!lastYearData.length) return {}

    return features.reduce((acc, feature) => {
      const values = lastYearData.map(d => parseValue(d[feature as keyof typeof d]))
      const max = Math.max(...values)
      acc[feature] = d3.scaleLinear().domain([0, max]).range([0, 1])
      return acc
    }, {} as { [key: string]: d3.ScaleLinear<number, number> })
  }, [lastYearData, features])

  useEffect(() => {
    if (!svgRef.current || !lastYearData.length || Object.keys(scales).length === 0) return

    const countryData = lastYearData.find(d => d['Country name'] === country)
    if (!countryData) return

    const margin = { top: 100, right: 100, bottom: 100, left: 100 }
    const width = 700 - margin.left - margin.right
    const height = 700 - margin.top - margin.bottom
    const radius = Math.min(width, height) / 2

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`)

    const radialScale = d3.scaleLinear().domain([0, 1]).range([0, radius])

    const angleScale = d3.scalePoint()
      .domain(features)
      .range([0, 2 * Math.PI])

    // Draw circular grid
    const circles = [0.2, 0.4, 0.6, 0.8, 1]
    circles.forEach(r => {
      g.append("path")
        .attr("d", d3.lineRadial<number>()
          .angle((_, i) => i * Math.PI / 3)
          .radius(radialScale(r))
          .curve(d3.curveLinearClosed)([0, 1, 2, 3, 4, 5]))
        .attr("stroke", "gray")
        .attr("fill", "none")
        .attr("opacity", 0.3)

      features.forEach((feature, i) => {
        const angle = (i * Math.PI / 3) - Math.PI / 2
        const labelX = (radialScale(r) + 10) * Math.cos(angle)
        const labelY = (radialScale(r) + 10) * Math.sin(angle)
        const scaleValue = scales[feature].invert(r)

        g.append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "12px")
          .attr("fill", "gray")
          .text(scaleValue.toFixed(2))
      })
    })

    // Draw axis lines and labels
    features.forEach((feature, i) => {
      const angle = (i * Math.PI / 3) - Math.PI / 2
      const lineCoords = angleToCoordinate(angle, 1)
      
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", lineCoords.x)
        .attr("y2", lineCoords.y)
        .attr("stroke", "gray")
        .attr("opacity", 0.3)

      const labelRadius = radius * 1.2
      const labelX = labelRadius * Math.cos(angle)
      const labelY = labelRadius * Math.sin(angle)

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY  - 10)
        .attr("text-anchor", labelX > 0 ? "start" : labelX < 0 ? "end" : "middle")
        .attr("dominant-baseline", labelY > 0 ? "hanging" : labelY < 0 ? "baseline" : "middle")
        .text(feature.replace("Explained by: ", ""))
        .attr("font-size", "15px")
        .attr("fill", "#333")
        .call(wrap, 100)
    })

    // Draw data points and shape
    const coordinates = features.map((feature, i) => {
      const angle = (i * Math.PI / 3) - Math.PI / 2
      const value = parseValue(countryData[feature as keyof typeof countryData])
      const scaledValue = scales[feature](value)
      return angleToCoordinate(angle, scaledValue)
    })

    // Draw shape
    g.append("path")
      .datum(coordinates)
      .attr("d", d3.line<{x: number, y: number}>().x(d => d.x).y(d => d.y).curve(d3.curveLinearClosed))
      .attr("stroke", "hsl(var(--primary))")
      .attr("fill", "hsl(var(--primary))")
      .attr("fill-opacity", 0.3)
      .attr("stroke-width", 2)

    // Add data points and labels
    coordinates.forEach((coord, index) => {
      const feature = features[index]
      const value = parseValue(countryData[feature as keyof typeof countryData])
      
      g.append("circle")
        .attr("cx", coord.x)
        .attr("cy", coord.y)
        .attr("r", 4)
        .attr("fill", "hsl(var(--primary))")

      const labelRadius = radius * 1.1
      const angle = (index * Math.PI / 3) - Math.PI / 2
      const labelX = labelRadius * Math.cos(angle)
      const labelY = labelRadius * Math.sin(angle)

      //se for log gdp per capita, social support e perceptions of corruption, coloca o label em cima
        if (feature === "Explained by: Log GDP per capita" || feature === "Explained by: Social support" || feature === "Explained by: Perceptions of corruption") {
            g.append("text")
            .attr("x", labelX)
            .attr("y", labelY - 5)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#333")
            .text(value.toFixed(3))
        } else {
            g.append("text")
            .attr("x", labelX)
            .attr("y", labelY + 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#333")
            .text(value.toFixed(3))
        }
    })

    function angleToCoordinate(angle: number, value: number): { x: number; y: number } {
      const x = Math.cos(angle) * radialScale(value)
      const y = Math.sin(angle) * radialScale(value)
      return { x, y }
    }

    function wrap(text: d3.Selection<SVGTextElement, unknown, SVGElement, unknown>, width: number) {
      text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line: string[] = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy") || "0"),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if ((tspan.node()?.getComputedTextLength() ?? 0) > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
          }
        }
      });
    }
  }, [country, lastYearData, features, scales])

  const ladderScore = lastYearData.find(d => d['Country name'] === country)?.['Ladder score']
  const sumOfFactors = features.reduce((sum, feature) => {
    const value = parseValue(lastYearData.find(d => d['Country name'] === country)?.[feature as keyof typeof lastYearData[0]] || 0)
    return sum + value
  }, 0)
  const residualValue = parseValue(ladderScore) - sumOfFactors

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <h2 className="text-2xl font-bold">Happiness Factors for {country}</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">What does this mean?</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <h3 className="font-semibold mb-2">Understanding the Happiness Factors Chart</h3>
            <p className="text-sm">
              This chart shows the impact of various factors on the overall happiness score (Ladder score) for {country}. 
              Each axis represents a different factor, and the area of the shape indicates the country's performance across these factors.
              The sum of these factors, along with the dystopia value and residual, equals the total Ladder score.
              Each factor has its own scale, with the maximum value being the highest observed value for that factor across all countries.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 700 700" preserveAspectRatio="xMidYMid meet" />
      <div className="mt-4 text-center">
        <p className="font-bold">Ladder Score: {parseFloat(ladderScore).toFixed(3)}</p>
        <p className="text-sm">
          (Sum of factors: {sumOfFactors.toFixed(3)} + Dystopia value + Residual: {residualValue.toFixed(3)})
        </p>
      </div>
    </div>
  )
}

export default RadarChart