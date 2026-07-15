uniform sampler2D u_texture;
uniform float u_time;
uniform float u_fadeInDuration;
uniform float u_holdDuration;
uniform float u_fadeOutDuration;

varying vec2 v_uv;

void main() {
    vec4 tex = texture2D(u_texture, v_uv);
    if (tex.r < 0.01) discard;

    const float wipeSoftness = 1.0;
    const float radialSoftness = 5.0;
    const vec2 fadeOrigin = vec2(0.5, 1.0);
    const float maxRadialDist = 1.2;

    float fadeInEnd = u_fadeInDuration;
    float holdEnd = fadeInEnd + u_holdDuration;
    float fadeOutEnd = holdEnd + u_fadeOutDuration;

    float alpha = 0.0;

    if (u_time < fadeInEnd) {
        float progress = smoothstep(0.0, 1.0, u_time / u_fadeInDuration);
        float edge = progress * (1.0 + wipeSoftness);
        alpha = 1.0 - smoothstep(edge - wipeSoftness, edge, v_uv.x);
    } else if (u_time < holdEnd) {
        alpha = 1.0;
    } else if (u_time < fadeOutEnd) {
        float progress = smoothstep(0.0, 1.0, (u_time - holdEnd) / u_fadeOutDuration);
        float dist = distance(v_uv, fadeOrigin);
        float outerLimit = mix(maxRadialDist + radialSoftness, 0.0, progress);
        alpha = 1.0 - smoothstep(outerLimit - radialSoftness, outerLimit, dist);
    }

    gl_FragColor = vec4(tex.rgb, tex.a * alpha);
}
