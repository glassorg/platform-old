import test from "ava"
import Entity from "../Entity"
import MemoryStore from "../stores/MemoryStore"
import Key from "../Key"

test("Entity component system queries", t => {

    let store = new MemoryStore()

    let player1 = new Entity({ key: "Entity/player1", player: 1, z: 4 }).create(store)
    let player2 = new Entity({ key: "Entity/player2", player: 2, color: "red", z: 1 }).create(store)
    let enemy1 = new Entity({ key: "Entity/enemy1", enemy: 1, z: 3 }).create(store)
    let enemy2 = new Entity({ key: "Entity/enemy2", enemy: 2, color: "red", z: 2 }).create(store)

    let players = store.list(Key.create(Entity, { where: { player: { "!=": null } } }))
    t.deepEqual(players, [player1, player2])

    let enemies = store.list(Key.create(Entity, { where: { enemy: { "!=": null } } }))
    t.deepEqual(enemies, [enemy1, enemy2])

    let reds = store.list(Key.create(Entity, { where: { color: "red" } }))
    t.deepEqual(reds, [player2, enemy2])

    let redPlayer = store.list(Key.create(Entity, { where: { player: { "!=": null }, color: "red" } }))
    t.deepEqual(redPlayer, [player2])

    let sorted = store.list(Key.create(Entity, { sort: [{ z: true }] } ))
    t.deepEqual(sorted, [player2, enemy2, enemy1, player1])

})
