import Rectangle from "../math/Rectangle"

export default class Sprite {

    image: string
    bounds: Rectangle

    constructor(image: string, bounds: Rectangle = new Rectangle(0, 0, 1, 1)) {
        this.image = image
        this.bounds = bounds
    }

}