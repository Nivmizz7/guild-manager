import express from 'express';
import cors from 'cors';
import session from 'express-session';
import 'dotenv/config';
import { storage } from './storage';
import { DiscordAuth } from './discord';
import { requireAdmin, AuthRequest } from './middleware';
import type { GuildConfig, Member, CalendarEvent, Raid, Dungeon, Loot, Log } from './types';

const app = express();
const PORT = process.env.PORT || 3001;
const discordAuth = new DiscordAuth();

// Helper function to log actions
const logAction = async (username: string, action: string, description: string, details: any = {}) => {
  const logs = await storage.logs.read();
  const log: Log = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    username,
    action,
    description,
    details
  };
  logs.push(log);
  await storage.logs.write(logs);
};

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Auth routes
app.get('/api/auth/status', (req, res) => {
  const isConfigured = discordAuth.isConfigured();
  
  res.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Discord OAuth configured' 
      : 'Discord OAuth NOT configured - Please configure in backend/.env'
  });
});

app.get('/api/auth/discord', (req, res) => {
  if (!discordAuth.isConfigured()) {
    return res.status(503).json({ 
      error: 'Discord OAuth not configured',
      message: 'Please configure Discord OAuth in backend/.env file. See SETUP.txt for instructions.'
    });
  }
  
  try {
    const authUrl = discordAuth.getAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

app.get('/api/auth/discord/callback', async (req, res) => {
  const code = req.query.code as string;
  
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  try {
    const accessToken = await discordAuth.exchangeCode(code);
    const user = await discordAuth.getUser(accessToken);
    
    req.session.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  } catch (error) {
    console.error('Discord auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

app.get('/api/auth/me', (req: AuthRequest, res) => {
  if (req.session?.user) {
    console.log('[API] /auth/me - User session:', req.session.user);
    res.json({ user: req.session.user });
  } else {
    console.log('[API] /auth/me - No user session');
    res.json({ user: null });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const username = req.session.user?.username || 'Utilisateur inconnu';
  logAction(username, 'LOGOUT', `Déconnexion de ${username}`).catch(console.error);
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Config / Setup (read-only)
app.get('/api/config', async (req, res) => {
  const config = await storage.config.read();
  res.json(config);
});

app.post('/api/config', requireAdmin, async (req: AuthRequest, res) => {
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

// Guild (read-only for non-admin)
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

app.put('/api/guild', requireAdmin, async (req: AuthRequest, res) => {
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

app.post('/api/members', requireAdmin, async (req: AuthRequest, res) => {
  const members = await storage.members.read();
  const newMember: Member = {
    id: Date.now().toString(),
    ...req.body
  };
  members.push(newMember);
  await storage.members.write(members);
  await logAction(req.session.user?.username || 'Système', 'MEMBER_CREATED', `Membre ajouté: ${newMember.name}`, newMember);
  res.json(newMember);
});

app.put('/api/members/:id', requireAdmin, async (req: AuthRequest, res) => {
  const members = await storage.members.read();
  const index = members.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Member not found' });
  
  const oldMember = members[index];
  members[index] = { ...members[index], ...req.body, id: req.params.id };
  await storage.members.write(members);
  await logAction(req.session.user?.username || 'Système', 'MEMBER_UPDATED', `Membre modifié: ${members[index].name}`, { old: oldMember, new: members[index] });
  res.json(members[index]);
});

app.delete('/api/members/:id', requireAdmin, async (req: AuthRequest, res) => {
  const members = await storage.members.read();
  const memberToDelete = members.find(m => m.id === req.params.id);
  const filtered = members.filter(m => m.id !== req.params.id);
  await storage.members.write(filtered);
  if (memberToDelete) {
    await logAction(req.session.user?.username || 'Système', 'MEMBER_DELETED', `Membre supprimé: ${memberToDelete.name}`, memberToDelete);
  }
  res.json({ success: true });
});

// Calendar
app.get('/api/calendar', async (req, res) => {
  const events = await storage.calendar.read();
  res.json(events);
});

app.post('/api/calendar', requireAdmin, async (req: AuthRequest, res) => {
  const events = await storage.calendar.read();
  const newEvent: CalendarEvent = {
    id: Date.now().toString(),
    ...req.body
  };
  events.push(newEvent);
  await storage.calendar.write(events);
  await logAction(req.session.user?.username || 'Système', 'EVENT_CREATED', `Événement créé: ${newEvent.title}`, newEvent);
  res.json(newEvent);
});

app.delete('/api/calendar/:id', requireAdmin, async (req: AuthRequest, res) => {
  const events = await storage.calendar.read();
  const eventToDelete = events.find(e => e.id === req.params.id);
  const filtered = events.filter(e => e.id !== req.params.id);
  await storage.calendar.write(filtered);
  if (eventToDelete) {
    await logAction(req.session.user?.username || 'Système', 'EVENT_DELETED', `Événement supprimé: ${eventToDelete.title}`, eventToDelete);
  }
  res.json({ success: true });
});

// Raids
app.get('/api/raids', async (req, res) => {
  const raids = await storage.raids.read();
  res.json(raids);
});

app.post('/api/raids', requireAdmin, async (req: AuthRequest, res) => {
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

app.put('/api/raids/:id', requireAdmin, async (req: AuthRequest, res) => {
  const raids = await storage.raids.read();
  const index = raids.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Raid not found' });
  
  const oldRaid = raids[index];
  raids[index] = { ...raids[index], ...req.body, id: req.params.id };
  await storage.raids.write(raids);
  await logAction(req.session.user?.username || 'Système', 'RAID_UPDATED', `Raid modifié: ${raids[index].instance}`, { old: oldRaid, new: raids[index] });
  res.json(raids[index]);
});

app.delete('/api/raids/:id', requireAdmin, async (req: AuthRequest, res) => {
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

app.post('/api/dungeons', requireAdmin, async (req: AuthRequest, res) => {
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

app.put('/api/loot/:id', requireAdmin, async (req: AuthRequest, res) => {
  const loot = await storage.loot.read();
  const index = loot.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Loot not found' });
  
  const oldLoot = loot[index];
  loot[index] = { ...loot[index], ...req.body, id: req.params.id };
  await storage.loot.write(loot);
  await logAction(req.session.user?.username || 'Système', 'LOOT_UPDATED', `Objet modifié: ${loot[index].itemName}`, { old: oldLoot, new: loot[index] });
  res.json(loot[index]);
});

app.delete('/api/loot/:id', requireAdmin, async (req: AuthRequest, res) => {
  const loot = await storage.loot.read();
  const lootToDelete = loot.find(l => l.id === req.params.id);
  const filtered = loot.filter(l => l.id !== req.params.id);
  await storage.loot.write(filtered);
  if (lootToDelete) {
    await logAction(req.session.user?.username || 'Système', 'LOOT_DELETED', `Objet supprimé: ${lootToDelete.itemName}`, lootToDelete);
  }
  res.json({ success: true });
});

// Logs (admin only)
app.get('/api/logs', requireAdmin, async (req: AuthRequest, res) => {
  const logs = await storage.logs.read();
  res.json(logs.sort((a: Log, b: Log) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
});

app.post('/api/loot', requireAdmin, async (req: AuthRequest, res) => {
  const loot = await storage.loot.read();
  const newLoot: Loot = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...req.body
  };
  loot.push(newLoot);
  await storage.loot.write(loot);
  await logAction(req.session.user?.username || 'Système', 'LOOT_CREATED', `Objet ajouté: ${newLoot.itemName}`, newLoot);
  res.json(newLoot);
});

app.listen(PORT, () => {
  console.log(`🎮 WoW Guild Manager API running on http://localhost:${PORT}`);
});
