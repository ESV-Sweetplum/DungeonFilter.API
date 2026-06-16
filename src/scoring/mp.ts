import { MAX_MP_SCORE } from './constants.js';

export default function getMpScore(mp: number = 0, reqMp: number, power: string, reqPower: string) {
    const powerPenalty = reqPower && power !== reqPower ? 0.5 : 1;
    const mpPenalty = Math.min(mp / reqMp, 1) ** 1.8;

    return MAX_MP_SCORE * powerPenalty * mpPenalty;
}
