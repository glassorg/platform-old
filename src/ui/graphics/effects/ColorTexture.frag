
precision mediump float;
uniform sampler2D colorTexture;

in vec2 vs_textureCoordinates;
in vec4 vs_color;

out vec4 outColor;
void main() {
    outColor = vs_color * texture(colorTexture, vs_textureCoordinates);
}
