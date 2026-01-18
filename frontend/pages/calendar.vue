<template>
  <div class="container">
    <h1>📅 {{ t('calendar') }}</h1>

    <div v-if="!isAdmin && isLoggedIn" class="wow-panel read-only-notice">
      ⚠️ {{ locale === 'fr' ? 'Mode lecture seule - Vous devez avoir le rôle admin pour modifier' : 'Read-only mode - Admin role required to edit' }}
    </div>

    <div v-if="isAdmin" class="wow-panel" style="margin-bottom: 2rem;">
      <button @click="showAddForm = !showAddForm" class="wow-button">
        {{ showAddForm ? t('cancel') : '+ Ajouter un événement' }}
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
              <option value="Buff">Buff</option>
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

          <div v-if="newEvent.type === 'Buff'" class="form-group">
            <label>Buff</label>
            <select v-model="newEvent.buff" class="wow-select">
              <option value="">Sélectionner</option>
              <option value="Tête de dragon">🐲 Tête de dragon</option>
              <option value="Cœur d'Onyxia">❤️ Cœur d'Onyxia</option>
              <option value="Cœur de Nefarian">🖤 Cœur de Nefarian</option>
              <option value="DMF">🎪 DMF (Foire de Sombrelune)</option>
              <option value="ZG Buff">⚡ ZG Buff</option>
              <option value="Songflower">🌸 Songflower</option>
            </select>
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label>Description</label>
            <textarea v-model="newEvent.description" class="wow-textarea" rows="3"></textarea>
          </div>
        </div>

        <button type="submit" class="wow-button" style="margin-top: 1rem;">{{ t('add') }}</button>
      </form>
    </div>

    <div class="wow-panel">
      <div class="calendar-header">
        <button @click="previousMonth" class="month-nav">◀</button>
        <h2>{{ currentMonthName }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="month-nav">▶</button>
      </div>

      <div class="calendar">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>

        <div class="days-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="['day-cell', { 
              'other-month': day.isOtherMonth, 
              'today': day.isToday,
              'has-events': day.events.length > 0 
            }]"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-events">
              <div
                v-for="event in day.events"
                :key="event.id"
                :class="['event-badge', 'event-' + event.type.toLowerCase()]"
                :title="event.title + (event.time ? ' - ' + event.time : '')"
              >
                <span class="event-icon">{{ getEventIcon(event.type) }}</span>
                <span class="event-title">{{ event.title }}</span>
                <span v-if="event.buff" class="buff-name">{{ event.buff }}</span>
                <button v-if="isAdmin" @click.stop="deleteEventById(event.id)" class="event-delete">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n();
const { isAdmin, isLoggedIn } = useAuth();
const api = useApi();
const events = ref<any[]>([]);
const showAddForm = ref(false);
const currentDate = ref(new Date());

const newEvent = ref({
  title: '',
  type: 'Raid' as const,
  date: '',
  time: '',
  description: '',
  buff: '',
});

const weekDays = locale.value === 'fr' 
  ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
});

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Adjust for Monday start (0 = Sunday, 1 = Monday)
  let startDay = firstDay.getDay() - 1;
  if (startDay === -1) startDay = 6;
  
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      day: prevMonthLastDay - i,
      date: date,
      isOtherMonth: true,
      isToday: false,
      events: getEventsForDate(date),
    });
  }
  
  // Current month days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({
      day,
      date: date,
      isOtherMonth: false,
      isToday: date.getTime() === today.getTime(),
      events: getEventsForDate(date),
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      day,
      date: date,
      isOtherMonth: true,
      isToday: false,
      events: getEventsForDate(date),
    });
  }
  
  return days;
});

const getEventsForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  return events.value.filter(event => event.date === dateStr);
};

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

onMounted(async () => {
  await loadEvents();
});

const loadEvents = async () => {
  events.value = await api.getCalendar();
};

const addEvent = async () => {
  try {
    const eventData = { ...newEvent.value };
    if (eventData.type !== 'Buff') {
      eventData.buff = '';
    }
    await api.createEvent(eventData);
    await loadEvents();
    showAddForm.value = false;
    newEvent.value = {
      title: '',
      type: 'Raid',
      date: '',
      time: '',
      description: '',
      buff: '',
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

const getEventIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Raid': '⚔️',
    'Donjon': '🏰',
    'Event guilde': '🎉',
    'Buff': '✨',
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

.read-only-notice {
  background: rgba(255, 165, 0, 0.2);
  border: 2px solid orange;
  padding: 1rem;
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--secondary);
}

.month-nav {
  background: rgba(212, 175, 55, 0.2);
  border: 2px solid var(--secondary);
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.month-nav:hover {
  background: rgba(212, 175, 55, 0.4);
  transform: scale(1.05);
}

.calendar-header h2 {
  margin: 0;
  text-transform: capitalize;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: var(--secondary);
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 0.9rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-cell {
  min-height: 100px;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.day-cell:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--secondary);
}

.day-cell.other-month {
  opacity: 0.4;
}

.day-cell.today {
  background: rgba(212, 175, 55, 0.3);
  border-color: var(--secondary);
  border-width: 2px;
}

.day-cell.has-events {
  background: rgba(212, 175, 55, 0.15);
}

.day-number {
  font-weight: bold;
  color: var(--secondary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-badge {
  background: rgba(0, 0, 0, 0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  border-left: 3px solid var(--secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  transition: all 0.2s;
}

.event-badge:hover {
  transform: translateX(2px);
  background: rgba(0, 0, 0, 0.7);
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

.event-buff {
  border-left-color: #ffaa00;
}

.event-icon {
  font-size: 0.9rem;
}

.event-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.buff-name {
  font-size: 0.7rem;
  color: #ffaa00;
  font-weight: bold;
}

.event-delete {
  background: rgba(255, 0, 0, 0.3);
  border: none;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.event-delete:hover {
  background: rgba(255, 0, 0, 0.6);
  transform: scale(1.1);
}
</style>
