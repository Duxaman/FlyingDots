class Spawner {
    static DefaultNames = ["Titananderson", "Burnsshimmer", "Thudhes", "Evansano", "Hawkiniel", "Crookedsmi",
        "Pontison", "Dunntrosity", "Ariwis", "Vitek", "Lina", "Mansteinia", "Twinkleckson", "Antiby", "Winabla", "Heropogo",
        "Bailas", "Fornrres", "Mashrson", "Watsonbow", "Gardnereth", "Antirees", "Lobstrosmorrison", "Toralka", "Olale",
        "Abalham", "Hammashmed", "Wickedson", "Patestat", "Johnpuffn", "Edwarvin", "Battlegreene"];

    static _DetermineSpawnPoint(Map) {
        var pointfound = false;
        while (!pointfound) {
            let x = Randomizer.GetRandomInt(0, Map.Width);
            let y = Randomizer.GetRandomInt(0, Map.Height);
            let MapPoint = Map.GetElement(x, y);
            if (MapPoint !== undefined) {
                if (MapPoint.Players.length === 0 &&
                    MapPoint.GameObjects.length === 0) //only spawn if there is no other players and other buffs
                {
                    return new Point(x, y);
                }
            }
            else {
                pointfound = true;
            }
        }
        return new Point(x, y);
    }

    static _ConstructBuff(MapPoint) {
        return new BuffItem(MapPoint, GUID.CreateGuid(), AssetId.UI.HealBuffItemUI, Randomizer.GetRandomInt(1, 3), Randomizer.GetRandomInt(1, BaseMaxHP));
    }

    static _ConstructWeapon(MapPoint) {
        let buff_type = Randomizer.GetRandomInt(0, 3);
        var ShellTemplate;
        var Asset;
        if (buff_type === 0) {
            ShellTemplate = new Shell(MapPoint, GUID.CreateGuid(), AssetId.Shells.LiteWeaponShell, BaseRadius, BaseMass, MaxDistance, BaseDamage);
            Asset = AssetId.UI.LiteWeaponUI;
        }
        if (buff_type === 1) {
            ShellTemplate = new Shell(MapPoint, GUID.CreateGuid(), AssetId.Shells.FireWeaponShell, BaseRadius * 2, BaseMass * 2, MaxDistance * 2, BaseDamage * 3);
            Asset = AssetId.UI.FireWeaponUI;
        }
        else {
            ShellTemplate = new Shell(MapPoint, GUID.CreateGuid(), AssetId.Shells.BibaWeaponShell, BaseRadius * 3, BaseMass * 3, MaxDistance * 3, -5);
            Asset = AssetId.UI.BibaWeaponUI;
        }
        return new WeaponItem(MapPoint, GUID.CreateGuid(), Asset, Randomizer.GetRandomInt(1, 100), ShellTemplate);
    }

    static _ConstructEnemy(MapPoint, MaxHp) {
        let Asset = AssetId.Players.Enemy;
        let Radius = BaseRadius * 10;
        let Mass = BaseMass;
        let MaxHp = BaseMaxHP;
        let Name = this.DefaultNames[Randomizer.GetRandomInt(1, this.DefaultNames.length)];
        let ID = GUID.CreateGuid();
        return new Player(MapPoint, ID, Asset, Radius, Mass, Name, MaxHp);
    }

    static SpawnBuff(Map) {
        return this._ConstructBuff(this._DetermineSpawnPoint(Map));
    }
    static SpawnWeapon(Map) {
        return this._ConstructWeapon(this._DetermineSpawnPoint(Map));
    }
    static SpawnEnemy(Map, MaxHp) {
        return this._ConstructEnemy(this._DetermineSpawnPoint(Map), MaxHp);
    }
}