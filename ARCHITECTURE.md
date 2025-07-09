# Music Machine Architecture Documentation

## Overview
This document explains the current working architecture of the Music Machine project and the critical decisions that make the filtering system work properly.

## Core Architecture Principles

### 1. Modular Design with Clear Separation of Concerns

The project is structured into distinct modules:
- **Data Layer**: `DataLoader`, `GraphConverter`
- **View Layer**: `NetworkView`, `BlueprintView`, `TimelineView`, `MapView`
- **Control Layer**: `UIControls`
- **Utility Layer**: `WingClassifier`, `VisualizationHelpers`
- **Orchestration Layer**: `ViewManager`, `script.js`

### 2. Data Flow Architecture

The data flows in a specific pattern that **must be maintained**:

```
User Input → UIControls → script.js callbacks → applyFilters() → updateCurrentView() → ViewManager → Specific View
```

**CRITICAL**: Never bypass this flow by directly manipulating DOM elements from script.js.

## Key Components and Their Roles

### script.js (Main Orchestrator)
- **Purpose**: Coordinates between all modules and manages application state
- **Key Responsibilities**:
  - Manages global state variables (`albums`, `graph`, `searchTerm`, `selectedWing`, etc.)
  - Handles data loading and initialization
  - Provides callbacks to UIControls
  - Manages filtering logic
  - Coordinates view updates

### UIControls Module
- **Purpose**: Handles all user interface interactions
- **Key Responsibilities**:
  - Sets up event listeners for all controls
  - Provides filtering logic (`applyFilters()`)
  - Manages connection visibility
  - **IMPORTANT**: Only handles the logic, does NOT directly update views

### ViewManager Module
- **Purpose**: Manages different visualization views
- **Key Responsibilities**:
  - Registers and switches between different view types
  - Provides clean API for view management
  - Handles view initialization with context data

### NetworkView Module
- **Purpose**: Implements the network graph visualization
- **Key Responsibilities**:
  - Renders the force-directed graph
  - Handles filtered data properly
  - Manages connection visibility in rendering

## Critical Implementation Details

### 1. Variable Scope Management

**WORKING PATTERN**:
```javascript
// Global state in script.js
let searchTerm = '';
let selectedWing = 'all';

// Callback functions update local variables
onWingFilterChange: (newSelectedWing) => {
  selectedWing = newSelectedWing;  // ✅ Updates local variable
  applyFilters();
}
```

