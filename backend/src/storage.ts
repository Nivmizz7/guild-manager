import fs from 'fs/promises';
import path from 'path';
import type { GuildConfig, Member, CalendarEvent, Raid, Dungeon, Loot, GuildInfo } from './types';

const DATA_DIR = path.join(__dirname, '../../data');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJSON<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const storage = {
  config: {
    read: () => readJSON<GuildConfig>('config.json', {
      name: '',
      faction: 'Horde',
      version: 'Vanilla',
      setupComplete: false
    }),
    write: (data: GuildConfig) => writeJSON('config.json', data)
  },

  guild: {
    read: () => readJSON<GuildInfo>('guild.json', {
      name: '',
      description: '',
      faction: 'Horde',
      version: 'Vanilla',
      memberCount: 0,
      classDistribution: {} as any,
      roleDistribution: {} as any
    }),
    write: (data: GuildInfo) => writeJSON('guild.json', data)
  },

  members: {
    read: () => readJSON<Member[]>('members.json', []),
    write: (data: Member[]) => writeJSON('members.json', data)
  },

  calendar: {
    read: () => readJSON<CalendarEvent[]>('calendar.json', []),
    write: (data: CalendarEvent[]) => writeJSON('calendar.json', data)
  },

  raids: {
    read: () => readJSON<Raid[]>('raids.json', []),
    write: (data: Raid[]) => writeJSON('raids.json', data)
  },

  dungeons: {
    read: () => readJSON<Dungeon[]>('dungeons.json', []),
    write: (data: Dungeon[]) => writeJSON('dungeons.json', data)
  },

  loot: {
    read: () => readJSON<Loot[]>('loot.json', []),
    write: (data: Loot[]) => writeJSON('loot.json', data)
  }
};
