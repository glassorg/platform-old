precision mediump float;
uniform sampler2D colorTexture;

in vec2 vs_textureCoordinates;

out vec4 outColor;
void main() {
    outColor = texture(colorTexture, vs_textureCoordinates);
}
