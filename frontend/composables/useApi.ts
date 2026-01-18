export const useApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    // Config
    getConfig: () => fetchApi('/api/config'),
    saveConfig: (data: any) => fetchApi('/api/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // Guild
    getGuild: () => fetchApi('/api/guild'),
    updateGuild: (data: any) => fetchApi('/api/guild', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Members
    getMembers: () => fetchApi('/api/members'),
    createMember: (data: any) => fetchApi('/api/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateMember: (id: string, data: any) => fetchApi(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteMember: (id: string) => fetchApi(`/api/members/${id}`, {
      method: 'DELETE',
    }),

    // Calendar
    getCalendar: () => fetchApi('/api/calendar'),
    createEvent: (data: any) => fetchApi('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    deleteEvent: (id: string) => fetchApi(`/api/calendar/${id}`, {
      method: 'DELETE',
    }),

    // Raids
    getRaids: () => fetchApi('/api/raids'),
    createRaid: (data: any) => fetchApi('/api/raids', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateRaid: (id: string, data: any) => fetchApi(`/api/raids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteRaid: (id: string) => fetchApi(`/api/raids/${id}`, {
      method: 'DELETE',
    }),

    // Loot
    getLoot: () => fetchApi('/api/loot'),
    getMemberLoot: (memberId: string) => fetchApi(`/api/loot/member/${memberId}`),
    createLoot: (data: any) => fetchApi('/api/loot', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };
};
