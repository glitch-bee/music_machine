/**
 * Music Machine Graph Converter
 * 
 * Converts album data into a graph structure suitable for D3.js visualization
 * with nodes (albums, artists, wing hubs) and links (various connection types).
 */

/**
 * Converts an array of albums into a graph structure with nodes and links
 * @param {Array} albums - Array of album objects
 * @returns {Object} Graph object with nodes and links arrays
 */
async function convertAlbumsToGraph(albums) {
  const nodes = [];
  const links = [];
  
  // Track all tags used by albums
  const allTags = new Set();
  const coreTagNames = new Set();
  
  // Load core tags to identify which are core vs unique
  try {
    const coreTags = await loadCoreTags();
    coreTags.forEach(tag => coreTagNames.add(tag.name));
  } catch (error) {
    console.warn('Could not load core tags, treating all as unique:', error);
  }
  
  // Create wing hub nodes
  const wings = {};
  
  // First pass: collect all tags
  albums.forEach(album => {
    if (album.metadata_tags) {
      album.metadata_tags.forEach(tag => allTags.add(tag));
    }
  });
  
  // Create tag nodes
  allTags.forEach(tagName => {
    const isCore = coreTagNames.has(tagName);
    nodes.push({
      id: `tag_${tagName}`,
      group: "tag",
      size: isCore ? 12 : 6,
      type: "tag",
      isCore: isCore,
      data: { 
        name: tagName,
        isCore: isCore,
        albums: [] // Will be populated later
      }
    });
  });
  
  // Create album nodes and classify by wing
  albums.forEach(album => {
    const wing = WingClassifier.classifyAlbumWing(album);
    
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
    const albumNode = {
      id: `${album.title}`,
      group: "album",
      size: 20,
      type: "album",
      wing: wing,
      data: album,
      tags: album.metadata_tags || []
    };
    nodes.push(albumNode);
    
    // Add album to tag nodes' data
    if (album.metadata_tags) {
      album.metadata_tags.forEach(tagName => {
        const tagNode = nodes.find(n => n.id === `tag_${tagName}`);
        if (tagNode) {
          tagNode.data.albums.push(album);
        }
      });
    }
    
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
    
    // Connect album to its tags
    if (album.metadata_tags) {
      album.metadata_tags.forEach(tagName => {
        links.push({
          source: `${album.title}`,
          target: `tag_${tagName}`,
          type: "tag_connection"
        });
      });
    }
  });
  
  // Create connections between albums
  for (let i = 0; i < albums.length; i++) {
    for (let j = i + 1; j < albums.length; j++) {
      const album1 = albums[i];
      const album2 = albums[j];
      const wing1 = WingClassifier.classifyAlbumWing(album1);
      const wing2 = WingClassifier.classifyAlbumWing(album2);
      
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

/**
 * Load core tags from JSON file
 * @returns {Promise<Array>} Array of core tag objects
 */
async function loadCoreTags() {
  try {
    const response = await fetch('data/core_tags.json');
    const coreTags = await response.json();
    return coreTags;
  } catch (error) {
    console.warn('Could not load core tags:', error);
    return [];
  }
}

/**
 * Get statistics about the graph structure
 * @param {Object} graph - Graph object with nodes and links
 * @returns {Object} Statistics about the graph
 */
function getGraphStats(graph) {
  if (!graph) return {};
  
  const nodeTypes = {};
  const linkTypes = {};
  
  graph.nodes.forEach(node => {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  });
  
  graph.links.forEach(link => {
    linkTypes[link.type] = (linkTypes[link.type] || 0) + 1;
  });
  
  return {
    totalNodes: graph.nodes.length,
    totalLinks: graph.links.length,
    nodeTypes,
    linkTypes
  };
}

// Export functions for use in other modules
window.GraphConverter = {
  convertAlbumsToGraph,
  getGraphStats
};
