class ColisionCalculator {

    static _GetCollidableObjects(Position, Map) {
        let Colliders = [];
        let indx = (Position.X - CollisionSensitivity) < 0 ? 0 : Position.X - CollisionSensitivity;
        let indy = (Position.Y - CollisionSensitivity) < 0 ? 0 : Position.Y - CollisionSensitivity;
        let endindx = (Position.X + CollisionSensitivity) > Map.MaxWidth ? Map.MaxWidth : Position.X + CollisionSensitivity;
        let endndy = (Position.Y + CollisionSensitivity) > Map.MaxHeight ? Map.MaxHeight : Position.Y + CollisionSensitivity;
        for (indx; indx < endindx; ++indx)
            for (indy; indy < endndy; ++indy) {
                if (indx === Position.X && indy === Position.Y) continue;
                let Elements = Map.GetElement(indx, indy);
                if (Elements !== undefined) {
                    Colliders.push(Elements);
                }
            }
        return Colliders;
    }

    /**
     * Рассчитывает коллизию для обьекта на основе его окружения на карте
     * @param {*} GameObj - объект типа movableobject
     * @param {*} Map - объект Map текущего кадра
     * @returns 
     */
    static CalculateCollision(GameObj, Map) {
        /**
         * Следует учесть следующие коллизии:
         * 1) Столкновение тел друг с другом: Удаляем все силы из обоих тел
         * 2) Столкновение игрока со снарядом: Применяем урон от снаряда, отключаем снаряд
         * 3) Столкновение игрока с концом карты : Удаляем все силы из тела, перемещаем обратно на карту
         */
        if (!(GameObj instanceof MovableObject)) return;
        let Position = GameObj.GetPosition();    //TODO: Что если объекты по умолчанию будут в колизии?
        if (GameObj instanceof Player) {
            let Colliders = this._GetCollidableObjects(GameObj.Position, Map);
            for (let i = 0; i < Colliders.length; ++i) {
                if (Colliders[i] instanceof Shell) {
                    GameObj.ModifyHP(Colliders[i].GetDamage());
                    Colliders[i].FlushForces();
                    continue;
                }
                if (Colliders[i] instanceof Player) {
                    Colliders[i].FlushForces();
                    GameObj.FlushForces();
                    continue;
                }
                if (Colliders[i] instanceof InventoryItem) {
                    if (GameObj.Inventory.AddItem(Colliders[i])) {
                        Colliders[i].Deactivate();
                    }
                    continue;
                }
                else {
                    GameObj.FlushForces();
                }
            }
        }

        /**
         * Проверяем выход за карту, в случае выхода у снарядов удаляем все силы,
         * у остальных телепортируем обратно и тоже удаляем все силы
         */
        if (Position.X < 0 || Position.X > Map.Width) {
            if (GameObj instanceof Shell) {
                GameObj.FlushForces();
                return;
            }
            GameObj.FlushForces();
            GameObj.Teleport(new Point(Map.Width - 10, GameObj.Position.Y));
        }
        if (Position.Y < 0 || Position.Y > Map.Height) {
            if (GameObj instanceof Shell) {
                GameObj.FlushForces();
                return;
            }
            GameObj.FlushForces();
            GameObj.Teleport(new Point(GameObj.Position.X, Map.Height - 10));
        }

    }
}