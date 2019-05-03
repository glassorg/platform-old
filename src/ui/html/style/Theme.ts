import ColorSettings from "./ColorSettings"
import StyleSettings from "./StyleSettings"
import FontSettings from "./FontSettings"

export default class Theme {

    readonly colors: ColorSettings
    readonly styles: StyleSettings
    readonly fonts: FontSettings
    readonly margin: number

    constructor(
        colors: ColorSettings = ColorSettings.light,
        styles: StyleSettings = new StyleSettings(),
        fonts: FontSettings = new FontSettings(),
        margin: number = 6
    ) {
        this.colors = colors
        this.styles = styles
        this.fonts = fonts
        this.margin = margin
    }

    static light = new Theme()
    static dark = new Theme(ColorSettings.dark)

}
