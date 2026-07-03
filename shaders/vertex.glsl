// Vertex Shader
// This shader transforms vertex positions from model space to screen space

uniform float u_time;
uniform vec3 u_noiseScale;
uniform float u_displacement;
uniform float u_amplitude;
uniform float u_planeWidth;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

struct NoiseDerivative {
    float value;
    vec3 derivative;
};

vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return normalize(fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0);
}

NoiseDerivative gradientNoiseWithDerivative(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    // Smoothstep and its derivative
    vec3 u = f * f * (3.0 - 2.0 * f);
    vec3 du = 6.0 * f * (1.0 - f);
    
    // Get 8 corner gradients
    vec3 g000 = hash33(i + vec3(0.0, 0.0, 0.0));
    vec3 g100 = hash33(i + vec3(1.0, 0.0, 0.0));
    vec3 g010 = hash33(i + vec3(0.0, 1.0, 0.0));
    vec3 g110 = hash33(i + vec3(1.0, 1.0, 0.0));
    vec3 g001 = hash33(i + vec3(0.0, 0.0, 1.0));
    vec3 g101 = hash33(i + vec3(1.0, 0.0, 1.0));
    vec3 g011 = hash33(i + vec3(0.0, 1.0, 1.0));
    vec3 g111 = hash33(i + vec3(1.0, 1.0, 1.0));
    
    // Compute dot products at corners
    float v000 = dot(g000, f - vec3(0.0, 0.0, 0.0));
    float v100 = dot(g100, f - vec3(1.0, 0.0, 0.0));
    float v010 = dot(g010, f - vec3(0.0, 1.0, 0.0));
    float v110 = dot(g110, f - vec3(1.0, 1.0, 0.0));
    float v001 = dot(g001, f - vec3(0.0, 0.0, 1.0));
    float v101 = dot(g101, f - vec3(1.0, 0.0, 1.0));
    float v011 = dot(g011, f - vec3(0.0, 1.0, 1.0));
    float v111 = dot(g111, f - vec3(1.0, 1.0, 1.0));
    
    // Trilinear interpolation for value
    float value = mix(
        mix(mix(v000, v100, u.x), mix(v010, v110, u.x), u.y),
        mix(mix(v001, v101, u.x), mix(v011, v111, u.x), u.y),
        u.z
    );
    
    // Interpolate the corner gradients
    vec3 deriv = mix(
        mix(mix(g000, g100, u.x), mix(g010, g110, u.x), u.y),
        mix(mix(g001, g101, u.x), mix(g011, g111, u.x), u.y),
        u.z
    );
    
    // Add contribution from changing interpolation weights (chain rule)
    deriv.x += du.x * mix(
        mix(v100 - v000, v110 - v010, u.y),
        mix(v101 - v001, v111 - v011, u.y),
        u.z
    );
    
    deriv.y += du.y * mix(
        mix(v010 - v000, v110 - v100, u.x),
        mix(v011 - v001, v111 - v101, u.x),
        u.z
    );
    
    deriv.z += du.z * mix(
        mix(v001 - v000, v101 - v100, u.x),
        mix(v011 - v010, v111 - v110, u.x),
        u.y
    );
    
    NoiseDerivative result;
    result.value = value;
    result.derivative = deriv;
    return result;
}

NoiseDerivative fbmWithDerivative(vec3 p) {
    NoiseDerivative result;
    result.value = 0.0;
    result.derivative = vec3(0.0);
    
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 3; i++) {
        NoiseDerivative octave = gradientNoiseWithDerivative(p);
        
        result.value += amplitude * octave.value;
        result.derivative += amplitude * frequency * octave.derivative;
        
        p = p * 2.2 + vec3(100.7, 47.3, 29.1);
        amplitude *= 0.5;
        frequency *= 2.2;
    }
    
    return result;
}

void main() {
    const float TWO_PI = 6.2832;

    // we want to bend the plane along a sin curve and animate with time
    float u = uv.x * TWO_PI - u_time * .5;
    float omega = TWO_PI/u_planeWidth; // we need this becuz chainrule

    vec3 newPosition = vec3(position.x, position.y, u_amplitude * sin(u));

    // we add noise now
    // we want to calculate two diff noise patterns at any time. Then lerp between them
    // in a three second interval
    float interval = floor(u_time / 3.0);
    float t = mod(u_time, 3.0) / 3.0; // normalize our t value (our lerp parameter)

    vec3 samplePos = position * u_noiseScale + vec3(47.3, 83.1, 12.7);

    // pattern A with derivatives
    vec3 offsetA = vec3(interval * 123.4, interval * 456.7, interval * 789.1);
    NoiseDerivative noiseA = fbmWithDerivative(samplePos + offsetA);

    // pattern B with derivatives
    ++interval;
    vec3 offsetB = vec3(interval * 123.4, interval * 456.7, interval * 789.1);
    NoiseDerivative noiseB = fbmWithDerivative(samplePos + offsetB);

    // lerp between the two heights and derivatives
    float finalHeight = mix(noiseA.value, noiseB.value, smoothstep(0.0, 1.0, t));
    vec3 finalDerivative = mix(noiseA.derivative, noiseB.derivative, smoothstep(0.0, 1.0, t));

    newPosition += normal * finalHeight * u_displacement;
    
    // Compute tangents including both sine curve and noise displacement
    vec3 tangentX = normalize(vec3(
        1.0,
        0.0,
        omega * u_amplitude * cos(u) + finalDerivative.x * u_displacement * u_noiseScale.x
    ));
    
    vec3 tangentY = normalize(vec3(
        0.0,
        1.0,
        finalDerivative.y * u_displacement * u_noiseScale.y
    ));
    
    vec3 newNormal = normalize(cross(tangentX, tangentY));

    v_worldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * newNormal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
