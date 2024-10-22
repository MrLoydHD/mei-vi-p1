import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'
import { Button } from "@/components/ui/button"
import { PlayCircle, PauseCircle, RotateCcw } from "lucide-react"

const BarChartRace: React.FC = () => {
  const { timeSeriesData } = useData()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentYear, setCurrentYear] = useState(2005)
  const [isPlaying, setIsPlaying] = useState(false)

  const colorScale = useMemo(() => {
    const uniqueCountries = Array.from(new Set(timeSeriesData.map(d => d['Country name'])))
    return d3.scaleOrdinal<string>()
      .domain(uniqueCountries)
      .range(d3.schemeTableau10)
  }, [timeSeriesData])


  useEffect(() => {
    if (!svgRef.current || !timeSeriesData.length) return

    const svg = d3.select(svgRef.current)
    const margin = { top: 40, right: 120, bottom: 30, left: 200 }
    const width = 1000 - margin.left - margin.right
    const height = 600 - margin.top - margin.bottom

    const x = d3.scaleLinear().range([0, width])
    const y = d3.scaleBand().range([0, height]).padding(0.1)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const updateChart = (year: number, prevYear: number | null) => {
      const data = timeSeriesData
        .filter(d => d.year === year)
        .sort((a, b) => b['Life Ladder'] - a['Life Ladder'])
        .slice(0, 15)

      const prevData = prevYear ? timeSeriesData
        .filter(d => d.year === prevYear)
        .sort((a, b) => b['Life Ladder'] - a['Life Ladder'])
        .slice(0, 15) : null

      x.domain([0, d3.max(data, d => d['Life Ladder']) || 0])
      y.domain(data.map(d => d['Country name']))

      const t = svg.transition().duration(750)

      const bars = g.selectAll('.bar')
        .data(data, d => d['Country name'])

      bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? y(prevCountry['Country name']) || height : height
        })
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(d['Country name']))
        .attr('width', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? x(prevCountry['Life Ladder']) : 0
        })
      .merge(bars as any)
        .transition(t)
        .attr('y', d => y(d['Country name']) || 0)
        .attr('width', d => x(d['Life Ladder']))
        .attr('fill', d => colorScale(d['Country name']))

      bars.exit()
        .transition(t)
        .attr('y', height)
        .attr('width', 0)
        .remove()

      const labels = g.selectAll('.label')
        .data(data, d => d['Country name'])

      labels.enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', -5)
        .attr('y', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? (y(prevCountry['Country name']) || height) + y.bandwidth() / 2 : height
        })
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('opacity', 0)
      .merge(labels as any)
        .transition(t)
        .attr('y', d => (y(d['Country name']) || 0) + y.bandwidth() / 2)
        .attr('opacity', 1)
        .text(d => d['Country name'])

      labels.exit()
        .transition(t)
        .attr('y', height)
        .attr('opacity', 0)
        .remove()

      const scores = g.selectAll('.score')
        .data(data, d => d['Country name'])

      scores.enter()
        .append('text')
        .attr('class', 'score')
        .attr('x', d => x(d['Life Ladder']) + 5)
        .attr('y', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? (y(prevCountry['Country name']) || height) + y.bandwidth() / 2 : height
        })
        .attr('dy', '.35em')
        .attr('opacity', 0)
      .merge(scores as any)
        .transition(t)
        .attr('y', d => (y(d['Country name']) || 0) + y.bandwidth() / 2)
        .attr('x', d => x(d['Life Ladder']) + 5)
        .attr('opacity', 1)
        .text(d => d['Life Ladder'].toFixed(2))

      scores.exit()
        .transition(t)
        .attr('y', height)
        .attr('opacity', 0)
        .remove()

      g.select('.x-axis')
        .transition(t)
        .call(d3.axisTop(x).ticks(5))

      svg.select('.title')
        .text(`Top 15 Countries by Life Ladder Score in ${year}`)
    }

    // Initial setup
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,0)`)

    svg.append('text')
      .attr('class', 'title')
      .attr('x', width / 2 + margin.left)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')

    updateChart(currentYear, null)

    return () => {
      svg.selectAll('*').remove()
    }
  }, [timeSeriesData, colorScale])

  useEffect(() => {
    if (!svgRef.current || !timeSeriesData.length) return
    const svg = d3.select(svgRef.current)
    const prevYear = currentYear > 2005 ? currentYear - 1 : null
    
    const g = svg.select('g')
    const updateChart = (year: number, prevYear: number | null) => {
      const margin = { top: 40, right: 120, bottom: 30, left: 200 }
      const width = 1000 - margin.left - margin.right
      const height = 600 - margin.top - margin.bottom

      const x = d3.scaleLinear().range([0, width])
      const y = d3.scaleBand().range([0, height]).padding(0.1)

      const data = timeSeriesData
        .filter(d => d.year === year)
        .sort((a, b) => b['Life Ladder'] - a['Life Ladder'])
        .slice(0, 15)

      const prevData = prevYear ? timeSeriesData
        .filter(d => d.year === prevYear)
        .sort((a, b) => b['Life Ladder'] - a['Life Ladder'])
        .slice(0, 15) : null

      x.domain([0, d3.max(data, d => d['Life Ladder']) || 0])
      y.domain(data.map(d => d['Country name']))

      const t = svg.transition().duration(750)

      const bars = g.selectAll('.bar')
        .data(data, d => d['Country name'])

      bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? y(prevCountry['Country name']) || height : height
        })
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(d['Country name']))
        .attr('width', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? x(prevCountry['Life Ladder']) : 0
        })
      .merge(bars as any)
        .transition(t)
        .attr('y', d => y(d['Country name']) || 0)
        .attr('width', d => x(d['Life Ladder']))
        .attr('fill', d => colorScale(d['Country name']))

      bars.exit()
        .transition(t)
        .attr('y', height)
        .attr('width', 0)
        .remove()

      const labels = g.selectAll('.label')
        .data(data, d => d['Country name'])

      labels.enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', -5)
        .attr('y', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? (y(prevCountry['Country name']) || height) + y.bandwidth() / 2 : height
        })
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('opacity', 0)
      .merge(labels as any)
        .transition(t)
        .attr('y', d => (y(d['Country name']) || 0) + y.bandwidth() / 2)
        .attr('opacity', 1)
        .text(d => d['Country name'])

      labels.exit()
        .transition(t)
        .attr('y', height)
        .attr('opacity', 0)
        .remove()

      const scores = g.selectAll('.score')
        .data(data, d => d['Country name'])

      scores.enter()
        .append('text')
        .attr('class', 'score')
        .attr('x', d => x(d['Life Ladder']) + 5)
        .attr('y', d => {
          const prevCountry = prevData?.find(c => c['Country name'] === d['Country name'])
          return prevCountry ? (y(prevCountry['Country name']) || height) + y.bandwidth() / 2 : height
        })
        .attr('dy', '.35em')
        .attr('opacity', 0)
      .merge(scores as any)
        .transition(t)
        .attr('y', d => (y(d['Country name']) || 0) + y.bandwidth() / 2)
        .attr('x', d => x(d['Life Ladder']) + 5)
        .attr('opacity', 1)
        .text(d => d['Life Ladder'].toFixed(2))

      scores.exit()
        .transition(t)
        .attr('y', height)
        .attr('opacity', 0)
        .remove()

      g.select('.x-axis')
        .transition(t)
        .call(d3.axisTop(x).ticks(5))

      svg.select('.title')
        .text(`Top 15 Countries by Life Ladder Score in ${year}`)
    }

    updateChart(currentYear, prevYear)
  }, [currentYear, timeSeriesData, colorScale])

  useEffect(() => {
    if (!isPlaying) return

    const years = Array.from(new Set(timeSeriesData.map(d => d.year)))
      .sort((a, b) => a - b)
      .filter(year => year >= 2005 && year <= 2023)

    const interval = setInterval(() => {
      setCurrentYear((prevYear) => {
        const currentIndex = years.indexOf(prevYear)
        const nextIndex = (currentIndex + 1) % years.length
        if (nextIndex === 0) setIsPlaying(false)
        return years[nextIndex]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, timeSeriesData])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentYear(2005)
  }

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center">
      <div className="flex space-x-2 mb-4">
        <Button onClick={handlePlayPause} variant="outline" size="icon">
          {isPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
        </Button>
        <Button onClick={handleReset} variant="outline" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <svg ref={svgRef} width="1000" height="600" />
    </div>
  )
}

export default BarChartRace