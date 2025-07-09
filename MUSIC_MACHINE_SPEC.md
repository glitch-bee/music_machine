# Music Machine Data Specification

## Overview

The Music Machine visualizes albums as functional modules in a vast, interconnected system. Each album is analyzed through five core analytical lenses and cataloged with specific metadata to show its role and connections within the machine.

## Core Philosophy

Albums are **never ranked** - instead, each is cataloged as a unique, interlocking module with specific functions, inputs, and outputs. The conversation interprets music as architectural, mechanical, and emotional systems working together.

## Data Structure

### Required Fields

Each album must be structured as a JSON object with the following required fields:

```json
{
  "title": "string",
  "artist": "string", 
  "year": "integer",
  "core_drive": "string",
  "structural_tension": "string",
  "emotional_output": "string",
  "environmental_context": "string",
  "subsystem_role": "string",
  "metadata_tags": ["array", "of", "strings"]
}
```

### Field Definitions

#### **title** (string)
- The album's official title
- Use exact spelling and capitalization
- Example: `"OK Computer"`

#### **artist** (string)
- Primary artist or band name
- Use most commonly recognized name
- Example: `"Radiohead"`

#### **year** (integer)
- Original release year
- Use 4-digit format
- Example: `1997`

#### **core_drive** (string)
- The primary energy, philosophy, or design principle powering the album
- Should describe the fundamental motivation or force behind the work
- Example: `"Technological alienation anxiety"`

#### **structural_tension** (string)
- The dynamics, constraints, or logic holding the album's form together
- Often describes opposing forces or creative tensions
- Example: `"Organic instrumentation vs digital paranoia"`

#### **emotional_output** (string)
- The emotional states, behaviors, or effects the album produces
- Focus on what the listener experiences or system generates
- Example: `"Existential dread with cathartic release"`

#### **environmental_context** (string)
- The album's relationship to the broader musical landscape
- Includes influences, movements, historical context
- Example: `"Pre-millennium tech dystopia emergence"`

#### **subsystem_role** (string)
- The album's functional role within the overall Music Machine
- Describes what mechanical/systemic function it serves
- Example: `"Anxiety processor and social mirror"`

#### **metadata_tags** (array of strings)
- Descriptive tags that enable machine-level connections
- Use machine-oriented terminology when possible
- Tags with 2+ matches create thematic connections in visualization
- Example: `["legacy_pulse_engine", "emotive_mechanism", "paranoia_module"]`

## Metadata Tag Categories

### System Components
- `deep_space_module` - Ambient/atmospheric processing units
- `engine_sync_core` - Rhythmic synchronization systems
- `analog_buffer` - Lo-fi/vintage processing modules
- `memory_bank` - Nostalgic or retrospective components

### Functional Modules
- `self_healing_loop` - Self-repairing/maintenance systems
- `adrenaline_module` - Energy/intensity boosters
- `beauty_under_stress` - Aesthetic processing under pressure
- `recursive_aggression` - Self-referential intensity systems

### Processing States
- `modulated_stillness` - Calm/meditative processing modes
- `reckless_balance` - Controlled chaos states
- `calibrated_awe` - Precision wonder generation
- `structural_urgency` - High-pressure operational modes

### Architectural Elements
- `harmonic_mapping` - Frequency/tonal organization
- `compressed_recall` - Memory compression systems
- `load_bearing_beauty` - Structural aesthetic support
- `genre_shredder` - Cross-genre processing units

### Specialized Functions
- `ambient_orbit` - Circular/cyclical processing
- `post_rock_precision` - Engineered crescendo systems
- `glitchcore_sync` - Error-state synchronization
- `collision_protocol` - System conflict resolution

## Machine Wing Architecture

The Music Machine is organized into specialized wings, each handling different aspects of the system's operation. Albums are automatically classified into wings based on their subsystem roles and metadata tags.

### Wing Classifications

#### **Atmospheric Processing Wing** (Light Blue - #74b9ff)
- **Function**: Ambient processing, atmospheric observation, spatial awareness
- **Includes**: Deep space modules, atmospheric sensors, beauty processing units
- **Keywords**: space, atmospheric, ambient, ascent, beauty, observation
- **Example**: Solar Fields - Movements (Deep Space Observation Module)

