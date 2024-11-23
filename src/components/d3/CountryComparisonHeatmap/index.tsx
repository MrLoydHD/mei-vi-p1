/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
"use client"

import React, { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import { HappinessData } from '@/lib/types'
interface CountriesComparasionChartProps {
  country1: string
  country2: string
}

const CountriesComparasionChart: React.FC<CountriesComparasionChartProps> = ({ country1, country2 }) => {
  const { lastYearData } = useData()
  const svgRef = useRef<SVGSVGElement>(null)
  //colors
  const blueColor = d3.schemeTableau10[0]  // Blue
  const purpleColor = d3.schemeTableau10[6]  // Purple

  const features = useMemo(() => [
    "Explained by: Log GDP per capita",
    "Explained by: Social support",
    "Explained by: Healthy life expectancy",
    "Explained by: Freedom to make life choices",
    "Explained by: Generosity",
    "Explained by: Perceptions of corruption"
  ], [])

  const parseValue = (value: string | number) => {
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

    const country1Data = lastYearData.find(d => d['Country name'] === country1) as unknown as HappinessData
    const country2Data = lastYearData.find(d => d['Country name'] === country2) as unknown as HappinessData
    if (!country1Data || !country2Data) return

    const margin = { top: 100, right: 130, bottom: 100, left: 130 }
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

    // Draw circular grid with animation
    const circles = [0.2, 0.4, 0.6, 0.8, 1]
    circles.forEach((r, i) => {
      g.append("path")
        .attr("d", d3.lineRadial<number>()
          .angle((_, i) => i * Math.PI / 3)
          .radius(0)
          .curve(d3.curveLinearClosed)([0, 1, 2, 3, 4, 5]))
        .attr("stroke", "gray")
        .attr("fill", "none")
        .attr("opacity", 0.3)
        .transition()
        .delay(i * 100)
        .duration(500)
        .attr("d", d3.lineRadial<number>()
          .angle((_, i) => i * Math.PI / 3)
          .radius(radialScale(r))
          .curve(d3.curveLinearClosed)([0, 1, 2, 3, 4, 5]))

      features.forEach((feature, j) => {
        const angle = (j * Math.PI / 3) - Math.PI / 2
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
          .attr("opacity", 0)
          .transition()
          .delay(i * 200 + 1000)
          .duration(500)
          .attr("opacity", 1)
      })
    })

    // Draw axis lines and labels with animation
    features.forEach((feature, i) => {
      const angle = (i * Math.PI / 3) - Math.PI / 2
      const lineCoords = angleToCoordinate(angle, 1)
      
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 0)
        .attr("stroke", "gray")
        .attr("opacity", 0.3)
        .transition()
        .delay(500)
        .duration(500)
        .attr("x2", lineCoords.x)
        .attr("y2", lineCoords.y)

      const labelRadius = radius * 1.35
      const labelX = labelRadius * Math.cos(angle)
      const labelY = labelRadius * Math.sin(angle)

      g.append("text")
        .attr("x", () => {
          if (feature === "Explained by: Log GDP per capita" || feature === "Explained by: Freedom to make life choices") {
            return labelX + 25
          }
          return labelX;
        })
        .attr("y", labelY - 10)
        .attr("text-anchor", labelX > 0 ? "start" : labelX < 0 ? "end" : "middle")
        .attr("dominant-baseline", labelY > 0 ? "hanging" : labelY < 0 ? "baseline" : "middle")
        .text(feature.replace("Explained by: ", ""))
        .attr("font-size", "15px")
        .attr("fill", "#333")
        .attr("opacity", 0)
        .call(wrap, 100)
        .transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", 1)
    })

    // Draw data for both countries
    const drawCountryData = (data: HappinessData, color: string, delay: number, offsetMultiplier: number) => {
      const coordinates = features.map((feature, i) => {
        const angle = (i * Math.PI / 3) - Math.PI / 2;
        const value = parseValue(data[feature as keyof typeof data]);
        const scaledValue = scales[feature](value);
        return angleToCoordinate(angle, scaledValue);
      });
    
      const line = d3.lineRadial<{ x: number; y: number }>()
        .angle((_, i) => i * Math.PI / 3)
        .radius(d => Math.sqrt(d.x * d.x + d.y * d.y))
        .curve(d3.curveLinearClosed);
    
      g.append("path")
        .datum(coordinates)
        .attr("d", line([{ x: 0, y: 0 }]))
        .attr("stroke", color)
        .attr("fill", color)
        .attr("fill-opacity", 0.3)
        .attr("stroke-width", 2)
        .transition()
        .delay(delay)
        .duration(500)
        .attrTween("d", function () {
          const interpolator = d3.interpolate([{ x: 0, y: 0 }], coordinates);
          return function (t) {
            return line(interpolator(t));
          };
        });
    
      coordinates.forEach((coord, index) => {
        const feature = features[index];
        const value = parseValue(data[feature as keyof typeof data]);
    
        g.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", color)
          .transition()
          .delay(delay + 500 + index * 50)
          .duration(250)
          .attr("cx", coord.x)
          .attr("cy", coord.y);
    
        // Adjust label positioning
        const labelRadius = radius * 1.1;
        const angle = (index * Math.PI / 3) - Math.PI / 2;
        const labelX = labelRadius * Math.cos(angle);
        const labelY = labelRadius * Math.sin(angle);
    
        const offsetX = 10 * offsetMultiplier * Math.cos(angle); // Adjust offset based on angle
        let offsetY = 10 * offsetMultiplier * Math.sin(angle); // Adjust offset based on angle
        
        g.append("text")
          .attr("x", labelX + offsetX)
          .attr("y", labelY + offsetY)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "14px")
          .attr("fill", color)
          .text(value.toFixed(3))
          .attr("opacity", 0)
          .transition()
          .delay(delay + 750 + index * 50)
          .duration(250)
          .attr("opacity", 1);
      });
    };
    
    drawCountryData(country1Data, blueColor, 1000, 1); // Offset multiplier for country1
    drawCountryData(country2Data, purpleColor, 2000, 3); // Offset multiplier for country2
    

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
        // eslint-disable-next-line no-cond-assign
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
  }, [country1, country2, lastYearData, features, scales])

  const getLadderScore = (country: string) => {
    const countryData = lastYearData.find(d => d['Country name'] === country)
    return countryData ? parseValue(countryData['Ladder score']) : 0
  }

  const getSumOfFactors = (country: string) => {
    const countryData = lastYearData.find(d => d['Country name'] === country)
    return features.reduce((sum, feature) => {
      const value = parseValue(countryData?.[feature as keyof typeof countryData] || 0)
      return sum + value
    }, 0)
  }

  const getResidualValue = (country: string) => {
    const ladderScore = getLadderScore(country)
    const sumOfFactors = getSumOfFactors(country)
    return ladderScore - sumOfFactors
  }

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width="83%" viewBox="0 0 700 700" preserveAspectRatio="xMidYMid meet" />
      <div className="mt-4 text-center">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">{country1}</p>
            <p>Ladder Score: {getLadderScore(country1).toFixed(3)}</p>
            <p className="text-sm">
              (Sum of factors: {getSumOfFactors(country1).toFixed(3)} + Dystopia value + Residual: {getResidualValue(country1).toFixed(3)})
            </p>
          </div>
          <div>
            <p className="font-bold">{country2}</p>
            <p>Ladder Score: {getLadderScore(country2).toFixed(3)}</p>
            <p className="text-sm">
              (Sum of factors: {getSumOfFactors(country2).toFixed(3)} + Dystopia value + Residual: {getResidualValue(country2).toFixed(3)})
            </p>
          </div>
        </div>
        <div className="mt-2 flex space-x-2 items-center justify-center">
          <div className="w-4 h-4" style={{ backgroundColor: blueColor }}></div>
          <span className="text-sm">{country1}</span>
          <div className="w-4 h-4" style={{ backgroundColor: purpleColor }}></div>
          <span className="text-sm">{country2}</span>
        </div>
      </div>
    </div>
  )
}

export default CountriesComparasionChart