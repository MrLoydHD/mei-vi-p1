/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { useData } from '@/contexts/data'
import { LastYearData, HappinessData } from '@/lib/types'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Topology } from 'topojson-specification';


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

interface InteractiveGlobeProps {
  onCountrySelect: (country: string) => void
  selectedCountry: string
}

export default function InteractiveGlobe({ onCountrySelect, selectedCountry }: Readonly<InteractiveGlobeProps>) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { lastYearData, timeSeriesData, isLoading } = useData()
  const [showLegacy, setShowLegacy] = useState(false)
  const [, setSelectedCountryState] = useState<d3.GeoPermissibleObjects | null>(null)

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

  const getLegacyData = (countryName: string) : HappinessData | undefined => {
    const countryData = timeSeriesData.filter(d => d['Country name'] === countryName)
    if (countryData.length === 0) return undefined
    return countryData.reduce((prev: HappinessData, current: HappinessData) => (prev.year > current.year) ? prev : current)
  }

  const getDisplayData = () => {
    if (!showLegacy) return lastYearData
    const legacyData = legacyCountries.map(country => getLegacyData(country)).filter(Boolean) as HappinessData[]
    return legacyData.map(d => ({
      ...d,
      'Country name': d['Country name'],
      'Ladder score': d['Life Ladder'],
      year: d.year
    }))
  }
  
  let worldData: Topology;

  useEffect(() => {
    if (!svgRef.current || isLoading || lastYearData.length === 0 || dimensions.width === 0) return

    const { width, height } = dimensions
    const displayData = getDisplayData()

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const projection = d3.geoOrthographic()
      .scale((Math.min(width, height) / 2))
      .center([0, 0])
      .rotate([0, -30])
      .translate([width / 2, height / 2])

    const initialScale = projection.scale()
    let path = d3.geoPath().projection(projection)

    const globeGroup = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`)

    const globeBackground = globeGroup.append("circle")
      .attr("fill", "#EEE")
      .attr("r", initialScale);

    const globeBorder = globeGroup.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("r", initialScale);


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
        return countryData
      }
      return undefined
    }

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((data: any) => {
        worldData = data;
        const countryShapes = (feature(worldData, worldData.objects.countries) as GeoJSON.FeatureCollection).features


        svg.selectAll(".country")
          .data(countryShapes)
          .enter().append("path")
          .attr("class", "country")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const countryDataItem = findCountryData(d.properties.name)
            return countryDataItem ? colorScale(countryDataItem['Ladder score'] || countryDataItem['Life Ladder']) : '#ccc'
          })
          .attr("stroke", "#000")
          .attr("stroke-width", 0.1)
          .style("cursor", (d: any) => findCountryData(d.properties.name) ? "pointer" : "default")
          .on("mousemove", function(event, d: any) {
            const countryDataItem = findCountryData(d.properties.name)
            let tooltipContent = `${d.properties.name}<br/>`
            if (countryDataItem) {
              const score = countryDataItem['Ladder score'] || countryDataItem['Life Ladder'];
              tooltipContent += `Av. Life Evaluation: ${score.toFixed(2)}`
              if ('year' in countryDataItem) {
                tooltipContent += `<br/>Year: ${countryDataItem.year}`
              }
            } else {
              tooltipContent += 'Av. Life Evaluation: N/A'
            }
            
            tooltip
              .style("opacity", 1)
              .html(tooltipContent)
              .style("left", (event.pageX - 210) + "px")
              .style("top", (event.pageY - 230) + "px")
          })
          .on("mouseout", function() {
            tooltip.style("opacity", 0)
          })
          .on("click", function(event, d: any) {
            const countryDataItem = findCountryData(d.properties.name)
            if (countryDataItem) {
              const countryName = countryNameMapping[d.properties.name] || d.properties.name
              onCountrySelect(countryName)
              rotateAndZoomToCountry(d)
            }
          })

          if (selectedCountry) {
            const country = countryShapes.find((d: any) => {
              const countryDataItem = findCountryData(d.properties.name) 
              const countryName = countryNameMapping[d.properties.name] || d.properties.name 
              return countryDataItem && countryName === selectedCountry
            })
            if (country) {
              rotateAndZoomToCountry(country)
            }
          }

        function rotateAndZoomToCountry(country: d3.GeoPermissibleObjects) {
          const centroid = d3.geoCentroid(country)
          const r = d3.interpolate(projection.rotate(), [-centroid[0], -centroid[1]])
          const zoomLevel = 2.5 // Increased zoom level

          d3.transition()
            .duration(1000)
            .tween("rotate", () => (t: number) => {
              projection.rotate(r(t) as [number, number])
              path = d3.geoPath().projection(projection)
              svg.selectAll(".country").attr("d", path as d3.ValueFn<SVGSVGElement, unknown, string>)
            })
            .transition()
            .duration(750)
            .tween("zoom", () => (t: number) => {
              const scale = d3.interpolate(projection.scale(), initialScale * zoomLevel)(t)
              projection.scale(scale)
              path = d3.geoPath().projection(projection)
              svg.selectAll(".country").attr("d", path as d3.ValueFn<SVGSVGElement, unknown, string>)
              globeBackground.attr("r", scale)
              globeBorder.attr("r", scale)
                .attr("stroke-width", 0.2 / (scale / initialScale))
            })

          setSelectedCountryState(country)
        }

        // Rotation logic
        let dragStarted = false
        let rotateStart: [number, number] | null = null
        let rotate = projection.rotate()

        const drag = d3.drag<SVGSVGElement, unknown>()
          .on("start", (event) => {
            dragStarted = true;
            rotateStart = [event.x, event.y];
          })
          .on("drag", (event) => {
            if (!dragStarted || !rotateStart) return;

            const rotateScale = 0.5;
            const dx = (event.x - rotateStart[0]) * rotateScale;
            const dy = (event.y - rotateStart[1]) * rotateScale;

            rotate = [
              (rotate[0] + dx) % 360,
              Math.max(-90, Math.min(90, rotate[1] - dy)),
              rotate[2]
            ];

            projection.rotate(rotate);
            path = d3.geoPath().projection(projection);
            svg.selectAll(".country").attr("d", path as d3.ValueFn<SVGSVGElement, unknown, string>);

            rotateStart = [event.x, event.y];
          })
          .on("end", () => {
            dragStarted = false;
            rotateStart = null;
          });

        svg.call(drag);

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.8, 10])
          .on('zoom', (event) => {
            const { transform } = event;
            projection.scale(initialScale * transform.k);
            path = d3.geoPath().projection(projection);
            svg.selectAll('.country').attr('d', path as d3.ValueFn<SVGSVGElement, unknown, string>);
            globeBackground.attr("r", initialScale * transform.k);
            globeBorder.attr("r", initialScale * transform.k)
              .attr("stroke-width", 0.2 / transform.k);
          });

        svg.call(zoom);

        // Color legend
        const legendWidth = 26
        const legendHeight = 200
        const legendSvg = svg.append("g")
          .attr("transform", `translate(${width - 70}, ${height / 2 - legendHeight / 2})`)

        legendSvg.append("rect")
          .attr("width", legendWidth + 80)
          .attr("height", legendHeight + 40)
          .attr("x", -45)
          .attr("y", -20)
          .attr("fill", "white")
          .attr("opacity", 0.8)

        const legendScale = d3.scaleLinear()
          .domain(colorScale.domain())
          .range([legendHeight, 0])

        const legendAxis = d3.axisRight(legendScale)
          .ticks(5)
          .tickFormat(d => (d as number).toFixed(2))

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
          .data(
              d3.range(colorScale.domain()[0], colorScale.domain()[1], (colorScale.domain()[1] - colorScale.domain()[0]) / 10).map((t: number) => ({
                offset: `${((t - colorScale.domain()[0]) / (colorScale.domain()[1] - colorScale.domain()[0])) * 100}%`,
                color: colorScale(t),
              }))
            )
          .enter().append("stop")
          .attr("offset", (d: { offset: string, color: string }) => d.offset)
          .attr("stop-color", (d: { color: string }) => d.color)

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
      })

    }, [lastYearData, timeSeriesData, isLoading, dimensions, showLegacy, onCountrySelect, selectedCountry])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="h-[400px]">
        <svg ref={svgRef} width="100%" height="100%" />
        <div ref={tooltipRef} className="absolute pointer-events-none bg-white p-2 rounded shadow-md opacity-0 transition-opacity" />
      </div>
      <div className="p-4 bg-background">
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Switch
            id="legacy-mode"
            checked={showLegacy}
            onCheckedChange={setShowLegacy}
          />
          <Label htmlFor="legacy-mode">Legacy Mode</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="h-8 w-8 p-0 rounded-xl">
                <Info className="h-12 w-12 text-white" strokeWidth={3} />
                <span className="sr-only">Legacy mode info</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Legacy Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Legacy mode displays data for countries that don't have current year data, 
                  using their most recent available data point. This helps provide a more 
                  complete global picture, especially for countries with limited recent data.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}