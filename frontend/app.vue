<template>
  <div :class="theme + '-theme'">
    <nav v-if="isLoggedIn" class="navbar">
      <div class="container">
        <div class="nav-content">
          <h1 class="logo">⚔️ {{ guildName || 'WoW Guild Manager' }}</h1>
          <div class="nav-links">
            <NuxtLink to="/">{{ t('home') }}</NuxtLink>
            <NuxtLink to="/members">{{ t('members') }}</NuxtLink>
            <NuxtLink to="/raids">{{ t('raids') }}</NuxtLink>
            <NuxtLink to="/calendar">{{ t('calendar') }}</NuxtLink>
            <NuxtLink to="/loot">{{ t('loot') }}</NuxtLink>
            <NuxtLink v-if="isAdmin" to="/logs">📜 Logs</NuxtLink>
            <button @click="toggleLocale" class="lang-toggle">{{ locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR' }}</button>
            
            <div class="user-menu">
              <span class="username">{{ user?.username }}</span>
              <span v-if="isAdmin" class="admin-badge">👑</span>
              <button @click="handleLogout" class="logout-btn">🚪</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { t, locale, toggleLocale } = useI18n();
const { user, isAdmin, isLoggedIn, fetchUser, logout } = useAuth();
const config = useState('config', () => ({ faction: 'Horde', name: '' }));
const route = useRoute();

const theme = computed(() => config.value.faction === 'Horde' ? 'horde' : 'alliance');
const guildName = computed(() => config.value.name);

onMounted(async () => {
  // Only fetch user if not on login page
  if (route.path !== '/login') {
    await fetchUser();
  }
});

const handleLogout = async () => {
  await logout();
  navigateTo('/login');
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.95) 100%);
  border-bottom: 3px solid var(--secondary);
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-light);
  text-decoration: none;
  font-weight: bold;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  border-color: var(--secondary);
  background: rgba(212, 175, 55, 0.1);
}

.lang-toggle {
  background: rgba(212, 175, 55, 0.2);
  border: 2px solid var(--secondary);
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.lang-toggle:hover {
  background: rgba(212, 175, 55, 0.3);
  transform: scale(1.05);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 2px solid var(--secondary);
}

.username {
  color: var(--text-light);
  font-weight: bold;
}

.admin-badge {
  font-size: 1.2rem;
}

.logout-btn,
.login-btn {
  background: rgba(88, 101, 242, 0.8);
  border: 2px solid #5865F2;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--secondary);
  padding: 0.3rem 0.6rem;
  font-size: 1.2rem;
}

.login-btn:hover,
.logout-btn:hover {
  transform: scale(1.05);
  background: rgba(88, 101, 242, 1);
}

.logout-btn:hover {
  background: rgba(212, 175, 55, 0.4);
}
</style>
