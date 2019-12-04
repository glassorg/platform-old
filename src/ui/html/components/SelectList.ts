import Context from "../../Context"
import { div, span } from ".."
import Checkbox from "./Checkbox"
import "./SelectList.css"
import Key, { SearchKey, ModelKey } from "../../../data/Key"
import INode from "../../INode"
import { getPosition, bindEventListeners } from "../functions"
import Model, { ModelSchema } from "../../../data/Model"
import State from "../../../data/State"
import * as gestures from "../../input/gestures"
import Vector2 from "../../math/Vector2"
import PointerState from "../../input/PointerState"
import Store from "../../../data/Store"
import Rectangle from "../../math/Rectangle"
import Action from "../../Action"
import IconButton from "./IconButton"

function getIndexMap<T>(order: T[]) {
    const indexMap = new Map<T,number>()
    for (let i = 0; i < order.length; i++) {
        indexMap.set(order[i], i)
    }
    return indexMap
}

type DragRow<T> = HTMLElement & { itemKey: ModelKey<T> }
function getDragRow<T>(element: INode | null) {
    for (let check: any = element; check != null; check = check.parentNode) {
        if (check.itemKey) {
            return check as DragRow<T>
        }
    }
    return null
}

function sortItems<T extends any, K = string>(items: T[], order: K[], map: (t: T) => K) {
    const orderMap = getIndexMap(order)
    let sorted = items.sort((a, b) => {
        let orderA = orderMap.get(map(a))
        let orderB = orderMap.get(map(b))
        if (orderA == null) {
            orderA = Number.MAX_SAFE_INTEGER
        }
        if (orderB == null) {
            orderB = Number.MAX_SAFE_INTEGER
        }
        return orderA - orderB
    })
    return sorted
}

@State.class()
export class SelectListState extends State {

    @State.property()
    slidePosition?: number

    @State.property()
    dragStart?: Vector2

    @State.property()
    dragPosition?: Vector2

    @State.property()
    dropHeight?: number

    @State.property()
    dropIndex?: number

    @State.property()
    dragPointers?: PointerState[]

    @State.property({ default: {} })
    selectedKeys!: { [name: string]: true }

    @State.property()
    slideOffset?: number

    get dragging() {
        return this.dragStart != null && this.dragPosition != null
    }

    static store = "memory"
}

type SelectableModel = Model & { selected: boolean }

const SelectListRow = Context.component(
    function SelectListRow<T>(c: Context, p: {
        selected: boolean,
        selectListKey: ModelKey<SelectListState>,
        itemKey: ModelKey<T>,
        item(key: ModelKey<T>): INode
    }) {
        let { itemKey, item, selected, selectListKey } = p
        div({
            itemKey,
            content() {
                Checkbox({
                    value: selected,
                    onclick(e) {
                        c.store.patch(selectListKey, { selectedKeys: { [itemKey.toString()]: !selected ? true : null } })
                        e.stopPropagation()
                    }
                })
                item(itemKey)
            }
        })
    }
)

