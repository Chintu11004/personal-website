// Sparkle particle fragment shader
// Soft radial glow with per-particle twinkle and lifetime fade.

uniform float u_time;

varying float vLife;
varying float vSeed;

void main() {
    if (vLife <= 0.0) discard;

    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    float twinkle = 0.35 + 0.65 * pow(
        0.5 + 0.5 * sin(u_time * (6.0 + vSeed * 10.0) + vSeed * 6.283),
        3.0
    );

    float glow = smoothstep(0.5, 0.0, dist);
    float alpha = glow * twinkle * vLife;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vec3(1.0), alpha);
}
