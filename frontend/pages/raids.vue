<template>
  <div class="container">
    <h1>⚔️ Gestion des raids</h1>

    <div class="wow-panel" style="margin-bottom: 2rem;">
      <button @click="showAddForm = !showAddForm" class="wow-button">
        {{ showAddForm ? 'Annuler' : '+ Créer un raid' }}
      </button>

      <form v-if="showAddForm" @submit.prevent="addRaid" style="margin-top: 2rem;">
        <div class="form-grid">
          <div class="form-group">
            <label>Nom du raid</label>
            <input v-model="newRaid.name" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Instance</label>
            <select v-model="newRaid.instance" class="wow-select" required>
              <option v-for="raid in availableRaids" :key="raid" :value="raid">{{ raid }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input v-model="newRaid.date" type="date" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Heure</label>
            <input v-model="newRaid.time" type="time" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Version</label>
            <select v-model="newRaid.version" class="wow-select" required>
              <option value="Vanilla">Vanilla</option>
              <option value="TBC">TBC</option>
              <option value="WotLK">WotLK</option>
              <option value="Cataclysm">Cataclysm</option>
              <option value="MoP">MoP</option>
              <option value="WoD">WoD</option>
              <option value="Legion">Legion</option>
              <option value="BFA">BFA</option>
              <option value="Shadowlands">Shadowlands</option>
              <option value="Dragonflight">Dragonflight</option>
              <option value="The War Within">The War Within</option>
            </select>
          </div>

          <div class="form-group">
            <label>Taille</label>
            <select v-model.number="newRaid.size" class="wow-select" required>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="25">25</option>
              <option :value="40">40</option>
            </select>
          </div>

          <div class="form-group">
            <label>Statut</label>
            <select v-model="newRaid.status" class="wow-select" required>
              <option value="prévu">Prévu</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">Créer le raid</button>
      </form>
    </div>

    <div class="raids-grid">
      <div v-if="raids.length === 0" class="wow-panel" style="text-align: center;">
        <p>Aucun raid planifié</p>
      </div>

      <div v-for="raid in raids" :key="raid.id" class="wow-panel raid-card">
        <div class="raid-header">
          <h3>{{ raid.name }}</h3>
          <span :class="'status-' + raid.status">{{ raid.status }}</span>
        </div>
        
        <div class="raid-info">
          <p><strong>📍 Instance:</strong> {{ raid.instance }}</p>
          <p><strong>📅 Date:</strong> {{ formatDate(raid.date) }} à {{ raid.time }}</p>
          <p><strong>👥 Taille:</strong> {{ raid.size }} joueurs</p>
          <p><strong>🎮 Version:</strong> {{ raid.version }}</p>
          <p><strong>Participants:</strong> {{ raid.participants.length }} / {{ raid.size }}</p>
        </div>

        <div class="raid-actions">
          <button @click="deleteRaidById(raid.id)" class="wow-button">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RAIDS_BY_VERSION } from '~/data/raids';

const api = useApi();
const config = useState('config');
const raids = ref<any[]>([]);
const showAddForm = ref(false);

const newRaid = ref({
  name: '',
  instance: '',
  date: '',
  time: '',
  version: 'Vanilla',
  size: 40,
  status: 'prévu' as const,
});

const availableRaids = computed(() => {
  return RAIDS_BY_VERSION[newRaid.value.version] || [];
});

onMounted(async () => {
  await loadRaids();
  const configData = await api.getConfig();
  newRaid.value.version = configData.version;
  if (availableRaids.value.length > 0) {
    newRaid.value.instance = availableRaids.value[0];
  }
});

const loadRaids = async () => {
  raids.value = await api.getRaids();
  raids.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const addRaid = async () => {
  try {
    await api.createRaid(newRaid.value);
    await loadRaids();
    showAddForm.value = false;
    newRaid.value = {
      name: '',
      instance: availableRaids.value[0] || '',
      date: '',
      time: '',
      version: config.value.version,
      size: 40,
      status: 'prévu',
    };
  } catch (error) {
    console.error('Failed to add raid:', error);
    alert('Erreur lors de la création du raid');
  }
};

const deleteRaidById = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce raid ?')) {
    try {
      await api.deleteRaid(id);
      await loadRaids();
    } catch (error) {
      console.error('Failed to delete raid:', error);
      alert('Erreur lors de la suppression');
    }
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR');
};
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--secondary);
}

.raids-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.raid-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.raid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--secondary);
  padding-bottom: 0.5rem;
}

.raid-header h3 {
  margin: 0;
}

.status-prévu {
  background: rgba(0, 200, 0, 0.3);
  color: #00ff00;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.status-terminé {
  background: rgba(128, 128, 128, 0.3);
  color: #999;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.raid-info p {
  margin: 0.5rem 0;
}

.raid-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}
</style>
