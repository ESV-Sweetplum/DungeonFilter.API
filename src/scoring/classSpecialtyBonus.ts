import { MAX_CLASS_SPECIALTY_BONUS } from './constants.js';

export default function getClassSpecialtyBonus(levels: number[], curLevel: number) {
    const max = levels.reduce((acc, cur) => (acc < cur ? cur : acc), -1);
    const min = levels.reduce((acc, cur) => (acc > cur ? cur : acc), 1e5);

    const prog = (curLevel - min) / (max - min);
    return prog * MAX_CLASS_SPECIALTY_BONUS;
}
