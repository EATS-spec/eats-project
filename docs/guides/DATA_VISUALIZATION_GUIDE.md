# Data Visualization Guide

## Overview

EATS incorporates sophisticated data visualizations that transform recipe data into interactive, insightful experiences. From ingredient relationship graphs to cooking technique networks, these visualizations provide unique value to users while demonstrating advanced web development techniques.

## 🕸️ Force-Directed Graphs

### Ingredient Affinity Network

The ingredient affinity graph shows relationships between ingredients based on how often they appear together in recipes.

```typescript
// components/visualizations/IngredientAffinitiesGraph.tsx
import ForceGraph2D from 'react-force-graph-2d'
import ForceGraph3D from 'react-force-graph-3d'

interface IngredientNode {
  id: string
  name: string
  category: string
  frequency: number
  color?: string
}

interface AffinityLink {
  source: string
  target: string
  strength: number  // 0-1 representing affinity strength
}

export function IngredientAffinitiesGraph({ graphData, is3D }) {
  // Dynamic node sizing based on frequency
  const nodeRelSize = useCallback((node: IngredientNode) => {
    return Math.log(node.frequency + 1) * 3
  }, [])
  
  // Color coding by category
  const nodeColor = useCallback((node: IngredientNode) => {
    const categoryColors = {
      protein: '#FF6B6B',
      vegetable: '#4ECDC4',
      grain: '#F7DC6F',
      dairy: '#85C1E9',
      spice: '#BB8FCE',
      fruit: '#F8B739'
    }
    return categoryColors[node.category] || '#95A5A6'
  }, [])
  
  // Link width based on affinity strength
  const linkWidth = useCallback((link: AffinityLink) => {
    return Math.sqrt(link.strength * 10)
  }, [])
  
  const Component = is3D ? ForceGraph3D : ForceGraph2D
  
  return (
    <Component
      graphData={graphData}
      nodeLabel="name"
      nodeRelSize={nodeRelSize}
      nodeColor={nodeColor}
      linkWidth={linkWidth}
      linkOpacity={0.5}
      enableNodeDrag={true}
      enableZoomPanInteraction={true}
      // 3D specific props
      {...(is3D && {
        nodeThreeObject: (node) => createSphere(node),
        enableNavigationControls: true,
        showNavInfo: false
      })}
    />
  )
}
```

### Data Processing Pipeline

```typescript
// lib/visualization/affinity-processor.ts
export class AffinityProcessor {
  private recipes: Recipe[]
  private threshold: number = 0.1  // Minimum affinity to show
  
  processRecipes(recipes: Recipe[]): AffinitiesData {
    const coOccurrences = new Map<string, Map<string, number>>()
    const ingredientFrequency = new Map<string, number>()
    
    // Count co-occurrences
    recipes.forEach(recipe => {
      const ingredients = this.normalizeIngredients(recipe.ingredients)
      
      ingredients.forEach(ing1 => {
        // Track frequency
        ingredientFrequency.set(ing1, (ingredientFrequency.get(ing1) || 0) + 1)
        
        ingredients.forEach(ing2 => {
          if (ing1 !== ing2) {
            if (!coOccurrences.has(ing1)) {
              coOccurrences.set(ing1, new Map())
            }
            const current = coOccurrences.get(ing1).get(ing2) || 0
            coOccurrences.get(ing1).set(ing2, current + 1)
          }
        })
      })
    })
    
    // Calculate affinity scores
    const nodes: IngredientNode[] = []
    const links: AffinityLink[] = []
    const processed = new Set<string>()
    
    coOccurrences.forEach((connections, ingredient) => {
      // Create node
      nodes.push({
        id: ingredient,
        name: this.formatName(ingredient),
        category: this.categorizeIngredient(ingredient),
        frequency: ingredientFrequency.get(ingredient)
      })
      
      // Create links
      connections.forEach((count, target) => {
        const pairKey = [ingredient, target].sort().join('-')
        if (!processed.has(pairKey)) {
          const affinity = this.calculateAffinity(
            count,
            ingredientFrequency.get(ingredient),
            ingredientFrequency.get(target)
          )
          
          if (affinity > this.threshold) {
            links.push({
              source: ingredient,
              target: target,
              strength: affinity
            })
            processed.add(pairKey)
          }
        }
      })
    })
    
    return { nodes, links }
  }
  
  private calculateAffinity(coOccurrence: number, freq1: number, freq2: number): number {
    // Jaccard similarity coefficient
    const union = freq1 + freq2 - coOccurrence
    return coOccurrence / union
  }
}
```

