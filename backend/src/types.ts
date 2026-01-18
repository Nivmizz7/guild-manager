export type Faction = 'Horde' | 'Alliance';

export type WoWVersion = 
  | 'Vanilla' 
  | 'TBC' 
  | 'WotLK' 
  | 'Cataclysm' 
  | 'MoP' 
  | 'WoD' 
  | 'Legion' 
  | 'BFA' 
  | 'Shadowlands' 
  | 'Dragonflight' 
  | 'The War Within';

export type WoWClass = 
  | 'Warrior' 
  | 'Paladin' 
  | 'Hunter' 
  | 'Rogue' 
  | 'Priest' 
  | 'Death Knight' 
  | 'Shaman' 
  | 'Mage' 
  | 'Warlock' 
  | 'Monk' 
  | 'Druid' 
  | 'Demon Hunter' 
  | 'Evoker';

export type Role = 'Tank' | 'Heal' | 'DPS';

export type EventType = 'Raid' | 'Donjon' | 'Event guilde' | 'Buff world';

export type RaidStatus = 'prévu' | 'terminé';

export type ItemQuality = 'Poor' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface GuildConfig {
  name: string;
  faction: Faction;
  version: WoWVersion;
  description?: string;
  setupComplete: boolean;
}

export interface Member {
  id: string;
  name: string;
  class: WoWClass;
  race: string;
  faction: Faction;
  role: Role;
  professions?: string[];
  specialization?: string;
  raidAttendance?: number;
  notes?: string;
}

export interface GuildInfo {
  name: string;
  description: string;
  faction: Faction;
  version: WoWVersion;
  memberCount: number;
  classDistribution: Record<WoWClass, number>;
  roleDistribution: Record<Role, number>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time?: string;
  description?: string;
  raidId?: string;
}

export interface Raid {
  id: string;
  name: string;
  instance: string;
  date: string;
  time: string;
  version: WoWVersion;
  size: 10 | 20 | 25 | 40;
  status: RaidStatus;
  participants: string[];
  composition: {
    tanks: string[];
    healers: string[];
    dps: string[];
  };
}

export interface Dungeon {
  id: string;
  name: string;
  instance: string;
  date: string;
  time: string;
  participants: string[];
}

export interface Loot {
  id: string;
  itemName: string;
  quality: ItemQuality;
  raidId: string;
  boss: string;
  assignedTo: string;
  date: string;
}
