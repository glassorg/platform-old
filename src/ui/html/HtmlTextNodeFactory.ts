import NodeFactory from "../NodeFactory";
import INode from "../INode";
import Context from "../Context";

export default class HtmlTextNodeFactory implements NodeFactory {

    public static instance: NodeFactory = new HtmlTextNodeFactory()

    private constructor() {
    }

    create(c: Context): INode {
        return c.document.createTextNode("") as INode
    }

    setProperties(node: INode & Text, properties: any) {
        properties = properties != null ? properties.toString() : ""
        const previousProperties = node.properties
        if (properties !== previousProperties) {
            node.textContent = properties
        }
        node.properties = properties
    }

    dispose(node: INode): void {
    }

    toString() {
        return `HtmlTextNodeFactory`
    }

}
