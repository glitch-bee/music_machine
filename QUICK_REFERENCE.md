# Music Machine - Quick Reference Guide

## Architecture Overview

```
Data Layer → Control Layer → Orchestration Layer → View Layer
    ↓            ↓               ↓                  ↓
DataLoader → UIControls → script.js → ViewManager → Views
```

## Key Files and Their Roles

### script.js (Main Controller)
- **Purpose**: Application orchestration and state management
- **Key Variables**: `albums`, `graph`, `searchTerm`, `selectedWing`, `connectionVisibility`
- **Key Functions**: `applyFilters()`, `updateCurrentView()`, `setupUIControls()`
- **Rule**: Single source of truth for all application state

### js/ui/controls.js
- **Purpose**: UI interaction handling and filtering logic
- **Key Functions**: `setupControls()`, `applyFilters()`, `updateConnectionVisibility()`
- **Rule**: Handles logic, never directly updates views

### js/views/view-manager.js
- **Purpose**: View lifecycle management
- **Key Functions**: `handleViewModeChange()`, `switchView()`, `registerView()`
- **Rule**: All view updates must go through this system

### js/views/network-view.js
- **Purpose**: Network graph visualization
- **Key Functions**: `initialize()`, `cleanup()`, `drawLinks()`, `drawNodes()`
- **Rule**: Must accept and use `filteredData` parameter

## Critical Data Flow

### User Interaction → Filter Update
1. User selects wing filter
2. UIControls triggers `onWingFilterChange` callback
3. script.js updates `selectedWing` variable
4. script.js calls `applyFilters()`
5. `applyFilters()` calls `UIControls.applyFilters()`
6. Filtered data updates global `filteredNodes` and `filteredLinks`
7. `updateCurrentView()` passes filtered data to ViewManager
8. ViewManager reinitializes current view with filtered data
9. View renders only filtered nodes and links

### View Switch (with filtering preserved)
1. User selects new view mode
2. UIControls triggers `onViewModeChange` callback
3. script.js updates `currentView` variable
4. ViewManager switches to new view
5. New view receives current filtered data
6. New view renders with filtered data

## Common Patterns

### ✅ Correct: State Updates
```javascript
onWingFilterChange: (newSelectedWing) => {
  selectedWing = newSelectedWing;  // Update local variable
  applyFilters();                  // Apply through proper channels
}
```

### ✅ Correct: View Updates
```javascript
function updateCurrentView() {
  const filteredData = { nodes: filteredNodes, links: filteredLinks };
  ViewManager.handleViewModeChange(currentView, {
    graph: graph,
    filteredData: filteredData,
    // ... other context
  });
}
```

### ✅ Correct: View Data Handling
```javascript
function initialize(context = {}) {
  const { graph, filteredData, connectionVisibility } = context;
  const displayGraph = filteredData || graph;
  // Use displayGraph for rendering
}
```

## Common Anti-Patterns

### ❌ Wrong: Direct DOM Manipulation
```javascript
// Don't do this
function updateVisualization() {
  svg.selectAll("circle").style("display", d => shouldShow(d) ? "block" : "none");
}
```

### ❌ Wrong: Window Properties
```javascript
// Don't do this
onWingFilterChange: (selectedWing) => {
  window.selectedWing = selectedWing;
}
```

### ❌ Wrong: Bypassing ViewManager
```javascript
// Don't do this
function updateView() {
  NetworkView.initialize(someData);
}
```

## Debugging Checklist

### Filter Not Working?
- [ ] Are callbacks properly updating local variables?
- [ ] Is `applyFilters()` being called?
- [ ] Is `updateCurrentView()` being called?
- [ ] Is filtered data being passed to views?
- [ ] Are views using filtered data in rendering?

### View Not Updating?
- [ ] Is ViewManager being used for updates?
- [ ] Is the view receiving the correct context?
- [ ] Is the view's `initialize()` function being called?
- [ ] Check browser console for errors

### Performance Issues?
- [ ] Are views being reinitialized unnecessarily?
- [ ] Are there memory leaks in view cleanup?
- [ ] Are force simulations being restarted properly?

## Module Dependencies

### Load Order (Important!)
1. D3.js (external)
2. Wing Classifier
3. Data Loader
4. Graph Converter
5. UI Controls
6. Visualization Helpers
7. View modules (Network, Blueprint, Timeline, Map)
8. View Manager
9. Main script

### Import/Export Pattern
```javascript
// At end of each module
window.ModuleName = {
  publicFunction1,
  publicFunction2
};
```

## Testing Quick Commands

### Start Local Server
```bash
cd "c:\Users\usher\Code\music_machine"
python -m http.server 8000
```

### Test URLs
- Main app: `http://localhost:8000`
- Debug page: `http://localhost:8000/debug.html`
- Filter test: `http://localhost:8000/test-filter.html`

### Browser Console Tests
```javascript
// Check module loading
console.log(window.UIControls);
console.log(window.ViewManager);
console.log(window.NetworkView);

// Check current state
console.log(selectedWing);
console.log(filteredNodes.length);
console.log(filteredLinks.length);
```

## Key Architectural Decisions

### Why Reinitialize Views Instead of Incremental Updates?
- **Simplicity**: Easier to reason about and debug
- **Reliability**: Prevents state synchronization bugs
- **Performance**: D3.js handles reinitialization efficiently
- **Maintainability**: Clear separation of concerns

### Why Modular Instead of Monolithic?
- **Scalability**: Easy to add new view types
- **Maintainability**: Clear separation of concerns
- **Testability**: Each module can be tested independently
- **Collaboration**: Multiple developers can work on different modules

### Why Single Source of Truth in script.js?
- **Consistency**: Prevents conflicting state
- **Debugging**: Easy to trace state changes
- **Reliability**: Clear ownership of data
- **Predictability**: Always know where state lives

## Emergency Procedures

### If Filtering Stops Working:
1. Check browser console for errors
2. Verify all modules are loading
3. Check variable scope in callbacks
4. Ensure ViewManager is being used
5. Test with simple wing selection

### If Views Don't Switch:
1. Check ViewManager module loading
2. Verify view registration
3. Check callback parameter names
4. Ensure cleanup is happening

### If Performance Degrades:
1. Check for memory leaks in views
2. Verify simulations are stopping properly
3. Look for excessive reinitialization
4. Monitor browser performance tools

Remember: **When in doubt, follow the data flow!**
