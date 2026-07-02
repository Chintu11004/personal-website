// Vertex Shader
// This shader transforms vertex positions from model space to screen space

uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_cameraPosition;
uniform float u_noiseScale;
uniform float u_displacement;
uniform float u_amplitude;
uniform float u_planeWidth;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float fresnel;

vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return normalize(fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0);
}

float gradientNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(
            mix(dot(hash33(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                dot(hash33(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
            mix(dot(hash33(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                dot(hash33(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
        mix(
            mix(dot(hash33(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                dot(hash33(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
            mix(dot(hash33(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                dot(hash33(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
        value += amplitude * gradientNoise(p);
        p = p * 2.2 + vec3(100.7, 47.3, 29.1);
        amplitude *= 0.50;
    }
    return value;
}

void main() {
    const float TWO_PI = 6.2832;

    // we want to bend the plane along a sin curve and animate with time
    float u = uv.x * TWO_PI - u_time * .5;
    float omega = TWO_PI/u_planeWidth; // we need this becuz chainrule

    vec3 newPosition = vec3(position.x, position.y, u_amplitude * sin(u));
    vec3 rd = vec3(1, 1, omega * u_amplitude * cos(u));
    vec3 T = normalize(rd);
    
    vec3 newNormal = normalize(cross(normal, T));


    // we add noise now
    // we want to calculate two diff noise patterns at any time. Then lerp between them
    // in a three second interval
    float interval = floor(u_time / 3.0);
    float t = mod(u_time, 3.0) / 3.0; // normalize our t value (our lerp parameter)

    vec3 samplePos = position * u_noiseScale + vec3(47.3, 83.1, 12.7);

    // pattern A
    vec3 offsetA = vec3(interval * 123.4, interval * 456.7, interval * 789.1);
    float heightA = fbm(samplePos + offsetA);

    // pattern B
    ++interval;
    vec3 offsetB = vec3(interval * 123.4, interval * 456.7, interval * 789.1);
    float heightB = fbm(samplePos + offsetB);

    // lerp between the two heights
    float finalHeight = mix(heightA, heightB, smoothstep(0.0, 1.0, t));

    newPosition += normal * finalHeight * u_displacement;

    vPosition = newPosition;
    vNormal = normalize(normalMatrix * newNormal);
    vUv = uv;

    vec3 posWorld = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vec3 normWorld = normalize(mat3(modelMatrix) * newNormal);

    vec3 viewDirection = normalize(-posWorld + vec3(posWorld.x, u_cameraPosition.y, u_cameraPosition.z));
    fresnel = 0.0 + 0.001 * pow(1.0 - dot(normWorld, viewDirection), 10.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
