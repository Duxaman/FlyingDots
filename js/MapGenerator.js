class MapGenerator {

    static _GenerateStaticBody(Position) {
        return new GameObject(Position, GUID.CreateGuid(), AssetId.Bodies.Star, Randomizer.GetRandomInt(20, 300), Randomizer.GetRandomInt(BaseMass, 1000));
    }

    static _GenerateMovableBody(Position, maxpos) {
        return new MovableObject(Position, GUID.CreateGuid(), AssetId.Bodies.Asteroid, Randomizer.GetRandomInt(20, 300),
            Randomizer.GetRandomInt(BaseMass, 1000), maxpos.Y, maxpos.X);
    }

    /**
     * Генерирует статичные и движущиеся тела на карте
     * @param {*} size - point x,y задающий размер карты
     */
    static GenerateMap(size) {
        //determine amount of static bodies, 
        //determine amount of movable bodies
        let StaticBodyAm = Randomizer.GetRandomInt(0, MaxStaticBodiesPerMap);
        let MovableBodyAm = Randomizer.GetRandomInt(0, MaxMovableBodiesPerMap);
        let gameobjects = new ObjectPool();
        for (let i = 0; i < StaticBodyAm; ++i) {
            let Position = new Point(Randomizer.GetRandomInt(0, size.X), Randomizer.GetRandomInt(0, size.Y));
            gameobjects.StaticBodies.push(this._GenerateStaticBody(Position));
        }
        for (let i = 0; i < MovableBodyAm; ++i) {
            let Position = new Point(Randomizer.GetRandomInt(0, size.X), Randomizer.GetRandomInt(0, size.Y));
            gameobjects.MovableBodies.push(this._GenerateMovableBody(Position, size));
        }
        return gameobjects;

    }
}