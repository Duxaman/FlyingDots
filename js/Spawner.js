class Spawner {
    static DefaultNames = ["Titananderson", "Burnsshimmer", "Thudhes", "Evansano", "Hawkiniel", "Crookedsmi",
        "Pontison", "Dunntrosity", "Ariwis", "Vitek", "Lina", "Mansteinia", "Twinkleckson", "Antiby", "Winabla", "Heropogo",
        "Bailas", "Fornrres", "Mashrson", "Watsonbow", "Gardnereth", "Antirees", "Lobstrosmorrison", "Toralka", "Olale",
        "Abalham", "Hammashmed", "Wickedson", "Patestat", "Johnpuffn", "Edwarvin", "Battlegreene"];

    static _DetermineSpawnPoint(mapsize) {
        return new Point(Randomizer.GetRandomInt(0, mapsize.X), Randomizer.GetRandomInt(0, mapsize.Y));
    }

    static _ConstructBuff(MapPoint) {
        return new BuffItem(MapPoint, GUID.CreateGuid(), AssetId.UI.HealBuffItemUI, Randomizer.GetRandomInt(1, 3), Randomizer.GetRandomInt(1, BaseMaxHP));
    }

    static _ConstructWeapon(MapPoint) {
        let buff_type = Randomizer.GetRandomInt(0, 3);
        var ShellTemplate;
        var Asset;
        if (buff_type === 0) {
            ShellTemplate = new Shell(MapPoint, GUID.CreateGuid(), AssetId.Shells.LiteWeaponShell, BaseShellRadius, BaseShellMass, 0, 0, ShellMaxDistance, BaseDamage, -1);
            Asset = AssetId.UI.LiteWeaponUI;
        }
        if (buff_type === 1) {
            ShellTemplate = new Shell(MapPoint, GUID.CreateGuid(), AssetId.Shells.FireWeaponShell, BaseShellRadius * 2, BaseShellMass * 2, 0, 0, ShellMaxDistance * 2, BaseDamage * 3, -1);
            Asset = AssetId.UI.FireWeaponUI;
        }
        else {
            ShellTemplate = new Shell(MapPoint, GUID.CreateGuid(), AssetId.Shells.BibaWeaponShell, BaseShellRadius * 10, BaseShellMass * 3, 0, 0, ShellMaxDistance * 3, -5, -1);
            Asset = AssetId.UI.BibaWeaponUI;
        }
        return new WeaponItem(MapPoint, GUID.CreateGuid(), Asset, Randomizer.GetRandomInt(1, 100), ShellTemplate);
    }

    static _ConstructEnemy(MapPoint, MaxHp, mapsize) {
        let Asset = AssetId.Players.Enemy;
        let Radius = BaseRadius;
        let Mass = BaseMass;
        let Name = this.DefaultNames[Randomizer.GetRandomInt(1, this.DefaultNames.length)];
        let ID = GUID.CreateGuid();
        return new Player(MapPoint, ID, Asset, Radius, Mass, mapsize.Y, mapsize.X, Name, MaxHp);
    }

    static SpawnBuff(mapsize) {            //spawn at any point, collisions will be resolved anyway
        return this._ConstructBuff(this._DetermineSpawnPoint(mapsize));
    }
    static SpawnWeapon(mapsize) {
        return this._ConstructWeapon(this._DetermineSpawnPoint(mapsize));
    }
    static SpawnEnemy(MaxHp, mapsize) {
        return this._ConstructEnemy(this._DetermineSpawnPoint(mapsize), MaxHp, mapsize);
    }
}