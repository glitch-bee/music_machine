/**
 * Music Machine Blueprint View
 * 
 * Hierarchical machine blueprint using D3 radial cluster layout.
 * Shows the machine structure as a technical blueprint with wings and albums.
 */

// View state
let blueprintSvg = null;
let currentData = null;

/**
 * Initialize the blueprint view
 * @param {Object} context - Context object with data and elements
 */
function initialize(context = {}) {
  const { svg, albums, graph, filteredData } = context;
  
  if (!svg) {
    console.error('Blueprint view requires SVG element');
    return;
  }
  
  blueprintSvg = svg;
  currentData = albums || [];
  
  const width = 900, height = 600;
  
  // Set up SVG
  blueprintSvg.attr("viewBox", [0, 0, width, height]);
  
  // Clear existing visualization
  blueprintSvg.selectAll("*").remove();
  
  // Create blueprint background
  createBlueprintBackground(blueprintSvg, width, height);
  
  // Convert data to hierarchical structure
  const hierarchicalData = convertToHierarchicalData(currentData, filteredData);
  
  // Create radial cluster visualization
  createRadialCluster(blueprintSvg, hierarchicalData, width, height);
  
  console.log('Blueprint view initialized');
}

/**
 * Convert album data to hierarchical structure for radial cluster
 * @param {Array} albums - Array of album objects
 * @param {Object} filteredData - Optional filtered data
 * @returns {Object} Hierarchical data structure
 */
function convertToHierarchicalData(albums, filteredData = null) {
  // Use filtered data if available
  const displayAlbums = filteredData ? 
    albums.filter(album => filteredData.nodes.some(node => node.data?.title === album.title)) : 
    albums;
  
  // Group albums by wing
  const wingGroups = {};
  
  displayAlbums.forEach(album => {
    const wing = WingClassifier.classifyAlbumWing(album);
    if (!wingGroups[wing.id]) {
      wingGroups[wing.id] = {
        name: wing.name,
        id: wing.id,
        color: wing.color,
        children: []
      };
    }
    
    wingGroups[wing.id].children.push({
      name: `${album.artist} – ${album.title}`,
      album: album,
      type: 'album'
    });
  });
  
  // Convert to D3 hierarchy format
  const hierarchicalData = {
    name: "Music Machine",
    type: 'root',
    children: Object.values(wingGroups)
  };
  
  return hierarchicalData;
}

/**
 * Create radial cluster visualization
 * @param {Object} svg - D3 SVG selection
 * @param {Object} data - Hierarchical data
 * @param {Number} width - SVG width
 * @param {Number} height - SVG height
 */
function createRadialCluster(svg, data, width, height) {
  const radius = Math.min(width, height) / 2 - 100;
  
  // Create hierarchy
  const root = d3.hierarchy(data);
  
  // Create cluster layout
  const cluster = d3.cluster()
    .size([2 * Math.PI, radius]);
  
  // Apply cluster layout
  cluster(root);
  
  // Create main group and center it
  const g = svg.append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);
  
  // Draw links
  const linkGroup = g.append("g")
    .attr("class", "links");
  
  linkGroup.selectAll("path")
    .data(root.links())
    .join("path")
    .attr("d", d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y))
    .attr("fill", "none")
    .attr("stroke", "#74b9ff")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.6);
  
  // Draw nodes
  const nodeGroup = g.append("g")
    .attr("class", "nodes");
  
  const nodes = nodeGroup.selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);
  
  // Add circles for nodes
  nodes.append("circle")
    .attr("r", d => {
      if (d.depth === 0) return 12; // Root
      if (d.depth === 1) return 8;  // Wings
      return 5; // Albums
    })
    .attr("fill", d => {
      if (d.depth === 0) return "#74b9ff"; // Root
      if (d.depth === 1) return d.data.color || "#74b9ff"; // Wings
      return "#ffffff"; // Albums
    })
    .attr("stroke", "#74b9ff")
    .attr("stroke-width", 2);
  
  // Add text labels
  nodes.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
    .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
    .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
    .text(d => d.data.name)
    .attr("font-size", d => {
      if (d.depth === 0) return "16px";
      if (d.depth === 1) return "14px";
      return "12px";
    })
    .attr("fill", "#74b9ff")
    .attr("font-family", "monospace");
  
  // Add blueprint-style annotations
  addBlueprintAnnotations(g, root, radius);
}

