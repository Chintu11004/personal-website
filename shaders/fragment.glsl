// Fragment Shader

uniform vec3 u_cameraPosition;
uniform float u_fresnelBias;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

void main() {
    vec3 normWorld = normalize(v_worldNormal);
    vec3 viewDirection = normalize(u_cameraPosition - v_worldPosition);
    float fresnel = u_fresnelBias + (1.0-u_fresnelBias) * pow(1.0 - clamp(abs(dot(normWorld, viewDirection)), 0.0, 1.0), 5.0);
    float alpha = clamp(fresnel, 0.0, 1.0);
    //alpha = clamp(mix(0.5, 1.0, alpha) - 0.5, 0.0, 1.0);
    gl_FragColor = vec4(vec3(1.0), alpha);
}
