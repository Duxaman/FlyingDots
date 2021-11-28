
/*css классы для игровых объектов*/
const AssetId =
{
    Players:
    {
        Player: "Body Ship Player",
        Enemy: "Body Ship Enemy"
    },
    Bodies:
    {
        Star: "Body Star",
        Asteroid: "Body Asteroid",
    },
    Shells:
    {
        LiteWeaponShell: "Body LiteWeaponShell",
        FireWeaponShell: "Body FireWeaponShell",
        BibaWeaponShell: "Body BibaWeaponShell Map"
    },
    Buffs: {
        HealBuffItem: "Body HealBuffItem",
    },
    UI: {
        LiteWeaponUI: "Body LiteWeaponUI",
        FireWeaponUI: "Body FireWeaponUI",
        BibaWeaponUI: "Body BibaWeaponUI",
        HealBuffItemUI: "Body HealBuffItemUI"
    }
}

class GUID {
    static CreateGuid() {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }
}

class Randomizer {
    /**
     * Возвращает число распределенное по равномерному закону распределения
     * @param {*} min 
     * @param {*} max 
     * @returns 
     */
    static GetRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Возвращает число распределенное по нормальному закону распределения
     * @param {*} mx - мат. ожидание
     * @param {*} sx - среднеквадратичное отклонение
     * @returns 
     */
    static GetGaussRandom(mx, sx) {
        let sum = 0;
        for (let i = 0; i < 12; ++i) {
            sum += Math.random();
        }
        sum -= 6;
        if (mx == 0 && sx == 1) return sum;
        else return mx + sx * sum;
    }
}

class Point {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
    }
    /**
     * Возвращает дистанцию между двумя точками плоскости
     * @param {*} PointA 
     * @param {*} PointB 
     */
    static Distance(PointA, PointB) {
        return Math.sqrt(Math.pow(PointA.X - PointB.X, 2) + Math.pow(PointA.Y - PointB.Y, 2));
    }

    /**
     * Возвращает угол в градусах между вектором и нормалью
     * @param {*} VecAPoint - Координата начала вектора
     * @param {*} VecBPoint - Координата конца вектора
     */
    static VectorNormalAngle(VecAPoint, VecBPoint) {
        let den = Point.Distance(VecAPoint, VecBPoint);
        if (den !== 0) {
            let Angle = Math.acos((VecAPoint.X - VecBPoint.X) / den);
            Angle = Angle * 180 / Math.PI;
            if (VecAPoint.Y > VecBPoint.Y) {
                Angle = 180 + (180 - Angle);
            }
            return Angle;
        }
        return -1;
    }
}

/**
 * Сила действующая на тела
 */
class Force {
    /**
     * Создает новую силу
     * @param {*} acceleration - Ускорение
     * @param {*} angle - Угол приложения силы относительно нормали в градусах
     */
    constructor(acceleration, angle) {
        this.Acceleration = acceleration;
        if (angle < 0) {
            this.Angle = 360 - angle;
        }
        else
            if (angle > 360) {
                this.Angle = angle - 360;
            }
            else {
                this.Angle = angle;
            }
    }
}

/**
 *  Базовый класс для всех игровых объектов с физическими параметрами
 */
class GameObject {
    /**
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Radius - Радиус тела
     * @param {*} Mass - Масса тела
     */
    constructor(Position, Id, AssetId, Radius, Mass) {
        this._Position = Position;
        this._Id = Id;
        this._AssetId = AssetId;
        this._Radius = Radius;
        this._Mass = Mass;
        this._State = true;
    }

    GetPosition() {
        return this._Position;
    }

    GetAssetId() {
        return this._AssetId;
    }

    GetId() {
        return this._Id;
    }

    IsActive() {
        return this._State;
    }

    Deactivate() {
        this._State = false;
    }

    GetRadius() {
        return this._Radius;
    }

    GetMass() {
        return this._Mass;
    }
}

/**
 *  Базовый класс для всех игровых объектов которые можно добавить в инвентарь
 */
class InventoryItem extends GameObject {
    /**
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Amount - Количество элементов
     */
    constructor(Position, Id, AssetId, Amount) {
        super(Position, Id, AssetId, BaseRadius / 3, 0);
        this.Amount = Amount;
    }

    ActivateItem() {
        throw "InventoryItem - абстрактный класс, следует вызвать метод у потомка"
    }
}

/**
 * Представляет все виды оружия, которые можно добавить в инвентарь
 */

