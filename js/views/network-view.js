/**
 * Music Machine Network View
 * 
 * Interactive network visualization of albums, artists, and connections
 * using D3.js force simulation for dynamic layout.
 */

// View state
let networkSvg = null;
let networkSimulation = null;
let networkTooltip = null;
let currentGraph = null;
let linkSelection = null;
let nodeSelection = null;
let labelSelection = null;

/**
 * Initialize the/**
 * Highlight connected nodes for the given node
 * @param {Object} node - Node to highlight connections for
 */
function highlightConnectedNodes(node) {
  // This function would be implemented to highlight connected nodes
  // For now, it's a placeholder that can be connected to the main script
  if (window.highlightConnectedNodes) {
    window.highlightConnectedNodes(node, currentGraph, networkSvg);
  }
}

/**
 * Initialize the network view
 * @param {Object} context - Context object with data and elements
 */
function initialize(context = {}) {
  const { graph, connectionVisibility, svg, tooltip, filteredData } = context;
  
  if (!graph) {
    console.error('Network view requires graph data');
    return;
  }
  
  // Store references
  networkSvg = svg;
  networkTooltip = tooltip;
  currentGraph = graph;
  
  // Use filtered data if provided, otherwise use full graph
  const displayGraph = filteredData || graph;
  
  const width = 900, height = 600;
  
  // Set up SVG with zoom
  networkSvg.attr("viewBox", [0, 0, width, height])
    .call(d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", function(event) {
        networkSvg.select(".main-group").attr("transform", event.transform);
      }));
  
  // Clear previous content
  networkSvg.selectAll("*").remove();
  
  // Create main group for zoomable content
  const mainGroup = networkSvg.append("g").attr("class", "main-group");
  
  // Add grid overlay for technical feel
  createGridOverlay(mainGroup, width, height);
  
  // Initialize tooltip
  networkTooltip = networkTooltip || VisualizationHelpers.initializeTooltip();
  
  // Set up force simulation
  setupForceSimulation(displayGraph, width, height);
  
  // Draw visualization elements
  drawLinks(mainGroup, displayGraph, connectionVisibility);
  drawNodes(mainGroup, displayGraph);
  drawLabels(mainGroup, displayGraph);
  
  // Start simulation
  startSimulation();
  
  console.log('Network view initialized');
}

/**
 * Create grid overlay for technical aesthetic
 * @param {Object} mainGroup - D3 selection for main group
 * @param {Number} width - SVG width
 * @param {Number} height - SVG height
 */
function createGridOverlay(mainGroup, width, height) {
  const gridGroup = mainGroup.append("g").attr("class", "grid-overlay");
  
  // Vertical grid lines
  for (let x = 0; x <= width; x += 50) {
    gridGroup.append("line")
      .attr("class", "grid-line")
      .attr("x1", x)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", height);
  }
  
  // Horizontal grid lines
  for (let y = 0; y <= height; y += 50) {
    gridGroup.append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("y1", y)
      .attr("x2", width)
      .attr("y2", y);
  }
}

/**
 * Set up D3 force simulation
 * @param {Object} graph - Graph data with nodes and links
 * @param {Number} width - SVG width
 * @param {Number} height - SVG height
 */
function setupForceSimulation(graph, width, height) {
  // Initialize node positions randomly within the viewport
  graph.nodes.forEach(node => {
    node.x = Math.random() * width;
    node.y = Math.random() * height;
  });
  
  networkSimulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id).distance(d => {
      if (d.type === "wing_connection") return 80;
      if (d.type === "creates") return 60;
      if (d.type === "tag_connection") return 40; // Short connections for clustering
      if (d.type === "intra_wing_connection") return 100;
      if (d.type === "inter_wing_connection") return 200;
      if (d.type === "functional_bridge") return 180;
      if (d.type === "hub_bridge") return 250;
      return 120;
    }).strength(d => {
      if (d.type === "wing_connection") return 0.8;
      if (d.type === "creates") return 0.9;
      if (d.type === "tag_connection") return 0.7; // Strong pull for clustering
      if (d.type === "intra_wing_connection") return 0.6;
      if (d.type === "inter_wing_connection") return 0.3;
      if (d.type === "functional_bridge") return 0.4;
      if (d.type === "hub_bridge") return 0.2;
      return 0.3;
    }))
    .force("charge", d3.forceManyBody().strength(d => {
      if (d.group === "wing_hub") return -800;
      if (d.group === "album") return -200;
      if (d.group === "artist") return -150;
      if (d.group === "tag") return d.isCore ? -300 : -100; // Core tags have stronger charge
      return -200;
    }))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(d => d.size + 10))
    // Add clustering force to spread core tags around the space
    .force("cluster", function(alpha) {
      const coreTagNodes = graph.nodes.filter(n => n.group === "tag" && n.isCore);
      const radius = Math.min(width, height) * 0.3;
      
      coreTagNodes.forEach((node, i) => {
        const angle = (i / coreTagNodes.length) * 2 * Math.PI;
        const targetX = width / 2 + Math.cos(angle) * radius;
        const targetY = height / 2 + Math.sin(angle) * radius;
        
        node.vx += (targetX - node.x) * alpha * 0.1;
        node.vy += (targetY - node.y) * alpha * 0.1;
      });
    });
}

