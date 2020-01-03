import Graphics3D from "./Graphics3D"
import * as GL from "./GL"
import GLTF, { MeshPrimitive } from "./GLTF"
import { getRelativeUrl } from "../../utility/http"
import DataBuffer, { BufferUsage } from "./DataBuffer"
import IndexBuffer from "./IndexBuffer"
import VertexBuffer from "./VertexBuffer"
import Primitive from "./Primitive"
import VertexElement from "./VertexElement"
import VertexFormat from "./VertexFormat"
import Program from "./Program"
import VertexShader from "./VertexShader"
import FragmentShader from "./FragmentShader"
import Position_VertexShader from "./effects/Position.vert"
import Color_FragmentShader from "./effects/Color.frag"

const programs = {
    position: new Program(
        new VertexShader(VertexFormat.positionNormal, Position_VertexShader),
        new FragmentShader(Color_FragmentShader)
    )
}

//  Valid attribute semantic property names include
//      POSITION, NORMAL, TANGENT, TEXCOORD_0, TEXCOORD_1, COLOR_0, JOINTS_0, and WEIGHTS_0.
//  Application-specific semantics must start with an underscore, e.g.,
//      _TEMPERATURE.
const shaderNames = {
    POSITION: "position",
    NORMAL: "normal",
    TANGENT: "tangent",
    TEXCOORD_0: "texcoord_0",
    TEXCOORD_1: "texcoord_1",
    COLOR_0: "color_0"
}
function getShaderName(semanticName: string) {
    return shaderNames[semanticName] ?? semanticName
}

const accessorTypeElementCounts = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 2 * 2,
    MAT3: 3 * 3,
    MAT4: 4 * 4,
}
const componentTypeSizes = new Map<number, number>([
    [GL.BYTE, 1],
    [GL.UNSIGNED_BYTE, 1],
    [GL.SHORT, 2],
    [GL.UNSIGNED_SHORT, 2],
    [GL.UNSIGNED_INT, 4],
    [GL.FLOAT, 4]
])

function createDataBuffer(g: Graphics3D, gltf: GLTF, bufferViews: WebGLBuffer[], p: MeshPrimitive): DataBuffer {
    if (gltf.bufferViews == null || gltf.accessors == null) {
        throw new Error()
    }
    let vertexElementsByBuffer = new Map<WebGLBuffer, VertexElement[]>()
    for (let NAME in p.attributes) {
        let name = getShaderName(NAME)
        let attributeAccessor = gltf.accessors[p.attributes[NAME]]
        let attributeBufferView = gltf.bufferViews[attributeAccessor.bufferView ?? 0]
        let attributeBuffer = bufferViews[attributeAccessor.bufferView ?? 0]
        let vertexElements: VertexElement[] = vertexElementsByBuffer.get(attributeBuffer) ?? []
        vertexElementsByBuffer.set(attributeBuffer, vertexElements)
        let componentSize = componentTypeSizes.get(attributeAccessor.componentType)!
        let componentCount = accessorTypeElementCounts[attributeAccessor.type]
        let elementSizeBytes = componentSize * componentCount
        let stride = attributeBufferView.byteStride ?? elementSizeBytes
        let vertexElement = new VertexElement(
            name,
            componentCount,
            attributeAccessor.componentType,
            attributeAccessor.normalized,
            attributeAccessor.byteOffset ?? 0,
            stride
        )
        vertexElements.push(vertexElement)
    }
    let vertexBuffers: VertexBuffer[] = []
    for (let attributeBuffer of vertexElementsByBuffer.keys()) {
        let vertexElements = vertexElementsByBuffer.get(attributeBuffer)!
        let vertexFormat = new VertexFormat(...vertexElements)
        let vertexBuffer = new VertexBuffer(g, BufferUsage.staticDraw, vertexFormat, p.mode, attributeBuffer, 0)
        vertexBuffers.push(vertexBuffer)
    }

    if (p.indices == null) {
        if (vertexBuffers.length !== 1) {
            throw new Error("Non indexed vertices MUST be interleaved in a single buffer")
        }
        return vertexBuffers[0]
    }

    let indexAccessor = gltf.accessors[p.indices]
    let buffer = bufferViews[indexAccessor.bufferView ?? 0]
    // now create an indexed array thingy
    console.log("Indexes", { p, indexAccessor })
    let indexBuffer = new IndexBuffer(g, BufferUsage.staticDraw, vertexBuffers, p.mode, buffer, indexAccessor.componentType, 0, indexAccessor.count)
    return indexBuffer
}

function separateIndexBuffersFromVertexBuffers(g: Graphics3D, gltf: GLTF, dataBuffers: ArrayBuffer[]): WebGLBuffer[] {
    // determine which bufferViews are indexed elements
    const { gl } = g
    let indiceViews = new Set((gltf.meshes ?? []).map(mesh => mesh.primitives.map(p => p.indices ?? -1)).flat())
    let buffers: WebGLBuffer[] = (gltf.bufferViews ?? []).map(
        (bufferView, bufferViewIndex) => {
            const indexed = indiceViews.has(bufferViewIndex)
            const target = indexed ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER
            const glBuffer = gl.createBuffer()
            if (glBuffer == null) {
                throw new Error("Failed to create WebGLBuffer")
            }
            const rawBuffer = dataBuffers[bufferView.buffer]
            const start = bufferView.byteOffset ?? 0
            const end = start + bufferView.byteLength
            const dataBufferSection = rawBuffer.slice(start, end)
            // console.log("creating views", { indexed, target, bufferView, bufferViewIndex }, dataBufferSection)
            gl.bindBuffer(target, glBuffer)
            gl.bufferData(target, dataBufferSection, GL.STATIC_DRAW)
            return glBuffer
        }
    )
    return buffers
}

export default class GLTFModel {

    json: GLTF
    bufferViews: WebGLBuffer[]
    meshPrimitives: DataBuffer[][]
    program = programs.position

    constructor(json: GLTF, bufferViews: WebGLBuffer[], meshes: DataBuffer[][]) {
        this.json = json
        this.bufferViews = bufferViews
        this.meshPrimitives = meshes
    }

    static async load(g: Graphics3D, uri: string): Promise<GLTFModel> {
        let response = await fetch(uri)
        let gltf = await response.json() as unknown as GLTF
        // load buffers
        let dataBuffers: ArrayBuffer[] = []
        for (let bufferInfo of gltf.buffers ?? []) {
            const bufferUri = getRelativeUrl(uri, bufferInfo.uri!)
            const response = await fetch(bufferUri)
            const data = await response.arrayBuffer()
            dataBuffers.push(data)
        }
        // separate buffers and load them into index or vertex buffers
        let bufferViews = separateIndexBuffersFromVertexBuffers(g, gltf, dataBuffers)
        // console.log(gltf)
        let meshPrimitives: DataBuffer[][] = (gltf.meshes ?? []).map(
            meshInfo => meshInfo.primitives.map(
                p => createDataBuffer(g, gltf, bufferViews, p)
            )
        )
        return new GLTFModel(gltf, bufferViews, meshPrimitives)
    }

}

