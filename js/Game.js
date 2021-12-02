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


    /**
     * Возвращает массив неактивных элементов инвентаря
     * @returns 
     */
    GetInactiveInvItems() {
        return this.InvItems.filter(obj => !obj.IsActive())
    }

    /**
     * Удаляет все неактивные элементы из пулы объектов
     */
    ClearInactiveItems() {
        this.Players = this.Players.filter(obj => obj.IsActive()); //remove inactive elements
        this.Shells = this.Shells.filter(obj => obj.IsActive());
        this.InvItems = this.InvItems.filter(obj => obj.IsActive());
    }

}

/**
 * Представляет карту активации действий для управления игроком
 */
class ControlActivationMap {
    constructor() {
        this._ActivationMap = new Map();
        this._ActivationMap.set(FirstInvBtn, false);
        this._ActivationMap.set(SecondInvBtn, false);
        this._ActivationMap.set(ThirdInvBtn, false);
        this._ActivationMap.set(ForthInvBtn, false);
        this._ActivationMap.set(ActivateItemBtn, false);
        this._ActivationMap.set(MoveUpBtn, false);
        this._ActivationMap.set(MoveDownBtn, false);
        this._ActivationMap.set(MoveLeftBtn, false);
        this._ActivationMap.set(MoveRightBtn, false);
    }

    /**
     * Задает действие назначенное на клавишу key как активное
     * @param {*} key 
     * @returns 
     */
    ActivateControl(key) {
        if (this._ActivationMap.has(key)) {
            this._ActivationMap.set(key, true);
        }
    }

    /**
     * Задает действие назначенное на клавишу key как неактивное
     * @param {*} key 
     * @returns 
     */
    DeactivateControl(key) {
        if (this._ActivationMap.has(key)) {
            this._ActivationMap.set(key, false);
        }
    }

    /**
     * Возвращает состояние активации действия назначенного на клавишу key
     * @param {*} key 
     * @returns 
     */
    GetControlState(key) {
        if (this._ActivationMap.has(key)) {
            return this._ActivationMap.get(key);
        }
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
        /**
         * Имя игрока
         */
        this._PlayerName = PlayerName;
        /**
         * Объект используемый для вывода объектов в интерфейс пользователя
         */
        this._Renderer = new Renderer();
        this._ControlMap = new ControlActivationMap();
        this._KeyDownListener = (event) => this._ControlMap.ActivateControl(event.key);
        this._KeyUpListener = (event) => this._ControlMap.DeactivateControl(event.key);
        this._MouseListener = (event) => this._HandlePlayerMouse(event);
    }

    /**
     * Активирует слушателей клавиатуры и мыши
     */
    _StartListenInput() {
        window.addEventListener('keydown', this._KeyDownListener);
        window.addEventListener('keyup', this._KeyUpListener);
        document.getElementById(PlayAreaId).addEventListener('click', this._MouseListener);
    }

    /**
     * Деактивирует слушателей клавиатуры и мыши
     */
    _StopListenInput() {
        window.removeEventListener('keydown', this._KeyDownListener);
        window.removeEventListener('keyup', this._KeyUpListener);
        document.getElementById(PlayAreaId).removeEventListener('click', this._MouseListener);
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
        this._StartListenInput();
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
            diff = this._SavedTime + performance.now() - this._StartTime;
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

    /**
     * Вовзращает текущий счет
     * @returns 
     */
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
     * Возвращает массив пар ид элемента инвентаря - количество для каждого слота инвентаря игрока
     */
    GetInvStat() {
        let res = []
        for (let i = 0; i < this._GameObjects.Player.Inventory.Count(); ++i) {
            let val = this._GameObjects.Player.Inventory.GetItemAt(i);
            res.push([val.GetAssetId(), val.Amount]);
        }
        return res;
    }

    _HandlePlayerMouse(event) {
        let res = this._GameObjects.Player.Inventory.ActivateItem(this._GameObjects.Player, new Point(event.clientX, event.clientY));
        if (res !== undefined) {
            //add new objects to map
            this._GameObjects.Shells.push(res);
        }
    }

    /**
     * Анализирует карту активации элементов управления текущего кадра и применяет активные элементы
     */
    _HandlePlayerMovement() {
        if (this._ControlMap.GetControlState(FirstInvBtn))
            this._GameObjects.Player.Inventory.SelectItem(0);
        if (this._ControlMap.GetControlState(SecondInvBtn))
            this._GameObjects.Player.Inventory.SelectItem(1);
        if (this._ControlMap.GetControlState(ThirdInvBtn))
            this._GameObjects.Player.Inventory.SelectItem(2);
        if (this._ControlMap.GetControlState(ForthInvBtn))
            this._GameObjects.Player.Inventory.SelectItem(3);
        if (this._ControlMap.GetControlState(ActivateItemBtn)) {
            let res = this._GameObjects.Player.Inventory.ActivateItem(this._GameObjects.Player);
            if (res !== undefined) {
                //add new objects to map
                this._GameObjects.Shells.push(res);
            }
        }
        if (this._ControlMap.GetControlState(MoveUpBtn))
            this._GameObjects.Player.AddForce(new Force(PlayerAcceleration, 270));
        if (this._ControlMap.GetControlState(MoveDownBtn))
            this._GameObjects.Player.AddForce(new Force(PlayerAcceleration, 90));
        if (this._ControlMap.GetControlState(MoveLeftBtn))
            this._GameObjects.Player.AddForce(new Force(PlayerAcceleration, 180));
        if (this._ControlMap.GetControlState(MoveRightBtn))
            this._GameObjects.Player.AddForce(new Force(PlayerAcceleration, 0));
    }

    /**
     * Останавливает таймер обновления карты, сохраняя текущее время игры
     */
    _SuspendGame() {
        this._EndTime = performance.now(); //write player time
        if (this._SavedTime === null) {
            this._SavedTime = this._EndTime - this._StartTime;
        }
        else {
            this._SavedTime += this._EndTime - this._StartTime;
        }
        clearTimeout(this._FrameTimer); //stop game timer 
        this._StopListenInput();
    }

    /**
     * Обрабатывает все события игры в текущем кадре
     */
    _GameTick() {
        this._HandlePlayerMovement();
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
                this._Score += ScoreForOne * deadenemies;

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
            EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyEasy - CurrentEnemies);
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
        /**
         *  Снаряды и некоторые другие элементы добавляются на карту между обновлениями кадра,
         *  если сразу после добавления элемент помечен на удаление, то он ни разу не будет выведен,
         *  а значит его не будет на странице, поэтому сначала проверяем каждый элемент на null 
         *  */
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
            }
            else {
                element = this._CreateElement(obj);
                if (obj instanceof Player) this._SetProperties(element, obj.GetName(), obj.GetHP());
                this._PlayArea.appendChild(element);
            }
        }
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
        if (obj instanceof InventoryItem) { //sets the size of icon smaller
            element.classList.add('Map');
        }
        this._SetPosition(element, obj.GetPosition(), obj.GetRadius());
        element.style.width = obj.GetRadius() * 2 + "px";
        element.style.height = obj.GetRadius() * 2 + "px";
        return element
    }
}