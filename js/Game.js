const Difficulty =
{
    Easy: 0,
    Medium: 1,
    Hard: 2,
    Nuts: 3,
}

/**
 * Адаптер управления игроками
 */
class ControlHandler {
    /**
     * Применяет действие Action к игроку Player
     * @param {*} Action - символ задающий определенное действие
     * @param {*} Player - игрок по отношении к которому применяется данное действие
     * @returns 
     */
    static ApplyAction(Action, Player) {
        switch (Action) {
            case '1':
                Player.Inventory.SelectItem(0);
                break;
            case '2':
                Player.Inventory.SelectItem(1);
                break;
            case '3':
                Player.Inventory.SelectItem(2);
                break;
            case '4':
                Player.Inventory.SelectItem(3);
                break;
            case 'f':
                return Player.Inventory.ActivateItem(Player);
            case 'w':
                Player.AddForce(new Force(BaseAcceleration, 270));
                break;
            case 's':
                Player.AddForce(new Force(BaseAcceleration, 90));
                break;
            case 'a':
                Player.AddForce(new Force(BaseAcceleration, 180));
                break;
            case 'd':
                Player.AddForce(new Force(BaseAcceleration, 0));
                break;
            default: break;
        }
    }
}

/**
 * Управляющий объект игры
 */
class Game {
    /**
     * 
     * @param {*} Window - Document window 
     * @param {*} FieldSize - Point задающий размер игрового поля
     * @param {*} OnGameOver - Функция вызываемая по окончанию игры, аргументы: Время игрока, счет 
     * @param {*} PlayerName - Имя игрока
     * @param {*} Diff - Сложность игры (0-3)
     */
    constructor(Window, FieldSize, OnGameOver, PlayerName, Diff) {
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
         * Document.Window для отрисовки игры
         */
        this._Window = Window;
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
        this._FrameCounter = 0;
        /**
         * Хранилище всех игровых объектов
         */
        this._GameObjects = [];
        /**
         * Текущая сложность игры
         */
        this._Difficulty = Diff;
        this._PlayerName = PlayerName;
        this._Player = null;
        this._Map = new Map(FieldSize.X, FieldSize.Y);
    }

