
import { WeaponType, WeaponStats } from './types';

export const WEAPONS: Record<WeaponType, WeaponStats> = {
  [WeaponType.PISTOL]: {
    type: WeaponType.PISTOL,
    name: 'Tactical P9',
    damage: 25,
    fireRate: 400,
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1500,
    range: 100,
    spread: 0.01
  },
  [WeaponType.SMG]: {
    type: WeaponType.SMG,
    name: 'Vector-Z',
    damage: 15,
    fireRate: 100,
    ammo: 30,
    maxAmmo: 30,
    reloadTime: 2000,
    range: 60,
    spread: 0.05
  },
  [WeaponType.SHOTGUN]: {
    type: WeaponType.SHOTGUN,
    name: 'Breacher-8',
    damage: 15, // per pellet
    fireRate: 800,
    ammo: 6,
    maxAmmo: 6,
    reloadTime: 3000,
    range: 30,
    spread: 0.15
  }
};

export const CITY_SIZE = 200;
export const BUILDING_COUNT = 60;
export const ZOMBIE_SPAWN_INTERVAL = 3000;
