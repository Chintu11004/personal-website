// Sparkle particle vertex shader
// Drifts each point along aVector on the XY plane after spawn; fades and scales with life.

attribute float aBirthTime;
attribute float aSeed;
attribute vec2 aVector;

uniform float u_time;
uniform float u_lifetime;
uniform float u_speed;
uniform float u_size;

varying float vLife;
varying float vSeed;

void main() {
    float age = u_time - aBirthTime;
    vLife = 1.0 - clamp(age / u_lifetime, 0.0, 1.0);
    vSeed = aSeed;

    vec3 drift = vec3(aVector.x, aVector.y, 0.0) * age * u_speed;
    vec3 displaced = position + drift;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float size = u_size * (0.6 + 0.4 * aSeed) * vLife;
    gl_PointSize = size * (300.0 / -mvPosition.z);
}
