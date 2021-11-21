class FrameProcessor {
    /**
     * Выполняет расчет текущего кадра, обновляя физические характеристики пула объектов
     * @param {*} objectpool пул игровых объектов
     */
    static CalculateFrame(objectpool) {
        let len = objectpool.Players.length;
        let len2 = objectpool.Shells.length;
        let len3 = objectpool.InvItems.length;
        let len4 = objectpool.StaticBodies.length;
        let len5 = objectpool.MovableBodies.length;
        for (let i = 0; i < len; ++i) {
            for (let j = 0; j < len; ++j) {
                if (j <= i) continue;
                if (this._IsReachable(objectpool.Players[i], objectpool.Players[j])) {
                    _ApplyPlayerPlayerCollision(objectpool.Players[i], objectpool.Players[j]);
                }
            }
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
                    _ApplyPlayerStaticBodyItemCollision(objectpool.Players[i]);
                }
            }
            for (let j = 0; j < len5; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.MovableBodies[j])) {
                    _ApplyPlayerMovableBodyItemCollision(objectpool.Players[i]);
                }
            }
        }  //mov bodies + shells
        for (let i = 0; i < len5; ++i)
            for (let j = 0; j < len2; ++j) {
                if (this._IsReachable(objectpool.MovableBodies[i], objectpool.Shells[j])) {
                    objectpool.Shells[j].Deactivate();
                }
            }
        //static bodies + shells
        for (let i = 0; i < len4; ++i)
            for (let j = 0; j < len2; ++j) {
                if (this._IsReachable(objectpool.StaticBodies[i], objectpool.Shells[j])) {
                    objectpool.Shells[j].Deactivate();
                }
            }
    }

    static _IsReachable(Obj1, Obj1) {
        let r = Obj1.GetRadius() + Obj2.GetRadius();
        r *= r;
        return r < Math.pow(Obj1.GetPosition().X + Obj2.GetPosition().X, 2) + Math.pow(Obj1.GetPosition().Y + Obj2.GetPosition().Y, 2);
    }

    static _ApplyPlayerPlayerCollision(player1, player2) {
        player1.FlushForces();
        player2.FlushForces();
        player1.Revert();
        player2.Revert();
    }
    static _ApplyPlayerShellCollision(player, shell) {
        shell.Deactivate();
        player.ModiFyHP(-shell.GetDamage());
    }
    static _ApplyPlayerInventoryItemCollision(player, inv_item) {
        player.Inventory.AddItem(inv_item);
        inv_item.Deactivate();
    }
    static _ApplyPlayerStaticBodyItemCollision(player) {
        player.FlushForces();
        player.Revert();
    }
    static _ApplyPlayerMovableBodyItemCollision(player) {
        player.FlushForces();
        player.Revert();
    }
}