## 🌳 Technique Progression Trees

### Cooking Technique Hierarchy

```typescript
// components/visualizations/TechniqueGraph.tsx
interface TechniqueNode {
  id: string
  name: string
  level: 'basic' | 'intermediate' | 'advanced'
  prerequisites: string[]
  recipes: string[]
}

export function TechniqueGraph({ techniques }) {
  // Create hierarchical layout
  const createHierarchy = (techniques: TechniqueNode[]) => {
    const root = {
      name: 'Cooking Techniques',
      children: []
    }
    
    const levels = {
      basic: { name: 'Basic', children: [] },
      intermediate: { name: 'Intermediate', children: [] },
      advanced: { name: 'Advanced', children: [] }
    }
    
    techniques.forEach(tech => {
      levels[tech.level].children.push({
        name: tech.name,
        value: tech.recipes.length,
        prerequisites: tech.prerequisites
      })
    })
    
    root.children = Object.values(levels)
    return root
  }
  
  // D3.js tree visualization
  useEffect(() => {
    const tree = d3.tree()
      .size([width, height])
      .separation((a, b) => a.parent === b.parent ? 1 : 2)
    
    const hierarchy = d3.hierarchy(createHierarchy(techniques))
    const treeData = tree(hierarchy)
    
    // Draw links
    svg.selectAll('.link')
      .data(treeData.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
    
    // Draw nodes
    const nodes = svg.selectAll('.node')
      .data(treeData.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
    
    nodes.append('circle')
      .attr('r', d => Math.sqrt(d.data.value) * 2)
      .style('fill', d => levelColors[d.depth])
    
    nodes.append('text')
      .text(d => d.data.name)
      .attr('dy', '0.31em')
      .attr('text-anchor', 'middle')
  }, [techniques])
}
```

## 📊 Performance Monitoring Dashboard

### Real-Time Adapter Monitor

```typescript
// app/dev/adapter-monitor/page.tsx
export default function AdapterMonitor() {
  const [stats, setStats] = useState<AdapterStats>()
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Fetch and display stats
  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/adapter-monitor')
      const data = await response.json()
      setStats(data.stats)
    }
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 2000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])
  
  return (
    <div className="dashboard">
      {/* Success Rate Gauge */}
      <GaugeChart
        value={stats?.successRate || 0}
        max={100}
        label="Success Rate"
        colors={['#FF6B6B', '#F7DC6F', '#4ECDC4']}
      />
      
      {/* Conversion Timeline */}
      <TimelineChart
        data={stats?.recentLogs || []}
        xAxis="timestamp"
        yAxis="success"
        type="scatter"
      />
      
      {/* Error Distribution */}
      <PieChart
        data={Object.entries(stats?.errorsByType || {}).map(([type, count]) => ({
          name: type,
          value: count
        }))}
        colors={errorColors}
      />
      
      {/* Live Log Stream */}
      <LogStream logs={stats?.recentLogs || []} />
    </div>
  )
}
```

### Custom Chart Components

```typescript
// components/visualizations/GaugeChart.tsx
export function GaugeChart({ value, max, label, colors }) {
  const svgRef = useRef(null)
  
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const width = 200
    const height = 150
    const radius = Math.min(width, height) / 2
    
    // Create arc
    const arc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
    
    // Color scale
    const colorScale = d3.scaleLinear()
      .domain([0, max / 2, max])
      .range(colors)
    
    // Draw background arc
    svg.append('path')
      .attr('d', arc())
      .style('fill', '#E0E0E0')
    
    // Draw value arc with animation
    const valueArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
    
    svg.append('path')
      .datum({ endAngle: -Math.PI / 2 })
      .style('fill', colorScale(value))
      .transition()
      .duration(1000)
      .attrTween('d', (d) => {
        const interpolate = d3.interpolate(d.endAngle, (value / max) * Math.PI - Math.PI / 2)
        return (t) => {
          d.endAngle = interpolate(t)
          return valueArc(d)
        }
      })
    
    // Add value text
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .text(`${value}%`)
  }, [value, max, colors])
  
  return <svg ref={svgRef} width={200} height={150} />
}
```

