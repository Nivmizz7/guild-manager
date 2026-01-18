<template>
  <div class="container">
    <h1>{{ t('loot') }}</h1>

    <div v-if="!isAdmin" class="wow-panel" style="margin-bottom: 1rem; background: rgba(255,165,0,0.1);">
      <p style="margin: 0;">📖 Mode lecture seule - Vous devez avoir le rôle admin pour modifier le loot</p>
    </div>

    <div v-if="isAdmin" class="wow-panel" style="margin-bottom: 2rem;">
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
            <label>Quantité</label>
            <input v-model.number="newLoot.quantity" type="number" min="1" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Qualité</label>
            <select v-model="newLoot.quality" class="wow-select" required>
              <option value="Pauvre">Pauvre</option>
              <option value="Commun">Commun</option>
              <option value="Inhabituel">Inhabituel</option>
              <option value="Rare">Rare</option>
              <option value="Épique">Épique</option>
              <option value="Légendaire">Légendaire</option>
            </select>
          </div>

          <div class="form-group">
            <label>Provenance</label>
            <select v-model="newLoot.source" class="wow-select" required>
              <option value="Raid">Raid</option>
              <option value="Donjon">Donjon</option>
              <option value="Farm">Farm</option>
              <option value="Craft">Craft</option>
              <option value="Achat">Achat</option>
              <option value="Quête">Quête</option>
            </select>
          </div>

          <div v-if="newLoot.source === 'Raid' || newLoot.source === 'Donjon'" class="form-group">
            <label>{{ newLoot.source === 'Raid' ? 'Raid' : 'Donjon' }}</label>
            <input v-model="newLoot.instance" class="wow-input" :placeholder="newLoot.source === 'Raid' ? 'ex: Cœur du Magma' : 'ex: Stratholme'" required />
          </div>

          <div v-if="newLoot.source === 'Raid' || newLoot.source === 'Donjon'" class="form-group">
            <label>Boss / Mob</label>
            <input v-model="newLoot.boss" class="wow-input" />
          </div>

          <div class="form-group">
            <label>Localisation</label>
            <select v-model="newLoot.location" class="wow-select" required>
              <option value="Banque de guilde">Banque de guilde</option>
              <option value="Coffre personnel">Coffre personnel</option>
              <option value="Mule">Mule</option>
              <option value="Inventaire">Inventaire</option>
              <option value="Équipé">Équipé</option>
            </select>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">Ajouter</button>
      </form>
    </div>

    <div class="wow-panel">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          class="wow-input" 
          placeholder="🔍 Rechercher un objet, membre, boss, raid..."
        />
      </div>

      <div v-if="filteredLoot.length === 0" style="text-align: center; padding: 2rem;">
        <p>{{ searchQuery ? 'Aucun résultat trouvé' : 'Aucun loot enregistré' }}</p>
      </div>

      <div v-else class="loot-table">
        <div class="table-header">
          <div>Objet</div>
          <div>Qté</div>
          <div>Qualité</div>
          <div>Provenance</div>
          <div>Raid/Donjon</div>
          <div>Boss</div>
          <div>Localisation</div>
          <div>Date</div>
          <div v-if="isAdmin">Actions</div>
        </div>

        <div v-for="item in filteredLoot" :key="item.id" class="table-row">
          <div :class="'quality-' + item.quality">{{ item.itemName }}</div>
          <div>{{ item.quantity || 1 }}</div>
          <div :class="'quality-' + item.quality">{{ item.quality }}</div>
          <div>{{ item.source || '-' }}</div>
          <div>{{ item.instance || '-' }}</div>
          <div>{{ item.boss || '-' }}</div>
          <div>{{ item.location || '-' }}</div>
          <div>{{ formatDate(item.date) }}</div>
          <div v-if="isAdmin" class="actions">
            <button @click="editLoot(item)" class="edit-btn" title="Modifier">✏️</button>
            <button @click="deleteLootById(item.id)" class="delete-btn" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>

      <div v-if="loot.length > 0" style="margin-top: 2rem;">
        <h2>Résumé par provenance</h2>
        <div class="stats-grid">
          <div v-for="(count, source) in sourceCounts" :key="source" class="stat-item">
            <span>{{ source }}</span>
            <span class="count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { isAdmin } = useAuth();
const api = useApi();
const loot = ref<any[]>([]);
const showAddForm = ref(false);
const searchQuery = ref('');

const newLoot = ref({
  itemName: '',
  quantity: 1,
  quality: 'Rare' as const,
  source: 'Raid' as const,
  instance: '',
  location: 'Banque de guilde' as const,
  boss: '',
});

const sortedLoot = computed(() => {
  return [...loot.value].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

const filteredLoot = computed(() => {
  if (!searchQuery.value.trim()) {
    return sortedLoot.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return sortedLoot.value.filter(item => {
    const boss = (item.boss || '').toLowerCase();
    const itemName = item.itemName.toLowerCase();
    const source = (item.source || '').toLowerCase();
    const location = (item.location || '').toLowerCase();
    const instance = (item.instance || '').toLowerCase();
    
    return itemName.includes(query) || 
           boss.includes(query) ||
           source.includes(query) ||
           location.includes(query) ||
           instance.includes(query);
  });
});

const sourceCounts = computed(() => {
  const counts: Record<string, number> = {};
  loot.value.forEach(item => {
    const source = item.source || 'Autre';
    counts[source] = (counts[source] || 0) + 1;
  });
  return counts;
});

onMounted(async () => {
  await loadLoot();
});

const loadLoot = async () => {
  loot.value = await api.getLoot();
};

const addLoot = async () => {
  try {
    // Si la provenance n'est pas Raid ou Donjon, on vide instance et boss
    const lootData = { ...newLoot.value };
    if (lootData.source !== 'Raid' && lootData.source !== 'Donjon') {
      lootData.instance = '';
      lootData.boss = '';
    }
    
    await api.createLoot(lootData);
    await loadLoot();
    showAddForm.value = false;
    newLoot.value = {
      itemName: '',
      quantity: 1,
      quality: 'Rare',
      source: 'Raid',
      instance: '',
      location: 'Banque de guilde',
      boss: '',
    };
  } catch (error) {
    console.error('Failed to add loot:', error);
    alert('Erreur lors de l\'ajout du loot');
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

.search-bar {
  margin-bottom: 1.5rem;
}

.search-bar input {
  width: 100%;
  font-size: 1.1rem;
}

.loot-table {
  width: 100%;
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1.2fr 1.5fr 1.2fr 1.5fr 1fr 0.8fr;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  font-size: 0.9rem;
}

.table-header {
  font-weight: bold;
  color: var(--secondary);
  background: rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
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

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.edit-btn:hover,
.delete-btn:hover {
  transform: scale(1.2);
}
</style>