**BROKEN PATTERN (DON'T DO THIS)**:
```javascript
onWingFilterChange: (selectedWing) => {
  window.selectedWing = selectedWing;  // ❌ Creates window property
  applyFilters();
}
```

**WHY**: The filtering functions expect local variables, not window properties.

### 2. Filtering Data Flow

**WORKING PATTERN**:
```javascript
function applyFilters() {
  // 1. Get filtered data from UIControls
  const filtered = UIControls.applyFilters(graph, searchTerm, selectedWing);
  
  // 2. Update global filtered state
  filteredNodes = filtered.filteredNodes;
  filteredLinks = filtered.filteredLinks;
  
  // 3. Update view through proper channels
  updateCurrentView();
}

function updateCurrentView() {
  // 4. Pass filtered data to view system
  ViewManager.handleViewModeChange(currentView, {
    graph: graph,
    filteredData: { nodes: filteredNodes, links: filteredLinks },
    // ... other context
  });
}
```

**BROKEN PATTERN (DON'T DO THIS)**:
```javascript
function applyFilters() {
  // ❌ Direct DOM manipulation
  svg.selectAll("circle").style("display", d => shouldShow(d) ? "block" : "none");
}
```

**WHY**: Direct DOM manipulation bypasses the view system and breaks when views are reinitialized.

### 3. View Data Handling

**WORKING PATTERN** (in NetworkView):
```javascript
function initialize(context = {}) {
  const { graph, filteredData, connectionVisibility } = context;
  
  // Use filtered data if available, otherwise full graph
  const displayGraph = filteredData || graph;
  
  // Render with proper data
  drawLinks(mainGroup, displayGraph, connectionVisibility);
  drawNodes(mainGroup, displayGraph);
}
```

**WHY**: This allows views to work with both filtered and unfiltered data seamlessly.

### 4. Connection Visibility Integration

**WORKING PATTERN** (in NetworkView drawLinks):
```javascript
.style("display", d => connectionVisibility && connectionVisibility[d.type] ? "block" : "none")
```

**WHY**: Connection visibility is handled at render time, not through post-render manipulation.

## State Management Rules

### 1. Single Source of Truth
- All application state lives in `script.js`
- Other modules receive state through function parameters
- No module should maintain its own copy of shared state

### 2. Unidirectional Data Flow
- User interactions → UIControls → script.js → ViewManager → Views
- Never skip steps in this chain
- Never have views directly modify global state

### 3. Immutable Updates
- Always create new filtered data objects
- Don't modify original graph data
- Pass copies to views, not references

## Common Pitfalls and Solutions

### Pitfall 1: Direct DOM Manipulation
**Problem**: Trying to update visualization by directly selecting SVG elements
**Solution**: Always go through the view system with proper data

### Pitfall 2: Variable Scope Confusion
**Problem**: Using `window.variableName` instead of local variables
**Solution**: Maintain clear variable scope and use parameter passing

### Pitfall 3: Bypassing the View System
**Problem**: Updating visualization without reinitializing views
**Solution**: Always use `ViewManager.handleViewModeChange()` for updates

### Pitfall 4: State Synchronization Issues
**Problem**: Multiple sources of truth for the same data
**Solution**: Single source of truth in script.js, passed to other modules

## Testing the Architecture

### Key Test Cases:
1. **Wing Filter Test**: Select different wings, verify only relevant nodes show
2. **Search Test**: Type in search box, verify filtering works
3. **Connection Toggle Test**: Toggle connection types, verify visibility changes
4. **View Switch Test**: Switch between views, verify filtering persists
5. **Combined Filter Test**: Use multiple filters simultaneously

### Debug Checklist:
- [ ] Are callbacks properly updating local variables?
- [ ] Is `applyFilters()` being called after filter changes?
- [ ] Is `updateCurrentView()` being called after filtering?
- [ ] Is filtered data being passed to views?
- [ ] Are views using filtered data in rendering?

## Future Development Guidelines

### When Adding New Features:
1. **Identify the layer**: Which module should handle this?
2. **Follow data flow**: How does data move through the system?
3. **Update all layers**: Don't skip steps in the data flow
4. **Test filtering**: Ensure new features work with existing filters

### When Debugging:
1. **Check variable scope**: Are the right variables being updated?
2. **Trace data flow**: Follow data from user input to rendering
3. **Verify view updates**: Is the view system being used properly?
4. **Check state consistency**: Is there a single source of truth?

## Module Dependencies

```
script.js
├── DataLoader
├── GraphConverter
├── UIControls
├── ViewManager
│   ├── NetworkView
│   ├── BlueprintView
│   ├── TimelineView
│   └── MapView
├── VisualizationHelpers
└── WingClassifier
```

**IMPORTANT**: Never create circular dependencies. Keep the dependency tree clean and unidirectional.

## Performance Considerations

### Why This Architecture is Efficient:
1. **Lazy Updates**: Views only update when necessary
2. **Filtered Data**: Only render what's needed
3. **Modular Loading**: Components load independently
4. **Memory Management**: Views clean up properly

### Performance Monitoring:
- Watch for excessive view reinitializations
- Monitor filtering performance with large datasets
- Check memory usage during view switches

## Conclusion

The current architecture works because it maintains clear separation of concerns, follows unidirectional data flow, and properly handles state management. The key is to always work WITH the system, not around it. When in doubt, follow the data flow and use the proper APIs rather than trying to shortcut the process.

**Remember**: The complexity exists for a reason. Each layer serves a specific purpose in maintaining a scalable, maintainable codebase.
