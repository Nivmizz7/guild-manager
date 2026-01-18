export const useI18n = () => {
  const locale = useState('locale', () => 'fr');

  const translations: Record<string, Record<string, string>> = {
    fr: {
      // Navigation
      home: 'Accueil',
      members: 'Membres',
      raids: 'Raids',
      calendar: 'Calendrier',
      loot: 'Loot',
      
      // Common
      cancel: 'Annuler',
      add: 'Ajouter',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Enregistrer',
      search: 'Rechercher',
      loading: 'Chargement...',
      
      // Guild setup
      welcome: 'Bienvenue dans WoW Guild Manager',
      setupGuild: 'Configurez votre guilde pour commencer',
      guildName: 'Nom de la guilde',
      faction: 'Faction',
      gameVersion: 'Version du jeu',
      createGuild: 'Créer la guilde',
      
      // Members
      membersManagement: 'Gestion des membres',
      addMember: 'Ajouter un membre',
      editMember: 'Modifier le membre',
      name: 'Nom',
      class: 'Classe',
      race: 'Race',
      role: 'Rôle',
      specialization: 'Spécialisation',
      notes: 'Notes',
      noMembers: 'Aucun membre pour le moment',
      
      // Raids
      raidsManagement: 'Gestion des raids',
      createRaid: 'Créer un raid',
      raidName: 'Nom du raid',
      instance: 'Instance',
      date: 'Date',
      time: 'Heure',
      version: 'Version',
      size: 'Taille',
      status: 'Statut',
      planned: 'Prévu',
      completed: 'Terminé',
      noRaids: 'Aucun raid planifié',
      participants: 'Participants',
      boss: 'Boss',
      
      // Loot
      lootManagement: 'Gestion du loot',
      addLoot: 'Ajouter du loot',
      itemName: 'Nom de l\'objet',
      quantity: 'Quantité',
      quality: 'Qualité',
      source: 'Provenance',
      location: 'Localisation',
      noLoot: 'Aucun loot enregistré',
      noResults: 'Aucun résultat trouvé',
      
      // Quality
      poor: 'Pauvre',
      common: 'Commun',
      uncommon: 'Inhabituel',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire',
      
      // Source
      raid: 'Raid',
      dungeon: 'Donjon',
      farm: 'Farm',
      craft: 'Craft',
      purchase: 'Achat',
      quest: 'Quête',
      
      // Location
      guildBank: 'Banque de guilde',
      personalBank: 'Coffre personnel',
      mule: 'Mule',
      inventory: 'Inventaire',
      equipped: 'Équipé',
      
      // Stats
      activeRaids: 'Raids actifs',
      classDistribution: 'Répartition des classes',
      roleDistribution: 'Répartition des rôles',
      summaryBySource: 'Résumé par provenance',
    },
    en: {
      // Navigation
      home: 'Home',
      members: 'Members',
      raids: 'Raids',
      calendar: 'Calendar',
      loot: 'Loot',
      
      // Common
      cancel: 'Cancel',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      search: 'Search',
      loading: 'Loading...',
      
      // Guild setup
      welcome: 'Welcome to WoW Guild Manager',
      setupGuild: 'Configure your guild to get started',
      guildName: 'Guild Name',
      faction: 'Faction',
      gameVersion: 'Game Version',
      createGuild: 'Create Guild',
      
      // Members
      membersManagement: 'Members Management',
      addMember: 'Add Member',
      editMember: 'Edit Member',
      name: 'Name',
      class: 'Class',
      race: 'Race',
      role: 'Role',
      specialization: 'Specialization',
      notes: 'Notes',
      noMembers: 'No members yet',
      
      // Raids
      raidsManagement: 'Raids Management',
      createRaid: 'Create Raid',
      raidName: 'Raid Name',
      instance: 'Instance',
      date: 'Date',
      time: 'Time',
      version: 'Version',
      size: 'Size',
      status: 'Status',
      planned: 'Planned',
      completed: 'Completed',
      noRaids: 'No raids planned',
      participants: 'Participants',
      boss: 'Boss',
      
      // Loot
      lootManagement: 'Loot Management',
      addLoot: 'Add Loot',
      itemName: 'Item Name',
      quantity: 'Quantity',
      quality: 'Quality',
      source: 'Source',
      location: 'Location',
      noLoot: 'No loot recorded',
      noResults: 'No results found',
      
      // Quality
      poor: 'Poor',
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
      
      // Source
      raid: 'Raid',
      dungeon: 'Dungeon',
      farm: 'Farm',
      craft: 'Craft',
      purchase: 'Purchase',
      quest: 'Quest',
      
      // Location
      guildBank: 'Guild Bank',
      personalBank: 'Personal Bank',
      mule: 'Mule',
      inventory: 'Inventory',
      equipped: 'Equipped',
      
      // Stats
      activeRaids: 'Active Raids',
      classDistribution: 'Class Distribution',
      roleDistribution: 'Role Distribution',
      summaryBySource: 'Summary by Source',
    },
  };

  const t = (key: string): string => {
    return translations[locale.value]?.[key] || key;
  };

  const toggleLocale = () => {
    locale.value = locale.value === 'fr' ? 'en' : 'fr';
  };

  return {
    locale,
    t,
    toggleLocale,
  };
};
