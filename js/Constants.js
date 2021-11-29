const PlayAreaId = "workplace";
const ScoreForOne = 100;
const FrameInterval = 35;
const SpawnFrameTimeout = 300;
const AttackFrameTimeout = 65;
const MovableBodyForcesLimit = 30;
const Friction = 0.006;
const BaseRadius = 15;
const BaseAcceleration = 0.15;
const MovableBodiesMinAcceleration = BaseAcceleration * 0.1;
const MovableBodiesMaxAcceleration = BaseAcceleration * 0.2;
const MovableBodiesAngleVariance = 45;
const BaseMass = 100;
const BaseShellMass = 2;
const BaseShellRadius = 1;
const BaseMaxHP = 500;
const BaseDamage = 10;
const BaseDistance = 300;
const MaxStaticBodiesPerMap = 5;
const MaxMovableBodiesPerMap = 5;
const ShellMaxDistance = 300;
const EnemyVisionRange = 500;
const InventorySize = 4;

/*Controls */
const MoveUpBtn = 'w';
const MoveDownBtn = 's';
const MoveLeftBtn = 'a';
const MoveRightBtn = 'd';
const FirstInvBtn = '1';
const SecondInvBtn = '2';
const ThirdInvBtn = '3';
const ForthInvBtn = '4';
const ActivateItemBtn = ' ';


/**
 * Difficulty settings
 */
const MaxEnemyEasy = 3;
const MaxWeaponAmountEasy = 10;
const MaxEnemyHPEasy = 100;
const MaxBuffAmountEasy = 6;

const MaxEnemyMedium = 6;
const MaxWeaponAmountMedium = 6;
const MaxEnemyHPMedium = 500;
const MaxBuffAmountMedium = 4;

const MaxEnemyHard = 10;
const MaxWeaponAmountHard = 3;
const MaxEnemyHPHard = 1000;
const MaxBuffAmountHard = 2;

const MaxEnemyNuts = 15;
const MaxWeaponAmountNuts = 2;
const MaxEnemyHPNuts = 1000;
const MaxBuffAmountNuts = 1;