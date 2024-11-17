"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface TreeMapNode {
  name: string
  value: number
  children?: TreeMapNode[]
}

interface TreeMapChartProps {
  data: TreeMapNode
  onNodeClick: (node: TreeMapNode) => void
  metric: string
  showingContinent: boolean
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({ data, onNodeClick, metric, showingContinent }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedContinent, setSelectedContinent] = useState<d3.HierarchyRectangularNode<TreeMapNode> | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 30, right: 0, bottom: 0, left: 0 }
    const width = 800 - margin.left - margin.right
    const height = 800 - margin.top - margin.bottom

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const treemap = d3.treemap<TreeMapNode>()
      .size([width, height])
      .paddingOuter(1)
      .paddingTop(0)
      .paddingInner(1)
      .round(true)

    const root = d3.hierarchy(data)
      .sum(d => {
        if (showingContinent) {
          return d.children ? d.value : 0 // Use continent average when showing continents
        } else {
          return d.value // Use country values when showing countries
        }
      })
      .sort((a, b) => b.value! - a.value!)

    treemap(root)

    const colorScale = d3.scaleOrdinal()
      .domain(['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'])
      .range(['#4299E1', '#F6AD55', '#68D391', '#FC8181', '#B794F4', '#63B3ED'])

    const nodes = showingContinent ? root.children! : root.leaves()

    const tooltip = d3.select("body").select(".tooltip")
    if (tooltip.empty()) {
      d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
    }

    const hideTooltip = () => {
      d3.select("body").select(".tooltip").style("opacity", 0);
    }

    const zoom = (d: d3.HierarchyRectangularNode<TreeMapNode> | null) => {
      const transition = svg.transition().duration(750)
      if (d) {
        const x = d.x0
        const y = d.y0
        const dx = d.x1 - d.x0
        const dy = d.y1 - d.y0
        transition.call(
          (t: d3.Transition<SVGSVGElement, unknown, null, undefined>) => g.transition(t)
            .attr("transform", `translate(${margin.left},${margin.top}) scale(${width / dx},${height / dy}) translate(${-x},${-y})`)
        )
      } else {
        transition.call(
          (t: d3.Transition<SVGSVGElement, unknown, null, undefined>) => g.transition(t)
            .attr("transform", `translate(${margin.left},${margin.top})`)
        )
      }
    }

    const cell = g.selectAll("g")
      .data(nodes, (d: d3.HierarchyRectangularNode<TreeMapNode>) => d.data.name)
      .join(
        enter => enter.append("g")
          .attr("transform", d => `translate(${(d as d3.HierarchyRectangularNode<TreeMapNode>).x0},${(d as d3.HierarchyRectangularNode<TreeMapNode>).y0})`)
          .call(enter => enter.append("rect")
            .attr("id", d => d.data.name.replace(/\s+/g, ''))
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", d => colorScale(showingContinent ? d.data.name : d.parent!.data.name) as string)
            .attr("opacity", 0.9)
            .attr("cursor", "pointer")
          ),
        update => update,
        exit => exit.remove()
      )
      .on("click", (event, d) => {
        if (showingContinent) {
          hideTooltip();
          setSelectedContinent(d as d3.HierarchyRectangularNode<TreeMapNode>);
          zoom(d as d3.HierarchyRectangularNode<TreeMapNode>);
          onNodeClick(d.data);
        }
      })
      .on("mouseover", (event, d) => {
        d3.select("body").select(".tooltip")
          .transition()
          .duration(200)
          .style("opacity", .9);
        d3.select("body").select(".tooltip").html(`${d.data.name}: ${d.data.value.toFixed(2)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", hideTooltip);

    cell.transition().duration(750)
      .attr("transform", d => `translate(${(d as d3.HierarchyRectangularNode<TreeMapNode>).x0},${(d as d3.HierarchyRectangularNode<TreeMapNode>).y0})`)
      .select("rect")
        .attr("width", d => Math.max(0, (d as d3.HierarchyRectangularNode<TreeMapNode>).x1 - (d as d3.HierarchyRectangularNode<TreeMapNode>).x0))
        .attr("height", d => Math.max(0, (d as d3.HierarchyRectangularNode<TreeMapNode>).y1 - (d as d3.HierarchyRectangularNode<TreeMapNode>).y0))

    cell.select("text").remove();
    cell.append("text")
      .attr("clip-path", d => `url(#clip-${d.data.name.replace(/\s+/g, '')})`)
      .selectAll("tspan")
      .data(d => {
        const name = d.data.name
        const value = d.data.value.toFixed(2)
        return [`${name}`, `${value}`]
      })
      .join("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 18 + i * 16)
      .attr("fill-opacity", 0)
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text(d => d)
      .transition()
      .delay(750)
      .duration(500)
      .attr("fill-opacity", 1);

    cell.append("clipPath")
      .attr("id", d => `clip-${d.data.name.replace(/\s+/g, '')}`)
      .append("use")
      .attr("xlink:href", d => `#${d.data.name.replace(/\s+/g, '')}`)

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${metric} by ${showingContinent ? "Continent" : data.name}`)

    if (showingContinent && selectedContinent) {
      zoom(null);
      setSelectedContinent(null);
    }

    return () => {
      hideTooltip();
    }

  }, [data, metric, showingContinent, selectedContinent])

  return (
    <div className="w-full h-[800px] overflow-hidden">
      <svg ref={svgRef} width="800" height="800" />
    </div>
  )
}

export default TreeMapChart