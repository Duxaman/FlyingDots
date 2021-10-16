class Map {
    constructor(width, height) {
        this.Width = width;
        this.Height = height;
        this._Net = [];
    }
    GetElement(x, y) {
        return this._Net[x + y * this.Width]
    }
    AppendElement(Object) {
        this._Net[Math.round(Object.Position.X) + Math.round(Object.Position.Y) * this.Width] = Object;
    }
    ClearMap() {
        this._Net = [];
    }
}