/**
 * Draw links with connection type styling
 * @param {Object} mainGroup - D3 selection for main group
 * @param {Object} graph - Graph data with nodes and links
 * @param {Object} connectionVisibility - Connection visibility settings
 */
function drawLinks(mainGroup, graph, connectionVisibility) {
  linkSelection = mainGroup.append("g")
    .selectAll("line")
    .data(graph.links)
    .join("line")
      .attr("class", d => `link ${d.type}`)
      .attr("stroke", d => {
        if (d.type === "wing_connection") return "#555";
        if (d.type === "creates") return "#74b9ff";
        if (d.type === "tag_connection") return "#e17055"; // Orange for tag connections
        if (d.type === "intra_wing_connection") return "#00b894";
        if (d.type === "inter_wing_connection") return "#fd79a8";
        if (d.type === "functional_bridge") return "#fdcb6e";
        if (d.type === "hub_bridge") return "#a29bfe";
        return "#aaa";
      })
      .attr("stroke-width", d => {
        if (d.type === "wing_connection") return 3;
        if (d.type === "creates") return 2;
        if (d.type === "tag_connection") return 1.5; // Thinner for tag connections
        if (d.type === "hub_bridge") return 4;
        return 1.5;
      })
      .attr("stroke-dasharray", d => {
        if (d.type === "wing_connection") return "0";
        if (d.type === "creates") return "0";
        if (d.type === "tag_connection") return "3,2"; // Subtle dash for tags
        if (d.type === "intra_wing_connection") return "5,5";
        if (d.type === "inter_wing_connection") return "10,5";
        if (d.type === "functional_bridge") return "8,4";
        if (d.type === "hub_bridge") return "12,8";
        return "5,5";
      })
      .attr("opacity", d => {
        if (d.type === "wing_connection") return 0.7;
        if (d.type === "creates") return 0.8;
        if (d.type === "tag_connection") return 0.6; // Moderate opacity for tag connections
        if (d.type === "hub_bridge") return 0.9;
        if (d.type === "intra_wing_connection") return 0.6;
        if (d.type === "inter_wing_connection") return 0.4;
        if (d.type === "functional_bridge") return 0.5;
        return 0.3;
      })
      .style("display", d => connectionVisibility && connectionVisibility[d.type] ? "block" : "none");
}

/**
 * Draw nodes with wing-based colors and interactions
 * @param {Object} mainGroup - D3 selection for main group
 * @param {Object} graph - Graph data with nodes and links
 */
function drawNodes(mainGroup, graph) {
  nodeSelection = mainGroup.append("g")
    .selectAll("circle")
    .data(graph.nodes)
    .join("circle")
      .attr("class", d => {
        let classes = "node";
        if (d.group === "tag") {
          classes += " tag";
          classes += d.isCore ? " core" : " unique";
        }
        return classes;
      })
      .attr("r", d => d.size)
      .attr("fill", d => {
        if (d.group === "wing_hub") return d.wing.color;
        if (d.group === "album") return d.wing.color;
        if (d.group === "artist") return d.wing.color;
        if (d.group === "tag") return d.isCore ? "#e17055" : "#636e72"; // Core tags orange, unique tags gray
        return "#ddd";
      })
      .attr("stroke", d => {
        if (d.group === "wing_hub") return d.wing.strokeColor;
        if (d.group === "album") return d.wing.strokeColor;
        if (d.group === "artist") return d.wing.strokeColor;
        if (d.group === "tag") return d.isCore ? "#d63031" : "#2d3436"; // Darker stroke for tags
        return "#999";
      })
      .attr("stroke-width", d => {
        if (d.group === "wing_hub") return 4;
        if (d.group === "album") return 2;
        if (d.group === "tag") return d.isCore ? 2 : 1; // Core tags have thicker stroke
        return 1.5;
      })
      .on("mouseover", function(e, d) {
          d3.select(this).transition().attr("r", d.size * 1.25);
          VisualizationHelpers.showTooltip(networkTooltip, d, e);
      })
      .on("mousemove", function(e) {
          VisualizationHelpers.updateTooltipPosition(networkTooltip, e);
      })
      .on("mouseout", function(e, d) {
          d3.select(this).transition().attr("r", d.size);
          VisualizationHelpers.hideTooltip(networkTooltip);
      })
      .on("click", function(e, d) {
          // Highlight connected nodes
          highlightConnectedNodes(d);
      })
      .on("dblclick", function(e, d) {
          centerOnNode(d);
      })
      .call(createDragBehavior(networkSimulation));
}

