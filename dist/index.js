"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const xpToLevel_1 = __importDefault(require("./util/xpToLevel"));
const NBT = __importStar(require("nbtify"));
const app = (0, express_1.default)();
app.get('/', async (req, res) => {
    const name = req.query.name;
    const floor = req.query.floor.toLowerCase();
    if (!name) {
        res.status(400).send('Name not given.');
        return;
    }
    if (!floor) {
        res.status(400).send('Floor not given.');
        return;
    }
    const validFloors = ['e', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'];
    if (!validFloors.includes(floor)) {
        res.status(400).send('Invalid floor given.');
        return;
    }
    const uuid = (await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`).then(resp => resp.json())).id;
    if (!uuid) {
        res.status(404).send('User not found.');
        return;
    }
    const users = await (0, db_1.default) `SELECT * FROM users WHERE uuid=${uuid}`;
    if (users.length) {
        res.type('application/json').send({ data: users[0] });
        return;
    }
    const data = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`, {
        headers: {
            Accept: 'application/json',
            'API-Key': process.env.HYPIXEL_API_KEY ?? '',
            'Content-Type': 'application/json',
        },
    }).then(res => res.json());
    if (!data.success) {
        res.status(403).send(`An error occurred with the hypixel API: ${JSON.stringify(res)}`);
    }
    if (!data.profiles) {
        res.status(404).send('Profile not found.');
        return;
    }
    const profileData = data.profiles.filter((p) => p.selected)[0].members[uuid];
    const dungeonsData = profileData.dungeons;
    const sourceData = dungeonsData.dungeon_types[floor.includes('m') ? 'master_catacombs' : 'catacombs'];
    const floorId = (validFloors.indexOf(floor) - (floor.includes('m') ? 7 : 0)).toString();
    const desiredInfo = [
        'tier_completions',
        'milestone_completions',
        'fastest_time',
        'fastest_time_s',
        'fastest_time_s_plus',
        'best_score',
    ];
    const floorData = desiredInfo.reduce((obj, k) => {
        obj[k] = sourceData[k][floorId];
        return obj;
    }, {});
    const inventoryData = await NBT.read(Buffer.from(profileData.inventory.inv_contents.data, 'base64'));
    // const storageData = await NBT.read(Buffer.from(profileData.inventory));
    const invItems = inventoryData.data.i
        .map((item) => item?.tag?.display)
        .filter((i) => i)
        .map((obj) => {
        obj.Lore = obj?.Lore?.map((str) => str.replaceAll(/§./g, '').replace(/^a (.+?) a$/, '$1'));
        obj.Name = obj?.Name?.replaceAll(/§./g, '');
        return obj;
    });
    const dungeonsClass = dungeonsData.selected_dungeon_class;
    // console.log(profileData.inventory.backpack_contents);
    // console.log(profileData.inventory.ender_chest_contents);
    res.type('application/json').send({
        success: true,
        floorData,
        secrets: dungeonsData.secrets,
        selected_class: dungeonsClass,
        times_played: dungeonsData.dungeon_types.catacombs.times_played[floorId],
        magical_power: profileData.accessory_bag_storage.highest_magical_power,
        selected_power: profileData.accessory_bag_storage.selected_power,
        tunings: profileData.accessory_bag_storage.tuning.slot_0,
        levels: {
            total: (0, xpToLevel_1.default)(dungeonsData.dungeon_types.catacombs.experience),
            healer: (0, xpToLevel_1.default)(dungeonsData.player_classes.healer.experience),
            mage: (0, xpToLevel_1.default)(dungeonsData.player_classes.mage.experience),
            berserk: (0, xpToLevel_1.default)(dungeonsData.player_classes.berserk.experience),
            archer: (0, xpToLevel_1.default)(dungeonsData.player_classes.archer.experience),
            tank: (0, xpToLevel_1.default)(dungeonsData.player_classes.tank.experience),
        },
        inventory: invItems,
    });
});
exports.default = app;
