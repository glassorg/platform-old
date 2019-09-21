import { clamp } from "."
import Vector3 from "./Vector3"

export default class Color implements Iterable<number> {

    readonly red: number
    readonly green: number
    readonly blue: number
    readonly alpha: number

    constructor(red: number, green: number, blue: number, alpha: number = 1.0) {
        this.red = red
        this.green = green
        this.blue = blue
        this.alpha = alpha
    }

    *[ Symbol.iterator ]() {
        yield this.red
        yield this.green
        yield this.blue
        yield this.alpha
    }

    get isVisible() {
        return this.alpha > 0
    }

    get isTransparent() {
        return this.alpha === 0
    }

    get isTranslucent() {
        return this.alpha > 0 && this.alpha < 1
    }

    get isOpaque() {
        return this.alpha > 1
    }

    toString() {
        return `rgba(${this.red * 255},${this.green * 255},${this.blue * 255},${this.alpha})`
    }

    scale(f: number) {
        return new Color(this.red * f, this.green * f, this.blue * f, this.alpha)
    }

    opacity(alpha: number) {
        return new Color(this.red, this.green, this.blue, alpha)
    }

    lerp(color: Color, alpha: number) {
        return new Color(
            this.red + alpha * (color.red - this.red),
            this.green + alpha * (color.green - this.green),
            this.blue + alpha * (color.blue - this.blue),
            this.alpha + alpha * (color.alpha - this.alpha)
        )
    }

    /**
     * Converts to a 32 bit integer in ABGR format which seems
     * to be what WebGL expects.
     */
    toInt32() {
        //  we are using * 2 ** bits
        //  instead of << bits
        //  since shifts are treated as with signed 32 bit integers
        //  which makes the most significant bit be negative
        //  also using + instead of | for the same reason
        return (Math.round(clamp(this.alpha) * 255) * 2 ** 24) +
            (Math.round(clamp(this.blue) * 255) * 2 ** 16) +
            (Math.round(clamp(this.green) * 255) * 2 ** 8) +
            Math.round(clamp(this.red) * 255)
    }

    static readonly transparent = new Color(0, 0, 0, 0)

