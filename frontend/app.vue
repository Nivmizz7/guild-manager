<template>
  <div :class="theme + '-theme'">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <h1 class="logo">⚔️ {{ guildName || 'WoW Guild Manager' }}</h1>
          <div class="nav-links">
            <NuxtLink to="/">{{ t('home') }}</NuxtLink>
            <NuxtLink to="/members">{{ t('members') }}</NuxtLink>
            <NuxtLink to="/raids">{{ t('raids') }}</NuxtLink>
            <NuxtLink to="/calendar">{{ t('calendar') }}</NuxtLink>
            <NuxtLink to="/loot">{{ t('loot') }}</NuxtLink>
            <button @click="toggleLocale" class="lang-toggle">{{ locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR' }}</button>
            
            <div v-if="isLoggedIn" class="user-menu">
              <span class="username">{{ user?.username }}</span>
              <span v-if="isAdmin" class="admin-badge">👑</span>
              <button @click="handleLogout" class="logout-btn">🚪</button>
            </div>
            <button v-else @click="loginWithDiscord" class="login-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Login
            </button>
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
const { user, isAdmin, isLoggedIn, fetchUser, loginWithDiscord, logout } = useAuth();
const config = useState('config', () => ({ faction: 'Horde', name: '' }));
const theme = computed(() => config.value.faction === 'Horde' ? 'horde' : 'alliance');
const guildName = computed(() => config.value.name);

onMounted(() => {
  fetchUser();
});

const handleLogout = async () => {
  await logout();
  navigateTo('/');
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
