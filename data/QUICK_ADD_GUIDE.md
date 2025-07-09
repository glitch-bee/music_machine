# Quick Album Addition Guide

## Adding New Albums to the Music Machine

### Step 1: Choose or Create a JSON File
- Use existing files: `core_albums.json`, `experimental_albums.json`
- Or create new themed files: `indie_albums.json`, `electronic_albums.json`, etc.

### Step 2: Use the Template
Copy from `template_albums.json` and modify:

```json
[
  {
    "title": "Your Album Title",
    "artist": "Artist Name",
    "year": 2023,
    "core_drive": "What drives this album? What's its primary energy?",
    "structural_tension": "What holds it together? What are the opposing forces?",
    "emotional_output": "What does it make you feel? What does it do to the listener?",
    "environmental_context": "Where does it fit in music history? What influenced it?",
    "subsystem_role": "What job does it do in the Music Machine?",
    "metadata_tags": [
      "functional_tag",
      "architectural_tag", 
      "processing_tag"
    ]
  }
]
```

### Step 3: Add to File List
Edit `script.js` and add your new file to the `dataFiles` array:

```javascript
const dataFiles = [
  'data/core_albums.json',
  'data/experimental_albums.json',
  'data/your_new_file.json'  // Add this line
];
```

### Step 4: Refresh and Test
- Save your changes
- Refresh the webpage
- New albums should appear in the visualization

## Quick Tips
- **Reuse metadata tags** to create connections between albums
- **Keep subsystem roles descriptive** - think mechanically
- **5 albums per file** is a good batch size
- **Use consistent naming** for files and tags
