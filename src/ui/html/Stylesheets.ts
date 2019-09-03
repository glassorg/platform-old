// import Theme from "./style/Theme"

// type StyleCallback = (s: Theme) => string
// let theme = new Theme()
// let styles: Array<[StyleCallback, HTMLStyleElement]> = []

// export default {
//     get theme() {
//         return theme
//     },
//     set theme(value: Theme) {
//         theme = value
//         for (let [callback, style] of styles) {
//             style.textContent = callback(theme)
//         }
//     },
//     add(callback: StyleCallback) {
//         if (typeof document === "object") {
//             let style = document.createElement("style")
//             style.textContent = callback(theme)
//             let container = document.head || document
//             container.appendChild(style)
//             styles.push([callback, style])
//             return style
//         }
//     }
// }

