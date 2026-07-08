uniform sampler2D u_normData;
uniform sampler2D u_texture;
uniform float u_opacity;
uniform float u_selected;
uniform vec3 u_cameraPosition;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
varying vec2 v_uv;

void main() {
    vec4 normData = texture2D(u_normData, vec2(v_uv.x, 1.0 - v_uv.y));

    // vec2 normalXY = normData.rg * 2.0 - 1.0;
    // float normalZ = sqrt(max(0.0, 1.0 - dot(normalXY, normalXY)));
    // vec3 N_ts = normalize(vec3(normalXY, normalZ));
    vec3 N_ts = normalize(normData.rgb * 2.0 - 1.0);
    float mask = normData.a;

    // Tangent space → world space via TBN built from the plane's world normal.
    vec3 N_geom = normalize(v_worldNormal);
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N_geom));
    if (length(T) < 0.001) {
        T = normalize(cross(vec3(1.0, 0.0, 0.0), N_geom));
    }
    vec3 B = cross(N_geom, T);
    mat3 TBN = mat3(T, B, N_geom);
    vec3 N = normalize(TBN * N_ts);

    vec3 texData = vec3(0.85);//texture2D(u_texture, vec2(v_uv.x, v_uv.y + 0.15)).rgb;

    vec3 lightDir = normalize(vec3(-1.0, 0.5, 0.2));
    vec3 viewDir = normalize(u_cameraPosition - v_worldPosition);

    //diffuse lighting
    float NdotL = max(dot(N, lightDir), 0.0);
    vec3 diffuse = texData * (0.8 + 0.45 * NdotL);

    // specular lighting
    vec3 halfDir = normalize(lightDir + viewDir);
    float NdotH = max(dot(N, halfDir), 0.0);
    float shininess = 50.0;
    float specStrength = 0.5;
    vec3 specular = vec3(1.0) * pow(NdotH, shininess) * specStrength * NdotL;

    vec3 finalColor = min(diffuse + specular, vec3(1.0));

    gl_FragColor = vec4(finalColor, mask * u_opacity);
}
