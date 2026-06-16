import { Class } from '../interfaces/Class.js';
import { MAX_SECRET_SCORE, REQUIRED_SECRET_AVERAGES } from './constants.js';

export default function getSecretScore(avg: number = 0, cls: Class = Class.BERSERK) {
    const prog = Math.min(avg / REQUIRED_SECRET_AVERAGES[cls], 1);

    return MAX_SECRET_SCORE * prog ** 2;
}