class WeaponItem extends InventoryItem {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Amount - Количество элементов
     * @param {*} shelltemplate - Снаряд хранящийся в данном элементе
     */
    constructor(Position, Id, AssetId, Amount, shelltemplate) {
        super(Position, Id, AssetId, Amount);
        this._ShellTemplate = shelltemplate;
    }

    ActivateItem(PlayerObj) {
        //create shell with the same coordinates and angle that player have
        if (this.Amount > 0) {
            let PlayerPos = PlayerObj.GetPosition();
            let Pos = new Point(PlayerPos.X, PlayerPos.Y);
            let shell = new Shell(Pos, GUID.CreateGuid(), this._ShellTemplate.GetAssetId(),
                this._ShellTemplate.GetRadius(), this._ShellTemplate.GetMass(), PlayerObj.MaxYPos, PlayerObj.MaxXPos,
                this._ShellTemplate.GetMaxDistance(), this._ShellTemplate.GetDamage(), PlayerObj.GetId());
            shell.AddForce(new Force(4, 180 + (180 - PlayerObj.GetAngle()))); //rotate coordinate system first, in order to correct y angle
            this.Amount -= 1;
            return shell;
        }
    }
}


/**
 * Представляет все виды баффов, которые можно добавить в инвентарь
 */
class BuffItem extends InventoryItem {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Amount - Количество элементов
     * @param {*} Power - Мощность баффа
     */
    constructor(Position, Id, AssetId, Amount, Power) {
        super(Position, Id, AssetId, Amount);
        this._Power = Power;
    }

    GetPower() {
        return this._Power;
    }

    ActivateItem(PlayerObj) {
        if (PlayerObj instanceof Player) {
            if (this.Amount > 0) {
                PlayerObj.ModifyHP(this._Power);
                this.Amount -= 1;
            }
        }
    }
}

/**
 * Базовый класс для всех движущихся объектов
 */
class MovableObject extends GameObject {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Radius - Радиус тела
     * @param {*} Mass - Масса тела
     * @param {*} MaxY - Максимальная позиция по оси Y
     * @param {*} MaxX - Максимальная позиция по оси Х
     */
    constructor(Position, Id, AssetId, Radius, Mass, MaxY, MaxX) {
        super(Position, Id, AssetId, Radius, Mass);
        this.MaxYPos = MaxY;
        this.MaxXPos = MaxX;
        this._OldPos;
        this._Angle = 0; //угол в градусах, угол в сторону которого движется тело относительно нормали (0-360)
        this._Forces = [];
    }

    /**
     * Добавляет телу новую силу
     * @param {*} force 
     */
    AddForce(force) {
        if (force instanceof Force) {
            if (this._Forces.length < MovableBodyForcesLimit) {
                this._Forces.push(force);
            }
        }
    }

    /**
     * Вызывает расчет новых координат тела в следующий момент времени на основе действующих на тело сил
     */
    Move() {
        this._OldPos = new Point(this._Position.X, this._Position.Y);
        for (let i = 0; i < this._Forces.length; ++i) {
            if (this._Forces[i].Acceleration > 0) {
                this._Position.X = this._Position.X + (this._Mass * this._Forces[i].Acceleration) * Math.cos(this._Forces[i].Angle * Math.PI / 180);
                this._Position.Y = this._Position.Y + (this._Mass * this._Forces[i].Acceleration) * Math.sin(this._Forces[i].Angle * Math.PI / 180);
                this._Forces[i].Acceleration -= Friction;
            }
        }
        this._Forces = this._Forces.filter(x => x.Acceleration > 0); //deletes forces with zero acceleration
        let CalcValue = Point.Distance(this._Position, this._OldPos);
        if (CalcValue > 0) {
            this._Angle = Math.acos((this._Position.X - this._OldPos.X) / CalcValue);
            this._Angle = this._Angle * 180 / Math.PI;
            if (this._Position.Y > this._OldPos.Y) {
                this._Angle = 180 + (180 - this._Angle);
            }
        }
        //correct coordinates with restrincted maxvalue
        if (this._Position.X < 0) this._Position.X = this.MaxXPos + this._Position.X;
        if (this._Position.X > this.MaxXPos) this._Position.X = this._Position.X - this.MaxXPos;
        if (this._Position.Y < 0) this._Position.Y = this.MaxYPos + this._Position.Y;
        if (this._Position.Y > this.MaxYPos) this._Position.Y = this._Position.Y - this.MaxYPos;

    }

    /**
     * Сбрасывает все силы объекта
     */
    FlushForces() {
        this._Forces = [];
    }