#### **Propulsion Systems Wing** (Pink - #fd79a8)
- **Function**: Energy generation, rhythmic synchronization, drive systems
- **Includes**: Engines, drives, sync cores, propulsion units
- **Keywords**: engine, drive, sync, propulsion, core, structural_urgency
- **Example**: Battle Tapes - Form (Drive Unit / Engine Sync Core)

#### **Memory & Storage Wing** (Gold - #fdcb6e)
- **Function**: Data storage, recall systems, buffer management
- **Includes**: Memory buffers, archives, recall systems, storage units
- **Keywords**: buffer, memory, storage, archive, recall, compressed, analog
- **Example**: The Strokes - Is This It (Analog Memory Buffer)

#### **Processing & Analysis Wing** (Green - #00b894)
- **Function**: Computational processing, pattern analysis, resonance processing
- **Includes**: Processors, resonance engines, analysis units, computational cores
- **Keywords**: processor, resonance, fractal, analysis, computational, precision, calibrated
- **Example**: PG.Lost - Oscillate (Fractal Resonance Engine)

#### **Testing & Experimental Wing** (Purple - #a29bfe)
- **Function**: System testing, stress analysis, experimental protocols
- **Includes**: Stress units, debug systems, experimental protocols, test environments
- **Keywords**: stress, test, debug, experimental, protocol, glitch, collision, chaos
- **Example**: The Algorithm - Brute Force (Protocol Stress Unit)

### Wing Connection Rules

#### **Intra-Wing Connections** (Green dashed)
- Albums within the same wing connect through shared metadata tags
- Requires only 1+ shared tags for connection
- Represents functional cooperation within wing specialization

#### **Inter-Wing Connections** (Pink long-dashed)
- Albums from different wings connect through strong thematic overlap
- Requires 2+ shared metadata tags for connection
- Represents cross-wing collaboration and data sharing

#### **Functional Bridges** (Gold medium-dashed)
- Purpose-built connections between complementary wing functions
- Atmospheric ↔ Processing, Propulsion ↔ Testing, Memory ↔ Atmospheric
- Based on subsystem role compatibility

#### **Hub Bridges** (Purple heavy-dashed)
- Major system connections between wing control centers
- Enables high-level coordination between wing operations
- Predefined connections for optimal machine architecture

### Wing Hub System
Each wing has a central hub node that:
- Coordinates all albums within the wing
- Manages inter-wing communications
- Provides wing-level system status
- Displays wing specialization and album count in tooltips

## Best Practices

### Writing Guidelines
1. **Use mechanical/systemic language** for subsystem roles
2. **Describe processes and functions** rather than subjective opinions
3. **Focus on what the album does** rather than how good it is
4. **Think architecturally** - how does this component fit in the machine?

### Metadata Tag Strategy
1. **Reuse existing tags** to create connections
2. **Create new tags** for unique functions
3. **Use consistent naming** (snake_case preferred)
4. **Aim for 2-4 tags** per album for optimal connections

### Connection Logic
- Albums with identical `subsystem_role` get functional similarity connections
- Albums with 2+ shared `metadata_tags` get thematic connections
- All albums connect to their artists via "creates" relationships

## Example Entry

```json
{
  "title": "Kid A",
  "artist": "Radiohead", 
  "year": 2000,
  "core_drive": "Disruption of tradition, digital anxiety, searching for new sonic ground",
  "structural_tension": "Minimalism vs. chaos; analog warmth vs. digital coldness",
  "emotional_output": "Alienation, awe, introspection, surreal wonder",
  "environmental_context": "Post-millennial experimental rock, electronic, and ambient traditions",
  "subsystem_role": "Feedback engine, transformative catalyst, memory destabilizer",
  "metadata_tags": ["legacy_pulse_engine", "emotive_mechanism", "debug_mode"]
}
```

## Future Expansion

### Planned Features
- Genre-based clustering
- Temporal connections (year-based relationships)
- Influence mapping (albums that influenced each other)
- Intensity scaling (dynamic node sizes based on impact)

### Data Export
- System should be able to export all cataloged albums as single JSON array
- Import functionality for batch adding albums
- Backup/restore capabilities for machine state

---

*This specification ensures consistency in cataloging albums as functional modules within the Music Machine ecosystem.*