## 🌡️ Nutrition Visualizations

### Nutritional Balance Radar Chart

```typescript
// components/visualizations/NutritionRadar.tsx
export function NutritionRadar({ nutritionData }) {
  const categories = ['Protein', 'Carbs', 'Fat', 'Fiber', 'Vitamins', 'Minerals']
  const maxValues = { Protein: 30, Carbs: 300, Fat: 65, Fiber: 25, Vitamins: 100, Minerals: 100 }
  
  const data = categories.map(cat => ({
    axis: cat,
    value: (nutritionData[cat.toLowerCase()] / maxValues[cat]) * 100,
    recommended: 100
  }))
  
  return (
    <RadarChart width={400} height={400} data={data}>
      <PolarGrid gridType="polygon" radialLines={false} />
      <PolarAngleAxis dataKey="axis" />
      <PolarRadiusAxis domain={[0, 150]} tick={false} />
      
      {/* Recommended values */}
      <Radar
        name="Recommended"
        dataKey="recommended"
        stroke="#82CA9D"
        fill="#82CA9D"
        fillOpacity={0.3}
      />
      
      {/* Actual values */}
      <Radar
        name="This Recipe"
        dataKey="value"
        stroke="#8884D8"
        fill="#8884D8"
        fillOpacity={0.6}
      />
      
      <Legend />
    </RadarChart>
  )
}
```

### Caloric Distribution

```typescript
// components/visualizations/CaloricBreakdown.tsx
export function CaloricBreakdown({ nutrition }) {
  const macroData = [
    {
      name: 'Protein',
      calories: nutrition.protein * 4,
      percentage: (nutrition.protein * 4 / nutrition.totalCalories) * 100,
      color: '#FF6B6B'
    },
    {
      name: 'Carbohydrates',
      calories: nutrition.carbs * 4,
      percentage: (nutrition.carbs * 4 / nutrition.totalCalories) * 100,
      color: '#4ECDC4'
    },
    {
      name: 'Fat',
      calories: nutrition.fat * 9,
      percentage: (nutrition.fat * 9 / nutrition.totalCalories) * 100,
      color: '#F7DC6F'
    }
  ]
  
  return (
    <div className="caloric-breakdown">
      {/* Donut Chart */}
      <DonutChart
        data={macroData}
        innerRadius={60}
        outerRadius={100}
        padAngle={0.02}
      />
      
      {/* Macro Bars */}
      <div className="macro-bars">
        {macroData.map(macro => (
          <MacroBar
            key={macro.name}
            name={macro.name}
            value={macro.percentage}
            color={macro.color}
            calories={macro.calories}
          />
        ))}
      </div>
    </div>
  )
}
```

## 🗺️ Recipe Similarity Map

### Recipe Clustering Visualization

```typescript
// lib/visualization/recipe-clustering.ts
export class RecipeClustering {
  // Create embeddings for recipes
  async createEmbeddings(recipes: Recipe[]): Promise<number[][]> {
    return recipes.map(recipe => {
      const features = [
        // Ingredient vector
        ...this.ingredientVector(recipe.ingredients),
        // Technique complexity
        this.complexityScore(recipe.instructions),
        // Time features
        recipe.prepTime / 60,
        recipe.cookTime / 60,
        // Nutritional features
        recipe.nutrition?.calories / 100 || 0,
        recipe.nutrition?.protein || 0
      ]
      return features
    })
  }
  
  // Reduce dimensions for visualization
  async reduceDimensions(embeddings: number[][]): Promise<Point2D[]> {
    // Using t-SNE for dimensionality reduction
    const tsne = new TSNE({
      epsilon: 10,
      perplexity: 30,
      dim: 2
    })
    
    tsne.initDataRaw(embeddings)
    
    for (let i = 0; i < 500; i++) {
      tsne.step()
    }
    
    return tsne.getSolution().map(([x, y]) => ({ x, y }))
  }
  
  // Cluster recipes
  clusterRecipes(points: Point2D[], k: number = 5): Cluster[] {
    const kmeans = new KMeans({
      k: k,
      maxIterations: 100
    })
    
    const clusters = kmeans.fit(points)
    
    return clusters.map((cluster, i) => ({
      id: i,
      centroid: cluster.centroid,
      points: cluster.points,
      label: this.generateClusterLabel(cluster)
    }))
  }
}
```

