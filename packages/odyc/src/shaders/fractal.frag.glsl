precision mediump float;
varying vec2 v_texCoords;
uniform sampler2D u_texture;
uniform vec2 u_size;
uniform float u_sideCount;
uniform float u_scale;
uniform float u_rotation;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define CELL_SIZE 24.

void main() {
    float d = 0.0;
    vec2 uv = fract(v_texCoords * (u_size / CELL_SIZE));
    vec2 st = uv * 2. - 1.;

    float a = atan(st.x, st.y) + PI + u_rotation * TWO_PI;
    float r = TWO_PI / float(u_sideCount);

    d = cos(floor(.5 + a / r) * r - a) * length(st);

    float threshold = 1.0 - step(u_scale, d);
    gl_FragColor = texture2D(u_texture, v_texCoords) * threshold;
}