export default Context.component(
    function SelectList<T>(c: Context, p: {
        id: string,
        query: SearchKey<T>,
        order: string[],
        item(key: ModelKey<T>): INode,
        reorder(order: string[]): void,
        swipeLeft?: Action,
        swipeRight?: Action,
    })
    {
        const key = Key.create(SelectListState, p.id)
        const state = c.store.get(key)
        const itemKeys = c.store.get(p.query)

        function isSelected(itemKey?: ModelKey<T>) {
            return itemKey ? state.selectedKeys[itemKey.toString()] : false
        }

        function getClearSelectedKeys() {
            let selectedKeys: any = {}
            for (let keyString in state.selectedKeys) {
                selectedKeys[keyString] = null
            }
            return selectedKeys
        }

        function select(itemKey: ModelKey<T>, value = true, clearOthers = false) {
            let selectedKeys: any = clearOthers ? getClearSelectedKeys() : {}
            selectedKeys[itemKey.toString()] = !state.selectedKeys[itemKey.toString()]
            c.store.patch(key, { selectedKeys })
        }

        function getSelectedKeys(): { [key: string]: true } {
            return c.store.get(key).selectedKeys
        }

        function getKeyAndEntity<T>(target: EventTarget | null) {
            let row = getDragRow<T>(target as HTMLElement)
            return row ? [row.itemKey, c.store.peek(row.itemKey)!] : [null, null]
        }

        function pickIndex(p: Vector2, defaultValue: number) {
            let row = getDragRow<T>(document.elementFromPoint(p.x, p.y))
            return row ? sortedElements.indexOf(row) : defaultValue
        }

        let dragElements: HTMLElement[] = []
        let staticElements: HTMLElement[] = []
        let sortedElements: HTMLElement[]
        let container = div({
            class: "SelectList",
            // onclick(e: MouseEvent) {
            //     if (!state.dragging) {
            //         let [itemKey, entity] = getKeyAndEntity(e.target)
            //         if (itemKey && entity) {
            //             select(itemKey, !entity.selected, true)
            //         }
            //         console.log('onclick')
            //     }
            // },
            content() {
                let leftButton: HTMLElement | null = null
                let rightButton: HTMLElement | null = null
                if (p.swipeLeft) {
                    leftButton = IconButton({ action: p.swipeLeft, style: `right: 0px;` }) as HTMLElement
                    leftButton.style.opacity = `${Math.min(1, -(state.slideOffset ?? 0) * 2 / leftButton.parentElement!.clientWidth)}`
                }
                if (p.swipeRight) {
                    rightButton = IconButton({ action: p.swipeRight, style: `left: 0px;` }) as HTMLElement
                    rightButton.style.opacity = `${Math.min(1, (state.slideOffset ?? 0) * 2 / rightButton.parentElement!.clientWidth)}`
                }
                if (itemKeys) {
                    //  first we render the elements in their natural order.
                    let elements: HTMLElement[] = []
                    for (let itemKey of itemKeys) {
                        let element = SelectListRow({
                            selected: state.selectedKeys[itemKey.toString()],
                            selectListKey: key,
                            itemKey,
                            item: p.item
                        }) as HTMLElement
                        elements.push(element)
                    }
                    //  then we position them according to their actual order
                    sortedElements = sortItems(elements, p.order, ((e: any) => e.itemKey.toString()))

                    let dragging = state.dragPosition != null && state.dragPosition != null
                    let selectedKeys = getSelectedKeys()
                    let draggingKeys = dragging ? selectedKeys : new Set()

                    let dropHeight = state.dropHeight || 20
                    let dropIndex = dragging ? state.dropIndex || 0 : -1
                    let insertSpacerHeight = dropHeight * 2

                    let dropX = dragging ? state.dragPosition!.x - state.dragStart!.x : 0
                    let dropY = dragging ? state.dragPosition!.y - state.dragStart!.y : 0
                    let x = 0
                    let y = dragging ? - insertSpacerHeight / 4 : 0;
                    let dragElementIndex = 0
                    let nonDragElementIndex = 0
                    let selectedCount = 0
                    for (let element of sortedElements) {
                        let itemKey = (element as any).itemKey
                        let isDragElement = draggingKeys[itemKey]
                        if (isDragElement) {
                            dragElements.push(element)
                            dragElementIndex++
                        }
                        else {
                            staticElements.push(element)
                            if (nonDragElementIndex === dropIndex) {
                                y += insertSpacerHeight
                            }
                            nonDragElementIndex++
                        }
                        // SelectList_Selected
                        let selected = isSelected(itemKey)
                        if (selected) {
                            if (selectedCount == 0) {
                                for (let button of [leftButton, rightButton]) {
                                    if (button != null) {
                                        let size = `${element.clientHeight}px`
                                        button.style.top = `${y}px`
                                        // button.style.width = size
                                        button.style.height = size
                                    }
                                }
                            }
                            selectedCount++
                        }
                        element.className = `${selected ? "SelectList_selected" : ""} ${isDragElement ? "SelectList_DragItem" : ""}`
                        element.style.zIndex = `${isDragElement ? sortedElements.length - dragElementIndex : nonDragElementIndex}`
                        element.style.top = `${isDragElement ? dropY : y}px`
                        element.style.left = `${selected && state.slideOffset ? state.slideOffset : isDragElement ? dropX : x}px`
                        if (isDragElement) {
                            dropX += 5
                            dropY += dropHeight / 2
                        }
                        else {
                            y += element.clientHeight
                        }
                    }
                }
            }
        })

        return bindEventListeners({
            parent: {
                scroll() {
                    let state = c.store.get(key)!
                    if (state.dragging) {
                        // c.store.patch(key, getDragProperties(container, state.dragPointers!, getSelectedKeys(), state.dragStart!))
                    }
                }
            },
            window: gestures.recognize({
                SelectList_selectSingleGesture: {
                    start(pointers) {
                        return pointers.length === 1 ? pointers : []
                    },
                    onFinish(pointers) {
                        let pointer = pointers[0]
                        if (pointer.distance < 5) {
                            let [itemKey, entity] = getKeyAndEntity(pointer.first.target as any)
                            if (itemKey && entity) {
                                select(itemKey, !entity.selected, true)
                            }
                        }
                    },
                    share: {
                        SelectList_slideGesture: true
                    }
                },
                SelectList_slideGesture: {
                    start(pointers) {
                        //  ideally we recognize a significant horizontal drag
                        //  within the last x distance
                        return pointers.every(pointer => {
                            //  if theres only one pointer then the initial target MUST be selected to drag.
                            // if (pointers.length === 1 && !isSelected(getDragRow<T>(pointer.first.target)?.itemKey)) {
                            //     return false
                            // }
                            let distance = 20
                            let dot = 0.95
                            let current = pointer.last.position
                            let previous = pointer.getPointByDistance(-distance).position
                            let delta = current.subtract(previous).length()
                            //  we want to make sure that MOST of the dragging in the last section
                            //  was horizontal
                            let horizontal = Math.abs(current.x - previous.x)
                            return horizontal >= dot * distance && horizontal > dot * delta
                        }) ? pointers : []
                    },
                    onStart(pointers) {
                        if (pointers.length == 1) {
                            let [itemKey, entity] = getKeyAndEntity(pointers[0].first.target as any)
                            if (itemKey && entity && !isSelected(itemKey)) {
                                select(itemKey, true, true)
                            }
                        }
                    },
                    onUpdate(pointers) {
                        let dx = pointers.map(pointer => pointer.last.position.x - pointer.first.position.x).reduce((a, b) => a + b, 0) / pointers.length
                        // console.log("onStart------ slide " + dx)
                        c.store.patch(key, { slideOffset: dx })
                    },
                    onFinish() {
                        c.store.patch(key, { slideOffset: null })
                    },
                    // share: true
                },
                SelectList_selectRangeGesture: {
                    start(pointers) {
                        if (pointers.length > 1)
                            debugger
                        return !state.dragging && pointers.length >= 2 ? pointers : []
                    },
                    onStart(pointers) {
                        console.log("START range: ", pointers)
                    },
                    finish(pointers) {
                        return pointers.length < 2
                    },
                    onUpdate(pointers) {
                        let oldBounds = Rectangle.getBounds(pointers.map(p => p.getBounds()))
                        let newBounds = Vector2.getBounds(pointers.map(p => p.last.position))
                        let oldTop = pickIndex(oldBounds.topLeft, 0)
                        let oldBottom = pickIndex(oldBounds.bottomRight, sortedElements.length - 1)
                        let newTop = pickIndex(newBounds.topLeft, 0)
                        let newBottom = pickIndex(newBounds.bottomRight, sortedElements.length - 1)
                        //  we deselect anything within the max bounds
                        //  and select anything within the new bounds

                        let selectedKeys = getClearSelectedKeys()

                        for (let i = oldTop; i <= oldBottom; i++) {
                            let selected = i >= newTop && i <= newBottom
                            let element = sortedElements[i]
                            let itemKey: ModelKey<T> = (element as any).itemKey
                            if (selected) {
                                selectedKeys[itemKey.toString()] = true
                            }
                        }
                        c.store.patch(key, { selectedKeys })
                    },
                    // share: true,
                    capture: false,
                },
                // [dragGestureId]: {
                //     start: gestures.all(
                //         (pointer) => {
                //             //  if all pointers move 30 pixels in 0.25 seconds then we start drag
                //             let previous = pointer.getPreviousPoint(0.1)
                //             let distance = pointer.last.position.x - previous.position.x
                //             return getDragRow(pointer.last.target) != null
                //                 && distance > 50
                //         }
                //     ),
                //     // add: gestures.always,
                //     onStart(pointers) {
                //         //  select all that are within current pointers (a quarter second ago)
                //         //  we want to use what was selected when they started the right jerk
                //         let newBounds = Vector2.getBounds(pointers.map(p => p.getPreviousPoint(0.25).position))
                //         let top = pickIndex(newBounds.topLeft, 0)
                //         let bottom = pickIndex(newBounds.bottomRight, sortedElements.length - 1)

                //         let pointedEntities = sortedElements.slice(top, bottom + 1).map(p => getKeyAndEntity(p)) as Array<[ModelKey<T>,T]>
                //         //  we only allow pre-selected rows when doing a single finger drag
                //         let allowPreselected = pointers.length === 1 && pointedEntities.length > 0 && pointedEntities.filter(a => a != null).every(a => isSelected(a[0]))
                //         let selectedKeys: any = {}
                //         for (let i = 0; i < sortedElements.length; i++) {
                //             let element = sortedElements[i]
                //             let itemKey: ModelKey<T> = (element as any).itemKey
                //             let selected = i >= top && i <= bottom || (allowPreselected && isSelected(itemKey))
                //             selectedKeys[itemKey.toString()] = selected ? true : null
                //         }
                //         c.store.patch(key, getDragProperties(container, pointers, selectedKeys))
                //     },
                //     onUpdate(pointers) {
                //         let state = c.store.get(key)!
                //         pointers = pointers.slice(0).sort((a, b) => a.last.position.y - b.last.position.y)
                //         c.store.patch(key, getDragProperties(container, pointers, getSelectedKeys(), state.dragStart!))
                //     },
                //     onFinish(pointers) {
                //         let state = c.store.get(key)!
                //         if (state.dragging && dragElements && staticElements && state.dropIndex != null) {
                //             let newElements = staticElements.slice(0)
                //             newElements.splice(state.dropIndex, 0, ...dragElements)
                //             let newOrder = newElements.map((e: any) => e.itemKey.toString())
                //             p.reorder(newOrder)
                //         }
                //         c.store.patch(key, { dragStart: null, dragPosition: null, dragPointers: null } as any)
                //     }
                // }
            })
        })
    }
)

