class FrameProcessor {
    constructor() {
        this._PlayerMap = new Map();
    }

    /**
     * Выполняет расчет текущего кадра, обновляя физические характеристики пула объектов
     * @param {*} objectpool пул игровых объектов
     */
    CalculateFrame(objectpool) {
        let len = objectpool.Players.length;
        //player vs player collision
        for (let i = 0; i < len; ++i)
            for (let j = 0; j < len; ++j) {
                if (i === j) continue;
                if (this._PlayerMap.has(j.toString() + i.toString())) continue; //TODO: get rid of map
                if (this._IsReachable(objectpool.Players[i], objectpool.Players[j])) {
                    _ApplyPlayerPlayerCollision(objectpool.Players[i], objectpool.Players[j]);
                    this._PlayerMap.set(i.toString() + j.toString(), true);
                }
            }
        let len2 = objectpool.Shells.length;
        let len3 = objectpool.InvItems.length;
        let len4 = objectpool.StaticBodies.length;
        let len5 = objectpool.MovableBodies.length;
        for (let i = 0; i < len; ++i) {
            for (let j = 0; j < len2; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.Shells[j])) {
                    _ApplyPlayerShellCollision(objectpool.Players[i], objectpool.Shells[j]);
                }
            }
            for (let j = 0; j < len3; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.InvItems[j])) {
                    _ApplyPlayerInventoryItemCollision(objectpool.Players[i], objectpool.InvItems[j]);
                }
            }
            for (let j = 0; j < len4; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.StaticBodies[j])) {
                    _ApplyPlayerStaticBodyItemCollision(objectpool.Players[i], objectpool.StaticBodies[j]);
                }
            }
            for (let j = 0; j < len5; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.MovableBodies[j])) {
                    _ApplyPlayerMovableBodyItemCollision(objectpool.Players[i], objectpool.MovableBodies[j]);
                }
            }
        }  //mov bodies + shells
        for (let i = 0; i < len5; ++i)
            for (let j = 0; j < len2; ++j) {
                if (this._IsReachable(objectpool.MovableBodies[i], objectpool.Shells[j])) {
                    _ApplyMovableBodyShellCollision(objectpool.MovableBodies[i], objectpool.Shells[j]);
                }
            }
        //static bodies + shells
        for (let i = 0; i < len4; ++i)
            for (let j = 0; j < len2; ++j) {
                if (this._IsReachable(objectpool.StaticBodies[i], objectpool.Shells[j])) {
                    _ApplyStaticBodyShellCollision(objectpool.StaticBodies[i], objectpool.Shells[j]);
                }
            }
    }

    _IsReachable(Obj1, Obj1) {
        let r = Obj1.GetRadius() + Obj2.GetRadius();
        r *= r;
        return r < Math.pow(Obj1.GetPosition().X + Obj2.GetPosition().X, 2) + Math.pow(Obj1.GetPosition().Y + Obj2.GetPosition().Y, 2);
    }

    _ApplyPlayerPlayerCollision(player, player) { }
    _ApplyPlayerShellCollision(player, shell) { }
    _ApplyPlayerInventoryItemCollision(player, inv_item) { }
    _ApplyPlayerStaticBodyItemCollision(player, static_obj) { }
    _ApplyPlayerMovableBodyItemCollision(player, movable_obj) { }
    _ApplyMovableBodyShellCollision(movable_obj, shell) { }
    _ApplyStaticBodyShellCollision(static_obj, shell) { }

    /**
     * Очищает вычисленные значения текущего кадра
     */
    ResetFrame() {
        this._PlayerMap.clear();
    }
}
