export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side
  if (process.server) return;

  const { isLoggedIn } = useAuth();

  // Allow access to login page
  if (to.path === '/login') {
    // If already logged in, redirect to home
    if (isLoggedIn.value) {
      return navigateTo('/');
    }
    return;
  }

  // For all other pages, require login
  if (!isLoggedIn.value) {
    return navigateTo('/login');
  }
});