    /**
     * Начинает новую, или продолжает прерванную игру
     */
    Start() {
        if (!this._PauseMarker) {
            this._GameObjects = MapGenerator.GenerateMap(this._Map.Width, this._Map.Height);
            this._Player = new Player(new Point(10, 10), 0, AssetId.Player, BaseRadius, BaseMass, this._PlayerName, BaseMaxHP);
            this._GameObjects.push(_Player); //add player to objects
            this._Score = 0;
            this._FrameCounter = 0;
        }
        else {
            this._PauseMarker = false;
        }
        this._StartTime = performance.now(); // write startgame time
        this._FrameTimer = setInterval(this._GameTick, FrameInterval);
        this._Window.addEventListener('keydown', _HandlePlayerMovement); //watch player movements
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
        var diff;
        if (this._SavedTime === null) {
            let diff = performance.now() - this._StartTime;
        }
        else {
            let diff = performance.now() - this._SavedTime;
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
        return [this._Player.GetHP(), this._Player.GetMaxHP()]
    }

    /**
     * Возвращает массив пар ид элемента инвентаря - количество для каждого слота инвенторя игрока
     */
    GetInvStat() {
        let res = []
        for (i = 0; i < this._Player.Inventory.Count(); ++i) {
            let val = this._Player.Inventory.GetItemAt(i);
            res.push([val.GetAssetId(), val.Amount]);
        }
        return res;
    }

    /**
     * Отслеживает нажатие клавиш и переводит их в событие управления игроком
     * @param {*} event - событие keydown
     */
    _HandlePlayerMovement(event) {
        let res = ControlHandler.ApplyAction(event.key, _Player);
        if (res !== undefined) {
            //add new objects to map
            this._GameObjects.push(res);
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
        this._Window.removeEventListener('keydown', _HandlePlayerMovement); //stop watching for user input
    }

    /**
     * Обрабатывает все события игры в текущем кадре
     */
    _GameTick() {
        //clear map, move and add to map, calculate collisions, 
        //analyze for enemies, render, check for player death
        this._Map.clear();
        for (obj in this._GameObjects) {
            if (obj instanceof MovableObject) {
                obj.Move();
            }
            this._Map.AppendElement(obj);
        }
        let GameOver = false;
        for (obj in this._GameObjects) {
            if (obj instanceof MovableObject) {
                CollisionCalculator.CalculateCollision(obj, this._Map);
            }
            if (obj instanceof Player) {
                if (obj.Id != 0) {
                    EnemyAi.Analyze(this._Map, obj); //call analyze for every enemy
                    if (obj.GetHP() === 0) {
                        this._Score += ScoreForOne; //if after analyze enemy still has zero hp => than add score for this enemy
                    }
                }
                else {
                    if (obj.GetHP() === 0) {
                        Gameover = true;
                    }
                }
            }
        } //TODO: Add forces to movable objects
        this._Despawn(); //clear from output
        this._GameObjects = this._GameObjects.filter(obj => obj.IsActive()); //remove inactive elements
        if (this._FrameCounter === SpawnFrameTimeout) {
            this._SpawnItems();
            this._FrameCounter = 0;
        }
        this._Render();
        if (GameOver) {
            this.Stop();
        }
        this._FrameCounter++;
    }

    /**
     * Спавнит новые элементы на карту
     */
    _SpawnItems() {
        let CurrentBuffs = this._GameObjects.filter(obj => obj instanceof BuffItem).length;
        let CurrentEnemies = this._GameObjects.filter(obj => obj instanceof Player).length - 1; //excluding player
        let CurrentWeapons = this._GameObjects.filter(obj => obj instanceof WeaponItem).length;
        let BuffsToSpawn;
        let EnemiesToSpawn;
        let WeaponToSpawn;
        let MaxHP;
        if (this._Difficulty === Difficulty.Easy) {
            BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountEasy - CurrentBuffs);
            EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyEasy - CurrentEnemies);
            WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountEasy - CurrentWeapons);
            MaxHP = MaxEnemyHPEasy;
        }
        if (this._Difficulty === Difficulty.Medium) {
            BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountMedium - CurrentBuffs);
            EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyMedium - CurrentEnemies);
            WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountMedium - CurrentWeapons);
            MaxHP = MaxEnemyHPMedium;
        }
        if (this._Difficulty === Difficulty.Hard) {
            BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountHard - CurrentBuffs);
            EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyHard - CurrentEnemies);
            WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountHard - CurrentWeapons);
            MaxHP = MaxEnemyHPHard;
        }
        if (this._Difficulty === Difficulty.Nuts) {
            BuffsToSpawn = Randomizer.GetRandomInt(0, MaxBuffAmountNuts - CurrentBuffs);
            EnemiesToSpawn = Randomizer.GetRandomInt(0, MaxEnemyNuts - CurrentEnemies);
            WeaponToSpawn = Randomizer.GetRandomInt(0, MaxWeaponAmountNuts - CurrentWeapons);
            MaxHP = MaxEnemyHPNuts;
        }
        for (let i = 0; i < BuffsToSpawn; ++i) {
            this._GameObjects.push(Spawner.SpawnBuff(this._Map));
        }
        for (let i = 0; i < EnemiesToSpawn; ++i) {
            this._GameObjects.push(Spawner.SpawnEnemy(this._Map, MaxHP));
        }
        for (let i = 0; i < WeaponToSpawn; ++i) {
            this._GameObjects.push(Spawner.SpawnWeapon(this._Map));
        }
    }

    /**
     * Удаляет все неактивные элементы с интерфейса пользователя
     */
    _Despawn() {
        let ElementsToRemove = this._GameObjects.filter(obj => !obj.IsActive());
        if (ElementsToRemove.length > 0) {
            for (obj in ElementsToRemove) {
                let El = this._Window.document.getElementById(obj.Id);
                El.parentNode.removeChild(El);
            }
        }
    }

    /**
     * Отображает содержимое карты в интерфейс пользователя
     */
    _Render() {
        let PlayArea = this._Window.document.getElementById(PlayAreaId);
        for (obj in this._GameObjects) {
            var element;
            element = this._Window.document.getElementById(obj.Id);
            if (element !== undefined) {
                element.style.top = obj.Position.Y + "px";
                element.style.left = obj.Position.X + "px";
            }
            else {
                element = this._Window.createElement('div');
                element.setAttribute('id', obj.Id);
                element.setAttribute('class', obj.GetAssetId());
                if (obj instanceof GameObject) {
                    element.style.width = obj.GetRadius() + "px";
                    element.style.height = obj.GetRadius() + "px";
                    element.style.top = obj.Position.Y + "px";
                    element.style.left = obj.Position.X + "px";
                }
                if (obj instanceof Player) {
                    element.innerHTML = '<p>' + obj.GetName() + '</p>';
                }
                PlayArea.appendChild(element);
            }
        }

    }

}