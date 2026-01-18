<template>
  <div :class="theme + '-theme'">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <h1 class="logo">⚔️ {{ guildName || 'WoW Guild Manager' }}</h1>
          <div class="nav-links">
            <NuxtLink to="/">Accueil</NuxtLink>
            <NuxtLink to="/members">Membres</NuxtLink>
            <NuxtLink to="/raids">Raids</NuxtLink>
            <NuxtLink to="/calendar">Calendrier</NuxtLink>
            <NuxtLink to="/loot">Loot</NuxtLink>
          </div>
        </div>
      </div>
    </nav>
    
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const config = useState('config', () => ({ faction: 'Horde', name: '' }));
const theme = computed(() => config.value.faction === 'Horde' ? 'horde' : 'alliance');
const guildName = computed(() => config.value.name);
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
</style>
