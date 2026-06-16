import { Class } from '../interfaces/Class.js';
import { Floor } from '../interfaces/Floor.js';

export const MAX_TIME_SCORE = 200;
export const MAX_TIME_DEVIATION = 30;

export const MAX_SECRET_SCORE = 100;
export const REQUIRED_SECRET_AVERAGES = {
    [Class.TANK]: 8,
    [Class.BERSERK]: 8,
    [Class.HEALER]: 7.5,
    [Class.ARCHER]: 6.5,
    [Class.MAGE]: 5,
};

export const MAX_CATA_BONUS = 20;
export const MAX_CATA_BONUS_DEVIATION = 10;
export const MAX_CLASS_SPECIALTY_BONUS = 10;
export const MAX_MP_SCORE = 70;

export const DEFAULT_TIME_REQS = {
    [Floor.E]: 999999,
    [Floor.F1]: 999999,
    [Floor.F2]: 999999,
    [Floor.F3]: 999999,
    [Floor.F4]: 999999,
    [Floor.F5]: 210000,
    [Floor.F6]: 240000,
    [Floor.F7]: 300000,
    [Floor.M1]: 999999,
    [Floor.M2]: 999999,
    [Floor.M3]: 999999,
    [Floor.M4]: 240000,
    [Floor.M5]: 140000,
    [Floor.M6]: 240000,
    [Floor.M7]: 360000,
};

export const DEFAULT_MP_REQS = {
    [Floor.E]: 100,
    [Floor.F1]: 120,
    [Floor.F2]: 150,
    [Floor.F3]: 180,
    [Floor.F4]: 300,
    [Floor.F5]: 430,
    [Floor.F6]: 550,
    [Floor.F7]: 650,
    [Floor.M1]: 750,
    [Floor.M2]: 750,
    [Floor.M3]: 850,
    [Floor.M4]: 900,
    [Floor.M5]: 1000,
    [Floor.M6]: 1100,
    [Floor.M7]: 1250,
};

export const DEFAULT_CATA_REQS = {
    [Floor.E]: 0,
    [Floor.F1]: 2,
    [Floor.F2]: 4,
    [Floor.F3]: 7,
    [Floor.F4]: 11,
    [Floor.F5]: 17,
    [Floor.F6]: 24,
    [Floor.F7]: 32,
    [Floor.M1]: 31,
    [Floor.M2]: 33,
    [Floor.M3]: 35,
    [Floor.M4]: 39,
    [Floor.M5]: 39,
    [Floor.M6]: 42,
    [Floor.M7]: 45,
};
