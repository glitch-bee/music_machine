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

// List of JSON files to load
const dataFiles = [
  'data/core_albums.json',
  'data/experimental_albums.json'
];

// Load and merge all album data
async function loadAlbumData() {
  try {
    const promises = dataFiles.map(file => fetch(file).then(res => res.json()));
    const dataArrays = await Promise.all(promises);
    
    // Merge all arrays into one
    albums = dataArrays.flat();
    
    // Initialize the visualization
    initializeVisualization();
    setupControls();
    updateMachineStats();
    createWingLegend();
  } catch (error) {
    console.error('Error loading album data:', error);
    // Fallback to empty array if loading fails
    albums = [];
    initializeVisualization();
  }
}

// Initialize visualization with loaded data
function initializeVisualization() {
  // Convert albums to graph format
  graph = convertAlbumsToGraph(albums);
  
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

// Machine Wing Classification System
function classifyAlbumWing(album) {
  const role = album.subsystem_role.toLowerCase();
  const tags = album.metadata_tags.map(tag => tag.toLowerCase());
  const drive = album.core_drive.toLowerCase();
  
  // Wing 1: Atmospheric Processing (Ambient, Post-Rock, Atmospheric)
  if (role.includes('space') || role.includes('atmospheric') || role.includes('ambient') || 
      role.includes('ascent') || role.includes('beauty') || role.includes('observation') ||
      tags.some(tag => tag.includes('deep_space') || tag.includes('ambient') || 
                       tag.includes('atmospheric') || tag.includes('post_rock') ||
                       tag.includes('beauty') || tag.includes('ascent'))) {
    return {
      id: 'atmospheric',
      name: 'Atmospheric Processing Wing',
      color: '#74b9ff', // Light blue
      strokeColor: '#0984e3'
    };
  }
  
  // Wing 2: Propulsion Systems (Engines, Drives, Rhythm)
  if (role.includes('engine') || role.includes('drive') || role.includes('sync') ||
      role.includes('propulsion') || role.includes('core') ||
      tags.some(tag => tag.includes('engine') || tag.includes('drive') || 
                       tag.includes('sync') || tag.includes('propulsion') ||
                       tag.includes('structural_urgency'))) {
    return {
      id: 'propulsion',
      name: 'Propulsion Systems Wing',
      color: '#fd79a8', // Pink
      strokeColor: '#e84393'
    };
  }
  
  // Wing 3: Memory & Storage (Buffers, Recall, Archives)
  if (role.includes('buffer') || role.includes('memory') || role.includes('storage') ||
      role.includes('archive') || role.includes('recall') ||
      tags.some(tag => tag.includes('buffer') || tag.includes('memory') || 
                       tag.includes('recall') || tag.includes('compressed') ||
                       tag.includes('analog'))) {
    return {
      id: 'memory',
      name: 'Memory & Storage Wing',
      color: '#fdcb6e', // Gold
      strokeColor: '#e17055'
    };
  }
  
  // Wing 4: Processing & Analysis (Computational, Resonance, Analysis)
  if (role.includes('processor') || role.includes('resonance') || role.includes('fractal') ||
      role.includes('analysis') || role.includes('computational') ||
      tags.some(tag => tag.includes('processor') || tag.includes('resonance') || 
                       tag.includes('fractal') || tag.includes('precision') ||
                       tag.includes('calibrated'))) {
    return {
      id: 'processing',
      name: 'Processing & Analysis Wing',
      color: '#00b894', // Green
      strokeColor: '#00a085'
    };
  }
  
  // Wing 5: Testing & Experimental (Stress, Debug, Experimental)
  if (role.includes('stress') || role.includes('test') || role.includes('debug') ||
      role.includes('experimental') || role.includes('protocol') ||
      tags.some(tag => tag.includes('stress') || tag.includes('debug') || 
                       tag.includes('glitch') || tag.includes('collision') ||
                       tag.includes('modular_chaos'))) {
    return {
      id: 'testing',
      name: 'Testing & Experimental Wing',
      color: '#a29bfe', // Purple
      strokeColor: '#6c5ce7'
    };
  }
  
  // Default: Core Systems
  return {
    id: 'core',
    name: 'Core Systems Wing',
    color: '#ddd', // Gray
    strokeColor: '#999'
  };
}

function convertAlbumsToGraph(albums) {
  const nodes = [];
  const links = [];
  
  // Create wing hub nodes
  const wings = {};
  
  // Create album nodes and classify by wing
  albums.forEach(album => {
    const wing = classifyAlbumWing(album);
    
    // Create wing hub if it doesn't exist
    if (!wings[wing.id]) {
      wings[wing.id] = wing;
      nodes.push({
        id: `${wing.name}`,
        group: "wing_hub",
        size: 32,
        type: "wing_hub",
        wing: wing,
        data: { name: wing.name, albums: [] }
      });
    }
    
    // Add album to wing data
    const wingHub = nodes.find(n => n.id === wing.name);
    wingHub.data.albums.push(album);
    
    // Create album node
    nodes.push({
      id: `${album.title}`,
      group: "album",
      size: 20,
      type: "album",
      wing: wing,
      data: album
    });
    
    // Create artist nodes if they don't exist
    const artistExists = nodes.find(n => n.id === album.artist && n.group === "artist");
    if (!artistExists) {
      nodes.push({
        id: album.artist,
        group: "artist",
        size: 16,
        type: "artist",
        wing: wing, // Artist inherits wing from their albums
        data: { name: album.artist }
      });
    }
    
    // Connect album to its wing hub
    links.push({
      source: `${wing.name}`,
      target: `${album.title}`,
      type: "wing_connection"
    });
    
    // Connect album to artist
    links.push({
      source: album.artist,
      target: `${album.title}`,
      type: "creates"
    });
  });
  
  // Create connections between albums
  for (let i = 0; i < albums.length; i++) {
    for (let j = i + 1; j < albums.length; j++) {
      const album1 = albums[i];
      const album2 = albums[j];
      const wing1 = classifyAlbumWing(album1);
      const wing2 = classifyAlbumWing(album2);
      
      // Intra-wing connections (within same wing)
      if (wing1.id === wing2.id) {
        // Connect albums with overlapping metadata tags
        const commonTags = album1.metadata_tags.filter(tag => 
          album2.metadata_tags.includes(tag)
        );
        if (commonTags.length >= 1) {
          links.push({
            source: `${album1.title}`,
            target: `${album2.title}`,
            type: "intra_wing_connection"
          });
        }
      }
      
      // Inter-wing connections (between different wings)
      else {
        // Only connect if they share strong thematic connections
        const commonTags = album1.metadata_tags.filter(tag => 
          album2.metadata_tags.includes(tag)
        );
        if (commonTags.length >= 2) {
          links.push({
            source: `${album1.title}`,
            target: `${album2.title}`,
            type: "inter_wing_connection"
          });
        }
        
        // Connect complementary wing functions
        const wingConnections = {
          'atmospheric': ['processing', 'memory'],
          'propulsion': ['testing', 'memory'],
          'memory': ['atmospheric', 'propulsion'],
          'processing': ['atmospheric', 'testing'],
          'testing': ['propulsion', 'processing']
        };
        
        if (wingConnections[wing1.id]?.includes(wing2.id)) {
          // Only connect if albums have related functions
          const role1 = album1.subsystem_role.toLowerCase();
          const role2 = album2.subsystem_role.toLowerCase();
          
          if ((role1.includes('engine') && role2.includes('buffer')) ||
              (role1.includes('processor') && role2.includes('observation')) ||
              (role1.includes('stress') && role2.includes('engine'))) {
            links.push({
              source: `${album1.title}`,
              target: `${album2.title}`,
              type: "functional_bridge"
            });
          }
        }
      }
    }
  }
  
  // Create hub-to-hub connections for major system bridges
  const hubConnections = [
    ['Atmospheric Processing Wing', 'Processing & Analysis Wing'],
    ['Propulsion Systems Wing', 'Testing & Experimental Wing'],
    ['Memory & Storage Wing', 'Atmospheric Processing Wing']
  ];
  
  hubConnections.forEach(([hub1, hub2]) => {
    if (nodes.find(n => n.id === hub1) && nodes.find(n => n.id === hub2)) {
      links.push({
        source: hub1,
        target: hub2,
        type: "hub_bridge"
      });
    }
  });
  
  return { nodes, links };
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
  
  svg.selectAll("text")
    .style("opacity", 1);
}

// Control system setup
function setupControls() {
  // View mode selector
  d3.select("#viewMode").on("change", function() {
    currentView = this.value;
    initializeVisualization();
  });
  
  // Search functionality
  d3.select("#searchInput").on("input", function() {
    searchTerm = this.value.toLowerCase();
    applyFilters();
  });
  
  // Wing filter
  d3.select("#wingFilter").on("change", function() {
    selectedWing = this.value;
    applyFilters();
  });
  
  // Connection toggle buttons
  d3.select("#toggleWingConnections").on("click", function() {
    toggleConnectionType(['wing_connection', 'creates'], this);
  });
  
  d3.select("#toggleIntraConnections").on("click", function() {
    toggleConnectionType(['intra_wing_connection'], this);
  });
  
  d3.select("#toggleInterConnections").on("click", function() {
    toggleConnectionType(['inter_wing_connection'], this);
  });
  
  d3.select("#toggleBridges").on("click", function() {
    toggleConnectionType(['functional_bridge', 'hub_bridge'], this);
  });
  
  // Reset view button
  d3.select("#resetHighlight").on("click", function() {
    resetHighlight();
    // Reset zoom
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
  });
}

function applyFilters() {
  if (!graph) return;
  
  // Filter nodes based on search and wing selection
  filteredNodes = graph.nodes.filter(node => {
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
  filteredLinks = graph.links.filter(link => 
    visibleNodeIds.has(link.source.id || link.source) && 
    visibleNodeIds.has(link.target.id || link.target)
  );
  
  updateVisualization();
}

function updateVisualization() {
  if (!svg || currentView !== 'network') return;
  
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

// Connection toggle logic
function toggleConnectionType(types, button) {
  const isActive = button.classList.contains('active');
  
  types.forEach(type => {
    connectionVisibility[type] = !isActive;
  });
  
  // Update button state
  button.classList.toggle('active');
  
  // Update visualization
  updateConnectionVisibility();
}

function updateConnectionVisibility() {
  if (!svg) return;
  
  svg.selectAll("line").style("display", d => 
    connectionVisibility[d.type] ? "block" : "none"
  );
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
    const wing = classifyAlbumWing(album);
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
    const wing = classifyAlbumWing(album);
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
