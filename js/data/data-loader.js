/**
 * Music Machine Data Loader
 * 
 * Handles loading and merging of album data from multiple JSON files,
 * with error handling and fallback mechanisms.
 */

/**
 * Configuration for data files to load
 */
const DATA_FILES = [
  'data/core_albums.json',
  'data/experimental_albums.json'
];

/**
 * Loads and merges album data from multiple JSON files
 * @param {Array} fileList - Optional array of file paths to load (defaults to DATA_FILES)
 * @returns {Promise<Array>} Promise that resolves to merged album array
 */
async function loadAlbumData(fileList = DATA_FILES) {
  try {
    console.log('Loading album data from files:', fileList);
    
    // Create fetch promises for all files
    const promises = fileList.map(file => 
      fetch(file).then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load ${file}: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
    );
    
    // Wait for all files to load
    const dataArrays = await Promise.all(promises);
    
    // Merge all arrays into one
    const mergedAlbums = dataArrays.flat();
    
    console.log(`Successfully loaded ${mergedAlbums.length} albums from ${fileList.length} files`);
    
    return mergedAlbums;
    
  } catch (error) {
    console.error('Error loading album data:', error);
    console.warn('Falling back to empty album array');
    
    // Return empty array as fallback
    return [];
  }
}

/**
 * Validates that album data has required fields
 * @param {Array} albums - Array of album objects to validate
 * @returns {Object} Validation results with valid/invalid counts and issues
 */
function validateAlbumData(albums) {
  const requiredFields = ['title', 'artist', 'metadata_tags', 'subsystem_role'];
  const results = {
    valid: 0,
    invalid: 0,
    issues: []
  };
  
  albums.forEach((album, index) => {
    const missing = requiredFields.filter(field => !album[field]);
    
    if (missing.length === 0) {
      results.valid++;
    } else {
      results.invalid++;
      results.issues.push({
        index,
        album: album.title || `Album ${index}`,
        missingFields: missing
      });
    }
  });
  
  return results;
}

/**
 * Gets statistics about the loaded album data
 * @param {Array} albums - Array of album objects
 * @returns {Object} Statistics object with counts and breakdowns
 */
function getDataStats(albums) {
  if (!albums || albums.length === 0) {
    return {
      totalAlbums: 0,
      totalArtists: 0,
      wingBreakdown: {},
      roleBreakdown: {}
    };
  }
  
  const uniqueArtists = new Set();
  const wingCounts = {};
  const roleCounts = {};
  
  albums.forEach(album => {
    // Count unique artists
    uniqueArtists.add(album.artist);
    
    // Count wing distribution
    if (WingClassifier && WingClassifier.classifyAlbumWing) {
      const wing = WingClassifier.classifyAlbumWing(album);
      wingCounts[wing.name] = (wingCounts[wing.name] || 0) + 1;
    }
    
    // Count role distribution
    const role = album.subsystem_role || 'Unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  
  return {
    totalAlbums: albums.length,
    totalArtists: uniqueArtists.size,
    wingBreakdown: wingCounts,
    roleBreakdown: roleCounts
  };
}

// Export functions for use in other modules
window.DataLoader = {
  loadAlbumData,
  validateAlbumData,
  getDataStats,
  DATA_FILES
};
