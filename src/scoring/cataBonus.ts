import { MAX_CATA_BONUS, MAX_CATA_BONUS_DEVIATION } from './constants.js';

export default function getCataBonus(cur: number, min: number) {
    const diff = cur - min;
    if (diff <= 0) return 0;
    if (diff >= MAX_CATA_BONUS_DEVIATION) return MAX_CATA_BONUS;

    const prog = diff / MAX_CATA_BONUS_DEVIATION;

    return prog ** 0.7 * MAX_CATA_BONUS;
}
