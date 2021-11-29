const Difficulty =
{
    Easy: 0,
    Medium: 1,
    Hard: 2,
    Nuts: 3,
}

/**
 * Представляет хранилище всех игровых объектов
 */
class ObjectPool {
    constructor() {
        this.Player = null;
        this.Players = [];
        this.Shells = [];
        this.StaticBodies = [];
        this.MovableBodies = [];
        this.InvItems = [];
    }

    /**
     * Вызывает расчет следующей позиции на карте каждого движущегося тела
     */
    MoveObjects() {
        for (const obj of this.Shells) {
            obj.Move();
        }
        for (const obj of this.Players) {
            obj.Move();
        }
        for (const obj of this.MovableBodies) {
            obj.Move();
        }
    }

    /**
     * Добавляет сил каждому самостоятельно движущемуся телу
     */
    MaintainForces() {
        for (const obj of this.MovableBodies) {
            obj.AddForce(new Force(Randomizer.GetRandomInt(MovableBodiesMinAcceleration, MovableBodiesMaxAcceleration), Randomizer.GetGaussRandom(obj.GetAngle(), MovableBodiesAngleVariance)));
        }
    }

    /**
     * Вызывает у каждого ИИ соперника анализ карты, для выбора маршрута и цели
     */
    EnemiesAnalyze() {
        for (const obj of this.Players) {
            if (obj.GetId() != 0) {
                obj.Analyze(this);
            }
        }
    }

    /**
     * Возвращает массив неактивных игроков
     * @returns 
     */
    GetInactivePlayers() {
        return this.Players.filter(obj => !obj.IsActive());
    }

    /**
     * Возвращает массив неактивных снарядов 
     * @returns 
     */
    GetInactiveShells() {
        return this.Shells.filter(obj => !obj.IsActive());
    }


    GetInactiveInvItems() {
        return this.InvItems.filter(obj => !obj.IsActive())
    }

    ClearInactiveItems() {
        this.Players = this.Players.filter(obj => obj.IsActive()); //remove inactive elements
        this.Shells = this.Shells.filter(obj => obj.IsActive());
        this.InvItems = this.InvItems.filter(obj => obj.IsActive());
    }

}

/**
 * Управляющий объект игры
 */
class Game {
    /**
     * 
     * @param {*} FieldSize - Point задающий размер игрового поля
     * @param {*} OnGameOver - Функция вызываемая по окончанию игры, аргументы: Время игрока, счет 
     * @param {*} PlayerName - Имя игрока
     * @param {*} Diff - Сложность игры (0-3)
     */
    constructor(FieldSize, OnGameOver, PlayerName, Diff) {
        /**
         * Время начала игры
         */
        this._StartTime = null;
        /**
         * Время остановки игры
         */
        this._EndTime = null;
        /**
         * Итоговое время игры
         */
        this._SavedTime = null;
        /**
         * Таймер обновления карты
         */
        this._FrameTimer = null;
        /**
         * Функция вызываемая после окончания игры, аргументы: Время игрока, счет 
         */
        this._GameOverCallback = OnGameOver;
        /**
         * Маркер паузы
         */
        this._PauseMarker = false;
        /**
         * Итоговый счет текущей игры
         */
        this._Score = 0;
        /**
         * Счетчик обновлений карты, необходимый для спавна
         */
        this._SpawnFrameCounter = 0;
        /**
         * Хранилище всех игровых объектов
         */
        this._GameObjects = null;
        /**
         * Текущая сложность игры
         */
        this._Difficulty = Diff;
        /**
         * Размер игрового поля
         */
        this._FieldSize = FieldSize;
        this._PlayerName = PlayerName;
        this._Renderer = new Renderer();
    }

    /**
     * Начинает новую, или продолжает прерванную игру
     */
    Start() {
        if (!this._PauseMarker) {
            this._GameObjects = MapGenerator.GenerateMap(this._FieldSize);
            this._GameObjects.Player = new Player(new Point(10, 10), 0, AssetId.Players.Player, BaseRadius, BaseMass, this._FieldSize.Y, this._FieldSize.X, this._PlayerName, BaseMaxHP);
            this._GameObjects.Players.push(this._GameObjects.Player); //add player to objects
            this._Score = 0;
            this._SpawnFrameCounter = 0;
        }
        else {
            this._PauseMarker = false;
        }
        this._StartTime = performance.now(); // write startgame time
        this._FrameTimer = setInterval(() => this._GameTick(), FrameInterval);
        window.addEventListener('keydown', (event) => this._HandlePlayerMovement(event)); //watch player movements
    }

    /**
     * Приостанавливает текущую игру
     */
    Pause() {
        if (!this._PauseMarker) {
            this._SuspendGame();
            this._PauseMarker = true;
        }
    }

