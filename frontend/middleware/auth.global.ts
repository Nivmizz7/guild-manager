export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server side
  if (process.server) return;
  
  const { isLoggedIn, fetchUser } = useAuth();
  
  console.log('[Middleware] Route:', to.path);
  console.log('[Middleware] isLoggedIn BEFORE fetch:', isLoggedIn.value);
  
  // Fetch user on every navigation to ensure fresh state
  await fetchUser();
  
  console.log('[Middleware] isLoggedIn AFTER fetch:', isLoggedIn.value);

  // Allow access to login page
  if (to.path === '/login') {
    // If already logged in, redirect to home
    if (isLoggedIn.value) {
      console.log('[Middleware] Already logged in, redirecting to /');
      return navigateTo('/');
    }
    return;
  }

  // For all other pages, require login
  if (!isLoggedIn.value) {
    console.log('[Middleware] Not logged in, redirecting to /login');
    return navigateTo('/login');
  }
  
  console.log('[Middleware] Access granted to:', to.path);
});
