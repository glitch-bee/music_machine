# Music Machine Data Structure

This folder contains the album catalog for the Music Machine visualization, organized into thematic JSON files.

## File Organization

### Core Albums (`core_albums.json`)
The foundational modules of the machine - essential albums that define major subsystems:
- **Solar Fields - Movements** (Deep Space Observation Module)
- **Battle Tapes - Form** (Drive Unit / Engine Sync Core)  
- **The Strokes - Is This It** (Analog Memory Buffer)
- **PG.Lost - Oscillate** (Fractal Resonance Engine)
- **If These Trees Could Talk - Bones of a Dying World** (Ascent Engine)

### Experimental Albums (`experimental_albums.json`)
Albums that test system boundaries and explore edge cases:
- **The Algorithm - Brute Force** (Protocol Stress Unit)

## Adding New Albums

### Individual Album Files
Create new JSON files for specific themes or batches:
- `electronic_albums.json` - For synth/electronic modules
- `ambient_albums.json` - For atmospheric processing units
- `metal_albums.json` - For high-intensity system components
- `indie_albums.json` - For alternative processing modules

### File Format
Each JSON file should contain an array of album objects following the Music Machine specification:

```json
[
  {
    "title": "Album Title",
    "artist": "Artist Name",
    "year": 2023,
    "core_drive": "Description of primary energy/philosophy",
    "structural_tension": "Description of internal dynamics",
    "emotional_output": "Description of listener/system effects",
    "environmental_context": "Description of musical landscape position",
    "subsystem_role": "Description of machine function",
    "metadata_tags": ["tag1", "tag2", "tag3"]
  }
]
```

## File Naming Convention
- Use lowercase with underscores: `theme_albums.json`
- Keep filenames descriptive but concise
- Group related albums by theme, genre, or function

## Loading Process
All JSON files in this directory are automatically loaded and merged by the visualization system.

## Future Integration
This structure is designed to easily integrate with:
- Database systems (Supabase, etc.)
- API endpoints for dynamic loading
- Batch import/export tools
- Version control for album history
