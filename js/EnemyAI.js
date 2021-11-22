class EnemyAI {
    static Analyze(playerobj, objectpool, allowed_to_attack) {
        let obj_to_follow;
        let can_chase_player = false;
        if ((playerobj.GetHp() * 100 / playerobj.GetMaxHP()) < 50) { //check hp
            if (!this._Heal(playerobj)) {
                obj_to_follow = this._TrySeekHeal(playerobj, objectpool.InvItems);
            }
        }
        if (obj_to_follow === undefined) {
            can_chase_player = this._WeaponCheck(playerobj);
            if (!can_chase_player) {
                obj_to_follow = this._TrySeekWeapon(playerobj, objectpool.InvItems);
            }
        }
        if (can_chase_player) {
            if (obj_to_follow === undefined) {
                obj_to_follow = this._TrySeekPlayer(playerobj, objectpool.Player);
                if (obj_to_follow !== undefined && allowed_to_attack) {
                    this._Attack(playerobj, objectpool.Shells);
                }
            }
        }
        if (obj_to_follow === undefined) {
            this._RandomMove(playerobj);
        }
        this.FollowObj(playerobj, obj_to_follow);
    }


    static _RandomMove(player_obj) {
        player_obj.AddForce(new Force(BaseAcceleration, Randomizer.GetRandomInt(0, 360)));
    }

    static _TrySeekHeal(playerobj, inv_items_pool) {
        for (const element of inv_items_pool) {
            if (element instanceof BuffItem) {
                if (_IsInVisionRange(playerobj, element))
                    return element;
            }
        }
    }

    static _TrySeekWeapon(playerobj, inv_items_pool) {
        for (const element of inv_items_pool) {
            if (element instanceof WeaponItem) {
                if (_IsInVisionRange(playerobj, element))
                    return element;
            }
        }
    }

    static _TrySeekPlayer(playerobj, player) {
        if (_IsInVisionRange(playerobj, player))
            return element;
    }

    static _IsInVisionRange(playerobj, goal) {
        if (Point.Distance(playerobj.GetPosition(), goal.GetPosition()) <= EnemyVisionRange) {
            return true;
        }
        return false;
    }

    static _Heal(player_obj) {
        /**
         * iterate over inventory, find first heal, activate it, return true
         * if heal was not activated return false
         */
        for (let i = 0; i < player_obj.Inventory.Count(); ++i) {
            let Item = player_obj.GetItemAt(i);
            if (Item instanceof BuffItem) {
                player_obj.Inventory.SelectItem(i);
                player_obj.Inventory.ActivateItem(player_obj);
                return true;
            }
        }
        return false;
    }

    static _Attack(attacker, shellpool) {
        shellpool.push(attacker.Inventory.ActivateItem(attacker));
    }

    static _WeaponCheck(player_obj) {
        /**
         * iterate over inventory, find first weapon, select it, return true
         * if none weapon was found return false
         */
        for (let i = 0; i < player_obj.Inventory.Count(); ++i) {
            let Item = player_obj.GetItemAt(i);
            if (Item instanceof WeaponItem) {
                player_obj.Inventory.SelectItem(i);
                return true;
            }
        }
        return false;
    }

    static FollowObj(obj, obj_to_follow) {
        //add forces towards goal
        //determine angle 
        let vec1 = obj.GetPosition();
        let vec2 = obj_to_follow.GetPosition();
        let distance = Point.Distance(obj, obj_to_follow);
        let calc_angle = Point.VectorNormalAngle(vec1, vec2);
        if (Math.abs(obj.GetAngle() - calc_angle) > 20 && distance > 200) {
            obj.AddForce(new Force(BaseAcceleration, calc_angle));
        }
    }
}