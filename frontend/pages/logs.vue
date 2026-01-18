<template>
  <div class="container">
    <h1>📜 Logs de la guilde</h1>

    <div v-if="!isAdmin" class="wow-panel" style="background: rgba(255,0,0,0.2);">
      <p style="margin: 0;">🔒 Accès refusé - Page réservée aux administrateurs</p>
    </div>

    <div v-else>
      <div class="wow-panel" style="margin-bottom: 1rem;">
        <div class="filters">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="wow-input" 
            placeholder="🔍 Rechercher dans les logs..." 
            style="max-width: 400px;"
          />
          
          <select v-model="filterAction" class="wow-select" style="max-width: 200px;">
            <option value="">Toutes les actions</option>
            <option value="LOGIN">Connexions</option>
            <option value="LOGOUT">Déconnexions</option>
            <option value="MEMBER">Membres</option>
            <option value="RAID">Raids</option>
            <option value="LOOT">Loot</option>
            <option value="EVENT">Événements</option>
          </select>
        </div>
      </div>

      <div class="wow-panel">
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
          Total: {{ filteredLogs.length }} entrées
        </p>

        <div v-if="filteredLogs.length === 0" style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">Aucun log trouvé</p>
        </div>

        <div v-else class="logs-table">
          <div class="log-header">
            <div>Date/Heure</div>
            <div>Utilisateur</div>
            <div>Action</div>
            <div>Description</div>
          </div>

          <div v-for="log in paginatedLogs" :key="log.id" class="log-row">
            <div>{{ formatDateTime(log.timestamp) }}</div>
            <div class="username">{{ log.username }}</div>
            <div>
              <span :class="'badge badge-' + getActionType(log.action)">
                {{ log.action }}
              </span>
            </div>
            <div class="description">{{ log.description }}</div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="wow-button"
          >
            ◀ Précédent
          </button>
          
          <span class="page-info">
            Page {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="wow-button"
          >
            Suivant ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAdmin } = useAuth();
const api = useApi();

const logs = ref<any[]>([]);
const searchQuery = ref('');
const filterAction = ref('');
const currentPage = ref(1);
const logsPerPage = 50;

onMounted(async () => {
  if (isAdmin.value) {
    await loadLogs();
  }
});

const loadLogs = async () => {
  try {
    logs.value = await api.getLogs();
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
};

const filteredLogs = computed(() => {
  let filtered = logs.value;

  // Filter by action type
  if (filterAction.value) {
    filtered = filtered.filter(log => log.action.includes(filterAction.value));
  }

  // Search in all fields
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(log => {
      return (
        log.username.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query)
      );
    });
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / logsPerPage);
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * logsPerPage;
  const end = start + logsPerPage;
  return filteredLogs.value.slice(start, end);
});

// Reset page when filters change
watch([searchQuery, filterAction], () => {
  currentPage.value = 1;
});

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getActionType = (action: string) => {
  if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'auth';
  if (action.includes('MEMBER')) return 'member';
  if (action.includes('RAID')) return 'raid';
  if (action.includes('LOOT')) return 'loot';
  if (action.includes('EVENT')) return 'event';
  return 'other';
};
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.logs-table {
  width: 100%;
  overflow-x: auto;
}

.log-header,
.log-row {
  display: grid;
  grid-template-columns: 180px 150px 150px 1fr;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  font-size: 0.9rem;
}

.log-header {
  font-weight: bold;
  background: rgba(212, 175, 55, 0.1);
  position: sticky;
  top: 0;
  z-index: 1;
}

.log-row:hover {
  background: rgba(212, 175, 55, 0.05);
}

.username {
  font-weight: 600;
  color: var(--secondary);
}

.description {
  color: var(--text-secondary);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.badge-auth {
  background: rgba(100, 149, 237, 0.3);
  color: #6495ED;
}

.badge-member {
  background: rgba(50, 205, 50, 0.3);
  color: #32CD32;
}

.badge-raid {
  background: rgba(220, 20, 60, 0.3);
  color: #DC143C;
}

.badge-loot {
  background: rgba(255, 215, 0, 0.3);
  color: #FFD700;
}

.badge-event {
  background: rgba(138, 43, 226, 0.3);
  color: #8A2BE2;
}

.badge-other {
  background: rgba(128, 128, 128, 0.3);
  color: #808080;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 175, 55, 0.3);
}

.page-info {
  font-weight: bold;
  color: var(--secondary);
}

.wow-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .log-header,
  .log-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .log-header {
    display: none;
  }
  
  .log-row > div::before {
    content: attr(data-label);
    font-weight: bold;
    display: inline-block;
    margin-right: 0.5rem;
  }
}
</style>
