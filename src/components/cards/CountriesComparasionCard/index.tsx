"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from '@/contexts/data'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DivergingBarChart from '@/components/d3/CountriesComparasionChart'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'

interface CountriesComparasionCardProps {
  handleCountryChange: (value: string, index: number) => void;
  selectedCountries: { country1: string; country2: string };
}

export default function CountriesComparasionCard({ handleCountryChange, selectedCountries }: CountriesComparasionCardProps) {
    const { timeSeriesData } = useData()
    const { country1, country2 } = selectedCountries
    const [year1, setYear1] = useState<number>(2023)
    const [year2, setYear2] = useState<number>(2023)
    const [availableYears1, setAvailableYears1] = useState<number[]>([])
    const [availableYears2, setAvailableYears2] = useState<number[]>([])
    const [direction1, setDirection1] = useState<number>(0)
    const [direction2, setDirection2] = useState<number>(0)
    const [score1, setScore1] = useState<number>(0)
    const [score2, setScore2] = useState<number>(0)
    const svgRef = useRef<SVGSVGElement>(null)
  
    const countries = Array.from(new Set(timeSeriesData.map(d => d['Country name']))).sort()
  
    useEffect(() => {
      const years1 = timeSeriesData
        .filter(d => d['Country name'] === country1)
        .map(d => d.year)
        .sort((a, b) => b - a)
      setAvailableYears1(years1)
      setYear1(years1[0] || 2023)
  
      const years2 = timeSeriesData
        .filter(d => d['Country name'] === country2)
        .map(d => d.year)
        .sort((a, b) => b - a)
      setAvailableYears2(years2)
      setYear2(years2[0] || 2023)
    }, [country1, country2, timeSeriesData])

    useEffect(() => {
      const data1 = timeSeriesData.find(d => d['Country name'] === country1 && d.year === year1)
      const data2 = timeSeriesData.find(d => d['Country name'] === country2 && d.year === year2)
      
      if (data1 && data2) {
        setScore1(parseFloat(data1['Life Ladder'] as unknown as string))
        setScore2(parseFloat(data2['Life Ladder'] as unknown as string))
      }
    }, [country1, country2, year1, year2, timeSeriesData])

    useEffect(() => {
      if (!svgRef.current || !score1 || !score2) return

      const svg = d3.select(svgRef.current)
      svg.selectAll("*").remove()

      const width = svgRef.current.clientWidth
      const height = 40
      const totalScore = score1 + score2
      const score1Percentage = (score1 / totalScore) * 100
      const score2Percentage = (score2 / totalScore) * 100

      const xScale = d3.scaleLinear().domain([0, 100]).range([0, width])

      // Use Tableau10 colors
      const blueColor = d3.schemeTableau10[0]  // Blue
      const purpleColor = d3.schemeTableau10[6]  // Purple

      const clipPathIdLeft = "clip-path-rounded-left";

      svg.append("defs")
        .append("clipPath")
        .attr("id", clipPathIdLeft)
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", xScale(score1Percentage) + 20)
        .attr("height", height)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("transform", `translate(+${20}, 0)`);
      
      svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", xScale(score1Percentage))
        .attr("height", height)
        .attr("fill", purpleColor)
        .attr("clip-path", `url(#${clipPathIdLeft})`);

      const clipPathId = "clip-path-rounded-right";

      svg.append("defs")
        .append("clipPath")
        .attr("id", clipPathId)
        .append("rect")
        .attr("x", xScale(score1Percentage))
        .attr("y", 0)
        .attr("width", xScale(score2Percentage))
        .attr("height", height)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("transform", `translate(-${20}, 0)`);
      
      svg.append("rect")
        .attr("x", xScale(score1Percentage))
        .attr("y", 0)
        .attr("width", xScale(score2Percentage))
        .attr("height", height)
        .attr("fill", blueColor)
        .attr("clip-path", `url(#${clipPathId})`);

      svg.append("text")
        .attr("x", xScale(score1Percentage / 2))
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "white")
        .text(`${score1Percentage.toFixed(1)}%`)

      svg.append("text")
        .attr("x", xScale(score1Percentage + score2Percentage / 2))
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "white")
        .text(`${score2Percentage.toFixed(1)}%`)

    }, [score1, score2])
  
    const handleYearChange = (year: number, index: number, dir: number) => {
      if (index === 0) {
        setDirection1(dir)
        setYear1(year)
      } else {
        setDirection2(dir)
        setYear2(year)
      }
    }
  
    return (
      <Card className="border-primary">
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-around items-center mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const currentIndex = availableYears1.indexOf(year1)
                  if (currentIndex < availableYears1.length - 1) {
                    handleYearChange(availableYears1[currentIndex + 1], 0, -1)
                  }
                }}
                disabled={year1 === availableYears1[availableYears1.length - 1]}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={year1}
                  initial={{ x: direction1 * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction1 * -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold"
                >
                  {year1}
                </motion.div>
              </AnimatePresence>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const currentIndex = availableYears1.indexOf(year1)
                  if (currentIndex > 0) {
                    handleYearChange(availableYears1[currentIndex - 1], 0, 1)
                  }
                }}
                disabled={year1 === availableYears1[0]}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            
            <h2 className="text-3xl font-bold">Country Comparison (2005-2023)</h2>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const currentIndex = availableYears2.indexOf(year2)
                  if (currentIndex < availableYears2.length - 1) {
                    handleYearChange(availableYears2[currentIndex + 1], 1, -1)
                  }
                }}
                disabled={year2 === availableYears2[availableYears2.length - 1]}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={year2}
                  initial={{ x: direction2 * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction2 * -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold"
                >
                  {year2}
                </motion.div>
              </AnimatePresence>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const currentIndex = availableYears2.indexOf(year2)
                  if (currentIndex > 0) {
                    handleYearChange(availableYears2[currentIndex - 1], 1, 1)
                  }
                }}
                disabled={year2 === availableYears2[0]}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <Select value={country1} onValueChange={(value) => handleCountryChange(value, 1)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full mx-4">
              <svg ref={svgRef} width="100%" height="40" />
            </div>
            <Select value={country2} onValueChange={(value) => handleCountryChange(value, 2)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DivergingBarChart 
            country1={country1}
            country2={country2}
            year1={year1}
            year2={year2}
          />
        </CardContent>
      </Card>
    )
  }