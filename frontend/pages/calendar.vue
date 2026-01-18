<template>
  <div class="container">
    <h1>📅 Calendrier de guilde</h1>

    <div class="wow-panel" style="margin-bottom: 2rem;">
      <button @click="showAddForm = !showAddForm" class="wow-button">
        {{ showAddForm ? 'Annuler' : '+ Ajouter un événement' }}
      </button>

      <form v-if="showAddForm" @submit.prevent="addEvent" style="margin-top: 2rem;">
        <div class="form-grid">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="newEvent.title" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Type</label>
            <select v-model="newEvent.type" class="wow-select" required>
              <option value="Raid">Raid</option>
              <option value="Donjon">Donjon</option>
              <option value="Event guilde">Event guilde</option>
              <option value="Buff world">Buff world</option>
            </select>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input v-model="newEvent.date" type="date" class="wow-input" required />
          </div>

          <div class="form-group">
            <label>Heure</label>
            <input v-model="newEvent.time" type="time" class="wow-input" />
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label>Description</label>
            <textarea v-model="newEvent.description" class="wow-textarea" rows="3"></textarea>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">Ajouter</button>
      </form>
    </div>

    <div class="wow-panel">
      <div v-if="events.length === 0" style="text-align: center; padding: 2rem;">
        <p>Aucun événement prévu</p>
      </div>

      <div v-else class="events-list">
        <div v-for="event in sortedEvents" :key="event.id" class="event-item" :class="'event-' + event.type.toLowerCase().replace(' ', '-')">
          <div class="event-date">
            <div class="day">{{ formatDay(event.date) }}</div>
            <div class="month">{{ formatMonth(event.date) }}</div>
          </div>

          <div class="event-content">
            <h3>{{ event.title }}</h3>
            <div class="event-meta">
              <span class="event-type">{{ getEventIcon(event.type) }} {{ event.type }}</span>
              <span v-if="event.time">🕐 {{ event.time }}</span>
            </div>
            <p v-if="event.description">{{ event.description }}</p>
          </div>

          <button @click="deleteEventById(event.id)" class="delete-btn">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const events = ref<any[]>([]);
const showAddForm = ref(false);

const newEvent = ref({
  title: '',
  type: 'Raid' as const,
  date: '',
  time: '',
  description: '',
});

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
});

onMounted(async () => {
  await loadEvents();
});

const loadEvents = async () => {
  events.value = await api.getCalendar();
};

const addEvent = async () => {
  try {
    await api.createEvent(newEvent.value);
    await loadEvents();
    showAddForm.value = false;
    newEvent.value = {
      title: '',
      type: 'Raid',
      date: '',
      time: '',
      description: '',
    };
  } catch (error) {
    console.error('Failed to add event:', error);
    alert('Erreur lors de l\'ajout de l\'événement');
  }
};

const deleteEventById = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
    try {
      await api.deleteEvent(id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Erreur lors de la suppression');
    }
  }
};

const formatDay = (dateStr: string) => {
  return new Date(dateStr).getDate();
};

const formatMonth = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short' });
};

const getEventIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Raid': '⚔️',
    'Donjon': '🏰',
    'Event guilde': '🎉',
    'Buff world': '✨',
  };
  return icons[type] || '📅';
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

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border-left: 4px solid var(--secondary);
  align-items: center;
}

.event-raid {
  border-left-color: #ff4444;
}

.event-donjon {
  border-left-color: #4444ff;
}

.event-event-guilde {
  border-left-color: #44ff44;
}

.event-buff-world {
  border-left-color: #ffaa00;
}

.event-date {
  text-align: center;
  background: rgba(212, 175, 55, 0.2);
  padding: 1rem;
  border-radius: 4px;
}

.day {
  font-size: 2rem;
  font-weight: bold;
  color: var(--secondary);
}

.month {
  text-transform: uppercase;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.event-content h3 {
  margin: 0 0 0.5rem 0;
}

.event-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 0.5rem;
}

.event-type {
  font-weight: bold;
  color: var(--secondary);
}

.event-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  transition: transform 0.2s;
  align-self: flex-start;
}

.delete-btn:hover {
  transform: scale(1.2);
}
</style>
