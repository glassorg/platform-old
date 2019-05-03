import Context from "./Context";
import INode from "./INode";

export type Dispose = () => void
export type Render<T> = (context: Context, properties: T) => void | Dispose

type Component<T=any> = {
    //  the function which renders this components node
    render: Render<T>
    //  the properties passed to the last render function
    properties: any
    //  the node rendered by this component function
    node: INode | null
    //  optional function to call when disposing the component
    dispose?: Dispose
    //  the next component attached to the same node when render calls are directly nested
    next?: Component
}

export default Component
