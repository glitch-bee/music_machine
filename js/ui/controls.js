/**
 * Music Machine UI Controls
 * 
 * Handles all user interface controls including search, filtering, view modes,
 * connection toggles, and visualization updates.
 */

/**
 * Initialize all UI controls and event handlers
 * @param {Object} callbacks - Object containing callback functions for various actions
 */
function setupControls(callbacks = {}) {
  const {
    onViewModeChange,
    onSearchChange,
    onWingFilterChange,
    onConnectionToggle,
    onResetView
  } = callbacks;
  
  // View mode selector
  d3.select("#viewMode").on("change", function() {
    const newView = this.value;
    if (onViewModeChange) {
      onViewModeChange(newView);
    }
  });
  
  // Search functionality
  d3.select("#searchInput").on("input", function() {
    const searchTerm = this.value.toLowerCase();
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  });
  
  // Wing filter
  d3.select("#wingFilter").on("change", function() {
    const selectedWing = this.value;
    if (onWingFilterChange) {
      onWingFilterChange(selectedWing);
    }
  });
  
  // Connection toggle buttons
  d3.select("#toggleWingConnections").on("click", function() {
    const types = ['wing_connection', 'creates'];
    const isActive = this.classList.contains('active');
    toggleConnectionType(types, this);
    if (onConnectionToggle) {
      onConnectionToggle(types, !isActive);
    }
  });
  
  d3.select("#toggleIntraConnections").on("click", function() {
    const types = ['intra_wing_connection'];
    const isActive = this.classList.contains('active');
    toggleConnectionType(types, this);
    if (onConnectionToggle) {
      onConnectionToggle(types, !isActive);
    }
  });
  
  d3.select("#toggleInterConnections").on("click", function() {
    const types = ['inter_wing_connection'];
    const isActive = this.classList.contains('active');
    toggleConnectionType(types, this);
    if (onConnectionToggle) {
      onConnectionToggle(types, !isActive);
    }
  });
  
  d3.select("#toggleBridges").on("click", function() {
    const types = ['functional_bridge', 'hub_bridge'];
    const isActive = this.classList.contains('active');
    toggleConnectionType(types, this);
    if (onConnectionToggle) {
      onConnectionToggle(types, !isActive);
    }
  });
  
  d3.select("#toggleTagConnections").on("click", function() {
    const types = ['tag_connection'];
    const isActive = this.classList.contains('active');
    toggleConnectionType(types, this);
    if (onConnectionToggle) {
      onConnectionToggle(types, !isActive);
    }
  });
  
  // Reset view button
  d3.select("#resetHighlight").on("click", function() {
    if (onResetView) {
      onResetView();
    }
  });
}

/**
 * Toggle connection type visibility
 * @param {Array} types - Array of connection types to toggle
 * @param {HTMLElement} button - The button element that was clicked
 */
function toggleConnectionType(types, button) {
  // Update button state
  button.classList.toggle('active');
}

/**
 * Apply filters to nodes and links based on search and wing selection
 * @param {Object} graph - The graph object with nodes and links
 * @param {String} searchTerm - The search term to filter by
 * @param {String} selectedWing - The selected wing to filter by
 * @returns {Object} Filtered graph with filteredNodes and filteredLinks
 */
