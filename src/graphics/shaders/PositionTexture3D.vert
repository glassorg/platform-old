uniform mat4 modelViewProjection;

in vec3 position;
in vec2 texcoord_0;

out vec2 vs_textureCoordinates;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_textureCoordinates = texcoord_0;
}
