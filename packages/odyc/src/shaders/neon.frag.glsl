precision mediump float;

varying vec2 v_texCoords;
uniform sampler2D u_texture;
uniform vec2 u_size;

uniform float u_scale;
uniform float u_intensity;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define CELL_SIZE 24.

float mosaic(float scale) {
    float d = 0.0;
    vec2 uv = fract(v_texCoords * (u_size / CELL_SIZE));
    vec2 st = uv * 2. - 1.;

    float a = atan(st.x, st.y) + PI;
    float r = TWO_PI / 4.;

    d = cos(floor(.5 + a / r) * r - a) * length(st);

    return 1.0 - step(scale, d);
}

vec3 blur() {
    vec2 radius = CELL_SIZE / u_size;
    vec3 blur = vec3(0);
    float count = 0.;

    for (int j = 0; j < 16; j++) {
        float d = float(j) * TWO_PI / 16.;
        vec2 offset = vec2(cos(d), sin(d)) / (u_size / CELL_SIZE);
        blur += texture2D(u_texture, v_texCoords + offset).rgb;
        count++;
    }

    return blur / count;
}

void main() {
    vec3 color = texture2D(u_texture, v_texCoords).rgb;

    vec3 with_blur = mix(color, blur(), u_intensity);
    gl_FragColor = vec4(max(color, with_blur), 1.) * mosaic(u_scale);
}