function applyFilters(graph, searchTerm, selectedWing) {
  if (!graph) return { filteredNodes: [], filteredLinks: [] };
  
  // Filter nodes based on search and wing selection
  const filteredNodes = graph.nodes.filter(node => {
    // Wing filter
    if (selectedWing !== 'all' && node.wing.id !== selectedWing) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchableText = [
        node.id,
        node.data?.artist || '',
        node.data?.title || '',
        node.wing.name,
        node.data?.core_drive || '',
        node.data?.subsystem_role || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Filter links to only show connections between visible nodes
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = graph.links.filter(link => 
    visibleNodeIds.has(link.source.id || link.source) && 
    visibleNodeIds.has(link.target.id || link.target)
  );
  
  return { filteredNodes, filteredLinks };
}

/**
 * Update visualization based on current filters and visibility settings
 * @param {Object} svg - D3 SVG selection
 * @param {Array} filteredNodes - Array of filtered nodes
 * @param {Array} filteredLinks - Array of filtered links
 * @param {Object} connectionVisibility - Object with connection type visibility settings
 * @param {Object} simulation - D3 force simulation
 */
function updateVisualization(svg, filteredNodes, filteredLinks, connectionVisibility, simulation) {
  if (!svg) return;
  
  // Update node visibility
  svg.selectAll("circle")
    .style("display", d => filteredNodes.includes(d) ? "block" : "none")
    .style("opacity", d => filteredNodes.includes(d) ? 1 : 0.2);
  
  // Update link visibility
  svg.selectAll("line")
    .style("display", d => {
      const isVisible = filteredLinks.includes(d) && connectionVisibility[d.type];
      return isVisible ? "block" : "none";
    });
  
  // Update text visibility
  svg.selectAll("text")
    .style("display", d => filteredNodes.includes(d) ? "block" : "none");
  
  // Restart simulation with filtered data
  if (simulation) {
    simulation.nodes(filteredNodes);
    simulation.force("link").links(filteredLinks);
    simulation.alpha(0.3).restart();
  }
}

/**
 * Update connection visibility based on connection type settings
 * @param {Object} svg - D3 SVG selection
 * @param {Object} connectionVisibility - Object with connection type visibility settings
 */
function updateConnectionVisibility(svg, connectionVisibility) {
  if (!svg) return;
  
  svg.selectAll("line").style("display", d => 
    connectionVisibility[d.type] ? "block" : "none"
  );
}

/**
 * Reset all highlights and styles to default state
 * @param {Object} svg - D3 SVG selection
 */
function resetHighlight(svg) {
  if (!svg) return;
  
  svg.selectAll("circle")
    .style("opacity", 1)
    .style("stroke-width", d => {
      if (d.group === "wing_hub") return 4;
      if (d.group === "album") return 2;
      return 1.5;
    });
  
  svg.selectAll("line")
    .style("opacity", d => {
      if (d.type === "wing_connection") return 0.7;
      if (d.type === "creates") return 0.8;
      if (d.type === "hub_bridge") return 0.9;
      if (d.type === "intra_wing_connection") return 0.6;
      if (d.type === "inter_wing_connection") return 0.4;
      if (d.type === "functional_bridge") return 0.5;
      return 0.3;
    });
}

/**
 * Reset zoom to default state
 * @param {Object} svg - D3 SVG selection
 */
function resetZoom(svg) {
  if (!svg) return;
  
  svg.transition().duration(750).call(
    d3.zoom().transform,
    d3.zoomIdentity
  );
}

/**
 * Get current control states
 * @returns {Object} Object containing current control states
 */
function getControlStates() {
  return {
    viewMode: d3.select("#viewMode").property("value"),
    searchTerm: d3.select("#searchInput").property("value"),
    selectedWing: d3.select("#wingFilter").property("value"),
    connectionStates: {
      wing: d3.select("#toggleWingConnections").classed("active"),
      intra: d3.select("#toggleIntraConnections").classed("active"),
      inter: d3.select("#toggleInterConnections").classed("active"),
      bridges: d3.select("#toggleBridges").classed("active"),
      tags: d3.select("#toggleTagConnections").classed("active")
    }
  };
}

/**
 * Set control states
 * @param {Object} states - Object containing control states to set
 */
function setControlStates(states) {
  if (states.viewMode) {
    d3.select("#viewMode").property("value", states.viewMode);
  }
  if (states.searchTerm) {
    d3.select("#searchInput").property("value", states.searchTerm);
  }
  if (states.selectedWing) {
    d3.select("#wingFilter").property("value", states.selectedWing);
  }
  if (states.connectionStates) {
    const conn = states.connectionStates;
    d3.select("#toggleWingConnections").classed("active", conn.wing);
    d3.select("#toggleIntraConnections").classed("active", conn.intra);
    d3.select("#toggleInterConnections").classed("active", conn.inter);
    d3.select("#toggleBridges").classed("active", conn.bridges);
    d3.select("#toggleTagConnections").classed("active", conn.tags);
  }
}

// Export functions for use in other modules
window.UIControls = {
  setupControls,
  toggleConnectionType,
  applyFilters,
  updateVisualization,
  updateConnectionVisibility,
  resetHighlight,
  resetZoom,
  getControlStates,
  setControlStates
};
