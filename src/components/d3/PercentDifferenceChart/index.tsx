import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useData } from '@/contexts/data'

interface PercentDifferenceChartProps {
  selectedCountry: string
  comparisonType: 'global' | 'europe' | 'asia' | 'africa' | 'northAmerica' | 'southAmerica' | 'oceania'
}

export default function PercentDifferenceChart({ selectedCountry, comparisonType }: PercentDifferenceChartProps) {
  const chartRef = useRef<SVGSVGElement>(null)
  const { lastYearData } = useData()

  const metrics = [
    'Ladder score',
    'Explained by: Log GDP per capita',
    'Explained by: Social support',
    'Explained by: Healthy life expectancy',
    'Explained by: Freedom to make life choices',
    'Explained by: Generosity',
    'Explained by: Perceptions of corruption'
  ]

  const continents = {
    europe: ["Finland", "Denmark", "Iceland", "Sweden", "Netherlands", "Norway", "Luxembourg", "Switzerland", "Austria", "Belgium", "Ireland", "Czechia", "Lithuania", "United Kingdom", "Slovenia", "Germany", "France", "Romania", "Estonia", "Poland", "Spain", "Serbia", "Malta", "Italy", "Slovakia", "Latvia", "Cyprus", "Portugal", "Hungary", "Croatia", "Greece", "Bosnia and Herzegovina", "Moldova", "Russia", "Montenegro", "Bulgaria", "North Macedonia", "Albania", "Ukraine"],
    asia: ["Israel", "Kuwait", "United Arab Emirates", "Saudi Arabia", "Singapore", "Taiwan Province of China", "Japan", "South Korea", "Philippines", "Vietnam", "Thailand", "Malaysia", "China", "Bahrain", "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Mongolia", "Indonesia", "Armenia", "Tajikistan", "Georgia", "Iraq", "Nepal", "Laos", "Turkiye", "Iran", "Azerbaijan", "State of Palestine", "Pakistan", "Myanmar", "Cambodia", "Jordan", "India", "Sri Lanka", "Bangladesh", "Yemen", "Lebanon", "Afghanistan"],
    africa: ["Mauritius", "Libya", "South Africa", "Algeria", "Congo (Brazzaville)", "Mozambique", "Gabon", "Ivory Coast", "Guinea", "Senegal", "Nigeria", "Cameroon", "Namibia", "Morocco", "Niger", "Burkina Faso", "Mauritania", "Gambia", "Chad", "Kenya", "Tunisia", "Benin", "Uganda", "Ghana", "Liberia", "Mali", "Madagascar", "Togo", "Egypt", "Ethiopia", "Tanzania", "Comoros", "Zambia", "Eswatini", "Malawi", "Botswana", "Zimbabwe", "Congo (Kinshasa)", "Sierra Leone", "Lesotho"],
    northAmerica: ["Canada", "United States", "Mexico"],
    southAmerica: ["Costa Rica", "Uruguay", "Chile", "Panama", "Brazil", "Argentina", "Guatemala", "Nicaragua", "El Salvador", "Paraguay", "Peru", "Dominican Republic", "Bolivia", "Ecuador", "Venezuela", "Colombia", "Honduras"],
    oceania: ["Australia", "New Zealand"]
  }

  useEffect(() => {
    if (!chartRef.current || !lastYearData.length) return

    const xAxisColor = "hsl(var(--primary))"

    const svg = d3.select(chartRef.current)
    svg.selectAll("*").remove()

    const width = 700
    const height = 400
    const margin = { top: 60, right: 100, bottom: 60, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const countryData = lastYearData.find(d => d['Country name'] === selectedCountry)
    
    const getAverages = () => {
      let filteredData = lastYearData
      if (comparisonType !== 'global' && continents[comparisonType as keyof typeof continents]) {
        const continentCountries = continents[comparisonType as keyof typeof continents]
        filteredData = lastYearData.filter(d => continentCountries.includes(d['Country name']))
      }
      return metrics.reduce((acc, metric) => {
        acc[metric] = d3.mean(filteredData, d => parseFloat(d[metric as keyof typeof d] as string)) || 0
        return acc
      }, {} as Record<string, number>)
    }

    const averages = getAverages()
    
    const data = metrics.map(metric => ({
      metric,
      percentDifference: countryData && averages[metric] !== undefined && averages[metric] !== 0
        ? ((parseFloat(countryData[metric as keyof typeof countryData] as string) - averages[metric]) / averages[metric]) * 100
        : 0
    }))

    const x = d3.scaleBand()
      .domain(metrics)
      .range([0, chartWidth])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([-100, 100])
      .range([chartHeight, 0])

    chart.append("g")
      .attr("transform", `translate(0,${chartHeight / 2})`)
      .call(d3.axisBottom(x).tickSize(0))
      .attr("color", xAxisColor)
      .selectAll("text").remove()

    chart.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`))

    // Add grid
    chart.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(() => ""))

    chart.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    chart.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.metric)!)
      .attr("y", y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", d => d.percentDifference >= 0 ? "rgb(134, 239, 172)" : "rgb(252, 165, 165)")
      .transition()
      .duration(1000)
      .attr("y", d => d.percentDifference > 0 ? y(d.percentDifference) : y(0))
      .attr("height", d => Math.abs(y(d.percentDifference) - y(0)))

    chart.selectAll(".value")
      .data(data)
      .join("text")
      .attr("class", "value")
      .attr("x", d => x(d.metric)! + x.bandwidth() / 2)
      .attr("y", y(0))
      .attr("text-anchor", "middle")
      .text(d => `${d.percentDifference.toFixed(1)}%`)
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("y", d => {
        if (d.percentDifference > 100) {
          return y(0) - 5;
        } else if (d.percentDifference < -100) {
          return y(0) + 15;
        }
        return d.percentDifference > 0 ? y(d.percentDifference) - 5 : y(d.percentDifference) + 15;
      })
      .attr("opacity", 1)

    chart.selectAll(".metric-label")
      .data(data)
      .join("text")
      .attr("class", "metric-label")
      .attr("x", d => x(d.metric)! + x.bandwidth() / 2)
      .attr("y", y(0))
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("opacity", 0)
      .each(function(d) {
        const words = d.metric.replace('Explained by: ', '').replace('Log GDP per capita', 'GDP').split(' ');
        const text = d3.select(this);
        const lineHeight = 1.1; // ems
        const dy = d.percentDifference >= 0 ? 0 : -((words.length - 1) * lineHeight);

        text.text(null);
        for (let i = 0; i < words.length; i++) {
          text.append("tspan")
            .attr("x", x(d.metric)! + x.bandwidth() / 2)
            .attr("dy", i ? lineHeight + "em" : dy + "em")
            .text(words[i]);
        }
      })
      .transition()
      .duration(1000)
      .attr("y", d => d.percentDifference >= 0 ? y(0) + 10 : y(0) - 10)
      .attr("opacity", 1)

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percentage Difference")

    const legendText = `${comparisonType === 'global' ? 'Global' : comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)} Average`

    const legendTextLines = legendText.split(' '); // Divida o texto em duas partes

    chart.append("text")
      .attr("x", chartWidth + 10)
      .attr("y", chartHeight / 2 - 10) // Ajuste a posição vertical para a primeira linha
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .style("font-size", "14px")
      .text(legendTextLines[0]); // Primeira linha do texto
    
    chart.append("text")
      .attr("x", chartWidth + 10)
      .attr("y", chartHeight / 2 + 10) // Ajuste a posição vertical para a segunda linha
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .style("font-size", "14px")
      .text(legendTextLines[1]); // Segunda linha do texto


    // Update chart title
    chart.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${selectedCountry} vs ${legendText}`)

  }, [selectedCountry, comparisonType, lastYearData])

  return <svg ref={chartRef} width="100%" height="460px" />
}