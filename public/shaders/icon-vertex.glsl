varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
varying vec2 v_uv;

void main() {
    v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * normal);
    v_uv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
