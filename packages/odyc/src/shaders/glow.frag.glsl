precision mediump float;

varying vec2 v_texCoords;
uniform sampler2D u_texture;
uniform vec2 u_size;

uniform float u_intensity;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define CELL_SIZE 24.

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
    gl_FragColor = vec4(max(color, with_blur), 1.);
}
