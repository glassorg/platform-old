//  placeholder for effects

// import Program from "../Program";
// import Graphics3D from "../Graphics3D";
// import Node from "../scene/Node";
// import INode from "../../INode";
// import Graphics from "../Graphics";

// export class Pass {

//     program: Program

//     constructor(program: Program) {
//         this.program = program
//     }

//     render(g: Graphics3D, callback: (g: Graphics3D) => void) {
//         let saveProgram = g.program
//         g.program = this.program
//         callback(g)
//         g.program = saveProgram
//     }

// }

// export default class Effect {

//     passes: Pass[]

//     constructor(...passes: Pass[]) {
//         this.passes = passes
//     }

//     render(g: Graphics, callback: (g: Graphics3D) => void) {
//         for (let pass of this.passes) {
//             pass.render(g as Graphics3D, callback)
//         }
//     }

//     static createFromProgram(program: Program) {
//         return new Effect(new Pass(program))
//     }

// }