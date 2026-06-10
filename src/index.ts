import express from 'express';
import sql from './db';
import xpToLevel from './util/xpToLevel';
import * as NBT from 'nbtify';
const app = express();

app.get('/', async (req, res) => {
    const name = req.query.name as string;
    const floor = (req.query.floor as string).toLowerCase();
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
        res.status(403).send(`An error occurred with the hypixel API: ${JSON.stringify(res)}`);
    }

    if (!data.profiles) {
        res.status(404).send('Profile not found.');
        return;
    }

    const profileData = data.profiles.filter((p: any) => p.selected)[0].members[uuid];
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
    const floorData = desiredInfo.reduce((obj: Record<string, any>, k) => {
        obj[k] = sourceData[k][floorId];
        return obj;
    }, {});

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
