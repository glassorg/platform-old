thoughts on vertex buffers, loading and storing.

vertex data needs to have same name as varying inputs to vertexShader

so we can bind from VertexBuffer to shaders directly.

so how do we dynamically load our VertexBuffers?

//  maybe just n arguments all floats
//  if we know vertex definition then we know how to load data
vertexBuffer.add(x, y, z, u, v, nx, ny, nz, a, r, g, b)

// maybe a slower more semantic way as well
vertexBuffer.add({
    position: [x, y, z],
    texCoord: [u, v],
    normal: [nx, ny, nz],
    color: [a, r, g, b]
})

