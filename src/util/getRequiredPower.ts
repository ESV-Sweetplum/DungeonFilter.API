import { Class } from '../interfaces/Class.js';

export default function getRequiredPower(invItems: any, cls: Class) {
    if (cls === Class.MAGE) return 'silky';
    if (cls === Class.ARCHER) return 'fortuitous';

    const itemNames: string[] = invItems.map((i: any) => i.Name);
    if (
        itemNames.some(items => items.includes('Terminator')) &&
        !itemNames.some(items => ['Hyperion', 'Astraea', 'Scylla', 'Valkyrie'].some(blade => items.includes(blade)))
    )
        return 'fortuitous';

    return '';
}
