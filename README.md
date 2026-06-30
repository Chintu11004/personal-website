# Three.js WebGL Cube with Custom Shaders

A boilerplate setup for a local website using Three.js with custom vertex and fragment shaders.

## Features

- ✨ Custom GLSL vertex and fragment shaders
- 🎨 Animated color gradients
- 🖱️ Interactive mouse controls (OrbitControls)
- 📱 Responsive design
- 🌊 Procedural wave effects
- 💡 Fresnel lighting effects

## Project Structure

```
.
├── index.html          # Main HTML file
├── style.css           # Styling
├── main.js             # Three.js scene setup
├── shaders/
│   ├── vertex.glsl     # Vertex shader
│   └── fragment.glsl   # Fragment shader
└── README.md           # This file
```

## How to Run

1. **Option 1: Python HTTP Server**
   ```bash
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000

2. **Option 2: Node.js HTTP Server**
   ```bash
   npx http-server -p 8000
   ```
   Then open http://localhost:8000

3. **Option 3: VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on index.html and select "Open with Live Server"

## Controls

- **Left Click + Drag**: Rotate around the cube
- **Right Click + Drag**: Pan the camera
- **Scroll**: Zoom in/out
- **Mouse Movement**: Affects shader colors and displacement

## Shader Uniforms

### Vertex Shader
- `u_time`: Elapsed time for animations
- `u_mouse`: Mouse position for interactions

### Fragment Shader
- `u_time`: Elapsed time for color animations
- `u_resolution`: Screen resolution
- `u_mouse`: Mouse position
- `u_color1`, `u_color2`, `u_color3`: Base colors for gradient

## Customization

### Change Colors
In `main.js`, modify the uniform values:
```javascript
u_color1: { value: new THREE.Color(0x00ffff) }, // Cyan
u_color2: { value: new THREE.Color(0xff00ff) }, // Magenta
u_color3: { value: new THREE.Color(0xffff00) }  // Yellow
```

### Adjust Cube Size
In `main.js`, change the BoxGeometry parameters:
```javascript
const geometry = new THREE.BoxGeometry(2, 2, 2); // width, height, depth
```

### Modify Wave Effect
In `shaders/vertex.glsl`, adjust the wave calculation:
```glsl
float wave = sin(position.x * 2.0 + u_time) * 
             cos(position.y * 2.0 + u_time) * 0.1; // amplitude
```

## Technologies

- **Three.js** (v0.163.0): WebGL library
- **GLSL**: OpenGL Shading Language for custom shaders
- **ES6 Modules**: Modern JavaScript imports

## Learn More

- [Three.js Documentation](https://threejs.org/docs/)
- [GLSL Shader Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [The Book of Shaders](https://thebookofshaders.com/)

## License

Free to use and modify!
