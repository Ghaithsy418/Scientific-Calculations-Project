# GalaxiX - User Guide

## Installation and Setup

### Prerequisites

- Node.js (version 18.0.0 or higher)
- npm (version 8.0.0 or higher)

### Getting Started

1. Clone or download the project repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## User Interface

### Navigation Controls

The application uses OrbitControls from Three.js, which provides the following controls:

- **Rotate View**: Click and drag with the left mouse button
- **Pan View**: Click and drag with the right mouse button or hold Ctrl/Cmd while dragging
- **Zoom**: Use the mouse wheel or pinch gesture on touchscreens
- **Reset View**: Double-click with the left mouse button

### Debug UI

The application includes a debug panel (powered by lil-gui) in the top-right corner that allows you to:

- Toggle the visibility of the satellite orbit path
- Adjust audio settings (volume, mute)
- Modify other visualization parameters

## Features

### Celestial Bodies

#### Earth

- Realistic day/night textures that change based on lighting
- Cloud layer with semi-transparency
- Atmospheric glow effect
- Accurate axial tilt (23.5°)

#### Moon

- Orbits around the Earth
- Realistic surface texture

#### Sun

- Provides directional lighting for the scene
- Realistic solar texture

### Satellite

- Orbits around the Earth on a customizable path
- Realistic 3D model
- Automatically orients to face the Earth

### Audio

- Ambient space soundtrack that enhances the immersive experience
- Audio controls accessible through the debug UI

## Exploring the Simulation

### Understanding Orbital Mechanics

The satellite follows a circular orbit around the Earth. The orbit is visualized as a white line that can be toggled on/off using the debug UI.

### Observing Day/Night Cycle

As the Earth rotates, you can observe the transition between day and night sides. The night side shows city lights and other illuminated features.

### Atmospheric Effects

The Earth has a subtle blue atmospheric glow that is more visible when viewed from certain angles, simulating the scattering of light in a planetary atmosphere.

## Troubleshooting

### Performance Issues

If you experience performance issues:

1. Close other resource-intensive applications
2. Try using a different browser (Chrome or Firefox recommended)
3. Ensure your graphics drivers are up to date

### Display Problems

If textures or models don't load correctly:

1. Check your internet connection (for initial loading)
2. Clear your browser cache
3. Ensure WebGL is enabled in your browser

### Audio Issues

If you don't hear the background audio:

1. Check if your system volume is turned on
2. Verify that the audio is not muted in the debug UI
3. Click somewhere on the page (some browsers require user interaction before playing audio)

## Extending the Project

Developers interested in extending the project can:

1. Add new celestial bodies by creating new classes in the planets directory
2. Modify orbital parameters in the animation functions
3. Add new textures to the textures directory
4. Implement additional UI controls through the lil-gui interface

## Credits

- Planet textures: NASA imagery
- Satellite model: DjalalxJay (CC-BY-4.0)
- Three.js: https://threejs.org/
- lil-gui: https://lil-gui.georgealways.com/
