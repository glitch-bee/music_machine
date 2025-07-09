/**
 * Music Machine Wing Classification System
 * 
 * Classifies albums into specialized machine wings based on their
 * subsystem role, metadata tags, and core drive characteristics.
 */

/**
 * Classifies an album into one of the machine's operational wings
 * @param {Object} album - Album object with subsystem_role, metadata_tags, and core_drive
 * @returns {Object} Wing classification with id, name, color, and strokeColor
 */
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

/**
 * Get all available wing definitions
 * @returns {Array} Array of all possible wing configurations
 */
function getAllWingDefinitions() {
  return [
    {
      id: 'atmospheric',
      name: 'Atmospheric Processing Wing',
      color: '#74b9ff',
      strokeColor: '#0984e3',
      description: 'Ambient processing, atmospheric observation, spatial awareness'
    },
    {
      id: 'propulsion',
      name: 'Propulsion Systems Wing',
      color: '#fd79a8',
      strokeColor: '#e84393',
      description: 'Energy generation, rhythmic synchronization, drive systems'
    },
    {
      id: 'memory',
      name: 'Memory & Storage Wing',
      color: '#fdcb6e',
      strokeColor: '#e17055',
      description: 'Data storage, recall systems, buffer management'
    },
    {
      id: 'processing',
      name: 'Processing & Analysis Wing',
      color: '#00b894',
      strokeColor: '#00a085',
      description: 'Computational processing, pattern analysis, resonance processing'
    },
    {
      id: 'testing',
      name: 'Testing & Experimental Wing',
      color: '#a29bfe',
      strokeColor: '#6c5ce7',
      description: 'System testing, stress analysis, experimental protocols'
    },
    {
      id: 'core',
      name: 'Core Systems Wing',
      color: '#ddd',
      strokeColor: '#999',
      description: 'Foundational systems and unclassified components'
    }
  ];
}

// Export functions for use in other modules
window.WingClassifier = {
  classifyAlbumWing,
  getAllWingDefinitions
};
