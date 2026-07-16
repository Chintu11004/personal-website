uniform sampler2D u_texture;
uniform float u_opacity;
uniform float u_selected;
uniform vec3 u_cameraPosition;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
varying vec2 v_uv;

void main() {
    vec4 tex = texture2D(u_texture, vec2(v_uv.x, v_uv.y));
    if (tex.a < 0.01) discard;

    // vec3 viewDir = normalize(u_cameraPosition - v_worldPosition);
    // float fresnel = pow(1.0 - abs(dot(normalize(v_worldNormal), viewDir)), 3.0);
    // vec3 glow = vec3(1.0) * fresnel * u_selected * 0.25;

    gl_FragColor = vec4(tex.rgb, tex.a * u_opacity);
}
