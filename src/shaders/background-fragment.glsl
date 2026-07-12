uniform sampler2D u_texture;
uniform float u_opacity;

varying vec2 v_uv;

void main() {
    vec4 tex = texture2D(u_texture, v_uv);
    gl_FragColor = vec4(tex.rgb * vec3(0.8), tex.a * u_opacity);
}
