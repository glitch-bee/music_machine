/**
 * Music Machine View Manager
 * 
 * Manages different visualization views and handles switching between them.
 * Provides a clean API for registering and managing multiple view types.
 */

// Registry of available views
const viewRegistry = new Map();

// Current active view
let currentActiveView = null;

/**
 * Register a new view type
 * @param {String} viewId - Unique identifier for the view
 * @param {Object} viewConfig - Configuration object for the view
 * @param {Function} viewConfig.initialize - Function to initialize the view
 * @param {Function} viewConfig.cleanup - Optional cleanup function
 * @param {String} viewConfig.name - Display name for the view
 * @param {String} viewConfig.description - Description of the view
 */
function registerView(viewId, viewConfig) {
  if (!viewId || !viewConfig.initialize) {
    throw new Error('View registration requires viewId and initialize function');
  }
  
  viewRegistry.set(viewId, {
    id: viewId,
    name: viewConfig.name || viewId,
    description: viewConfig.description || '',
    initialize: viewConfig.initialize,
    cleanup: viewConfig.cleanup || (() => {}),
    isActive: false
  });
  
  console.log(`View registered: ${viewId}`);
}

/**
 * Switch to a different view
 * @param {String} viewId - ID of the view to switch to
 * @param {Object} context - Context object with data and elements
 */
function switchView(viewId, context = {}) {
  if (!viewRegistry.has(viewId)) {
    console.error(`View not found: ${viewId}`);
    return false;
  }
  
  // Cleanup current view
  if (currentActiveView) {
    currentActiveView.cleanup();
    currentActiveView.isActive = false;
  }
  
  // Initialize new view
  const newView = viewRegistry.get(viewId);
  try {
    newView.initialize(context);
    newView.isActive = true;
    currentActiveView = newView;
    
    console.log(`Switched to view: ${viewId}`);
    return true;
  } catch (error) {
    console.error(`Error initializing view ${viewId}:`, error);
    return false;
  }
}

/**
 * Get information about a specific view
 * @param {String} viewId - ID of the view
 * @returns {Object} View information
 */
function getViewInfo(viewId) {
  return viewRegistry.get(viewId);
}

/**
 * Get list of all registered views
 * @returns {Array} Array of view information objects
 */
function getAvailableViews() {
  return Array.from(viewRegistry.values());
}

/**
 * Get the currently active view
 * @returns {Object} Current view information
 */
function getCurrentView() {
  return currentActiveView;
}

/**
 * Check if a view is available
 * @param {String} viewId - ID of the view to check
 * @returns {Boolean} True if view is registered
 */
function isViewAvailable(viewId) {
  return viewRegistry.has(viewId);
}

/**
 * Remove a view from the registry
 * @param {String} viewId - ID of the view to remove
 */
function unregisterView(viewId) {
  if (currentActiveView && currentActiveView.id === viewId) {
    currentActiveView.cleanup();
    currentActiveView = null;
  }
  
  viewRegistry.delete(viewId);
  console.log(`View unregistered: ${viewId}`);
}

/**
 * Initialize the view manager with default views
 * @param {Object} context - Context object with data and elements
 */
function initializeViewManager(context = {}) {
  // Register default views
  registerView('network', {
    name: 'Network Graph',
    description: 'Interactive network visualization of albums, artists, and connections',
    initialize: NetworkView.initialize,
    cleanup: NetworkView.cleanup
  });
  
  registerView('blueprint', {
    name: 'Technical Blueprint',
    description: 'Hierarchical machine blueprint with technical specifications',
    initialize: BlueprintView.initialize,
    cleanup: BlueprintView.cleanup
  });
  
  registerView('timeline', {
    name: 'Timeline Evolution',
    description: 'Chronological evolution of the machine over time',
    initialize: TimelineView.initialize,
    cleanup: TimelineView.cleanup
  });
  
  registerView('map', {
    name: 'Spatial Map',
    description: 'Spatial visualization of album relationships',
    initialize: MapView.initialize,
    cleanup: MapView.cleanup
  });
  
  // Set default view
  switchView('network', context);
}

/**
 * Handle view mode changes from UI
 * @param {String} newViewId - ID of the new view
 * @param {Object} context - Context object with data and elements
 */
function handleViewModeChange(newViewId, context = {}) {
  if (switchView(newViewId, context)) {
    // Update any UI elements that track current view
    const event = new CustomEvent('viewChanged', {
      detail: { viewId: newViewId, view: getCurrentView() }
    });
    window.dispatchEvent(event);
  }
}

// Export functions for use in other modules
window.ViewManager = {
  registerView,
  switchView,
  getViewInfo,
  getAvailableViews,
  getCurrentView,
  isViewAvailable,
  unregisterView,
  initializeViewManager,
  handleViewModeChange
};
