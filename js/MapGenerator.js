class MapGenerator {

    static _GenerateStaticBody(Position) {
        return new GameObject(Position, GUID.CreateGuid(), AssetId.Bodies.Star, Randomizer.GetRandomInt(5, StaticBodiesMaxRadius), Randomizer.GetRandomInt(BaseMass, StaticBodiesMaxMass));
    }

    static _GenerateMovableBody(Position, maxpos) {
        return new MovableObject(Position, GUID.CreateGuid(), AssetId.Bodies.Asteroid, Randomizer.GetRandomInt(5, MovableBodiesMaxRadius),
            Randomizer.GetRandomInt(BaseMass, MovableBodiesMaxMass), maxpos.Y, maxpos.X);
    }

    /**
     * Генерирует статичные и движущиеся тела на карте
     * @param {*} size - point x,y задающий размер карты
     */
    static GenerateMap(size) {
        //determine amount of static bodies, 
        //determine amount of movable bodies
        let StaticBodyAm = Randomizer.GetRandomInt(0, MaxStaticBodiesPerMap + 1);
        let MovableBodyAm = Randomizer.GetRandomInt(0, MaxMovableBodiesPerMap + 1);
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