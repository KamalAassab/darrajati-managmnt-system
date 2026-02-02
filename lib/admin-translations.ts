export const adminTranslations = {
    en: {
        // Navigation
        dashboard: 'Dashboard',
        scooters: 'Scooters', // Simplified from Fleet
        clients: 'Clients',
        rentals: 'Rentals',
        finances: 'Finances',
        logout: 'Logout',

        // Dashboard KPIs
        totalRevenue: 'Total Revenue',
        totalExpenses: 'Total Expenses',
        netProfit: 'Net Profit',
        activeRentals: 'Active Rentals',
        overdueRentals: 'Overdue Rentals',
        availableScooters: 'Available Scooters',

        // Scooters
        addScooter: 'Add Scooter',
        scooterName: 'Scooter Name',
        licensePlate: 'License Plate',
        dailyPrice: 'Daily Price',
        engine: 'Engine',
        speed: 'Max Speed',
        status: 'Status',
        available: 'Available',
        rented: 'Rented',
        maintenance: 'Maintenance',
        lastMaintenance: 'Last Maintenance',
        description: 'Description',
        features: 'Features',

        // Clients
        addClient: 'Add Client',
        fullName: 'Full Name',
        documentId: 'CIN / Passport',
        phone: 'Phone',
        deposit: 'Deposit',
        depositAmount: 'Deposit Amount',
        rentalHistory: 'Rental History',

        // Rentals
        createRental: 'Create Rental',
        selectClient: 'Select Client',
        selectScooter: 'Select Scooter',
        startDate: 'Start Date',
        endDate: 'End Date',
        totalPrice: 'Total Price',
        paymentStatus: 'Payment Status',
        paymentMethod: 'Payment Method',
        cash: 'Cash',
        transfer: 'Bank Transfer',
        paid: 'Paid',
        pending: 'Pending',
        partial: 'Partial',
        beforePhotos: 'Before Photos',
        afterPhotos: 'After Photos',
        uploadPhotos: 'Upload Photos',
        notes: 'Notes', // Simplified from Protocol

        // Expenses
        addExpense: 'Add Expense',
        category: 'Category',
        amount: 'Amount',
        date: 'Date',
        fuel: 'Fuel',
        advertising: 'Advertising',
        salary: 'Salaries',
        rent: 'Shop Rent',
        insurance: 'Insurance',
        other: 'Other',

        // Actions
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        search: 'Search',
        filter: 'Filter',

        // Messages
        saveSuccess: 'Saved successfully',
        deleteSuccess: 'Deleted successfully',
        error: 'An error occurred',
        noRentals: 'No rentals found',
        completed: 'Completed',
        client: 'Client',
        actions: 'Actions',
    },

    fr: {
        // Navigation
        dashboard: 'Tableau de bord',
        scooters: 'Scooters', // Kept simple
        clients: 'Clients',
        rentals: 'Locations',
        finances: 'Finances',
        logout: 'Déconnexion',

        // Dashboard KPIs
        totalRevenue: 'Revenu Total',
        totalExpenses: 'Dépenses Totales',
        netProfit: 'Bénéfice Net',
        activeRentals: 'Locations Actives',
        overdueRentals: 'Retards',
        availableScooters: 'Scooters Disponibles',

        // Scooters
        addScooter: 'Ajouter Scooter',
        scooterName: 'Nom du Scooter',
        licensePlate: 'Immatriculation',
        dailyPrice: 'Prix Journalier',
        engine: 'Moteur',
        speed: 'Vitesse Max',
        status: 'État',
        available: 'Disponible',
        rented: 'Loué',
        maintenance: 'Maintenance',
        lastMaintenance: 'Dernière Révision',
        description: 'Description',
        features: 'Caractéristiques',

        // Clients
        addClient: 'Ajouter Client',
        fullName: 'Nom Complet',
        documentId: 'CIN / Passeport',
        phone: 'Téléphone',
        deposit: 'Caution',
        depositAmount: 'Montant Caution',
        rentalHistory: 'Historique',

        // Rentals
        createRental: 'Créer Location',
        selectClient: 'Sélectionner Client',
        selectScooter: 'Sélectionner Scooter',
        startDate: 'Date Début',
        endDate: 'Date Fin',
        totalPrice: 'Prix Total',
        paymentStatus: 'Statut Paiement',
        paymentMethod: 'Mode Paiement',
        cash: 'Espèces',
        transfer: 'Virement',
        paid: 'Payé',
        pending: 'En Attente',
        partial: 'Partiel',
        beforePhotos: 'Photos Avant',
        afterPhotos: 'Photos Après',
        uploadPhotos: 'Télécharger Photos',
        notes: 'Notes',

        // Expenses
        addExpense: 'Ajouter Dépense',
        category: 'Catégorie',
        amount: 'Montant',
        date: 'Date',
        fuel: 'Carburant',
        advertising: 'Publicité',
        salary: 'Salaires',
        rent: 'Loyer Local',
        insurance: 'Assurance',
        other: 'Autre',

        // Actions
        save: 'Enregistrer',
        cancel: 'Annuler',
        edit: 'Modifier',
        delete: 'Supprimer',
        view: 'Voir',
        search: 'Rechercher',
        filter: 'Filtrer',

        // Messages
        saveSuccess: 'Enregistré avec succès',
        deleteSuccess: 'Supprimé avec succès',
        error: 'Une erreur s\'est produite',
        noRentals: 'Aucune location trouvée',
        completed: 'Terminé',
        client: 'Client',
        actions: 'Actions',
    },
};

export type TranslationKey = keyof typeof adminTranslations.en;
