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
        * Счетчик обновлений карты, необходимый для атак ИИ противника
        */
        this._EnemyAttackFrameCounter = 0;
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
            case '1':
                this._GameObjects.Player.Inventory.SelectItem(0);
                break;
            case '2':
                this._GameObjects.Player.Inventory.SelectItem(1);
                break;
            case '3':
                this._GameObjects.Player.Inventory.SelectItem(2);
                break;
            case '4':
                this._GameObjects.Player.Inventory.SelectItem(3);
                break;
            case 'f':
                res = this._GameObjects.Player.Inventory.ActivateItem(this._GameObjects.Player);
            case 'w':
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 270));
                break;
            case 's':
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 90));
                break;
            case 'a':
                this._GameObjects.Player.AddForce(new Force(BaseAcceleration, 180));
                break;
            case 'd':
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
        window.removeEventListener('keydown', _HandlePlayerMovement); //stop watching for user input
    }

    /**
     * Обрабатывает все события игры в текущем кадре
     */
    _GameTick() {
        for (let obj of this._GameObjects.Players) {
            obj.Move();
            if (obj.GetId() != 0) {
                if (this._EnemyAttackFrameCounter === AttackFrameTimeout) {
                    EnemyAI.Analyze(obj, this._GameObjects, true);
                    this._EnemyAttackFrameCounter = 0;
                }
                else {
                    EnemyAI.Analyze(obj, this._GameObjects, false);
                }
            }
        }
        for (const obj of this._GameObjects.Shells) {
            obj.Move();
        }
        for (const obj of this._GameObjects.MovableBodies) {
            obj.Move();
            obj.AddForce(new Force(Randomizer.GetRandomInt(MovableBodiesMinAcceleration, MovableBodiesMaxAcceleration), Randomizer.GetGaussRandom(obj.GetAngle(), 90)));
        }
        let GameOver = false;
        FrameProcessor.CalculateFrame(this._GameObjects);
        if (this._GameObjects.Player.GetHP() === 0) {
            GameOver = true;
        }
        for (const obj of this._GameObjects.Players) {
            if (obj.GetId() != 0 && !obj.IsActive()) {
                this._Score += ScoreForOne;
            }
        }
        if (!GameOver) {
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
    _SpawnItems() { //TODO: change filter method to loops
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
        this._Renderer.RemoveElements(this._GameObjects.Players.filter(obj => !obj.IsActive())); //TODO: perhaps there's a better way?
        this._Renderer.RemoveElements(this._GameObjects.Shells.filter(obj => !obj.IsActive()));
        this._Renderer.RemoveElements(this._GameObjects.MovableBodies.filter(obj => !obj.IsActive()));
        this._Renderer.RemoveElements(this._GameObjects.InvItems.filter(obj => !obj.IsActive()));
        //удаляем объекты
        this._GameObjects.Players = this._GameObjects.Players.filter(obj => obj.IsActive()); //remove inactive elements
        this._GameObjects.Shells = this._GameObjects.Shells.filter(obj => obj.IsActive());
        this._GameObjects.MovableBodies = this._GameObjects.MovableBodies.filter(obj => obj.IsActive());
        this._GameObjects.InvItems = this._GameObjects.InvItems.filter(obj => obj.IsActive());
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
            document.getElementById(obj.GetId()).remove();
        }
    }

    _RenderPool(pool) {
        for (const obj of pool) {
            var element = document.getElementById(obj.GetId());
            if (element !== null) {
                this._SetPosition(element, obj.GetPosition());
            }
            else {
                element = this._CreateElement(obj);
                if (obj instanceof Player) element.innerHTML = '<p>' + obj.GetName() + ' (' + obj.GetHP() + ')</p>'; //not the best solution
                this._PlayArea.appendChild(element);
            }
        }
    }

    _SetPosition(element, position) {
        element.style.top = position.Y + "px";
        element.style.left = position.X + "px";
    }
    _CreateElement(obj) {
        let element = document.createElement('div');
        element.setAttribute('id', obj.GetId());
        element.setAttribute('class', obj.GetAssetId());
        element.style.top = obj.GetPosition().Y + "px";
        element.style.left = obj.GetPosition().X + "px";
        if (obj instanceof GameObject) {
            element.style.width = obj.GetRadius() * 2 + "px";
            element.style.height = obj.GetRadius() * 2 + "px";
        }
        return element
    }
}