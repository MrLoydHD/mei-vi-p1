import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { useData } from '@/contexts/data'
import { LastYearData, HappinessData } from '@/lib/types'
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Country name mapping
const countryNameMapping: { [key: string]: string } = {
    "United States of America": "United States",
    "Bosnia and Herz.": "Bosnia and Herzegovina",
    "Turkey": "Turkiye",
    "Congo": "Congo (Brazzaville)",
    "Dem. Rep. Congo": "Congo (Kinshasa)",
    "Czech Republic": "Czechia",
    "Côte d'Ivoire": "Ivory Coast",
    "eSwatini": "Eswatini",
    "Taiwan" : "Taiwan Province of China",
    "Dominican Rep.": "Dominican Republic",
    "S. Sudan": "South Sudan",
    "Central African Rep.": "Central African Republic",
  }

const legacyCountries = [
  "Belarus", "Angola", "Sudan", "South Sudan", "Somalia", "Central African Republic",
  "Rwanda", "Burundi", "Syria", "Turkmenistan", "Bhutan", "Qatar", "Oman",
  "Suriname", "Guyana", "Haiti", "Cuba", "Belize"
]

export default function InteractiveGlobe() {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { lastYearData, timeSeriesData, isLoading } = useData()
  const [scale, setScale] = useState(1)
  const [showLegacy, setShowLegacy] = useState(false)


  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const getLegacyData = (countryName: string) : HappinessData | undefined=> {
    const countryData = timeSeriesData.filter(d => d['Country name'] === countryName)
    if (countryData.length === 0) return undefined
    return countryData.reduce((prev, current) => (prev.year > current.year) ? prev : current)
  }

  const getDisplayData = () => {
    if (!showLegacy) return lastYearData
    const legacyData = legacyCountries.map(country => getLegacyData(country)).filter(Boolean) as HappinessData[]
    return legacyData.map(d => ({
      'Country name': d['Country name'],
      'Ladder score': d['Life Ladder'],
      year: d.year
    }))
  }


  useEffect(() => {
    if (!svgRef.current || isLoading || lastYearData.length === 0 || dimensions.width === 0) return

    const { width, height } = dimensions
    const displayData = getDisplayData()

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const projection = d3.geoOrthographic()
      .scale((Math.min(width, height) / 2) * scale)
      .center([0, 0])
      .rotate([0, -30])
      .translate([width / 2, height / 2])

    const initialScale = projection.scale()
    let path = d3.geoPath().projection(projection)

    const globe = svg.append("circle")
      .attr("fill", "#EEE")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale)

    const tooltip = d3.select(tooltipRef.current)

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([
        d3.min(displayData, (d: LastYearData | HappinessData) => d['Ladder score'] || d['Life Ladder'] || 0) ?? 0,
        d3.max(displayData, (d: LastYearData | HappinessData) => d['Ladder score'] || d['Life Ladder'] || 10) ?? 10
      ])

    const findCountryData = (countryName: string): (LastYearData | HappinessData) | undefined => {
      const mappedName = countryNameMapping[countryName] || countryName
      const countryData = displayData.find(item => item['Country name'] === mappedName)
      if (countryData) {
        return {
          ...countryData,
          score: countryData['Ladder score'] || countryData['Life Ladder']
        }
      }
      return undefined
    }

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((worldData: any) => {
        const countryShapes = feature(worldData, worldData.objects.countries).features

        svg.selectAll(".country")
          .data(countryShapes)
          .enter().append("path")
          .attr("class", "country")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const countryDataItem = findCountryData(d.properties.name)
            return countryDataItem ? colorScale(countryDataItem.score) : '#ccc'
          })
          .attr("stroke", "#000")
          .attr("stroke-width", 0.1)
          .on("mouseover", function(event, d: any) {
            const countryDataItem = findCountryData(d.properties.name)
            let tooltipContent = `${d.properties.name}<br/>`
            if (countryDataItem) {
              tooltipContent += `Av. Life Evaluation: ${countryDataItem.score.toFixed(2)}`
              if ('year' in countryDataItem) {
                tooltipContent += `<br/>Year: ${countryDataItem.year}`
              }
            } else {
              tooltipContent += 'Av. Life Evaluation: N/A'
            }
            
            tooltip
              .style("opacity", 1)
              .html(tooltipContent)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 28) + "px")
          })
          .on("mouseout", function() {
            tooltip.style("opacity", 0)
          })

        // Rotation logic
        let dragStarted = false
        let rotateStart: [number, number] | null = null
        let rotate = projection.rotate()

        const drag = d3.drag<SVGSVGElement, unknown>()
          .on("start", (event) => {
            dragStarted = true
            rotateStart = [event.x, event.y]
          })
          .on("drag", (event) => {
            if (!dragStarted || !rotateStart) return

            const rotateScale = 0.5
            const dx = (event.x - rotateStart[0]) * rotateScale
            const dy = (event.y - rotateStart[1]) * rotateScale

            rotate = [
              (rotate[0] + dx) % 360,
              Math.max(-90, Math.min(90, rotate[1] - dy)),
              rotate[2]
            ]

            projection.rotate(rotate)
            path = d3.geoPath().projection(projection)
            svg.selectAll(".country").attr("d", path as any)

            rotateStart = [event.x, event.y]
          })
          .on("end", () => {
            dragStarted = false
            rotateStart = null
          })

        svg.call(drag)
      })

    // Color legend
    const legendWidth = 20
    const legendHeight = 200
    const legendSvg = svg.append("g")
      .attr("transform", `translate(${width - 50}, ${height / 2 - legendHeight / 2})`)

    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([legendHeight, 0])

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(2))

    legendSvg.append("g")
      .call(legendAxis)
      .attr("transform", `translate(${legendWidth}, 0)`)


    const defs = svg.append("defs")
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%")
      

    linearGradient.selectAll("stop")
      .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)

    legendSvg.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)")

    legendSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -legendHeight / 2)
      .attr("y", -30)
      .attr("z", 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Average Life Evaluation")


    legendSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -legendHeight / 2)
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text("(3-year average)")


    // Min and max labels
    const [min, max] = colorScale.domain()
    legendSvg.append("text")
      .attr("x", 0)
      .attr("y", 210)
      .attr("text-anchor", "start")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text(min.toFixed(2))

    legendSvg.append("text")
      .attr("x", legendWidth)
      .attr("y", -5)
      .attr("text-anchor", "end")
      .style("font-weight", "bold")

      .style("font-size", "10px")
      .text(max.toFixed(2))

    }, [lastYearData, timeSeriesData, isLoading, dimensions, scale, showLegacy])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="flex-grow">
        <svg ref={svgRef} width="100%" height="100%" />
        <div ref={tooltipRef} className="absolute pointer-events-none bg-white p-2 rounded shadow-md opacity-0 transition-opacity" />
      </div>
      <div className="p-4 bg-background">
        <Slider
          defaultValue={[1]}
          max={2}
          min={0.5}
          step={0.1}
          onValueChange={([value]) => setScale(value)}
        />
        <div className="text-center mt-2 text-sm text-muted-foreground">
          Zoom: {scale.toFixed(1)}x
        </div>
        <div className="flex justify-center items-center space-x-2 mt-4">
            <Switch
                id="legacy-mode"
                checked={showLegacy}
                onCheckedChange={setShowLegacy}
            />
            <Label htmlFor="legacy-mode">Legacy Mode</Label>
        </div>
      </div>
    </div>
  )
}