/**
 * Add blueprint-style annotations
 * @param {Object} g - Main group element
 * @param {Object} root - Root hierarchy node
 * @param {Number} radius - Cluster radius
 */
function addBlueprintAnnotations(g, root, radius) {
  // Add concentric circles for depth indicators
  const depthCircles = g.append("g")
    .attr("class", "depth-indicators");
  
  [radius * 0.3, radius * 0.7, radius].forEach((r, i) => {
    depthCircles.append("circle")
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "#74b9ff")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.3)
      .attr("stroke-dasharray", "5,5");
  });
  
  // Add wing labels around the perimeter
  const wingNodes = root.children || [];
  const wingLabels = g.append("g")
    .attr("class", "wing-labels");
  
  wingNodes.forEach(wingNode => {
    const angle = wingNode.x;
    const labelRadius = radius + 30;
    
    wingLabels.append("text")
      .attr("transform", `rotate(${angle * 180 / Math.PI - 90}) translate(${labelRadius}, 0)`)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("fill", "#74b9ff")
      .attr("opacity", 0.7)
      .text(`${wingNode.data.name.toUpperCase()}`);
  });
  
  // Add title
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -radius - 50)
    .attr("font-size", "18px")
    .attr("font-family", "monospace")
    .attr("fill", "#74b9ff")
    .text("MUSIC MACHINE - TECHNICAL BLUEPRINT");
}

/**
 * Create blueprint background elements
 * @param {Object} svg - D3 SVG selection
 * @param {Number} width - SVG width
 * @param {Number} height - SVG height
 */
function createBlueprintBackground(svg, width, height) {
  // Add blueprint-style background
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#0a0a0a");
  
  // Add grid pattern
  const gridGroup = svg.append("g").attr("class", "blueprint-grid");
  
  // Create fine grid pattern
  for (let x = 0; x <= width; x += 20) {
    gridGroup.append("line")
      .attr("x1", x)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", height)
      .attr("stroke", "#74b9ff")
      .attr("stroke-width", 0.2)
      .attr("opacity", 0.3);
  }
  
  for (let y = 0; y <= height; y += 20) {
    gridGroup.append("line")
      .attr("x1", 0)
      .attr("y1", y)
      .attr("x2", width)
      .attr("y2", y)
      .attr("stroke", "#74b9ff")
      .attr("stroke-width", 0.2)
      .attr("opacity", 0.3);
  }
  
  // Add corner markers
  const cornerSize = 20;
  const corners = [
    [0, 0], [width, 0], [0, height], [width, height]
  ];
  
  corners.forEach(([x, y]) => {
    svg.append("g")
      .attr("transform", `translate(${x},${y})`)
      .append("rect")
      .attr("width", cornerSize)
      .attr("height", cornerSize)
      .attr("fill", "none")
      .attr("stroke", "#74b9ff")
      .attr("stroke-width", 2);
  });
}

/**
 * Cleanup function for the blueprint view
 */
function cleanup() {
  if (blueprintSvg) {
    blueprintSvg.selectAll("*").remove();
  }
  
  blueprintSvg = null;
  currentData = null;
  console.log('Blueprint view cleaned up');
}

/**
 * Update the blueprint view with new data
 * @param {Object} context - Context object with updated data
 */
function update(context = {}) {
  cleanup();
  initialize(context);
}

// Export functions for use in other modules
window.BlueprintView = {
  initialize,
  cleanup,
  update
};
