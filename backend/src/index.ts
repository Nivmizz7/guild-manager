import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import type { GuildConfig, Member, CalendarEvent, Raid, Dungeon, Loot } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Config / Setup
app.get('/api/config', async (req, res) => {
  const config = await storage.config.read();
  res.json(config);
});

app.post('/api/config', async (req, res) => {
  const config: GuildConfig = { ...req.body, setupComplete: true };
  await storage.config.write(config);
  
  // Initialize guild info
  await storage.guild.write({
    name: config.name,
    description: '',
    faction: config.faction,
    version: config.version,
    memberCount: 0,
    classDistribution: {} as any,
    roleDistribution: {} as any
  });
  
  res.json(config);
});

// Guild
app.get('/api/guild', async (req, res) => {
  const guild = await storage.guild.read();
  const members = await storage.members.read();
  
  const classDistribution: any = {};
  const roleDistribution: any = {};
  
  members.forEach(member => {
    classDistribution[member.class] = (classDistribution[member.class] || 0) + 1;
    roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
  });
  
  res.json({
    ...guild,
    memberCount: members.length,
    classDistribution,
    roleDistribution
  });
});

app.put('/api/guild', async (req, res) => {
  const currentGuild = await storage.guild.read();
  const updated = { ...currentGuild, ...req.body };
  await storage.guild.write(updated);
  res.json(updated);
});

// Members
app.get('/api/members', async (req, res) => {
  const members = await storage.members.read();
  res.json(members);
});

app.post('/api/members', async (req, res) => {
  const members = await storage.members.read();
  const newMember: Member = {
    id: Date.now().toString(),
    ...req.body
  };
  members.push(newMember);
  await storage.members.write(members);
  res.json(newMember);
});

app.put('/api/members/:id', async (req, res) => {
  const members = await storage.members.read();
  const index = members.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Member not found' });
  
  members[index] = { ...members[index], ...req.body, id: req.params.id };
  await storage.members.write(members);
  res.json(members[index]);
});

app.delete('/api/members/:id', async (req, res) => {
  const members = await storage.members.read();
  const filtered = members.filter(m => m.id !== req.params.id);
  await storage.members.write(filtered);
  res.json({ success: true });
});

// Calendar
app.get('/api/calendar', async (req, res) => {
  const events = await storage.calendar.read();
  res.json(events);
});

app.post('/api/calendar', async (req, res) => {
  const events = await storage.calendar.read();
  const newEvent: CalendarEvent = {
    id: Date.now().toString(),
    ...req.body
  };
  events.push(newEvent);
  await storage.calendar.write(events);
  res.json(newEvent);
});

app.delete('/api/calendar/:id', async (req, res) => {
  const events = await storage.calendar.read();
  const filtered = events.filter(e => e.id !== req.params.id);
  await storage.calendar.write(filtered);
  res.json({ success: true });
});

// Raids
app.get('/api/raids', async (req, res) => {
  const raids = await storage.raids.read();
  res.json(raids);
});

app.post('/api/raids', async (req, res) => {
  const raids = await storage.raids.read();
  const calendar = await storage.calendar.read();
  
  const newRaid: Raid = {
    id: Date.now().toString(),
    participants: [],
    composition: { tanks: [], healers: [], dps: [] },
    ...req.body
  };
  
  raids.push(newRaid);
  await storage.raids.write(raids);
  
  // Add to calendar
  const calendarEvent: CalendarEvent = {
    id: `cal-${newRaid.id}`,
    title: newRaid.name,
    type: 'Raid',
    date: newRaid.date,
    time: newRaid.time,
    raidId: newRaid.id
  };
  calendar.push(calendarEvent);
  await storage.calendar.write(calendar);
  
  res.json(newRaid);
});

app.put('/api/raids/:id', async (req, res) => {
  const raids = await storage.raids.read();
  const index = raids.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Raid not found' });
  
  raids[index] = { ...raids[index], ...req.body, id: req.params.id };
  await storage.raids.write(raids);
  res.json(raids[index]);
});

app.delete('/api/raids/:id', async (req, res) => {
  const raids = await storage.raids.read();
  const calendar = await storage.calendar.read();
  
  const filtered = raids.filter(r => r.id !== req.params.id);
  const filteredCal = calendar.filter(e => e.raidId !== req.params.id);
  
  await storage.raids.write(filtered);
  await storage.calendar.write(filteredCal);
  res.json({ success: true });
});

// Dungeons
app.get('/api/dungeons', async (req, res) => {
  const dungeons = await storage.dungeons.read();
  res.json(dungeons);
});

app.post('/api/dungeons', async (req, res) => {
  const dungeons = await storage.dungeons.read();
  const calendar = await storage.calendar.read();
  
  const newDungeon: Dungeon = {
    id: Date.now().toString(),
    participants: [],
    ...req.body
  };
  
  dungeons.push(newDungeon);
  await storage.dungeons.write(dungeons);
  
  const calendarEvent: CalendarEvent = {
    id: `cal-${newDungeon.id}`,
    title: newDungeon.name,
    type: 'Donjon',
    date: newDungeon.date,
    time: newDungeon.time
  };
  calendar.push(calendarEvent);
  await storage.calendar.write(calendar);
  
  res.json(newDungeon);
});

// Loot
app.get('/api/loot', async (req, res) => {
  const loot = await storage.loot.read();
  res.json(loot);
});

app.get('/api/loot/member/:memberId', async (req, res) => {
  const loot = await storage.loot.read();
  const memberLoot = loot.filter(l => l.assignedTo === req.params.memberId);
  res.json(memberLoot);
});

app.post('/api/loot', async (req, res) => {
  const loot = await storage.loot.read();
  const newLoot: Loot = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...req.body
  };
  loot.push(newLoot);
  await storage.loot.write(loot);
  res.json(newLoot);
});

app.listen(PORT, () => {
  console.log(`🎮 WoW Guild Manager API running on http://localhost:${PORT}`);
});