    /**
     * Заканчивает текущую игру
     */
    Stop() {
        this._SuspendGame();
        OnGameOver(this._PlayerName, this._SavedTime, this._Score);
    }

    /**
     * Возвращает строку содержащую время прошедшее от начала игры в формате m:s
     */
    GetTime() {
        let diff;
        if (this._SavedTime === null) {
            diff = performance.now() - this._StartTime;
        }
        else {
            diff = performance.now() - this._SavedTime;
        }
        let sec = Math.floor(diff / 1000);
        let hrs = Math.floor(sec / 3600);
        sec -= hrs * 3600;
        let min = Math.floor(sec / 60);
        sec -= min * 60;

        sec = '' + sec;
        sec = ('00' + sec).substring(sec.length);

        if (hrs > 0) {
            min = '' + min;
            min = ('00' + min).substring(min.length);
            return hrs + ":" + min + ":" + sec;
        }
        else {
            return min + ":" + sec;
        }

    }

    GetScore() {
        return this._Score;
    }

    /**
     * Возвращает массив с текущем HP игрока и его максимумом
     */
    GetPlayerStat() {
        return [this._GameObjects.Player.GetHP(), this._GameObjects.Player.GetMaxHP()]
    }

    /**
     * Возвращает массив пар ид элемента инвентаря - количество для каждого слота инвенторя игрока
     */
    GetInvStat() {
        let res = []
        for (let i = 0; i < this._GameObjects.Player.Inventory.Count(); ++i) {
            let val = this._GameObjects.Player.Inventory.GetItemAt(i);
            res.push([val.GetAssetId(), val.Amount]);
        }
        return res;
    }

    /**
     * Отслеживает нажатие клавиш и переводит их в событие управления игроком
     * @param {*} event - событие keydown
     */
    _HandlePlayerMovement(event) {
        let res;
        switch (event.key) {
            case FirstInvBtn:
                this._GameObjects.Player.Inventory.SelectItem(0);
                break;
            case SecondInvBtn:
                this._GameObjects.Player.Inventory.SelectItem(1);
                break;
            case ThirdInvBtn:
                this._GameObjects.Player.Inventory.SelectItem(2);
                break;
            case ForthInvBtn:
                this._GameObjects.Player.Inventory.SelectItem(3);
                break;
            case ActivateItemBtn:
                res = this._GameObjects.Player.Inventory.ActivateItem(this._GameObjects.Player);
                break;
            case MoveUpBtn:
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 270));
                break;
            case MoveDownBtn:
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 90));
                break;
            case MoveLeftBtn:
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 180));
                break;
            case MoveRightBtn:
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 0));
                break;
            default: break;
        }
        if (res !== undefined) {
            //add new objects to map
            this._GameObjects.Shells.push(res);
        }
    }

    /**
     * Останавливает таймер обновления карты, сохраняя текущее время игры
     */
    _SuspendGame() {
        this._EndTime = performance.now; //write player time
        if (this._SavedTime === null) {
            this._SavedTime = this._EndTime - this._StartTime;
        }
        else {
            this._SavedTime += this._EndTime - this._StartTime;
        }
        clearTimeout(this._FrameTimer); //stop game timer
        window.removeEventListener('keydown', this._HandlePlayerMovement); //stop watching for user input
    }

    /**
     * Обрабатывает все события игры в текущем кадре
     */
    _GameTick() {
        this._GameObjects.MoveObjects();
        this._GameObjects.EnemiesAnalyze();
        this._GameObjects.MaintainForces();
        let GameOver = false;
        FrameProcessor.CalculateFrame(this._GameObjects);
        if (this._GameObjects.Player.GetHP() === 0) {
            GameOver = true;
        }
        if (!GameOver) {
            let deadenemies = this._GameObjects.GetInactivePlayers().length;
            if (deadenemies > 0) {
                this._Score += ScoreForOne * (this._GameObjects.GetInactivePlayers().length - 1);

            }
            this._Despawn();
            if (this._SpawnFrameCounter === SpawnFrameTimeout) {
                this._SpawnItems();
                this._SpawnFrameCounter = 0;
            }
            this._Renderer.Render(this._GameObjects);
            this._SpawnFrameCounter++;
        }
        else {
            this.Stop();
        }
    }

    /**
     * Спавнит новые элементы на карту
     */
    _SpawnItems() {
        let CurrentBuffs = this._GameObjects.InvItems.filter(obj => obj instanceof BuffItem).length;
        let CurrentEnemies = this._GameObjects.Players.length - 1; //excluding player
        let CurrentWeapons = this._GameObjects.InvItems.filter(obj => obj instanceof WeaponItem).length;
        let BuffsToSpawn;
        let EnemiesToSpawn;
        let WeaponToSpawn;
        let MaxHP;
        if (this._Difficulty === Difficulty.Easy) {
            BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountEasy - CurrentBuffs);
            EnemiesToSpawn = Randomizer.GetRandomInt(1, MaxEnemyEasy - CurrentEnemies);
            WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountEasy - CurrentWeapons);
            MaxHP = MaxEnemyHPEasy;
        } else
            if (this._Difficulty === Difficulty.Medium) {
                BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountMedium - CurrentBuffs);
                EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyMedium - CurrentEnemies);
                WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountMedium - CurrentWeapons);
                MaxHP = MaxEnemyHPMedium;
            } else
                if (this._Difficulty === Difficulty.Hard) {
                    BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountHard - CurrentBuffs);
                    EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyHard - CurrentEnemies);
                    WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountHard - CurrentWeapons);
                    MaxHP = MaxEnemyHPHard;
                } else
                    if (this._Difficulty === Difficulty.Nuts) {
                        BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountNuts - CurrentBuffs);
                        EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyNuts - CurrentEnemies);
                        WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountNuts - CurrentWeapons);
                        MaxHP = MaxEnemyHPNuts;
                    }
        for (let i = 0; i < BuffsToSpawn; ++i) {
            this._GameObjects.InvItems.push(Spawner.SpawnBuff(this._FieldSize));
        }
        for (let i = 0; i < EnemiesToSpawn; ++i) {
            this._GameObjects.Players.push(Spawner.SpawnEnemy(MaxHP, this._FieldSize));
        }
        for (let i = 0; i < WeaponToSpawn; ++i) {
            this._GameObjects.InvItems.push(Spawner.SpawnWeapon(this._FieldSize));
        }
    }

    /**
     * Удаляет все неактивные элементы с карты
     */
    _Despawn() {
        //удаляем элементы
        this._Renderer.RemoveElements(this._GameObjects.GetInactivePlayers());
        this._Renderer.RemoveElements(this._GameObjects.GetInactiveShells());
        this._Renderer.RemoveElements(this._GameObjects.GetInactiveInvItems());
        //удаляем объекты
        this._GameObjects.ClearInactiveItems();
    }
}