### Interactive Recipe Map

```typescript
// components/visualizations/RecipeMap.tsx
export function RecipeMap({ recipes }) {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  
  useEffect(() => {
    const processRecipes = async () => {
      const clustering = new RecipeClustering()
      const embeddings = await clustering.createEmbeddings(recipes)
      const points = await clustering.reduceDimensions(embeddings)
      const clustered = clustering.clusterRecipes(points)
      
      setClusters(clustered)
    }
    
    processRecipes()
  }, [recipes])
  
  return (
    <svg width={800} height={600}>
      {/* Cluster regions */}
      {clusters.map(cluster => (
        <g key={cluster.id}>
          <Voronoi
            points={cluster.points}
            fill={clusterColors[cluster.id]}
            opacity={0.2}
          />
          <text
            x={cluster.centroid.x}
            y={cluster.centroid.y}
            textAnchor="middle"
            className="cluster-label"
          >
            {cluster.label}
          </text>
        </g>
      ))}
      
      {/* Recipe points */}
      {recipes.map((recipe, i) => (
        <RecipePoint
          key={recipe.id}
          recipe={recipe}
          position={points[i]}
          selected={selectedRecipe === recipe.id}
          onClick={() => setSelectedRecipe(recipe.id)}
        />
      ))}
      
      {/* Zoom controls */}
      <ZoomControls />
    </svg>
  )
}
```

## 📈 Analytics Dashboards

### Search Analytics Visualization

```typescript
// components/admin/SearchAnalyticsDashboard.tsx
export function SearchAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SearchAnalytics>()
  
  return (
    <div className="analytics-dashboard">
      {/* Search Volume Timeline */}
      <LineChart
        data={analytics?.searchVolume || []}
        xKey="date"
        yKey="count"
        title="Search Volume Over Time"
        gradient={true}
      />
      
      {/* Popular Search Terms */}
      <WordCloud
        words={analytics?.popularTerms || []}
        maxSize={48}
        minSize={12}
        colors={d3.schemeCategory10}
      />
      
      {/* Conversion Funnel */}
      <FunnelChart
        data={[
          { name: 'Searches', value: analytics?.totalSearches },
          { name: 'Results Viewed', value: analytics?.resultsViewed },
          { name: 'Recipes Opened', value: analytics?.recipesOpened },
          { name: 'Saved/Cooked', value: analytics?.conversions }
        ]}
      />
      
      {/* Geographic Distribution */}
      <HeatMap
        data={analytics?.geographic || []}
        title="Search Activity by Region"
      />
    </div>
  )
}
```

## 🎨 Advanced Visualization Techniques

### WebGL-Powered 3D Visualizations

```typescript
// components/visualizations/Recipe3DSpace.tsx
import * as THREE from 'three'

export function Recipe3DSpace({ recipes }) {
  const mountRef = useRef(null)
  
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    
    // Create recipe spheres
    recipes.forEach((recipe, i) => {
      const geometry = new THREE.SphereGeometry(
        Math.log(recipe.popularity + 1),
        32,
        32
      )
      
      const material = new THREE.MeshPhongMaterial({
        color: categoryColors[recipe.category],
        emissive: 0x404040,
        shininess: 100
      })
      
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(
        Math.cos(i * 0.5) * 20,
        Math.sin(i * 0.5) * 20,
        Math.cos(i * 0.3) * 10
      )
      
      sphere.userData = { recipe }
      scene.add(sphere)
    })
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    
    const pointLight = new THREE.PointLight(0xffffff, 0.8)
    camera.add(pointLight)
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      // Rotate scene
      scene.rotation.y += 0.001
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    mountRef.current.appendChild(renderer.domElement)
    
    return () => {
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [recipes])
  
  return <div ref={mountRef} className="three-container" />
}
```

