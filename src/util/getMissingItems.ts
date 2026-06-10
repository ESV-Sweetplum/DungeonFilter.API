export const REQ_ITEMS = {
    [3]: {
        mage: ['Fire Freeze Staff'],
    },
    [4]: {
        mage: ['Ice Spray Wand'],
        healer: ['Tribal Spear'],
    },
    [5]: {
        mage: ['Ice Spray Wand'],
    },
    [6]: {
        mage: ['Gyrokinetic Wand'],
        archer: ['Gyrokinetic Wand'],
        berserk: ['Gyrokinetic Wand'],
    },
    [7]: {},
};

export default function getMissingItems(
    floorId: 3 | 4 | 5 | 6 | 7,
    items: string[],
    dungeonsClass: 'mage' | 'berserk' | 'archer' | 'tank' | 'healer',
): string[] {
    return [];
}
