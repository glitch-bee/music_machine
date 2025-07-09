# Tag-Based Clustering Implementation Guide

## Overview
This document describes the tag-based clustering system implemented for the Music Machine network visualization.

## Implementation Details

### 1. Graph Structure Changes
- **Tag Nodes**: Created for each unique metadata tag across all albums
  - Core tags (defined in `core_tags.json`): Larger size (12px), orange color
  - Unique tags: Smaller size (6px), gray color
- **Tag Connections**: New link type `tag_connection` connecting albums to their tags

### 2. Core Components Updated

#### GraphConverter (`js/data/graph-converter.js`)
- Added async loading of core tags from `core_tags.json`
- Creates tag nodes with `isCore` property
- Connects each album to its metadata tags
- Populates tag nodes with references to associated albums

#### NetworkView (`js/views/network-view.js`)
- Updated force simulation to handle tag nodes
- Added clustering force to position core tags in a circle
- Styled tag nodes and connections distinctly
- Added stronger attraction for tag connections (0.7 strength, 40px distance)

#### UI Controls (`js/ui/controls.js`)
- Added "Tags" toggle button for tag connections
- Updated connection visibility system

### 3. Visual Design

#### Tag Nodes
- **Core tags**: Orange (#e17055), larger, glowing effect
- **Unique tags**: Gray (#636e72), smaller, subtle appearance
- **Labels**: Show tag names, sized appropriately

#### Tag Connections
- **Color**: Orange (#e17055)
- **Style**: Dashed lines (3,2 pattern)
- **Opacity**: 0.6 (moderate visibility)

### 4. Force Simulation Enhancements

#### Clustering Force
- Positions core tags in a circle around the center
- Radius: 30% of viewport size
- Creates natural clustering zones

#### Connection Strengths
- Tag connections: 0.7 strength, 40px distance (strong clustering)
- Core tag charge: -300 (strong repulsion, acts as cluster center)
- Unique tag charge: -100 (weaker repulsion)

### 5. User Interface

#### Connection Controls
New "Tags" button added to layer controls:
- Shows/hides all tag connections
- Integrated with existing connection visibility system

## Usage

### Viewing Tag Clusters
1. Open Network view
2. Ensure "Tags" button is active (orange)
3. Albums will cluster around shared tags
4. Core tags act as major clustering centers

### Hiding Tag Noise
- Toggle off "Tags" button to see clean album relationships
- Tag nodes remain visible but connections are hidden

### Identifying Tag Types
- **Orange nodes**: Core tags (reusable across albums)
- **Gray nodes**: Unique tags (specific to individual albums)

## Technical Notes

### Performance Considerations
- Tag nodes increase graph complexity
- Force simulation handles ~50+ nodes smoothly
- Clustering force runs on each tick (optimized)

### Future Enhancements
- Tag filtering by category
- Tag importance weighting
- 3D constellation view preparation
- Interactive tag highlighting

## Files Modified
- `js/data/graph-converter.js` - Tag node creation and connections
- `js/views/network-view.js` - Visualization and clustering forces
- `js/ui/controls.js` - Tag connection controls
- `index.html` - Tags toggle button
- `style.css` - Tag node styling
- `script.js` - Async graph loading

## Testing
The tag-based clustering creates meaningful visual groupings where:
1. Albums sharing core tags cluster together
2. Core tags act as gravitational centers
3. Unique tags appear as satellite nodes
4. Visual hierarchy clearly distinguishes tag types

This foundation supports future constellation/universe-style visualizations with established tag relationships and clustering behaviors.