    static readonly aliceblue = new Color(240, 248, 255)
    static readonly antiquewhite = new Color(250, 235, 215)
    static readonly aqua = new Color(0, 255, 255)
    static readonly aquamarine = new Color(127, 255, 212)
    static readonly azure = new Color(240, 255, 255)
    static readonly beige = new Color(245, 245, 220)
    static readonly bisque = new Color(255, 228, 196)
    static readonly black = new Color(0, 0, 0)
    static readonly blanchedalmond = new Color(255, 235, 205)
    static readonly blue = new Color(0, 0, 255)
    static readonly blueviolet = new Color(138, 43, 226)
    static readonly brown = new Color(165, 42, 42)
    static readonly burlywood = new Color(222, 184, 135)
    static readonly cadetblue = new Color(95, 158, 160)
    static readonly chartreuse = new Color(127, 255, 0)
    static readonly chocolate = new Color(210, 105, 30)
    static readonly coral = new Color(255, 127, 80)
    static readonly cornflowerblue = new Color(100, 149, 237)
    static readonly cornsilk = new Color(255, 248, 220)
    static readonly crimson = new Color(220, 20, 60)
    static readonly cyan = new Color(0, 255, 255)
    static readonly darkblue = new Color(0, 0, 139)
    static readonly darkcyan = new Color(0, 139, 139)
    static readonly darkgoldenrod = new Color(184, 134, 11)
    static readonly darkgray = new Color(169, 169, 169)
    static readonly darkgreen = new Color(0, 100, 0)
    static readonly darkgrey = new Color(169, 169, 169)
    static readonly darkkhaki = new Color(189, 183, 107)
    static readonly darkmagenta = new Color(139, 0, 139)
    static readonly darkolivegreen = new Color(85, 107, 47)
    static readonly darkorange = new Color(255, 140, 0)
    static readonly darkorchid = new Color(153, 50, 204)
    static readonly darkred = new Color(139, 0, 0)
    static readonly darksalmon = new Color(233, 150, 122)
    static readonly darkseagreen = new Color(143, 188, 143)
    static readonly darkslateblue = new Color(72, 61, 139)
    static readonly darkslategray = new Color(47, 79, 79)
    static readonly darkslategrey = new Color(47, 79, 79)
    static readonly darkturquoise = new Color(0, 206, 209)
    static readonly darkviolet = new Color(148, 0, 211)
    static readonly deeppink = new Color(255, 20, 147)
    static readonly deepskyblue = new Color(0, 191, 255)
    static readonly dimgray = new Color(105, 105, 105)
    static readonly dimgrey = new Color(105, 105, 105)
    static readonly dodgerblue = new Color(30, 144, 255)
    static readonly firebrick = new Color(178, 34, 34)
    static readonly floralwhite = new Color(255, 250, 240)
    static readonly forestgreen = new Color(34, 139, 34)
    static readonly fuchsia = new Color(255, 0, 255)
    static readonly gainsboro = new Color(220, 220, 220)
    static readonly ghostwhite = new Color(248, 248, 255)
    static readonly goldenrod = new Color(218, 165, 32)
    static readonly gold = new Color(255, 215, 0)
    static readonly gray = new Color(128, 128, 128)
    static readonly green = new Color(0, 128, 0)
    static readonly greenyellow = new Color(173, 255, 47)
    static readonly grey = new Color(128, 128, 128)
    static readonly honeydew = new Color(240, 255, 240)
    static readonly hotpink = new Color(255, 105, 180)
    static readonly indianred = new Color(205, 92, 92)
    static readonly indigo = new Color(75, 0, 130)
    static readonly ivory = new Color(255, 255, 240)
    static readonly khaki = new Color(240, 230, 140)
    static readonly lavenderblush = new Color(255, 240, 245)
    static readonly lavender = new Color(230, 230, 250)
    static readonly lawngreen = new Color(124, 252, 0)
    static readonly lemonchiffon = new Color(255, 250, 205)
    static readonly lightblue = new Color(173, 216, 230)
    static readonly lightcoral = new Color(240, 128, 128)
    static readonly lightcyan = new Color(224, 255, 255)
    static readonly lightgoldenrodyellow = new Color(250, 250, 210)
    static readonly lightgray = new Color(211, 211, 211)
    static readonly lightgreen = new Color(144, 238, 144)
    static readonly lightgrey = new Color(211, 211, 211)
    static readonly lightpink = new Color(255, 182, 193)
    static readonly lightsalmon = new Color(255, 160, 122)
    static readonly lightseagreen = new Color(32, 178, 170)
    static readonly lightskyblue = new Color(135, 206, 250)
    static readonly lightslategray = new Color(119, 136, 153)
    static readonly lightslategrey = new Color(119, 136, 153)
    static readonly lightsteelblue = new Color(176, 196, 222)
    static readonly lightyellow = new Color(255, 255, 224)
    static readonly lime = new Color(0, 255, 0)
    static readonly limegreen = new Color(50, 205, 50)
    static readonly linen = new Color(250, 240, 230)
    static readonly magenta = new Color(255, 0, 255)
    static readonly maroon = new Color(128, 0, 0)
    static readonly mediumaquamarine = new Color(102, 205, 170)
    static readonly mediumblue = new Color(0, 0, 205)
    static readonly mediumorchid = new Color(186, 85, 211)
    static readonly mediumpurple = new Color(147, 112, 219)
    static readonly mediumseagreen = new Color(60, 179, 113)
    static readonly mediumslateblue = new Color(123, 104, 238)
    static readonly mediumspringgreen = new Color(0, 250, 154)
    static readonly mediumturquoise = new Color(72, 209, 204)
    static readonly mediumvioletred = new Color(199, 21, 133)
    static readonly midnightblue = new Color(25, 25, 112)
    static readonly mintcream = new Color(245, 255, 250)
    static readonly mistyrose = new Color(255, 228, 225)
    static readonly moccasin = new Color(255, 228, 181)
    static readonly navajowhite = new Color(255, 222, 173)
    static readonly navy = new Color(0, 0, 128)
    static readonly oldlace = new Color(253, 245, 230)
    static readonly olive = new Color(128, 128, 0)
    static readonly olivedrab = new Color(107, 142, 35)
    static readonly orange = new Color(255, 165, 0)
    static readonly orangered = new Color(255, 69, 0)
    static readonly orchid = new Color(218, 112, 214)
    static readonly palegoldenrod = new Color(238, 232, 170)
    static readonly palegreen = new Color(152, 251, 152)
    static readonly paleturquoise = new Color(175, 238, 238)
    static readonly palevioletred = new Color(219, 112, 147)
    static readonly papayawhip = new Color(255, 239, 213)
    static readonly peachpuff = new Color(255, 218, 185)
    static readonly peru = new Color(205, 133, 63)
    static readonly pink = new Color(255, 192, 203)
    static readonly plum = new Color(221, 160, 221)
    static readonly powderblue = new Color(176, 224, 230)
    static readonly purple = new Color(128, 0, 128)
    static readonly rebeccapurple = new Color(102, 51, 153)
    static readonly red = new Color(255, 0, 0)
    static readonly rosybrown = new Color(188, 143, 143)
    static readonly royalblue = new Color(65, 105, 225)
    static readonly saddlebrown = new Color(139, 69, 19)
    static readonly salmon = new Color(250, 128, 114)
    static readonly sandybrown = new Color(244, 164, 96)
    static readonly seagreen = new Color(46, 139, 87)
    static readonly seashell = new Color(255, 245, 238)
    static readonly sienna = new Color(160, 82, 45)
    static readonly silver = new Color(192, 192, 192)
    static readonly skyblue = new Color(135, 206, 235)
    static readonly slateblue = new Color(106, 90, 205)
    static readonly slategray = new Color(112, 128, 144)
    static readonly slategrey = new Color(112, 128, 144)
    static readonly snow = new Color(255, 250, 250)
    static readonly springgreen = new Color(0, 255, 127)
    static readonly steelblue = new Color(70, 130, 180)
    static readonly tan = new Color(210, 180, 140)
    static readonly teal = new Color(0, 128, 128)
    static readonly thistle = new Color(216, 191, 216)
    static readonly tomato = new Color(255, 99, 71)
    static readonly turquoise = new Color(64, 224, 208)
    static readonly violet = new Color(238, 130, 238)
    static readonly wheat = new Color(245, 222, 179)
    static readonly white = new Color(255, 255, 255)
    static readonly whitesmoke = new Color(245, 245, 245)
    static readonly yellow = new Color(255, 255, 0)
    static readonly yellowgreen = new Color(154, 205, 50)

}