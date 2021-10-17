class MapGenerator {

    static _GenerateStaticBody(Position) {
        return new GameObject(Position, GUID.CreateGuid(), AssetId.Bodies.Star, Randomizer.GetRandomInt(20, 300), Randomizer.GetRandomInt(BaseMass, 1000));
    }

    static _GenerateMovableBody(Position) {
        return new MovableObject(Position, GUID.CreateGuid(), AssetId.Bodies.Asteroid, Randomizer.GetRandomInt(20, 300), Randomizer.GetRandomInt(BaseMass, 1000));
    }

    /**
     * Генерирует статичные и движущиеся тела на карте
     * @param {*} width 
     * @param {*} height 
     */
    static GenerateMap(width, height) {
        //determine amount of static bodies, 
        //determine amount of movable bodies
        let StaticBodyAm = Randomizer.GetRandomInt(0, MaxStaticBodiesPerMap);
        let MovableBodyAm = Randomizer.GetRandomInt(0, MaxMovableBodiesPerMap);
        let gameobjects = [];
        let Position = new Point(Randomizer.GetRandomInt(0, width), Randomizer.GetRandomInt(0, height));
        for (let i = 0; i < StaticBodyAm; ++i) {
            gameobjects.push(this._GenerateStaticBody(Position));
        }
        for (let i = 0; i < MovableBodyAm; ++i) {
            gameobjects.push(this._GenerateMovableBody(Position));
        }
        return gameobjects;

    }
}