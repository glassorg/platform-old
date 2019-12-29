import Graphics3D from "./Graphics3D";
import GLTF from "./GLTF";

export async function load(g: Graphics3D, uri: string): Promise<GLTF> {
    let response = await fetch(uri)
    let gltf = response.json() as unknown as GLTF
    console.log(gltf)
    return gltf
}
