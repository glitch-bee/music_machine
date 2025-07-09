/**
 * Music Machine Visualization Helpers & Statistics
 * 
 * Provides helper functions for visualization features like tooltips, legends,
 * statistics calculations, and other UI enhancement utilities.
 */

/**
 * Initialize tooltip element
 * @returns {Object} D3 selection of tooltip element
 */
function initializeTooltip() {
  return d3.select("#tooltip");
}

/**
 * Generate tooltip content based on node data
 * @param {Object} node - Node data object
 * @returns {String} HTML content for tooltip
 */
function generateTooltipContent(node) {
  let content = `<strong>${node.id}</strong><br>`;
  
  if (node.type === "wing_hub") {
    content += `<em>${node.wing.name}</em><br>`;
    content += `<strong>Albums:</strong> ${node.data.albums.length}<br>`;
    content += `<strong>Function:</strong> ${node.wing.name.split(' ')[0]} processing and coordination`;
  } else if (node.type === "album" && node.data) {
    content += `<em>${node.data.artist} (${node.data.year})</em><br>`;
    content += `<strong>Wing:</strong> ${node.wing.name}<br><br>`;
    content += `<strong>Core Drive:</strong> ${node.data.core_drive}<br>`;
    content += `<strong>Emotional Output:</strong> ${node.data.emotional_output}<br>`;
    content += `<strong>Subsystem Role:</strong> ${node.data.subsystem_role}`;
  } else if (node.type === "artist") {
    content += `<em>Artist - ${node.wing.name}</em>`;
  }
  
  return content;
}

/**
 * Show tooltip with content at mouse position
 * @param {Object} tooltip - D3 tooltip selection
 * @param {Object} node - Node data object
 * @param {Event} event - Mouse event
 */
function showTooltip(tooltip, node, event) {
  const content = generateTooltipContent(node);
  
  tooltip.transition().style("opacity", 1);
  tooltip.html(content)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 30) + "px");
}

/**
 * Update tooltip position on mouse move
 * @param {Object} tooltip - D3 tooltip selection
 * @param {Event} event - Mouse event
 */
function updateTooltipPosition(tooltip, event) {
  tooltip
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 30) + "px");
}

/**
 * Hide tooltip
 * @param {Object} tooltip - D3 tooltip selection
 */
function hideTooltip(tooltip) {
  tooltip.transition().style("opacity", 0);
}

/**
 * Calculate comprehensive machine statistics
 * @param {Array} albums - Array of album objects
 * @param {Object} graph - Graph object with nodes and links
 * @returns {Object} Statistics object
 */
function calculateMachineStats(albums, graph) {
  if (!albums || albums.length === 0) {
    return {
      "Total Albums": 0,
      "Active Wings": 0,
      "Total Connections": 0,
      "Artists": 0,
      "Date Range": "No data"
    };
  }
  
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

/**
 * Get detailed wing statistics
 * @param {Array} albums - Array of album objects
 * @returns {Object} Wing statistics with counts and percentages
 */
function getWingStats(albums) {
  if (!albums || albums.length === 0) {
    return {};
  }
  
  const wingCounts = {};
  
  albums.forEach(album => {
    const wing = WingClassifier.classifyAlbumWing(album);
    if (!wingCounts[wing.id]) {
      wingCounts[wing.id] = {
        ...wing,
        count: 0,
        albums: []
      };
    }
    wingCounts[wing.id].count++;
    wingCounts[wing.id].albums.push(album);
  });
  
  // Add percentages
  Object.values(wingCounts).forEach(wing => {
    wing.percentage = ((wing.count / albums.length) * 100).toFixed(1);
  });
  
  return wingCounts;
}

/**
 * Update machine statistics display
 * @param {Array} albums - Array of album objects
 * @param {Object} graph - Graph object with nodes and links
 */
function updateMachineStats(albums, graph) {
  const stats = calculateMachineStats(albums, graph);
  const container = d3.select("#machine-stats");
  
  container.selectAll("*").remove();
  
  Object.entries(stats).forEach(([key, value]) => {
    const item = container.append("div").attr("class", "stat-item");
    item.append("div").attr("class", "stat-label").text(key);
    item.append("div").attr("class", "stat-value").text(value);
  });
}

/**
 * Create wing legend with colors and counts
 * @param {Array} albums - Array of album objects
 */
function createWingLegend(albums) {
  const wings = getWingStats(albums);
  
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

/**
 * Get connection type statistics
 * @param {Object} graph - Graph object with nodes and links
 * @returns {Object} Connection statistics by type
 */
function getConnectionStats(graph) {
  if (!graph || !graph.links) {
    return {};
  }
  
  const connectionCounts = {};
  
  graph.links.forEach(link => {
    connectionCounts[link.type] = (connectionCounts[link.type] || 0) + 1;
  });
  
  return connectionCounts;
}

/**
 * Get artist statistics
 * @param {Array} albums - Array of album objects
 * @returns {Object} Artist statistics with album counts
 */
function getArtistStats(albums) {
  if (!albums || albums.length === 0) {
    return {};
  }
  
  const artistCounts = {};
  
  albums.forEach(album => {
    if (!artistCounts[album.artist]) {
      artistCounts[album.artist] = {
        name: album.artist,
        albums: [],
        wingDistribution: {}
      };
    }
    
    artistCounts[album.artist].albums.push(album);
    
    const wing = WingClassifier.classifyAlbumWing(album);
    artistCounts[album.artist].wingDistribution[wing.name] = 
      (artistCounts[album.artist].wingDistribution[wing.name] || 0) + 1;
  });
  
  return artistCounts;
}

/**
 * Generate comprehensive data insights
 * @param {Array} albums - Array of album objects
 * @param {Object} graph - Graph object with nodes and links
 * @returns {Object} Comprehensive insights object
 */
function generateDataInsights(albums, graph) {
  return {
    basic: calculateMachineStats(albums, graph),
    wings: getWingStats(albums),
    connections: getConnectionStats(graph),
    artists: getArtistStats(albums),
    generated: new Date().toISOString()
  };
}

/**
 * Format statistics for display
 * @param {Object} stats - Statistics object
 * @returns {String} Formatted HTML string
 */
function formatStatsForDisplay(stats) {
  let html = '<div class="stats-display">';
  
  Object.entries(stats).forEach(([key, value]) => {
    html += `<div class="stat-row">`;
    html += `<span class="stat-key">${key}:</span>`;
    html += `<span class="stat-value">${value}</span>`;
    html += `</div>`;
  });
  
  html += '</div>';
  return html;
}

// Export functions for use in other modules
window.VisualizationHelpers = {
  // Tooltip functions
  initializeTooltip,
  generateTooltipContent,
  showTooltip,
  updateTooltipPosition,
  hideTooltip,
  
  // Statistics functions
  calculateMachineStats,
  getWingStats,
  updateMachineStats,
  getConnectionStats,
  getArtistStats,
  generateDataInsights,
  formatStatsForDisplay,
  
  // UI helper functions
  createWingLegend
};
