const PlayAreaId = "workplace";
const ScoreForOne = 100;
const FrameInterval = 35;
const SpawnFrameTimeout = 300;
const AttackFrameTimeout = 500;
const MovableBodyForcesLimit = 20;
const Friction = 0.0008
const BaseRadius = 15;
const BaseAcceleration = 0.1;
const MovableBodiesMinAcceleration = BaseAcceleration * 0.08;
const MovableBodiesMaxAcceleration = BaseAcceleration * 0.5;
const BaseMass = 100;
const BaseShellMass = 2;
const BaseShellRadius = 1;
const BaseMaxHP = 500;
const BaseDamage = 4;
const BaseDistance = 300;
const MaxStaticBodiesPerMap = 15;
const MaxMovableBodiesPerMap = 5;
const ShellMaxDistance = 200;
const EnemyVisionRange = 500;

/**
 * Difficulty settings
 */
const MaxEnemyEasy = 3;
const MaxWeaponAmountEasy = 10;
const MaxEnemyHPEasy = 100;
const MaxBuffAmountEasy = 10;

const MaxEnemyMedium = 6;
const MaxWeaponAmountMedium = 6;
const MaxEnemyHPMedium = 500;
const MaxBuffAmountMedium = 6;

const MaxEnemyHard = 10;
const MaxWeaponAmountHard = 3;
const MaxEnemyHPHard = 1000;
const MaxBuffAmountHard = 3;

const MaxEnemyNuts = 15;
const MaxWeaponAmountNuts = 2;
const MaxEnemyHPNuts = 1000;
const MaxBuffAmountNuts = 2;