function setVectorLength(length, x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let currentLength = Math.sqrt(dx * dx + dy * dy);
    // the length cannot be longer than the current length
    length = Math.min(length, currentLength);
    let ratio = length / currentLength;
    dx *= ratio;
    dy *= ratio;
    return [x0 + dx, y0 + dy];
}

// linear interpolation
function lerp(x0, y0, x1, y1, alpha) {
    return [x0 + alpha * (x1 - x0), y0 + alpha * (y1 - y0)];
}

function createCurvedPath(args, radius = 16) {
    // remove duplicate points.
    let j = args.length - 2;
    while (j >= 2) {
        if (args[j] === args[j-2] && args[j+1] === args[j-1]) {
            args.splice(j, 2);
        }
        j -= 2;
    }

    let path = `M ${args[0]} ${args[1]}`
    for (let k = 1; k < args.length / 2 - 1; k++) {
        let i = k * 2;
        // start
        let sx = args[i+0-2];
        let sy = args[i+1-2];
        // end
        let ex = args[i+0+2];
        let ey = args[i+1+2];
        // corner
        let cx = args[i+0];
        let cy = args[i+1];
        // set vector lengths to radius
        [sx, sy] = setVectorLength(radius, cx, cy, sx, sy);
        [ex, ey] = setVectorLength(radius, cx, cy, ex, ey);
        // determine correct control points for rounded corners
        let kappa = 0.55;
        let [c1x, c1y] = lerp(sx, sy, cx, cy, kappa);
        let [c2x, c2y] = lerp(ex, ey, cx, cy, kappa);
        if (isNaN(c1x) || isNaN(c1y) || isNaN(c2x) || isNaN(c2y)) {
            return "M 0 0";
        }

        path += `L ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`;
    }
    path += `L ${args[args.length - 2]} ${args[args.length - 1]}`;
    return path;
}

export default createCurvedPath
