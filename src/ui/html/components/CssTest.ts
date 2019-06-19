import Context from "../../Context";
import Model from "../../../data/Model";
import Key from "../../../data/Key";
import State from "../../../data/State";
import Stylesheets from "../Stylesheets";
import { Render } from "../../Component";
import * as html from "..";
import HtmlContext from "../HtmlContext";
import "./CssTest.css";

// this can be deleted now, it was only for the purposes of testing

export default function CssTest(c: Context) {
    let { div, span, text, end, render } = HtmlContext(c);
    div({
        class: "CssTest",
        style: "--size: 100px;",
        onclick(this: HTMLDivElement, e) {
            this.style.setProperty("--size", "200px");
        }
    })
        text("Hello Css Test")
    end()
}