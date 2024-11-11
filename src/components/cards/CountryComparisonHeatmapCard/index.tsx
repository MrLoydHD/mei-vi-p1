"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from '@/contexts/data'
import CountryComparisonHeatmap from '@/components/d3/CountryComparisonHeatmap'

export default function CountryComparisonHeatmapCard() {
  const { lastYearData } = useData()
  const [country1, setCountry1] = useState<string>("Finland")
  const [country2, setCountry2] = useState<string>("Denmark")

  const countries = lastYearData.map(d => d['Country name']).sort()

  return (
    <Card className="border-primary">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Country Comparison Heatmap</h2>
        <div className="flex justify-between items-center mb-4">
          <Select value={country1} onValueChange={setCountry1}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select country 1" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={country2} onValueChange={setCountry2}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select country 2" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CountryComparisonHeatmap country1={country1} country2={country2} />
      </CardContent>
    </Card>
  )
}