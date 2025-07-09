// Music Machine Data Loader
let albums = [];
let graph = null;
let simulation = null;
let svg = null;
let tooltip = null;
let currentView = 'network';

// Connection visibility toggles
let connectionVisibility = {
  wing_connection: true,
  intra_wing_connection: true,
  inter_wing_connection: true,
  functional_bridge: true,
  hub_bridge: true,
  creates: true
};

// Search and filter state
let searchTerm = '';
let selectedWing = 'all';
let filteredNodes = [];
let filteredLinks = [];

// Load and merge all album data
async function loadAlbumData() {
  try {
    // Use the DataLoader module to load album data
    albums = await DataLoader.loadAlbumData();
    
    // Initialize the visualization
    initializeVisualization();
    setupControls();
    updateMachineStats();
    createWingLegend();
  } catch (error) {
    console.error('Error in loadAlbumData:', error);
    // Fallback to empty array if loading fails
    albums = [];
    initializeVisualization();
  }
}

// Initialize visualization with loaded data
function initializeVisualization() {
  // Convert albums to graph format
  graph = GraphConverter.convertAlbumsToGraph(albums);
  
  // Reset filters
  filteredNodes = [...graph.nodes];
  filteredLinks = [...graph.links];
  
  if (currentView === 'network') {
    initializeNetworkView();
  } else if (currentView === 'blueprint') {
    initializeBlueprintView();
  } else if (currentView === 'timeline') {
    initializeTimelineView();
  } else if (currentView === 'map') {
    initializeMapView();
  }
}

function initializeNetworkView() {
  const width = 900, height = 600;
  svg = d3.select("#music-map")
      .attr("viewBox", [0, 0, width, height])
      .call(d3.zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", function(event) {
          svg.select(".main-group").attr("transform", event.transform);
        }));
  
  // Clear previous content
  svg.selectAll("*").remove();
  
  // Create main group for zoomable content
  const mainGroup = svg.append("g").attr("class", "main-group");
  
  // Add grid overlay for technical feel
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
  
  tooltip = d3.select("#tooltip");
  
  // Set up simulation with wing-based forces
  simulation = d3.forceSimulation(graph.nodes)
      .force("link", d3.forceLink(graph.links).id(d => d.id).distance(d => {
        if (d.type === "wing_connection") return 80;
        if (d.type === "creates") return 60;
        if (d.type === "intra_wing_connection") return 100;
        if (d.type === "inter_wing_connection") return 200;
        if (d.type === "functional_bridge") return 180;
        if (d.type === "hub_bridge") return 250;
        return 120;
      }).strength(d => {
        if (d.type === "wing_connection") return 0.8;
        if (d.type === "creates") return 0.9;
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
        return -200;
      }))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.size + 10));
  
  // Draw links with wing-based styling
  const link = mainGroup.append("g")
    .selectAll("line")
    .data(graph.links)
    .join("line")
      .attr("class", d => `link ${d.type}`)
      .attr("stroke", d => {
        if (d.type === "wing_connection") return "#555";
        if (d.type === "creates") return "#74b9ff";
        if (d.type === "intra_wing_connection") return "#00b894";
        if (d.type === "inter_wing_connection") return "#fd79a8";
        if (d.type === "functional_bridge") return "#fdcb6e";
        if (d.type === "hub_bridge") return "#a29bfe";
        return "#aaa";
      })
      .attr("stroke-width", d => {
        if (d.type === "wing_connection") return 3;
        if (d.type === "creates") return 2;
        if (d.type === "hub_bridge") return 4;
        return 1.5;
      })
      .attr("stroke-dasharray", d => {
        if (d.type === "wing_connection") return "0";
        if (d.type === "creates") return "0";
        if (d.type === "intra_wing_connection") return "5,5";
        if (d.type === "inter_wing_connection") return "10,5";
        if (d.type === "functional_bridge") return "8,4";
        if (d.type === "hub_bridge") return "12,8";
        return "5,5";
      })
      .attr("opacity", d => {
        if (d.type === "wing_connection") return 0.7;
        if (d.type === "creates") return 0.8;
        if (d.type === "hub_bridge") return 0.9;
        if (d.type === "intra_wing_connection") return 0.6;
        if (d.type === "inter_wing_connection") return 0.4;
        if (d.type === "functional_bridge") return 0.5;
        return 0.3;
      })
      .style("display", d => connectionVisibility[d.type] ? "block" : "none");
  
  // Draw nodes with wing-based colors
  const node = mainGroup.append("g")
    .selectAll("circle")
    .data(graph.nodes)
    .join("circle")
      .attr("class", "node")
      .attr("r", d => d.size)
      .attr("fill", d => {
        if (d.group === "wing_hub") return d.wing.color;
        if (d.group === "album") return d.wing.color;
        if (d.group === "artist") return d.wing.color;
        return "#ddd";
      })
      .attr("stroke", d => {
        if (d.group === "wing_hub") return d.wing.strokeColor;
        if (d.group === "album") return d.wing.strokeColor;
        if (d.group === "artist") return d.wing.strokeColor;
        return "#999";
      })
      .attr("stroke-width", d => {
        if (d.group === "wing_hub") return 4;
        if (d.group === "album") return 2;
        return 1.5;
      })
      .on("mouseover", function(e, d) {
          d3.select(this).transition().attr("r", d.size * 1.25);
          tooltip.transition().style("opacity", 1);
          
          let tooltipContent = `<strong>${d.id}</strong><br>`;
          
          if (d.type === "wing_hub") {
            tooltipContent += `<em>${d.wing.name}</em><br>`;
            tooltipContent += `<strong>Albums:</strong> ${d.data.albums.length}<br>`;
            tooltipContent += `<strong>Function:</strong> ${d.wing.name.split(' ')[0]} processing and coordination`;
          } else if (d.type === "album" && d.data) {
            tooltipContent += `<em>${d.data.artist} (${d.data.year})</em><br>`;
            tooltipContent += `<strong>Wing:</strong> ${d.wing.name}<br><br>`;
            tooltipContent += `<strong>Core Drive:</strong> ${d.data.core_drive}<br>`;
            tooltipContent += `<strong>Emotional Output:</strong> ${d.data.emotional_output}<br>`;
            tooltipContent += `<strong>Subsystem Role:</strong> ${d.data.subsystem_role}`;
          } else if (d.type === "artist") {
            tooltipContent += `<em>Artist - ${d.wing.name}</em>`;
          }
          
          tooltip.html(tooltipContent)
            .style("left", (e.pageX + 15) + "px")
            .style("top", (e.pageY - 30) + "px");
      })
      .on("mousemove", function(e) {
          tooltip
            .style("left", (e.pageX + 15) + "px")
            .style("top", (e.pageY - 30) + "px");
      })
      .on("mouseout", function(e, d) {
          d3.select(this).transition().attr("r", d.size);
          tooltip.transition().style("opacity", 0);
      })
      .on("click", function(e, d) {
          // Highlight connected nodes
          highlightConnectedNodes(d);
      })
      .on("dblclick", function(e, d) {
          centerOnNode(d);
      })
      .call(drag(simulation));
  
  // Node labels
  mainGroup.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#fafafa")
      .text(d => d.id);
  
  // Simulation tick
  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  
    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  
    mainGroup.selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
  });
  
  // Enhanced drag functionality
  function drag(simulation) {
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
}

