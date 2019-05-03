import Stylesheets from "./Stylesheets"

export default Stylesheets.add(t => `
    body {
        background-color: ${t.colors.background};
        color: ${t.colors.foreground};
        padding: ${t.margin * 4}px;
    }
    .margin, input, textarea, select, button, p, h1, h2, h3, label > span {
        margin: ${t.margin}px;
    }
    label {
        display: flex;
        flex-direction: column;
    }
    label.row {
        align-items: center;
    }
    .row {
        display: flex;
        flex-direction: row;
    }
    .column {
        display: flex;
        flex-direction: column;
    }
    form {
        display: flex;
        flex-direction: column;
        padding: ${t.margin}px;
        max-width: 300px;
    }
    form label {
        display: flex;
        flex-direction: column;
    }
    form label span, form input, form button {
        margin: ${t.margin}px;
    }
    .card {
        background: ${t.colors.background.strong};
        border-radius: 2px;
        display: inline-block;
        margin: ${t.margin};
    }
    .z1 {
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }
    .z1:hover {
        box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    }
    .z2 {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    }
    .z3 {
        box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    }
    .z4 {
        box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    }      
    .z5 {
        box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
    }
`)
