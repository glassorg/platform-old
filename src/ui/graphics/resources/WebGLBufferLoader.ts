// import ResourceLoader from "./ResourceLoader";
// import Graphics3D from "../Graphics3D";

// const loader: ResourceLoader<WebGLBuffer> = {

//     async load(g: Graphics3D, uri: string): Promise<WebGLBuffer> {
//         const { gl } = g
//         const response = await fetch(uri)
//         const data = await response.arrayBuffer()
//         const buffer = gl.createBuffer()
//         if (buffer == null) {
//             throw new Error(`Failed to create buffer for ${uri}`)
//         }
//         const target = gl.ARRAY_BUFFER
//         const usage = gl.STATIC_DRAW
//         gl.bindBuffer(target, buffer)
//         gl.bufferData(target, data, usage)
//         return buffer
//     }

// }

// export default loader