// Alternative view implementations (placeholders for future development)
function initializeBlueprintView() {
  const width = 900, height = 600;
  svg = d3.select("#music-map")
      .attr("viewBox", [0, 0, width, height]);
  
  // Clear existing visualization
  svg.selectAll("*").remove();
  
  // Blueprint view placeholder
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height/2)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("fill", "#74b9ff")
    .text("Blueprint View - Coming Soon");
  
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height/2 + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "#999")
    .text("Hierarchical machine blueprint with technical specifications");
}

function initializeTimelineView() {
  const width = 900, height = 600;
  svg = d3.select("#music-map")
      .attr("viewBox", [0, 0, width, height]);
  
  // Clear existing visualization
  svg.selectAll("*").remove();
  
  // Timeline view placeholder  
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height/2)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("fill", "#74b9ff")
    .text("Timeline View - Coming Soon");
  
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height/2 + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "#999")
    .text("Chronological evolution of the machine over time");
}

function initializeMapView() {
  const width = 900, height = 600;
  svg = d3.select("#music-map")
      .attr("viewBox", [0, 0, width, height]);
  
  // Clear existing visualization
  svg.selectAll("*").remove();
  
  // Map view placeholder
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height/2)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("fill", "#74b9ff")
    .text("Spatial Map View - Coming Soon");
  
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height/2 + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "#999")
    .text("Geographic/conceptual mapping of musical influences");
}

