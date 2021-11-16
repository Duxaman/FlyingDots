
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
        BibaWeaponShell: "Body BibaWeaponShell"
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
    static GetRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
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
     * Возвращает угол в градусах между двумя векторами относительно нормали
     * @param {*} VecAPoint - Координата первого вектора
     * @param {*} VecBPoint - Координата второго вектора
     */
    static VectorNormalAngle(VecAPoint, VecBPoint) {
        var den = Point.Distance(VecAPoint, VecBPoint);
        if (den !== 0) {
            var Angle = Math.acos((VecAPoint.X - VecBPoint.X) / den);
            Angle = this._Angle * 180 / Math.PI;
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
        this.Angle = angle;
    }
}

/**
 * Базовый класс для всех игровых объектов
 */
class SpawnableObject {
    /**
     * 
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} Asset - Сss класс
     */
    constructor(Position, Id, Asset) {
        this._Position = Position;
        this._Id = Id;
        this._AssetId = Asset;
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
}

/**
 *  Базовый класс для всех игровых объектов с физическими параметрами
 */
class GameObject extends SpawnableObject {
    /**
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Radius - Радиус тела
     * @param {*} Mass - Масса тела
     */
    constructor(Position, Id, AssetId, Radius, Mass) {
        super(Position, Id, AssetId);
        this._Radius = Radius;
        this._Mass = Mass;
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
class InventoryItem extends SpawnableObject {
    /**
     * @param {*} Position - Позиция тела на карте
     * @param {*} Id - Идентификатор тела
     * @param {*} AssetId - Сss класс
     * @param {*} Amount - Количество элементов
     */
    constructor(Position, Id, AssetId, Amount) {
        super(Position, Id, AssetId);
        this.Amount = Amount;
    }

    Dectivate() {
        this._State = false;
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
            return new Shell(PlayerObj.GetPosition(), this._Radius, this._Mass, this._AssetId, GUID.CreateGuid(), this._Distance, this._Damage);
        }
        else {
            throw "Этот элемент закончился";
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

    ActivateItem() {
        if (PlayerObj instanceof Player) {
            if (this.Amount > 0) {
                if (this._AssetId === AssetId.Buffs.HealBuffItem) {
                    PlayerObj.Heal(this._Power);
                }
            }
            else throw "Этот элемент закончился";
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
     */
    constructor(...args) {
        super(...args);
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
        let CalcValue = Point.VectorNormalAngle(this._Position, this._OldPos);
        if (CalcValue >= 0) {
            this._Angle = CalcValue;
        }
    }

    /**
     * Сбрасывает все силы объекта
     */
    FlushForces() {
        this._Forces = [];
    }

    Teleport(NewPosition) {
        this._Position = Position;
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
     * @param {*} MaxDistance - Максимальная дистанция полета снаряда
     * @param {*} Damage - Урон от снаряда
     */
    constructor(Position, Id, AssetId, Radius, Mass, MaxDistance, Damage) {
        super(Position, Id, AssetId, Radius, Mass);
        this._MaxDistance = MaxDistance;
        this._CurrentDistance = 0;
        this._Damage = Damage;
        this._BaseForceAdded = false;
    }

    AddForce(force) {
        if (!this._BaseForceAdded) {
            super(force)
            this._BaseForceAdded = true;
        }
        else {
            throw "Снарядам нельзя добавлять дополнительные силы";
        }

    }

    Move() {
        if (this.IsActive()) {
            super();
            this._CurrentDistance += Point.Distance(this._Position, this._OldPos);
            if (this._CurrentDistance === this._MaxDistance) {
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
     * @param {*} Name 
     * @param {*} MaxHP 
     */
    constructor(Position, Id, AssetId, Radius, Mass, Name, MaxHP) {
        super(Position, Id, AssetId, Radius, Mass);
        this._Name = Name;
        this._Health = MaxHP;
        this._MaxHP = MaxHP;
        this.Inventory = new Inventory();
    }

    GetName() {
        return this._Name;
    }

    GetHP() {
        return this._Health;
    }

    GetMaxHp() {
        return _MaxHP;
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