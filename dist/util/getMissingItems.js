"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQ_ITEMS = void 0;
exports.default = getMissingItems;
exports.REQ_ITEMS = {
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
function getMissingItems(floorId, items, dungeonsClass) {
    return [];
}
