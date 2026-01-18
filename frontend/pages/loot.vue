<template>
  <div class="container">
    <h1>💎 Gestion du loot</h1>

    <div class="wow-panel" style="margin-bottom: 2rem;">
      <button @click="showAddForm = !showAddForm" class="wow-button">
        {{ showAddForm ? 'Annuler' : '+ Ajouter du loot' }}
      </button>

      <form v-if="showAddForm" @submit.prevent="addLoot" style="margin-top: 2rem;">
        <div class="form-grid">
          <div class="form-group">
            <label>Nom de l'objet</label>
            <input v-model="newLoot.itemName" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Qualité</label>
            <select v-model="newLoot.quality" class="wow-select" required>
              <option value="Poor">Pauvre</option>
              <option value="Common">Commun</option>
              <option value="Uncommon">Inhabituel</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Épique</option>
              <option value="Legendary">Légendaire</option>
            </select>
          </div>

          <div class="form-group">
            <label>Raid</label>
            <select v-model="newLoot.raidId" class="wow-select" required>
              <option value="">Sélectionner un raid</option>
              <option v-for="raid in raids" :key="raid.id" :value="raid.id">
                {{ raid.name }} - {{ raid.instance }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Boss</label>
            <input v-model="newLoot.boss" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Attribué à</label>
            <select v-model="newLoot.assignedTo" class="wow-select" required>
              <option value="">Sélectionner un membre</option>
              <option v-for="member in members" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.class }})
              </option>
            </select>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">Ajouter</button>
      </form>
    </div>

    <div class="wow-panel">
      <div v-if="loot.length === 0" style="text-align: center; padding: 2rem;">
        <p>Aucun loot enregistré</p>
      </div>

      <div v-else class="loot-table">
        <div class="table-header">
          <div>Objet</div>
          <div>Qualité</div>
          <div>Boss</div>
          <div>Raid</div>
          <div>Attribué à</div>
          <div>Date</div>
        </div>

        <div v-for="item in sortedLoot" :key="item.id" class="table-row">
          <div :class="'quality-' + item.quality">{{ item.itemName }}</div>
          <div :class="'quality-' + item.quality">{{ item.quality }}</div>
          <div>{{ item.boss }}</div>
          <div>{{ getRaidName(item.raidId) }}</div>
          <div :class="getMemberClass(item.assignedTo)">{{ getMemberName(item.assignedTo) }}</div>
          <div>{{ formatDate(item.date) }}</div>
        </div>
      </div>

      <div v-if="loot.length > 0" style="margin-top: 2rem;">
        <h2>Statistiques par membre</h2>
        <div class="stats-grid">
          <div v-for="(count, memberId) in memberLootCounts" :key="memberId" class="stat-item">
            <span :class="getMemberClass(memberId)">{{ getMemberName(memberId) }}</span>
            <span class="count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const loot = ref<any[]>([]);
const members = ref<any[]>([]);
const raids = ref<any[]>([]);
const showAddForm = ref(false);

const newLoot = ref({
  itemName: '',
  quality: 'Rare' as const,
  raidId: '',
  boss: '',
  assignedTo: '',
});

const sortedLoot = computed(() => {
  return [...loot.value].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

const memberLootCounts = computed(() => {
  const counts: Record<string, number> = {};
  loot.value.forEach(item => {
    counts[item.assignedTo] = (counts[item.assignedTo] || 0) + 1;
  });
  return counts;
});

onMounted(async () => {
  await Promise.all([
    loadLoot(),
    loadMembers(),
    loadRaids(),
  ]);
});

const loadLoot = async () => {
  loot.value = await api.getLoot();
};

const loadMembers = async () => {
  members.value = await api.getMembers();
};

const loadRaids = async () => {
  raids.value = await api.getRaids();
};

const addLoot = async () => {
  try {
    await api.createLoot(newLoot.value);
    await loadLoot();
    showAddForm.value = false;
    newLoot.value = {
      itemName: '',
      quality: 'Rare',
      raidId: '',
      boss: '',
      assignedTo: '',
    };
  } catch (error) {
    console.error('Failed to add loot:', error);
    alert('Erreur lors de l\'ajout du loot');
  }
};

const getMemberName = (memberId: string) => {
  const member = members.value.find(m => m.id === memberId);
  return member?.name || 'Inconnu';
};

const getMemberClass = (memberId: string) => {
  const member = members.value.find(m => m.id === memberId);
  return member ? 'class-' + member.class.replace(' ', '-') : '';
};

const getRaidName = (raidId: string) => {
  const raid = raids.value.find(r => r.id === raidId);
  return raid?.name || 'Inconnu';
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

.loot-table {
  width: 100%;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.table-header {
  font-weight: bold;
  color: var(--secondary);
  background: rgba(0, 0, 0, 0.3);
}

.table-row:hover {
  background: rgba(212, 175, 55, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--secondary);
}
</style>
