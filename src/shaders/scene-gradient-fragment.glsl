// Matches App.css radial-gradient:
// ellipse 150% 120% at 75% 20%, #000a5b 0%, #000a5b 20%, #3357b7 100%

uniform float u_opacity;

varying vec2 v_uv;

void main() {
    vec2 center = vec2(0.8, 0.9);
    vec2 topSeed = vec2(0.5, 1.0);
    vec2 botSeed = vec2(0.5, 0.0);

    float distTop = length(v_uv - topSeed);
    float distBot = length(v_uv - botSeed);

    float radius = u_opacity * 2.0;
    float softness = 1.0;

    float revealTop = 1.0 - smoothstep(radius - softness, radius, distTop);
    float revealBot = 1.0 - smoothstep(radius - softness, radius, distBot);

    float reveal = max(revealTop, revealBot);

    vec2 diff = v_uv - center;
    float dist = length(vec2(diff.x / 2.0, diff.y / 1.7));

    vec3 inner = vec3(0.0, 0.0392157, 0.3568627); // #000a5b — rgb(0, 10, 91)
    vec3 outer = vec3(0.2, 0.3411765, 0.7176471);   // #3357b7 — rgb(51, 87, 183)

    float t = clamp((dist - 0.2) / 0.8, 0.0, 1.0);
    vec3 color = mix(inner, outer, t);

    if (u_opacity <= 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    gl_FragColor = vec4(mix(vec3(0.0), color, reveal), 1.0);
}