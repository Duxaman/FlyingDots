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
                    this._ApplyPlayerPlayerCollision(objectpool.Players[i], objectpool.Players[j]);
                }
            }
            for (let j = 0; j < len2; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.Shells[j])
                    && objectpool.Shells[j].GetFatherID() !== objectpool.Players[i].GetId()) {
                    this._ApplyPlayerShellCollision(objectpool.Players[i], objectpool.Shells[j]);
                }
            }
            for (let j = 0; j < len3; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.InvItems[j])) {
                    this._ApplyPlayerInventoryItemCollision(objectpool.Players[i], objectpool.InvItems[j]);
                }
            }
            for (let j = 0; j < len4; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.StaticBodies[j])) {
                    this._ApplyPlayerStaticBodyItemCollision(objectpool.Players[i]);
                }
            }
            for (let j = 0; j < len5; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.MovableBodies[j])) {
                    this._ApplyPlayerMovableBodyItemCollision(objectpool.Players[i], objectpool.MovableBodies[j]);
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

    static _IsReachable(Obj1, Obj2) {
        let r = Obj1.GetRadius() + Obj2.GetRadius();
        return r >= Point.Distance(Obj1.GetPosition(), Obj2.GetPosition());
    }

    static _ApplyPlayerPlayerCollision(player1, player2) {
        player1.FlushForces();
        player2.FlushForces();
        player1.Revert();
        player2.Revert();
    }
    static _ApplyPlayerShellCollision(player, shell) {
        shell.Deactivate();
        player.ModifyHP(-shell.GetDamage());
    }
    static _ApplyPlayerInventoryItemCollision(player, inv_item) {
        player.Inventory.AddItem(inv_item);
        inv_item.Deactivate();
    }
    static _ApplyPlayerStaticBodyItemCollision(player) {      //dummy physics
        player.ModifyHP(-player.GetSpeedDt() * player.GetMass() * 0.1);
        player.FlushForces();
        player.Revert();
    }
    static _ApplyPlayerMovableBodyItemCollision(player, movable_body) {
        player.ModifyHP(-(player.GetSpeedDt() * player.GetMass() + movable_body.GetSpeedDt() * movable_body.GetMass()) * 0.001);
        player.FlushForces();
        player.Revert();
    }
}
