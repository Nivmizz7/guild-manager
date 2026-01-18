<template>
  <div class="container">
    <div v-if="loading" class="wow-panel" style="text-align: center;">
      <h2>⏳ Chargement...</h2>
    </div>

    <div v-else-if="!config.setupComplete" class="setup-wizard">
      <div class="wow-panel">
        <h1>🎮 Bienvenue dans WoW Guild Manager</h1>
        <p style="margin-bottom: 2rem;">Configurez votre guilde pour commencer</p>

        <form @submit.prevent="saveSetup">
          <div class="form-group">
            <label>Nom de la guilde</label>
            <input v-model="setupData.name" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Faction</label>
            <select v-model="setupData.faction" class="wow-select" required>
              <option value="Horde">Horde</option>
              <option value="Alliance">Alliance</option>
            </select>
          </div>

          <div class="form-group">
            <label>Version du jeu</label>
            <select v-model="setupData.version" class="wow-select" required>
              <option value="Vanilla">Vanilla (1.12)</option>
              <option value="TBC">The Burning Crusade</option>
              <option value="WotLK">Wrath of the Lich King</option>
              <option value="Cataclysm">Cataclysm</option>
              <option value="MoP">Mists of Pandaria</option>
              <option value="WoD">Warlords of Draenor</option>
              <option value="Legion">Legion</option>
              <option value="BFA">Battle for Azeroth</option>
              <option value="Shadowlands">Shadowlands</option>
              <option value="Dragonflight">Dragonflight</option>
              <option value="The War Within">The War Within</option>
            </select>
          </div>

          <button type="submit" class="wow-button">Créer la guilde</button>
        </form>
      </div>
    </div>

    <div v-else class="dashboard">
      <h1>🏰 {{ guild.name }}</h1>
      
      <div class="stats-grid">
        <div class="wow-panel stat-card">
          <h3>👥 Membres</h3>
          <div class="stat-value">{{ guild.memberCount }}</div>
        </div>

        <div class="wow-panel stat-card">
          <h3>⚔️ Raids actifs</h3>
          <div class="stat-value">{{ upcomingRaids }}</div>
        </div>

        <div class="wow-panel stat-card">
          <h3>🎯 Version</h3>
          <div class="stat-value">{{ guild.version }}</div>
        </div>

        <div class="wow-panel stat-card">
          <h3>🛡️ Faction</h3>
          <div class="stat-value">{{ guild.faction }}</div>
        </div>
      </div>

      <div class="wow-panel" style="margin-top: 2rem;">
        <h2>Répartition des classes</h2>
        <div class="class-distribution">
          <div v-for="(count, className) in guild.classDistribution" :key="className" class="class-bar">
            <span :class="'class-' + className">{{ className }}</span>
            <div class="bar">
              <div class="bar-fill" :style="{ width: (count / guild.memberCount * 100) + '%' }"></div>
              <span class="count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wow-panel" style="margin-top: 2rem;">
        <h2>Répartition des rôles</h2>
        <div class="role-distribution">
          <div v-for="(count, role) in guild.roleDistribution" :key="role" class="role-item">
            <span class="role-name">{{ role }}</span>
            <span class="role-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const config = useState('config');
const loading = ref(true);
const guild = ref<any>({});
const upcomingRaids = ref(0);

const setupData = ref({
  name: '',
  faction: 'Horde',
  version: 'Vanilla',
});

onMounted(async () => {
  try {
    const configData = await api.getConfig();
    config.value = configData;
    
    if (configData.setupComplete) {
      guild.value = await api.getGuild();
      const raids = await api.getRaids();
      upcomingRaids.value = raids.filter((r: any) => r.status === 'prévu').length;
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  } finally {
    loading.value = false;
  }
});

const saveSetup = async () => {
  try {
    const savedConfig = await api.saveConfig(setupData.value);
    config.value = savedConfig;
    guild.value = await api.getGuild();
  } catch (error) {
    console.error('Failed to save setup:', error);
    alert('Erreur lors de la configuration');
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 3rem;
  font-weight: bold;
  color: var(--secondary);
  margin-top: 0.5rem;
}

.class-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.class-bar {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: center;
}

.bar {
  background: rgba(0, 0, 0, 0.5);
  height: 30px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  background: linear-gradient(90deg, var(--secondary), var(--primary));
  height: 100%;
  transition: width 0.5s ease;
}

.count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
}

.role-distribution {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.role-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-name {
  font-weight: bold;
}

.role-count {
  font-size: 1.5rem;
  color: var(--secondary);
}
</style>
