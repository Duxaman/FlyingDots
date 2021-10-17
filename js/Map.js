class Map {
    constructor(width, height) {
        this.Width = width;
        this.Height = height;
        this._Net = [];
    }
    GetElement(x, y) {
        return this._Net[x + y * this.Width]
    }
    /**
     * Добавлят элемент на звдвнное положение на карте, допускается наличия нескольких элементов сразу
     * @param {*} Object 
     */
    AppendElement(Object) {
        if (this._Net[Math.round(Object.Position.X) + Math.round(Object.Position.Y) * this.Width] === undefined) {
            this._Net[Math.round(Object.Position.X) + Math.round(Object.Position.Y) * this.Width] = [];
        }
        this._Net[Math.round(Object.Position.X) + Math.round(Object.Position.Y) * this.Width].push(Object);
    }
    ClearMap() {
        this._Net = [];
    }
}