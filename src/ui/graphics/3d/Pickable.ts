import SceneNode from "./SceneNode";
import PickRequest from "./PickRequest";
import PickResult from "./PickResult";

export abstract class Pickable extends SceneNode {

    abstract pick(p: PickRequest): PickResult

}