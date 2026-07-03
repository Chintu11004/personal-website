// Simple Vertex Shader for Fresnel Effect
// Passes world-space position and normal to the fragment shader

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

void main() {
    v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
