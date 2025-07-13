/**
 * Music Machine Blueprint View
 * 
 * Hierarchical machine blueprint using D3 radial cluster layout.
 * Shows the machine structure as a technical blueprint with wings and albums.
 */

// View state
let blueprintSvg = null;
let currentData = null;
let currentGraph = null;
let blueprintTooltip = null;

/**
 * Initialize the blueprint view
 * @param {Object} context - Context object with data and elements
 */
function initialize(context = {}) {
  const { svg, albums, graph, filteredData, connectionVisibility, tooltip } = context;
  
  if (!svg) {
    console.error('Blueprint view requires SVG element');
    return;
  }
  
  blueprintSvg = svg;
  currentData = albums || [];
  currentGraph = graph;
  blueprintTooltip = tooltip;
  
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
  createRadialCluster(blueprintSvg, hierarchicalData, width, height, connectionVisibility);
  
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
 * @param {Object} connectionVisibility - Connection visibility settings
 */
function createRadialCluster(svg, data, width, height, connectionVisibility) {
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
  
  // Draw hierarchical links first (underneath metadata connections)
  const linkGroup = g.append("g")
    .attr("class", "hierarchical-links");
  
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
  
  // Add metadata connections overlay
  if (currentGraph && currentGraph.links) {
    drawMetadataConnections(g, root, currentGraph, connectionVisibility);
  }
  
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
    .attr("stroke-width", 2)
    .on("mouseover", function(e, d) {
      d3.select(this).transition().attr("r", d => {
        if (d.depth === 0) return 15;
        if (d.depth === 1) return 10;
        return 7;
      });
      if (blueprintTooltip && d.data.album) {
        VisualizationHelpers.showTooltip(blueprintTooltip, d.data.album, e);
      }
    })
    .on("mousemove", function(e) {
      if (blueprintTooltip) {
        VisualizationHelpers.updateTooltipPosition(blueprintTooltip, e);
      }
    })
    .on("mouseout", function(e, d) {
      d3.select(this).transition().attr("r", d => {
        if (d.depth === 0) return 12;
        if (d.depth === 1) return 8;
        return 5;
      });
      if (blueprintTooltip) {
        VisualizationHelpers.hideTooltip(blueprintTooltip);
      }
    });
  
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
  currentGraph = null;
  blueprintTooltip = null;
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

/**
 * Draw metadata connections overlay on radial layout
 * @param {Object} g - Main group element
 * @param {Object} root - Root hierarchy node
 * @param {Object} graph - Graph data with metadata connections
 * @param {Object} connectionVisibility - Connection visibility settings
 */
function drawMetadataConnections(g, root, graph, connectionVisibility) {
  // Create a mapping from album names to radial positions
  const albumPositions = new Map();
  
  // Build position mapping for albums
  root.descendants().forEach(node => {
    if (node.data.album) {
      const albumKey = `${node.data.album.artist} – ${node.data.album.title}`;
      // Convert radial coordinates to cartesian
      const angle = node.x;
      const radius = node.y;
      const x = Math.cos(angle - Math.PI / 2) * radius;
      const y = Math.sin(angle - Math.PI / 2) * radius;
      albumPositions.set(albumKey, { x, y, node });
    }
  });
  
  // Filter graph links to only include connections between albums in the radial view
  const metadataLinks = graph.links.filter(link => {
    const sourceKey = link.source.id || link.source;
    const targetKey = link.target.id || link.target;
    return albumPositions.has(sourceKey) && albumPositions.has(targetKey);
  });
  
  // Draw metadata connections
  const metadataGroup = g.append("g")
    .attr("class", "metadata-connections");
  
  metadataGroup.selectAll("line")
    .data(metadataLinks)
    .join("line")
    .attr("class", d => `metadata-link ${d.type}`)
    .attr("x1", d => {
      const sourceKey = d.source.id || d.source;
      const pos = albumPositions.get(sourceKey);
      return pos ? pos.x : 0;
    })
    .attr("y1", d => {
      const sourceKey = d.source.id || d.source;
      const pos = albumPositions.get(sourceKey);
      return pos ? pos.y : 0;
    })
    .attr("x2", d => {
      const targetKey = d.target.id || d.target;
      const pos = albumPositions.get(targetKey);
      return pos ? pos.x : 0;
    })
    .attr("y2", d => {
      const targetKey = d.target.id || d.target;
      const pos = albumPositions.get(targetKey);
      return pos ? pos.y : 0;
    })
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
      if (d.type === "wing_connection") return 2;
      if (d.type === "creates") return 1.5;
      if (d.type === "tag_connection") return 1; // Thinner for blueprint aesthetic
      if (d.type === "hub_bridge") return 3;
      return 1;
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
      if (d.type === "wing_connection") return 0.5;
      if (d.type === "creates") return 0.6;
      if (d.type === "tag_connection") return 0.4; // More subtle in blueprint
      if (d.type === "hub_bridge") return 0.7;
      if (d.type === "intra_wing_connection") return 0.4;
      if (d.type === "inter_wing_connection") return 0.3;
      if (d.type === "functional_bridge") return 0.4;
      return 0.3;
    })
    .style("display", d => connectionVisibility && connectionVisibility[d.type] ? "block" : "none");
}

// Export functions for use in other modules
window.BlueprintView = {
  initialize,
  cleanup,
  update
};
