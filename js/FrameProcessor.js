class FrameProcessor {
    constructor() {
        this._PlayerPlayerMap = new Map();
        this._PlayerShellMap = new Map();
        this._PlayerInvItemMap = new Map();
        this._PlayerStaticBodiesMap = new Map();
        this._PlayerMovableBodiesMap = new Map();
        this._MovableBodiesShellMap = new Map();
        this._MovableBodiesStaticBodiesMap = new Map();
        this._MovableBodiesMovableBodiesMap = new Map();
        this._StaticBodiesShellMap = new Map();
    }

    /**
     * Выполняет расчет текущего кадра, обновляя физические характеристики пула объектов
     * @param {*} objectpool this.пул игровых объектов
     */
    CalculateFrame(objectpool) {

    }


    _ApplyTeleport() {

    }

    /**
     * Очищает вычисленные значения текущего кадра
     */
    ResetFrame() {
        this._PlayerPlayerMap.clear();
        this._PlayerShellMap.clear();
        this._PlayerInvItemMap.clear();
        this._PlayerStaticBodiesMap.clear();
        this._PlayerMovableBodiesMap.clear();
        this._MovableBodiesShellMap.clear();
        this._MovableBodiesStaticBodiesMap.clear();
        this._MovableBodiesMovableBodiesMap.clear();
        this._StaticBodiesShellMap.clear();
    }
}