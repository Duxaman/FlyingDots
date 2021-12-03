if (navigator.userAgent.match(/firefox|fxios/i)) var frameint = 17; //firefox adds 10ms 
else var frameint = 29;
const FrameInterval = frameint;
const PlayAreaId = "workplace";
const ScoreForOne = 100;
const SpawnFrameTimeout = 300;
const AttackFrameTimeout = 10;
const MovableBodyForcesLimit = 30;
const Friction = 0.006;
const BaseRadius = 15;
const BaseAcceleration = 0.10;
const MovableBodiesMinAcceleration = BaseAcceleration * 0.1;
const MovableBodiesMaxAcceleration = BaseAcceleration * 0.2;
const MovableBodiesAngleVariance = 45;
const MovableBodiesMaxMass = 1000;
const MovableBodiesMaxRadius = 50;
const StaticBodiesMaxMass = 1000;
const StaticBodiesMaxRadius = 50;
const PlayerAcceleration = BaseAcceleration * 0.4;
const BaseMass = 100;
const BaseShellMass = 2;
const BaseShellRadius = 2;
const BaseMaxHP = 500;
const BaseDamage = 10;
const BaseDistance = 300;
const MaxStaticBodiesPerMap = 5;
const MaxMovableBodiesPerMap = 5;
const ShellMaxDistance = 600;
const EnemyVisionRange = 900;
const InventorySize = 4;
const MinWeaponAm = 10;
const MaxWeaponAm = 200;
const ShellAcceleration = 18;
const ShellCollisionTrack = ShellAcceleration;

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
const MaxEnemyEasy = 2;
const MaxWeaponAmountEasy = 10;
const MaxEnemyHPEasy = 100;
const MaxBuffAmountEasy = 6;

const MaxEnemyMedium = 4;
const MaxWeaponAmountMedium = 12;
const MaxEnemyHPMedium = 100;
const MaxBuffAmountMedium = 6;

const MaxEnemyHard = 6;
const MaxWeaponAmountHard = 20;
const MaxEnemyHPHard = 80;
const MaxBuffAmountHard = 10;

const MaxEnemyNuts = 10;
const MaxWeaponAmountNuts = 30;
const MaxEnemyHPNuts = 80;
const MaxBuffAmountNuts = 15;