// Helper functions for enhanced interactions
function highlightConnectedNodes(selectedNode) {
  const connectedNodeIds = new Set();
  
  // Find all connected nodes
  graph.links.forEach(link => {
    if (link.source.id === selectedNode.id || link.source === selectedNode.id) {
      connectedNodeIds.add(link.target.id || link.target);
    }
    if (link.target.id === selectedNode.id || link.target === selectedNode.id) {
      connectedNodeIds.add(link.source.id || link.source);
    }
  });
  
  // Add the selected node itself
  connectedNodeIds.add(selectedNode.id);
  
  // Update node styling
  svg.selectAll("circle")
    .style("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.2)
    .style("stroke-width", d => d.id === selectedNode.id ? 6 : 
           connectedNodeIds.has(d.id) ? 3 : 1);
  
  // Update link styling
  svg.selectAll("line")
    .style("opacity", d => {
      const isConnected = (d.source.id === selectedNode.id || d.source === selectedNode.id) ||
                         (d.target.id === selectedNode.id || d.target === selectedNode.id);
      return isConnected ? 1 : 0.1;
    });
  
  // Update text styling
  svg.selectAll("text")
    .style("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.3);
}

function centerOnNode(node) {
  const width = 900, height = 600;
  const scale = 1.5;
  const x = -node.x * scale + width / 2;
  const y = -node.y * scale + height / 2;
  
  svg.transition()
    .duration(750)
    .call(
      d3.zoom().transform,
      d3.zoomIdentity.translate(x, y).scale(scale)
    );
}

function resetHighlight() {
  UIControls.resetHighlight(svg);
}

function resetZoom() {
  UIControls.resetZoom(svg);
}

// Control system setup
function setupControls() {
  // Set up UI controls with callbacks
  UIControls.setupControls({
    onViewModeChange: (newView) => {
      currentView = newView;
      initializeVisualization();
    },
    onSearchChange: (searchTerm) => {
      window.searchTerm = searchTerm;
      applyFilters();
    },
    onWingFilterChange: (selectedWing) => {
      window.selectedWing = selectedWing;
      applyFilters();
    },
    onConnectionToggle: (types, isVisible) => {
      types.forEach(type => {
        connectionVisibility[type] = isVisible;
      });
      updateConnectionVisibility();
    },
    onResetView: () => {
      resetHighlight();
      resetZoom();
    }
  });
}

function applyFilters() {
  if (!graph) return;
  
  // Use UIControls to apply filters
  const filtered = UIControls.applyFilters(graph, searchTerm, selectedWing);
  filteredNodes = filtered.filteredNodes;
  filteredLinks = filtered.filteredLinks;
  
  updateVisualization();
}

function updateVisualization() {
  if (!svg || currentView !== 'network') return;
  
  // Use UIControls to update visualization
  UIControls.updateVisualization(svg, filteredNodes, filteredLinks, connectionVisibility, simulation);
}

function updateConnectionVisibility() {
  if (!svg) return;
  
  // Use UIControls to update connection visibility
  UIControls.updateConnectionVisibility(svg, connectionVisibility);
}

// Machine statistics
function updateMachineStats() {
  const stats = calculateMachineStats();
  const container = d3.select("#machine-stats");
  
  container.selectAll("*").remove();
  
  Object.entries(stats).forEach(([key, value]) => {
    const item = container.append("div").attr("class", "stat-item");
    item.append("div").attr("class", "stat-label").text(key);
    item.append("div").attr("class", "stat-value").text(value);
  });
}

function calculateMachineStats() {
  const wingCounts = {};
  const totalConnections = graph ? graph.links.length : 0;
  
  albums.forEach(album => {
    const wing = WingClassifier.classifyAlbumWing(album);
    wingCounts[wing.name] = (wingCounts[wing.name] || 0) + 1;
  });
  
  return {
    "Total Albums": albums.length,
    "Active Wings": Object.keys(wingCounts).length,
    "Total Connections": totalConnections,
    "Artists": new Set(albums.map(a => a.artist)).size,
    "Date Range": albums.length > 0 ? 
      `${Math.min(...albums.map(a => a.year))} - ${Math.max(...albums.map(a => a.year))}` : 
      "No data"
  };
}

// Wing legend
function createWingLegend() {
  const wings = {};
  albums.forEach(album => {
    const wing = WingClassifier.classifyAlbumWing(album);
    wings[wing.id] = wings[wing.id] || { ...wing, count: 0 };
    wings[wing.id].count++;
  });
  
  const container = d3.select(".legend-items");
  container.selectAll("*").remove();
  
  Object.values(wings).forEach(wing => {
    const item = container.append("div").attr("class", "legend-item");
    
    item.append("div")
      .attr("class", "legend-color")
      .style("background-color", wing.color);
    
    item.append("div")
      .attr("class", "legend-label")
      .text(wing.name.split(' ')[0]);
    
    item.append("div")
      .attr("class", "legend-count")
      .text(wing.count);
  });
}

// Start loading data when page loads
loadAlbumData();
