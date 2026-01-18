<template>
  <div class="container">
    <h1>👥 Gestion des membres</h1>

    <div class="wow-panel" style="margin-bottom: 2rem;">
      <button @click="toggleForm" class="wow-button">
        {{ showForm ? 'Annuler' : '+ Ajouter un membre' }}
      </button>

      <form v-if="showForm" @submit.prevent="saveMember" style="margin-top: 2rem;">
        <h3>{{ editingMember ? 'Modifier le membre' : 'Ajouter un membre' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="formData.name" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Classe</label>
            <select v-model="formData.class" class="wow-select" required>
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
            <input v-model="formData.race" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Rôle</label>
            <select v-model="formData.role" class="wow-select" required>
              <option value="Tank">Tank</option>
              <option value="Heal">Heal</option>
              <option value="DPS">DPS</option>
            </select>
          </div>

          <div class="form-group">
            <label>Spécialisation</label>
            <input v-model="formData.specialization" class="wow-input" />
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="formData.notes" class="wow-textarea" rows="3"></textarea>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">
          {{ editingMember ? 'Modifier' : 'Ajouter' }}
        </button>
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
          <div class="actions">
            <button @click="editMember(member)" class="edit-btn" title="Modifier">✏️</button>
            <button @click="deleteMemberById(member.id)" class="delete-btn" title="Supprimer">🗑️</button>
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
const showForm = ref(false);
const editingMember = ref<any>(null);

const formData = ref({
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
  formData.value.faction = configData.faction;
});

const loadMembers = async () => {
  members.value = await api.getMembers();
};

const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    editingMember.value = null;
    resetForm();
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    class: 'Warrior',
    race: '',
    role: 'DPS',
    faction: config.value.faction,
    specialization: '',
    notes: '',
  };
};

const editMember = (member: any) => {
  editingMember.value = member;
  formData.value = { ...member };
  showForm.value = true;
};

const saveMember = async () => {
  try {
    if (editingMember.value) {
      await api.updateMember(editingMember.value.id, formData.value);
    } else {
      await api.createMember(formData.value);
    }
    await loadMembers();
    showForm.value = false;
    editingMember.value = null;
    resetForm();
  } catch (error) {
    console.error('Failed to save member:', error);
    alert('Erreur lors de l\'enregistrement du membre');
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

.actions {
  display: flex;
  gap: 0.5rem;
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
