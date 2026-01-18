<template>
  <div class="container">
    <h1>👥 Gestion des membres</h1>

    <div class="wow-panel" style="margin-bottom: 2rem;">
      <button @click="showAddForm = !showAddForm" class="wow-button">
        {{ showAddForm ? 'Annuler' : '+ Ajouter un membre' }}
      </button>

      <form v-if="showAddForm" @submit.prevent="addMember" style="margin-top: 2rem;">
        <div class="form-grid">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="newMember.name" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Classe</label>
            <select v-model="newMember.class" class="wow-select" required>
              <option value="Warrior">Guerrier</option>
              <option value="Paladin">Paladin</option>
              <option value="Hunter">Chasseur</option>
              <option value="Rogue">Voleur</option>
              <option value="Priest">Prêtre</option>
              <option value="Death Knight">Chevalier de la mort</option>
              <option value="Shaman">Chaman</option>
              <option value="Mage">Mage</option>
              <option value="Warlock">Démoniste</option>
              <option value="Monk">Moine</option>
              <option value="Druid">Druide</option>
              <option value="Demon Hunter">Chasseur de démons</option>
              <option value="Evoker">Évocateur</option>
            </select>
          </div>

          <div class="form-group">
            <label>Race</label>
            <input v-model="newMember.race" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Rôle</label>
            <select v-model="newMember.role" class="wow-select" required>
              <option value="Tank">Tank</option>
              <option value="Heal">Heal</option>
              <option value="DPS">DPS</option>
            </select>
          </div>

          <div class="form-group">
            <label>Spécialisation</label>
            <input v-model="newMember.specialization" class="wow-input" />
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="newMember.notes" class="wow-textarea" rows="3"></textarea>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">Ajouter</button>
      </form>
    </div>

    <div class="wow-panel">
      <div v-if="members.length === 0" style="text-align: center; padding: 2rem;">
        <p>Aucun membre pour le moment</p>
      </div>

      <div v-else class="members-table">
        <div class="table-header">
          <div>Nom</div>
          <div>Classe</div>
          <div>Race</div>
          <div>Rôle</div>
          <div>Spé</div>
          <div>Actions</div>
        </div>

        <div v-for="member in members" :key="member.id" class="table-row">
          <div :class="'class-' + member.class.replace(' ', '-')">{{ member.name }}</div>
          <div :class="'class-' + member.class.replace(' ', '-')">{{ member.class }}</div>
          <div>{{ member.race }}</div>
          <div>{{ member.role }}</div>
          <div>{{ member.specialization || '-' }}</div>
          <div>
            <button @click="deleteMemberById(member.id)" class="delete-btn">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const config = useState('config');
const members = ref<any[]>([]);
const showAddForm = ref(false);

const newMember = ref({
  name: '',
  class: 'Warrior',
  race: '',
  role: 'DPS',
  faction: 'Horde',
  specialization: '',
  notes: '',
});

onMounted(async () => {
  await loadMembers();
  const configData = await api.getConfig();
  newMember.value.faction = configData.faction;
});

const loadMembers = async () => {
  members.value = await api.getMembers();
};

const addMember = async () => {
  try {
    await api.createMember(newMember.value);
    await loadMembers();
    showAddForm.value = false;
    newMember.value = {
      name: '',
      class: 'Warrior',
      race: '',
      role: 'DPS',
      faction: config.value.faction,
      specialization: '',
      notes: '',
    };
  } catch (error) {
    console.error('Failed to add member:', error);
    alert('Erreur lors de l\'ajout du membre');
  }
};

const deleteMemberById = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
    try {
      await api.deleteMember(id);
      await loadMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Erreur lors de la suppression');
    }
  }
};
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.members-table {
  width: 100%;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1.5fr 0.5fr;
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

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.delete-btn:hover {
  transform: scale(1.2);
}
</style>
