# Music Machine

An interactive visualization project that reimagines music albums as functional components in a vast, interconnected mechanical system. Rather than ranking or categorizing music traditionally, the Music Machine explores how albums function as specialized system modules with specific roles, connections, and purposes.

## Core Concept

The Music Machine treats music albums as **mechanical modules** in a living, breathing system where:
- Each album serves a specific functional purpose within the machine
- Albums are interconnected through shared metadata tags and characteristics
- The system grows organically as new albums are added
- No component is considered more important than another - each has its role

## Current Features

### 🔧 **Tag-Based Clustering System**
Albums are analyzed through a **constrained metadata vocabulary** using:
- **Core tags** (shared across multiple albums) that create natural clustering
- **Unique tags** (album-specific) that add personality without isolation
- **Force-directed visualization** where albums cluster around shared concepts
- **57 carefully curated core tags** spanning function, energy, emotion, structure, and more

### 🎛️ **Multiple Viewing Modes**
- **Network View**: Interactive force-directed graph showing album relationships
- **Blueprint View**: Technical radial cluster layout resembling machine schematics
- **Wing-Based Organization**: Albums automatically categorized into operational wings

### 🔍 **Interactive Exploration**
- **Wing filtering** - Focus on specific parts of the machine
- **Connection controls** - Toggle different relationship types
- **Search functionality** - Find specific albums or artists
- **Responsive tooltips** - Detailed information on hover

## Five Analytical Lenses

Each album is analyzed through five distinct perspectives:

1. **Core Drive** - Primary energy/philosophy powering the album
2. **Structural Tension** - Dynamics and forces holding the album together
3. **Emotional Output** - Feelings and effects the album produces
4. **Environmental Context** - Album's place in the broader musical landscape
5. **Subsystem Role** - Functional role within the Music Machine

## Wing Classifications

Albums are automatically organized into specialized operational wings:

- 🌌 **Atmospheric Processing Wing** - Ambient, spatial, environmental processing
- 🚀 **Propulsion Systems Wing** - Engines, drives, rhythmic synchronization
- 💾 **Memory & Storage Wing** - Buffers, archives, recall systems
- ⚙️ **Processing & Analysis Wing** - Computational processing, pattern analysis
- 🧪 **Testing & Experimental Wing** - Stress testing, experimental protocols

## Technical Architecture

### Modern Modular Design
- **Clean separation of concerns** with specialized modules
- **Data-driven visualization** using D3.js force simulations
- **Scalable architecture** ready for hundreds of albums
- **Responsive design** that works across devices

### Core Components
- **DataLoader** - Handles album and tag data loading
- **GraphConverter** - Transforms album data into network graphs
- **ViewManager** - Orchestrates different visualization modes
- **UIControls** - Manages user interactions and filtering
- **WingClassifier** - Automatically categorizes albums into wings

## Current Dataset

The system currently includes **carefully analyzed albums** across multiple genres and eras, each tagged with:
- **3-5 metadata tags** (mix of core and unique tags)
- **Detailed analytical descriptions** across all five lenses
- **Wing classification** based on functional role
- **Rich contextual information** about musical relationships

## Tag-Based Connections

The heart of the system is the **metadata tag network**:
- **Core tags** like "oscillator", "coolant", "feedback_loop" create natural clusters
- **Shared tags** between albums create meaningful connections
- **Force simulation** pulls albums toward their shared concepts
- **Visual hierarchy** distinguishes core tags from unique descriptors

## Installation & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/music_machine.git
   cd music_machine
   ```

2. **Start a local server**
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

4. **Explore the machine**
   - Use the view selector to switch between visualization modes
   - Try wing filtering to focus on specific machine components
   - Toggle connection types to see different relationship layers
   - Search for specific albums or artists

## Future Vision

The long-term goal is to evolve this into a **3D constellation universe** where:
- Albums exist as stars in an explorable musical cosmos
- Shared tags create gravitational clusters and orbital relationships
- Users can navigate through interconnected musical galaxies
- The system supports thousands of albums in an immersive 3D space

Inspired by visualizations like the [UNESCO Intangible Cultural Heritage constellation](https://ich.unesco.org/dive/constellation/?language=en), the ultimate vision is a living, breathing musical universe where discovery happens through exploration rather than search.

## Contributing

This project represents a unique approach to music analysis that combines:
- **Technical visualization** with **poetic interpretation**
- **Systematic analysis** with **organic discovery**
- **Individual albums** with **collective relationships**
- **Current functionality** with **future possibilities**

The system is designed to grow organically as new albums are analyzed and added to the machine.

## Architecture Documentation

For developers interested in the technical implementation:
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture and design patterns
- **[FILTERING_SYSTEM.md](FILTERING_SYSTEM.md)** - Deep dive into the filtering implementation
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Developer cheat sheet and debugging guide
- **[FUTURE.md](FUTURE.md)** - Long-term vision and development roadmap

## License

This project is a creative exploration of music visualization and analysis. See LICENSE for details.

---

*The Music Machine is more than a visualization - it's a new way of understanding how music connects, functions, and evolves within a living system. Each album has its purpose, each connection has meaning, and the machine grows stronger with every