    /**
     * Возвращает мгновенное значение скорости тела относительно предыдущего положения
     * @returns 
     */
    GetSpeedDt() {
        if (this._OldPos === undefined) {
            return 0;
        }
        else {
            return Point.Distance(this._Position, this._OldPos);
        }
    }

    /**
     * Возвращает тело на его предыдущую позицию
     */
    Revert() {
        if (this._OldPos !== undefined) {
            if (this._OldPos === this._Position) {
                this._Position.X -= this._Radius * Math.round(Randomizer.GetRandomInt(-1, 1)); //teleport to random spot
                this._Position.Y -= this._Radius * Math.round(Randomizer.GetRandomInt(-1, 1));  //TODO:!!!
            }
            this._Position = this._OldPos;
        }
        else {
            if (this._Position.X - this._Radius >= 0) {
                this._Position.X -= this._Radius;
            }
            else {
                this._Position.X += this._Radius;
            }
        }
    }

    GetAngle() {
        return this._Angle;
    }
}

/**
 * Представляет оружейный снаряд
*/

class Shell extends MovableObject {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Radius - Радиус тела
     * @param {*} Mass - Масса тела
     * @param {*} MaxY - Максимальная позиция по оси Y
     * @param {*} MaxX - Максимальная позиция по оси Х
     * @param {*} MaxDistance - Максимальная дистанция полета снаряда
     * @param {*} Damage - Урон от снаряда
     * @param {*} FatherId - ID игрока создавшего снаряд
     */
    constructor(Position, Id, AssetId, Radius, Mass, MaxY, MaxX, MaxDistance, Damage, FatherId) {
        super(Position, Id, AssetId, Radius, Mass, MaxY, MaxX);
        this._MaxDistance = MaxDistance;
        this._CurrentDistance = 0;
        this._Damage = Damage;
        this._BaseForceAdded = false;
        this._FatherID = FatherId;
    }

    AddForce(force) {
        if (!this._BaseForceAdded) {
            super.AddForce(force)
            this._BaseForceAdded = true;
        }
        else {
            throw "Снарядам нельзя добавлять дополнительные силы";
        }

    }

    GetFatherID() {
        return this._FatherID;
    }

    Move() {
        if (this.IsActive()) {
            super.Move();
            this._CurrentDistance += Point.Distance(this._Position, this._OldPos);
            if (this._CurrentDistance >= this._MaxDistance) {
                this._State = false;
            }
            if (this._Forces.length === 0) {
                this._State = false;
            }
        }
    }

    GetMaxDistance() {
        return this._MaxDistance;
    }

    GetDamage() {
        return this._Damage;
    }
}

/**
 * Представляет игрока и его соперников
 */
class Player extends MovableObject {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Radius - Радиус тела
     * @param {*} Mass - Масса тела
     * @param {*} MaxY - Максимальная позиция по оси Y
     * @param {*} MaxX - Максимальная позиция по оси Х
     * @param {*} Name  - Имя игрока
     * @param {*} MaxHP - Максимальное здоровье игрока
     */
    constructor(Position, Id, AssetId, Radius, Mass, MaxY, MaxX, Name, MaxHP) {
        super(Position, Id, AssetId, Radius, Mass, MaxY, MaxX);
        this._Name = Name;
        this._Health = MaxHP;
        this._MaxHP = MaxHP;
        this.Inventory = new Inventory(InventorySize);
    }

    GetName() {
        return this._Name;
    }

    GetHP() {
        return this._Health;
    }

    GetMaxHP() {
        return this._MaxHP;
    }

    ModifyHP(hp) {
        if (this._Health + hp > this._MaxHP) {
            this._Health = this._MaxHP;
        }
        else
            if (this._Health + hp < 0) {
                this._Health = 0;
                this._State = false;
            }
            else {
                this._Health = hp + this._Health;
            }
    }
}

/**
 * Представляет игрока-соперника
 */
class EnemyPlayer extends Player {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Radius - Радиус тела
     * @param {*} Mass - Масса тела
     * @param {*} MaxY - Максимальная позиция по оси Y
     * @param {*} MaxX - Максимальная позиция по оси Х
     * @param {*} Name  - Имя игрока
     * @param {*} MaxHP - Максимальное здоровье игрока
     */
    constructor(Position, Id, AssetId, Radius, Mass, MaxY, MaxX, Name, MaxHP) {
        super(Position, Id, AssetId, Radius, Mass, MaxY, MaxX, Name, MaxHP);
        this._Object_to_Follow = null;
        this._AttackCounter = null;
    }