### GPU-Accelerated Particle Systems

```typescript
// components/visualizations/IngredientParticles.tsx
export function IngredientParticles({ ingredients }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2')
    
    // Vertex shader for particles
    const vertexShader = `
      attribute vec2 position;
      attribute vec3 color;
      attribute float size;
      
      varying vec3 vColor;
      
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        gl_PointSize = size;
        vColor = color;
      }
    `
    
    // Fragment shader
    const fragmentShader = `
      precision mediump float;
      varying vec3 vColor;
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;
        
        gl_FragColor = vec4(vColor, 1.0 - length(coord) * 2.0);
      }
    `
    
    // Create particle data
    const particles = ingredients.map(ing => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
      color: getCategoryColor(ing.category),
      size: Math.log(ing.frequency + 1) * 5
    }))
    
    // Animation loop
    const animate = () => {
      // Update particle positions
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        
        // Bounce off walls
        if (Math.abs(p.x) > 1) p.vx *= -1
        if (Math.abs(p.y) > 1) p.vy *= -1
      })
      
      // Render particles
      renderParticles(gl, particles)
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [ingredients])
  
  return <canvas ref={canvasRef} width={800} height={600} />
}
```

## 🔧 Performance Optimization

### Visualization Performance Tips

```typescript
// Virtualization for large datasets
export function VirtualizedGraph({ data }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 })
  
  // Only render visible nodes
  const visibleNodes = useMemo(() => 
    data.nodes.slice(visibleRange.start, visibleRange.end),
    [data, visibleRange]
  )
  
  // Use canvas instead of SVG for large datasets
  const renderCanvas = useCallback((ctx, data) => {
    ctx.clearRect(0, 0, width, height)
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      data.forEach(node => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)
        ctx.fillStyle = node.color
        ctx.fill()
      })
    })
  }, [])
  
  // Debounce interactions
  const handleZoom = useMemo(
    () => debounce((scale) => {
      updateVisibleRange(scale)
    }, 100),
    []
  )
}

// Web Worker for heavy calculations
// workers/graph-layout.worker.js
self.addEventListener('message', (e) => {
  const { nodes, links } = e.data
  
  // Perform force simulation in worker
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter())
  
  simulation.on('tick', () => {
    self.postMessage({ type: 'tick', nodes })
  })
  
  simulation.on('end', () => {
    self.postMessage({ type: 'complete', nodes })
  })
})
```

## 📊 Custom Visualization Components

### Creating Reusable Viz Components

```typescript
// lib/visualization/ChartFactory.tsx
export class ChartFactory {
  static create(type: ChartType, config: ChartConfig): ChartComponent {
    switch(type) {
      case 'line':
        return new LineChart(config)
      case 'bar':
        return new BarChart(config)
      case 'scatter':
        return new ScatterPlot(config)
      case 'heatmap':
        return new HeatMap(config)
      case 'sankey':
        return new SankeyDiagram(config)
      case 'treemap':
        return new TreeMap(config)
      default:
        throw new Error(`Unknown chart type: ${type}`)
    }
  }
}

// Usage
const chart = ChartFactory.create('sankey', {
  data: ingredientFlowData,
  width: 800,
  height: 600,
  margins: { top: 20, right: 20, bottom: 30, left: 40 },
  colors: d3.schemeCategory10,
  interactive: true,
  animations: true
})
```

## Conclusion

The data visualization capabilities in EATS transform raw recipe data into engaging, insightful experiences. By leveraging modern visualization libraries, WebGL for performance, and thoughtful UX design, these features provide unique value that sets EATS apart from traditional recipe platforms. The modular architecture ensures new visualizations can be added easily, while performance optimizations ensure smooth interactions even with large datasets.