/**
 * Draw node labels
 * @param {Object} mainGroup - D3 selection for main group
 * @param {Object} graph - Graph data with nodes and links
 */
function drawLabels(mainGroup, graph) {
  labelSelection = mainGroup.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", d => {
        if (d.group === "tag") return d.isCore ? 10 : 8; // Smaller font for tags
        return 12;
      })
      .attr("fill", d => {
        if (d.group === "tag") return d.isCore ? "#e17055" : "#636e72"; // Match tag node colors
        return "#fafafa";
      })
      .text(d => {
        if (d.group === "tag") return d.data.name; // Show tag name
        return d.id;
      });
}

/**
 * Start the simulation and set up tick handling
 */
function startSimulation() {
  networkSimulation.on("tick", () => {
    // Update link positions
    linkSelection
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    
    // Update node positions
    nodeSelection
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
    
    // Update label positions
    labelSelection
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });
}

/**
 * Create drag behavior for nodes
 * @param {Object} simulation - D3 force simulation
 * @returns {Object} D3 drag behavior
 */
function createDragBehavior(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

/**
 * Highlight connected nodes for a given node
 * @param {Object} node - Node to highlight connections for
 */
function highlightConnectedNodes(node) {
  const connectedNodeIds = new Set();
  
  // Find all connected nodes
  currentGraph.links.forEach(link => {
    if (link.source.id === node.id || link.source === node.id) {
      connectedNodeIds.add(link.target.id || link.target);
    }
    if (link.target.id === node.id || link.target === node.id) {
      connectedNodeIds.add(link.source.id || link.source);
    }
  });
  
  // Add the selected node itself
  connectedNodeIds.add(node.id);
  
  // Update node styling
  networkSvg.selectAll("circle")
    .style("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.2)
    .style("stroke-width", d => d.id === node.id ? 6 : 
           connectedNodeIds.has(d.id) ? 3 : 1);
  
  // Update link styling
  networkSvg.selectAll("line")
    .style("opacity", d => {
      const isConnected = (d.source.id === node.id || d.source === node.id) ||
                         (d.target.id === node.id || d.target === node.id);
      return isConnected ? 1 : 0.1;
    });
  
  // Update text styling
  networkSvg.selectAll("text")
    .style("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.3);
}

/**
 * Center the view on a specific node
 * @param {Object} node - Node to center on
 */
function centerOnNode(node) {
  const width = 900, height = 600;
  const scale = 1.5;
  const x = -node.x * scale + width / 2;
  const y = -node.y * scale + height / 2;
  
  networkSvg.transition()
    .duration(750)
    .call(
      d3.zoom().transform,
      d3.zoomIdentity.translate(x, y).scale(scale)
    );
}

/**
 * Cleanup function for the network view
 */
function cleanup() {
  if (networkSimulation) {
    networkSimulation.stop();
  }
  if (networkSvg) {
    networkSvg.selectAll("*").remove();
  }
  
  // Reset state
  networkSvg = null;
  networkSimulation = null;
  networkTooltip = null;
  currentGraph = null;
  linkSelection = null;
  nodeSelection = null;
  labelSelection = null;
  
  console.log('Network view cleaned up');
}

/**
 * Update the network view with new data
 * @param {Object} context - Context object with updated data
 */
function update(context = {}) {
  cleanup();
  initialize(context);
}

// Export functions for use in other modules
window.NetworkView = {
  initialize,
  cleanup,
  update
};
