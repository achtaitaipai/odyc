precision mediump float;
varying vec2 v_texCoords;

uniform sampler2D u_texture;
uniform vec2 u_size;

uniform float u_warp;
uniform float u_lineWidth;
uniform float u_lineIntensity;
uniform float u_lineCount;

void main() {
    vec2 fragCoord = v_texCoords * u_size;
    vec2 uv = v_texCoords;

    vec2 dc = abs(0.5 - uv);
    dc *= dc;

    uv.x -= 0.5;
    uv.x *= 1.0 + dc.y * (0.3 * u_warp);
    uv.x += 0.5;

    uv.y -= 0.5;
    uv.y *= 1.0 + dc.x * (0.4 * u_warp);
    uv.y += 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0);
    } else {
        float dist = abs(fract(uv.y * u_lineCount) - 0.5);
        float scanLine = min(step(u_lineWidth * .5, dist) + (1. - u_lineIntensity), 1.);

        vec3 color = texture2D(u_texture, uv).rgb;
        gl_FragColor = vec4(color * scanLine, 1.0);
    }
}