/**
 * Представляет объект для отображения содержимого карты в интерфейс пользователя
 */
class Renderer {

    constructor() {
        this._PlayArea = document.getElementById(PlayAreaId);
    }

    /**
     * Отображает пул объектов в интерфейс пользователя
     * @param {*} objectpool 
     */
    Render(objectpool) {
        this._RenderPool(objectpool.Players);
        this._RenderPool(objectpool.Shells);
        this._RenderPool(objectpool.InvItems);
        this._RenderPool(objectpool.StaticBodies);
        this._RenderPool(objectpool.MovableBodies);
    }

    /**
     * Удаляет элементы с интерфейса пользователя
     * @param {*} array - массив элементов игры
     */
    RemoveElements(array) {
        for (const obj of array) {
            let el = document.getElementById(obj.GetId());
            if (el !== null) el.remove();
        }
    }

    _RenderPool(pool) {
        for (const obj of pool) {
            var element = document.getElementById(obj.GetId());
            if (element !== null) {
                this._SetPosition(element, obj.GetPosition(), obj.GetRadius());
                if (obj instanceof Player) this._SetProperties(element, obj.GetName(), obj.GetHP());
                if (obj instanceof EnemyPlayer) this._SetDebugProp(element, obj.State, obj.curforceangle);
            }
            else {
                element = this._CreateElement(obj);
                if (obj instanceof Player) this._SetProperties(element, obj.GetName(), obj.GetHP());
                if (obj instanceof EnemyPlayer) this._SetDebugProp(element, obj.State, obj.curforceangle);
                this._PlayArea.appendChild(element);
            }
        }
    }

    _SetDebugProp(element, state, curforceangle) {
        element.innerHTML = '<p>' + state + ' (' + curforceangle + ') </p > '; //not the best solution
    }

    _SetProperties(element, name, hp) {
        element.innerHTML = '<p>' + name + ' (' + Math.round(hp) + ') </p > '; //not the best solution
    }

    _SetPosition(element, position, radius) {
        element.style.top = position.Y - radius + "px";
        element.style.left = position.X - radius + "px";
    }
    _CreateElement(obj) {
        let element = document.createElement('div');
        element.setAttribute('id', obj.GetId());
        element.setAttribute('class', obj.GetAssetId());
        if (obj instanceof InventoryItem) { //no the best solutuion
            element.classList.add('Map');
        }
        this._SetPosition(element, obj.GetPosition(), obj.GetRadius());
        element.style.width = obj.GetRadius() * 2 + "px";
        element.style.height = obj.GetRadius() * 2 + "px";
        return element
    }
}