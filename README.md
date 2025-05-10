# GalaxiX - 3D Space Visualization

![GalaxiX](public/satellite-favicon.png)

GalaxiX is an interactive 3D visualization project that simulates celestial bodies including Earth, Moon, Sun, and a satellite in orbit. Built with Three.js, this application provides an immersive space environment with realistic textures, animations, and audio effects.

## Documentation

This project includes comprehensive documentation split into several files for easier navigation:

- [Project Structure](./project-structure.md) - Overview of the file organization and component relationships
- [Technical Documentation](./technical-documentation.md) - Detailed code implementation and architecture
- [User Guide](./user-guide.md) - Installation instructions and usage information

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Features

- **Realistic Earth** with day/night textures, cloud layer, and atmospheric glow
- **Orbiting satellite** with realistic 3D model
- **Moon and Sun** with accurate textures and orbital mechanics
- **Interactive controls** for camera navigation
- **Ambient space audio** for an immersive experience
- **Debug UI** for toggling visualization options

## Technologies

- **Three.js** - 3D rendering engine
- **lil-gui** - Debug interface
- **Vite** - Build tool and development server

## Project Structure Highlights

```
Scientific-Calculations-Project/
├── src/
│   ├── js/           # Core functionality modules
│   ├── planets/      # Celestial body implementations
│   └── main.js       # Application entry point
├── public/
│   ├── models/       # 3D models (GLTF)
│   ├── textures/     # Image textures
│   └── audios/       # Sound files
└── index.html        # HTML entry point
```

For a complete breakdown of the project structure and implementation details, please refer to the documentation files linked above.

## Scientific Calculations

The project implements various scientific principles including:

- Orbital mechanics for satellite and moon movement
- Earth rotation with proper axial tilt (23.5°)
- Atmospheric light scattering simulation
- Directional lighting physics

## License

The project uses assets under various licenses:

- Satellite model: CC-BY-4.0 by DjalalxJay
- Planet textures: NASA imagery (public domain)

## Acknowledgements

- Three.js community for the powerful 3D library
- NASA for planetary textures and reference materials
- Contributors to the open-source libraries used in this project
