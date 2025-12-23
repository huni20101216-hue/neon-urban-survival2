
export enum WeaponType {
  PISTOL = 'PISTOL',
  SMG = 'SMG',
  SHOTGUN = 'SHOTGUN'
}

export enum ZombieType {
  WALKER = 'WALKER',
  RUNNER = 'RUNNER',
  TANK = 'TANK'
}

export interface WeaponStats {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  range: number;
  spread: number;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  score: number;
  isDashing: boolean;
  dashCooldown: number;
  currentWeapon: WeaponType;
}

export interface GameMessage {
  id: string;
  text: string;
  timestamp: number;
}
