export const useAuth = () => {
  const user = useState('user', () => null as any);
  const api = useApi();

  const fetchUser = async () => {
    try {
      const data = await api.getMe();
      user.value = data.user || data;
    } catch (error) {
      user.value = null;
    }
  };

  const loginWithDiscord = async () => {
    try {
      const { url } = await api.getAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
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
