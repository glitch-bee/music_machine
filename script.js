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
  creates: true,
  tag_connection: true
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
    await initializeVisualization();
    setupUIControls();
    VisualizationHelpers.updateMachineStats(albums, graph);
    VisualizationHelpers.createWingLegend(albums);
  } catch (error) {
    console.error('Error in loadAlbumData:', error);
    // Fallback to empty array if loading fails
    albums = [];
    await initializeVisualization();
  }
}

// Initialize visualization with loaded data
async function initializeVisualization() {
  // Convert albums to graph format
  graph = await GraphConverter.convertAlbumsToGraph(albums);
  
  // Reset filters
  filteredNodes = [...graph.nodes];
  filteredLinks = [...graph.links];
  
  // Initialize tooltip
  tooltip = VisualizationHelpers.initializeTooltip();
  
  // Initialize the view manager with context
  const svg = d3.select("#music-map");
  const context = {
    graph: graph,
    albums: albums,
    connectionVisibility: connectionVisibility,
    svg: svg,
    tooltip: tooltip
  };
  
  ViewManager.initializeViewManager(context);
}

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
}

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
function setupUIControls() {
  // Set up UI controls with callbacks
  UIControls.setupControls({
    onViewModeChange: (newView) => {
      currentView = newView;
      ViewManager.handleViewModeChange(newView, {
        graph,
        albums,
        connectionVisibility,
        svg: d3.select("#music-map"),
        tooltip: d3.select("#tooltip")
      });
    },
    onSearchChange: (newSearchTerm) => {
      searchTerm = newSearchTerm;
      applyFilters();
    },
    onWingFilterChange: (newSelectedWing) => {
      selectedWing = newSelectedWing;
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
  
  // Update the current view with filtered data
  updateCurrentView();
}

function updateCurrentView() {
  if (!graph) return;
  
  // Create filtered graph data
  const filteredData = {
    nodes: filteredNodes,
    links: filteredLinks
  };
  
  // Update the current view with filtered data
  ViewManager.handleViewModeChange(currentView, {
    graph: graph,
    filteredData: filteredData,
    albums: albums,
    connectionVisibility: connectionVisibility,
    svg: d3.select("#music-map"),
    tooltip: d3.select("#tooltip")
  });
}

function updateConnectionVisibility() {
  if (!graph) return;
  
  // Update the current view with new connection visibility
  updateCurrentView();
}

// Start loading data when page loads
loadAlbumData();
