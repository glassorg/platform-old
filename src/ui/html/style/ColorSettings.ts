import ColorTriplet from "./ColorTriplet"

export default class ColorSettings {
    //  usually transparent gray
    readonly shadow: ColorTriplet = new ColorTriplet("rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.3)")
    //  usually white
    readonly background: ColorTriplet = new ColorTriplet("#DDDDDD", "#EEEEEE", "#FFFFFF")
    //  usually black
    readonly foreground: ColorTriplet = new ColorTriplet("#222222", "#111111", "#000000")
    //  usually used for selection
    readonly highlight: ColorTriplet = new ColorTriplet("#800080", "#900090", "#A000A0")
    //  usually blue
    readonly action: ColorTriplet = new ColorTriplet("#448AFF", "#2979FF", "#2962FF")
    //  usually red
    readonly error: ColorTriplet = new ColorTriplet("#EF5350", "#F44336", "#E53935")
    //  usually green
    readonly success: ColorTriplet = new ColorTriplet("#81C784", "#66BB6A", "#4CAF50")
    //  usually orange
    readonly warning: ColorTriplet = new ColorTriplet("#FFAB40", "#FF9100", "#FF6D00")

    constructor(colors?: any) {
        if (colors) {
            for (let name in colors) {
                this[name] = colors[name]
            }
        }
    }

    static light = new ColorSettings()
    static dark = new ColorSettings({
        background: ColorSettings.light.foreground,
        foreground: ColorSettings.light.background
    })

}
