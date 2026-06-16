import express from 'express';
import sql from './db.js';
import xpToLevel from './util/xpToLevel.js';
import * as NBT from 'nbtify';
import getTimeScore from './scoring/time.js';
import {
    DEFAULT_CATA_REQS,
    DEFAULT_MP_REQS,
    DEFAULT_TIME_REQS,
    MAX_CATA_BONUS,
    MAX_CLASS_SPECIALTY_BONUS,
    MAX_MP_SCORE,
    MAX_SECRET_SCORE,
    MAX_TIME_SCORE,
} from './scoring/constants.js';
import getSecretScore from './scoring/secret.js';
import { Class } from './interfaces/Class.js';
import getClassSpecialtyBonus from './scoring/classSpecialtyBonus.js';
import { Floor } from './interfaces/Floor.js';
import getMpScore from './scoring/mp.js';
import getRequiredPower from './util/getRequiredPower.js';
import getCataBonus from './scoring/cataBonus.js';
const app = express();

app.get('/', async (req, res) => {
    const name = req.query.name as string;
    const floor = ((req.query.floor as string) ?? '').toLowerCase();
    if (!name) {
        res.status(400).send('Name not given.');
        return;
    }

    if (!floor) {
        res.status(400).send('Floor not given.');
        return;
    }

    const validFloors = Object.keys(Floor).map(f => f.toLowerCase());
    if (!validFloors.includes(floor)) {
        res.status(400).send('Invalid floor given.');
        return;
    }
    const floorId = Floor[floor.toUpperCase() as keyof typeof Floor];

    const mpReq = parseInt((req.query.mpReq as string) ?? DEFAULT_MP_REQS[floorId].toString());
    const timeReq = parseInt((req.query.timeReq as string) ?? DEFAULT_TIME_REQS[floorId].toString());
    const cataReq = parseInt((req.query.cataReq as string) ?? DEFAULT_CATA_REQS[floorId].toString());

    const userData = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`).then(resp => resp.json());
    if (userData.errorMessage) {
        res.status(404).send(userData.errorMessage);
        return;
    }
    const uuid = userData.id;
    const username = userData.name;

    const users = await sql`SELECT * FROM users WHERE uuid=${uuid}`;
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
        res.status(403).send(`An error occurred with the hypixel API: ${JSON.stringify(data)}`);
    }

    if (!data.profiles) {
        res.status(404).send('Profile not found.');
        return;
    }

    const profileData = data.profiles.filter((p: any) => p.selected)[0].members[uuid];
    const dungeonsData = profileData.dungeons;
    const sourceData = dungeonsData.dungeon_types[floor.includes('m') ? 'master_catacombs' : 'catacombs'];
    const desiredInfo = [
        'tier_completions',
        'milestone_completions',
        'fastest_time',
        'fastest_time_s',
        'fastest_time_s_plus',
        'best_score',
    ];
    const floorData = desiredInfo.reduce((obj: Record<string, any>, k) => {
        obj[k] = sourceData[k][floorId];
        return obj;
    }, {});

    floorData.times_played = dungeonsData.dungeon_types.catacombs.times_played[floorId];
    floorData.floor = floor.toUpperCase();

    const inventoryData = await NBT.read(Buffer.from(profileData.inventory.inv_contents.data, 'base64'));
    // const storageData = await NBT.read(Buffer.from(profileData.inventory));
    const invItems = (inventoryData.data as any).i
        .map((item: any) => item?.tag?.display)
        .filter((i: any) => i)
        .map((obj: any) => {
            obj.Lore = obj?.Lore?.map((str: string) => str.replaceAll(/§./g, '').replace(/^a (.+?) a$/, '$1'));
            obj.Name = obj?.Name?.replaceAll(/§./g, '');
            return obj;
        });

    const dungeonsClass = dungeonsData.selected_dungeon_class;
    const playerData = {
        username,
        uuid,
    };
    const currentData = {
        selected_class: dungeonsClass,
        magical_power: profileData.accessory_bag_storage.highest_magical_power,
        selected_power: profileData.accessory_bag_storage.selected_power,
        tunings: profileData.accessory_bag_storage.tuning.slot_0,
    };

    let totalRunCount = dungeonsData.dungeon_types.catacombs.tier_completions['0'] ?? 0;
    for (let i = 1; i <= 7; i++) {
        const str = i.toString();
        totalRunCount += dungeonsData.dungeon_types.catacombs.tier_completions[str] ?? 0;
        totalRunCount += dungeonsData.dungeon_types.master_catacombs.tier_completions[str] ?? 0;
    }

    const scoreData: Record<string, [number, number, number?]> = {
        time: [
            getTimeScore(
                ['f5', 'f6', 'f7', 'm5', 'm6', 'm7'].includes(floor)
                    ? floorData.fastest_time_s_plus
                    : floorData.fastest_time_s,
                timeReq,
            ),
            MAX_TIME_SCORE,
        ],
        secret: [
            getSecretScore(
                dungeonsData.secrets / totalRunCount,
                Class[dungeonsClass.toUpperCase() as keyof typeof Class],
            ),
            MAX_SECRET_SCORE,
        ],
        classSpecialtyBonus: [
            getClassSpecialtyBonus(
                [
                    xpToLevel(dungeonsData.player_classes.healer.experience),
                    xpToLevel(dungeonsData.player_classes.mage.experience),
                    xpToLevel(dungeonsData.player_classes.berserk.experience),
                    xpToLevel(dungeonsData.player_classes.archer.experience),
                    xpToLevel(dungeonsData.player_classes.tank.experience),
                ],
                xpToLevel(dungeonsData.player_classes[dungeonsClass].experience),
            ),
            0,
            MAX_CLASS_SPECIALTY_BONUS,
        ],
        mp: [
            getMpScore(
                currentData.magical_power,
                mpReq,
                currentData.selected_power,
                getRequiredPower(invItems, Class[dungeonsClass.toUpperCase() as keyof typeof Class]),
            ),
            MAX_MP_SCORE,
        ],
        cataBonus: [
            getCataBonus(xpToLevel(dungeonsData.dungeon_types.catacombs.experience), cataReq),
            0,
            MAX_CATA_BONUS,
        ],
    };

    scoreData.total = Object.values(scoreData).reduce(([tc, tt], [cc, ct]) => [tc + cc, tt + ct], [0, 0]);

    res.type('application/json').send({
        success: true,
        floorData,
        playerData,
        currentData,
        scoreData,
        secrets: dungeonsData.secrets,
        runCount: totalRunCount,
        levels: {
            total: xpToLevel(dungeonsData.dungeon_types.catacombs.experience),
            healer: xpToLevel(dungeonsData.player_classes.healer.experience),
            mage: xpToLevel(dungeonsData.player_classes.mage.experience),
            berserk: xpToLevel(dungeonsData.player_classes.berserk.experience),
            archer: xpToLevel(dungeonsData.player_classes.archer.experience),
            tank: xpToLevel(dungeonsData.player_classes.tank.experience),
        },
        inventory: invItems,
    });
});

export default app;