    Analyze(objectpool) {
        this._AttackCounter++;
        let can_attack = false;
        if (this._AttackCounter === AttackFrameTimeout) {
            can_attack = true;
            this._AttackCounter = 0;
        }
        let need_heal = false;
        let need_weapon = false;
        if ((this.GetHP() * 100 / this.GetMaxHP()) < 50) {
            need_heal = true;
        }
        need_weapon = this._WeaponCheck();
        if (this._CanFollowObject()) {
            if (need_heal) {
                if (!(this._Object_to_Follow instanceof BuffItem)) {
                    let res = this._TrySeekBuff(objectpool.InvItems.filter(x => x instanceof BuffItem));
                    if (res !== undefined) {
                        this._Object_to_Follow = res;
                    }
                }
                this._FollowBuff();
                return;
            }
            if (need_weapon) {
                if (!(this._Object_to_Follow instanceof WeaponItem)) {
                    let res = this._TrySeekBuff(objectpool.InvItems.filter(x => x instanceof WeaponItem));
                    if (res !== undefined) {
                        this._Object_to_Follow = res;
                    }
                }
                this._FollowBuff();
                return;
            }
            this._FollowPlayer();
            if (can_attack) {
                this._Attack();
            }
        }
        else {
            this._Object_to_Follow = null;
            if (need_heal) {
                let res = this._TrySeekBuff(objectpool.InvItems.filter(x => x instanceof BuffItem));
                if (res !== undefined) {
                    this._Object_to_Follow = res;
                    this._FollowBuff();
                    return;
                }
            }
            if (need_weapon) {
                let res = this._TrySeekBuff(objectpool.InvItems.filter(x => x instanceof WeaponItem));
                if (res !== undefined) {
                    this._Object_to_Follow = res;
                    this._FollowBuff();
                    return;
                }
            }
            let res = this._TrySeekPlayer(objectpool.Player);
            if (res !== undefined) {
                this._Object_to_Follow = res;
                this._FollowPlayer();
                return;
            }
            this._RandomMove();
        }
    }

    _CanFollowObject() {
        if (this.Object_to_Follow != null) {
            return this.Object_to_Follow.IsActive() && this._IsInVisionRange(this.Object_to_Follow);
        }
        return false;
    }

    _RandomMove() {
        this.AddForce(new Force(BaseAcceleration * 0.5, Randomizer.GetRandomInt(0, 360)));
    }

    _TrySeekBuff(inv_items_pool) {
        for (const element of inv_items_pool) {
            if (this._IsInVisionRange(this, element)) {
                return element;
            }
        }
    }

    _TrySeekPlayer(player) {
        if (this._IsInVisionRange(this, player))
            return player;
    }

    _IsInVisionRange(goal) {
        if (Point.Distance(this.GetPosition(), goal.GetPosition()) <= EnemyVisionRange) {
            return true;
        }
        return false;
    }

    _Heal() {
        /**
         * iterate over inventory, find first heal, activate it, return true
         * if heal was not activated return false
         */
        for (let i = 0; i < this.Inventory.Count(); ++i) {
            let Item = this.Inventory.GetItemAt(i);
            if (Item instanceof BuffItem) {
                this.Inventory.SelectItem(i);
                this.Inventory.ActivateItem(player_obj);
                return true;
            }
        }
        return false;
    }

    _Attack(shellpool) {
        shellpool.push(this.Inventory.ActivateItem(this));
    }

    _WeaponCheck() {
        /**
         * iterate over inventory, find first weapon, select it, return true
         * if none weapon was found return false
         */
        for (let i = 0; i < this.Inventory.Count(); ++i) {
            let Item = this.Inventory.GetItemAt(i);
            if (Item instanceof WeaponItem) {
                this.Inventory.SelectItem(i);
                return true;
            }
        }
        return false;
    }

    _FollowBuff() {
        //add forces towards goal
        //determine angle 
        let vec1 = this.GetPosition();
        let vec2 = this._Object_to_Follow.GetPosition();
        let calc_angle = Point.VectorNormalAngle(vec1, vec2);
        this.AddForce(new Force(BaseAcceleration * 0.25, calc_angle));
    }

    _FollowPlayer() {
        //add forces towards goal
        //determine angle 
        let vec1 = this.GetPosition();
        let vec2 = this._Object_to_Follow.GetPosition();
        let distance = Point.Distance(vec1, vec2);
        let calc_angle = Point.VectorNormalAngle(vec1, vec2);
        if (distance < 300) //if player is too close, dodge shells, don't get closer
        {
            this._RandomMove(obj);
        }
        else
            this.AddForce(new Force(BaseAcceleration * 0.25, calc_angle));


    }
}