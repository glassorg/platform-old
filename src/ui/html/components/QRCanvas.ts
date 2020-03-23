import Context from "../../Context";
import { div, span, canvas } from "..";
import QRCode from "qrcode";

export default Context.component(function QRCanvas(c: Context, p: {
    value: string,
    /**
     * Pixels per black dot.
     * @default 4
     */
    scale?: number,
    /**
     * Width and height of the output in pixels.
     */
    width?: number,
    style?: string,
    class?: string,
}) {
    const { value, scale, width, ...otherProps } = p;
    const qrCanvas = canvas({ ...otherProps });
    // now we render to the canvas.
    const options = { scale, width };
    QRCode.toCanvas(qrCanvas, value, options, e => {
        if (e) {
            console.error(e);
        }
        else {
            console.log(`Rendered to Canvas`);
        }
    })
})
