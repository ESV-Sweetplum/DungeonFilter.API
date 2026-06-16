import { MAX_TIME_DEVIATION, MAX_TIME_SCORE } from './constants.js';

export default function getTimeScore(time: number = 9999999, target: number = 300000) {
    const diff = (time - target) / 1000;
    if (diff <= 0) return MAX_TIME_SCORE;
    if (diff >= MAX_TIME_DEVIATION) return 0;

    return (MAX_TIME_SCORE / MAX_TIME_DEVIATION ** 0.9) * (MAX_TIME_DEVIATION - diff) ** 0.9;
}
