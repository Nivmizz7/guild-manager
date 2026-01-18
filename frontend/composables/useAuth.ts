export const useAuth = () => {
  const user = useState('user', () => null as any);
  const api = useApi();

  const fetchUser = async () => {
    try {
      const data = await api.getMe();
      user.value = data.user;
    } catch (error) {
      user.value = null;
    }
  };

  const loginWithDiscord = async () => {
    try {
      const { url } = await api.getAuthUrl();
      window.location.href = url;
    } catch (error: any) {
      console.error('Failed to get auth URL:', error);
      alert('Erreur: Discord OAuth non configuré. Voir SETUP.txt pour les instructions.');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      user.value = null;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAdmin = computed(() => user.value?.isAdmin || false);
  const isLoggedIn = computed(() => !!user.value);

  return {
    user,
    isAdmin,
    isLoggedIn,
    fetchUser,
    loginWithDiscord,
    logout,
  };
};
