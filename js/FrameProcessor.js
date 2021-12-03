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
            for (let j = 0; j < len2; ++j) {
                if (this._IsObjShellReachable(objectpool.Players[i], objectpool.Shells[j])
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
                    this._ApplyPlayerStaticBodyCollision(objectpool.Players[i]);
                }
            }
            for (let j = 0; j < len5; ++j) {
                if (this._IsReachable(objectpool.Players[i], objectpool.MovableBodies[j])) {
                    this._ApplyPlayerMovableBodyCollision(objectpool.Players[i], objectpool.MovableBodies[j]);
                }
            }
        }  //mov bodies + shells
        for (let i = 0; i < len5; ++i)
            for (let j = 0; j < len2; ++j) {
                if (this._IsObjShellReachable(objectpool.MovableBodies[i], objectpool.Shells[j])) {
                    objectpool.Shells[j].Deactivate();
                }
            }
        //static bodies + shells
        for (let i = 0; i < len4; ++i)
            for (let j = 0; j < len2; ++j) {
                if (this._IsObjShellReachable(objectpool.StaticBodies[i], objectpool.Shells[j])) {
                    objectpool.Shells[j].Deactivate();
                }
            }
    }

    static _IsReachable(Obj1, Obj2) {
        let r = Obj1.GetRadius() + Obj2.GetRadius();
        return r >= Point.Distance(Obj1.GetPosition(), Obj2.GetPosition());
    }

    /**
     * Проверяет произошла ли коллизия между объектом и снарядом в момент его перехода из старой к новой позиции
     */
    static _IsObjShellReachable(Obj, Shell) {
        /**
         * Снаряд может двигаться очень быстро, перескакивая от одной позиции на другую,
         * но при этом на траектории его движения могут быть элементы с которыми он может 
         * столкнуться
         */
        //determine shell prev and current position
        let oldpos = Shell.GetOldPos();
        if (oldpos === null) {
            return this._IsReachable(Obj, Shell);
        }
        let curpos = Shell.GetPosition();
        let xstart = oldpos.X;
        let xend = curpos.X;
        let ystart = oldpos.Y;
        let yend = curpos.Y;
        let xlen = Math.abs(xend - xstart);
        let ylen = Math.abs(yend - ystart);
        let xstep = curpos.X > oldpos.X ? xlen / ShellCollisionTrack : -xlen / ShellCollisionTrack;
        let ystep = curpos.Y > oldpos.Y ? ylen / ShellCollisionTrack : -ylen / ShellCollisionTrack;
        for (let x = xstart, y = ystart, i = 0; i < ShellCollisionTrack; x += xstep, y += ystep, ++i) {
            if (this._IsReachable(Obj, new GameObject(new Point(x, y), -1, '-1', Shell.GetRadius(), Shell.GetMass()))) {
                return true;
            }
        }
        return false;
    }

    static _ApplyPlayerShellCollision(player, shell) {
        shell.Deactivate();
        player.ModifyHP(-shell.GetDamage());
    }
    static _ApplyPlayerInventoryItemCollision(player, inv_item) {
        player.Inventory.AddItem(inv_item);
        inv_item.Deactivate();
    }
    static _ApplyPlayerStaticBodyCollision(player) {      //dummy physics
        player.ModifyHP(-player.GetSpeedDt() * player.GetMass() * 0.1);
        player.FlushForces();
        player.Revert();
    }
    static _ApplyPlayerMovableBodyCollision(player, movable_body) {
        player.ModifyHP(-(player.GetSpeedDt() * player.GetMass() + movable_body.GetSpeedDt() * movable_body.GetMass()) * 0.001);
        player.FlushForces();
        player.Revert();
    }
}
