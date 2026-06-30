// Fragment Shader
// This shader determines the color of each pixel

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_cameraPosition;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float fresnel;

void main() {
    // Normalize the normal vector
    vec3 normal = normalize(vNormal);
    
    // Create animated color gradient based on position and time
    // float colorMix1 = sin(vPosition.x * 2.0 + u_time) * 0.5 + 0.5;
    // float colorMix2 = cos(vPosition.y * 2.0 + u_time * 0.8) * 0.5 + 0.5;
    // float colorMix3 = sin(vPosition.z * 2.0 + u_time * 1.2) * 0.5 + 0.5;
    
    // Mix three colors based on position
    //vec3 color = vec3(0.0);
    //color = mix(color, u_color3, colorMix2);
    
    
    // Output final color with full opacity
    float alpha = clamp(fresnel, 0.0, 1.0);
    gl_FragColor = vec4(vec3(1.0), alpha);
}
