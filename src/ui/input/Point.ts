import INode from "../INode"
import Vector2 from "../math/Vector2"

export default class Point {

    time: number;
    target: INode;
    position: Vector2;
    buttons: number;
    pressure: number = 0.5;
    width: number = 1;
    height: number = 1;

    constructor(e: PointerEvent) {
        this.buttons = e.buttons;
        this.position = new Vector2(e.x, e.y);
        this.pressure = e.pressure;
        this.target = e.target as any;
        this.width = e.width;
        this.height = e.height;
        this.time = e.timeStamp / 1000;
    }

    getPosition(target = this.target) {
        if (!(target instanceof HTMLElement)) {
            throw new Error(`Support for virtual INodes not implemented yet. Why don't you do it now?`);
        }
        let bounds = target.getClientRects()[0];
        return new Vector2(this.position.x - bounds.left, this.position.y - bounds.top);
    }

}
