uniform sampler2D u_texture;
uniform float u_opacity;
uniform float u_selected;
uniform vec3 u_cameraPosition;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
varying vec2 v_uv;

void main() {
    vec4 texColor = texture2D(u_texture, v_uv);

    if (texColor.a < 0.01) {
        discard;
    }

    vec3 finalColor = texColor.rgb;
    float finalAlpha = texColor.a * u_opacity;

    gl_FragColor = vec4(finalColor, finalAlpha);
}