const dragGestureId = "SelectList_drag"
export function StartSelectionDrag(
    key: ModelKey<SelectListState>,
    pointer: PointerState,
    dropHeight = 40, dragStart = new Vector2(document.body.clientWidth * 0.75, dropHeight / 2)) {
    let pointerKey = Key.create(PointerState, pointer.id.toString())
    Store.default.patch(pointerKey, { handler: dragGestureId })
    Store.default.patch(key, { dragStart, dropHeight })
    // result = { dragStart, dropHeight: dragRow.clientHeight }
}

function getDropIndex(y: number, container: INode, selectedKeys: { [name: string]: true }) {
    let elements: HTMLElement[] = []
    for (let element: any = container.firstChild; element != null; element = element.nextSibling) {
        if (!selectedKeys[element.itemKey]) {
            elements.push(element)
        }
    }
    let heights = elements.map(e => e.clientHeight)
    for (let i = 0; i < heights.length; i++) {
        let height = heights[i]
        if (y < height / 2) {
            return i
        }
        y -= height
    }
    return heights.length
}

function getFirstSelectedRow(container: HTMLElement, selectedKeys: { [name: string]: true }) {
    for (let child = container.firstChild; child != null; child = child.nextSibling) {
        if (selectedKeys[(child as any).itemKey]) {
            return child as HTMLElement
        }
    }
    return null
}

function getDragProperties(
    container: HTMLElement,
    pointers: PointerState[],
    selectedKeys: { [name: string]: true },
    dragStart?: Vector2)
{
    let result: any = {}

    if (dragStart == null) {
        let firstPointer = pointers[0].first
        let dragRow = getDragRow(firstPointer.target) || getFirstSelectedRow(container, selectedKeys)
        if (dragRow) {
            dragStart = firstPointer.getPosition(dragRow)
            result = { dragStart, dropHeight: dragRow.clientHeight }
        }
        else {
            dragStart = new Vector2(0, 0)
        }
    }

    let lastPointer = pointers[0].last
    let dragPosition = lastPointer.getPosition(container)
    let topOfFirstDragElement = dragPosition.y - dragStart.y
    let dropIndex = getDropIndex(topOfFirstDragElement, container, selectedKeys)
    return { ...result, dragPosition, dropIndex, dragPointers: pointers.slice(0), selectedKeys }
}