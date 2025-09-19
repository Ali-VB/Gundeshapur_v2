import React, { useState, useEffect, useContext, createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { User, AuthContextType, LanguageContextType, ToastContextType, Translations, Locale, ToastMessage } from './types';
import { auth, db, googleProvider, SUPER_ADMIN_EMAIL } from './constants';

// --- LANGUAGE/TRANSLATION CONTEXT ---
const translations: Translations = {
  en: {
    // General
    signOut: 'Sign Out',
    loading: 'Loading...',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    areYouSure: 'Are you sure?',
    // Login Page
    loginTitle: 'Gundeshapur Library Manager',
    loginSubtitle: 'Simple, affordable library management for your community.',
    loginButton: 'Sign In with Google',
    // Admin Page
    adminTitle: 'Admin Panel - User Management',
    adminDisplayName: 'Display Name',
    adminEmail: 'Email',
    adminPlan: 'Plan',
    adminStatus: 'Status',
    // Setup Page
    setupTitle: "Welcome! Let's set up your library.",
    setupSubtitle: "Connect your library's data source to get started.",
    setupOpt1Title: 'Option 1: Create a New Sheet',
    setupOpt1Desc: "We'll automatically create a new Google Sheet in your Google Drive.",
    setupOpt1Button: 'Create & Connect',
    setupOpt2Title: 'Option 2: Connect an Existing Sheet',
    setupOpt2Desc: 'Paste the ID of your existing Google Sheet.',
    setupOpt2Button: 'Connect',
    setupOpt2Placeholder: 'Enter Google Sheet ID',
    // Dashboard
    dashboardTitle: 'Library Dashboard',
    backupButton: 'Backup Data',
    backupButtonPro: 'Backup Data (Pro)',
    exportButton: 'Export Data',
    exportButtonEnt: 'Export Data (Ent)',
    upgradeBannerTitle: "You're on the Free plan!",
    upgradeBannerSubtitle: 'Unlock powerful features like unlimited books and data backups by upgrading.',
    upgradeBannerButton: 'Upgrade Now',
    tabBooks: 'Books',
    tabMembers: 'Members',
    tabLoans: 'Loans',
    tabBilling: 'Billing',
    // Books View
    addBook: 'Add Book',
    editBook: 'Edit Book',
    searchBooks: 'Search books by title, author, or ISBN...',
    bookTitle: 'Title',
    bookAuthor: 'Author',
    bookYear: 'Year',
    bookISBN: 'ISBN',
    bookPublisher: 'Publisher',
    bookLanguage: 'Language',
    bookDDC: 'DDC',
    bookTags: 'Tags (comma-separated)',
    bookTotalCopies: 'Total Copies',
    bookAvailableCopies: 'Available',
    // Members View
    addMember: 'Add Member',
    editMember: 'Edit Member',
    searchMembers: 'Search members by name or email...',
    memberName: 'Name',
    memberEmail: 'Email',
    memberPhone: 'Phone',
    memberRole: 'Role',
    memberStatus: 'Status',
    // Loans View
    lendBook: 'Lend Book',
    returnLoan: 'Return Loan',
    searchLoans: 'Search by book title or member name...',
    loanBookTitle: 'Book Title',
    loanMemberName: 'Member Name',
    loanDate: 'Loan Date',
    loanDueDate: 'Due Date',
    loanStatus: 'Status',
    loanActions: 'Actions',
    selectBook: 'Select a book',
    selectMember: 'Select a member',
    // Billing Page
    billingTitle: 'Subscription & Billing',
    billingSubtitle: "Choose the plan that's right for your library.",
    planFree: 'Free',
    planPro: 'Pro',
    planEnterprise: 'Enterprise',
    currentPlan: 'Current Plan',
    upgrade: 'Upgrade',
    downgrade: 'Downgrade',
    recommended: 'Recommended',
    // Toasts
    toastBookAdded: 'Book added successfully!',
    toastBookUpdated: 'Book updated successfully!',
    toastBookDeleted: 'Book deleted.',
    toastMemberAdded: 'Member added successfully!',
    toastMemberUpdated: 'Member updated successfully!',
    toastMemberDeleted: 'Member deleted.',
    toastLoanAdded: 'Book lent successfully!',
    toastLoanReturned: 'Loan returned successfully!',
  },
  es: {
    signOut: 'Cerrar Sesión',
    loading: 'Cargando...',
    close: 'Cerrar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Añadir',
    areYouSure: '¿Estás seguro?',
    loginTitle: 'Gestor de Biblioteca Gundeshapur',
    loginSubtitle: 'Gestión de bibliotecas simple y asequible para tu comunidad.',
    loginButton: 'Iniciar Sesión con Google',
    adminTitle: 'Panel de Admin - Gestión de Usuarios',
    adminDisplayName: 'Nombre',
    adminEmail: 'Correo Electrónico',
    adminPlan: 'Plan',
    adminStatus: 'Estado',
    setupTitle: '¡Bienvenido! Configuremos tu biblioteca.',
    setupSubtitle: 'Conecta la fuente de datos de tu biblioteca para comenzar.',
    setupOpt1Title: 'Opción 1: Crear una Nueva Hoja',
    setupOpt1Desc: 'Crearemos automáticamente una nueva Hoja de Google en tu Google Drive.',
    setupOpt1Button: 'Crear y Conectar',
    setupOpt2Title: 'Opción 2: Conectar una Hoja Existente',
    setupOpt2Desc: 'Pega el ID de tu Hoja de Google existente.',
    setupOpt2Button: 'Conectar',
    setupOpt2Placeholder: 'Introduce el ID de la Hoja de Google',
    dashboardTitle: 'Panel de la Biblioteca',
    backupButton: 'Copia de Seguridad',
    backupButtonPro: 'Copia de Seguridad (Pro)',
    exportButton: 'Exportar Datos',
    exportButtonEnt: 'Exportar Datos (Ent)',
    upgradeBannerTitle: '¡Estás en el plan Gratuito!',
    upgradeBannerSubtitle: 'Desbloquea funciones potentes como libros ilimitados y copias de seguridad de datos actualizando tu plan.',
    upgradeBannerButton: 'Actualizar Ahora',
    tabBooks: 'Libros',
    tabMembers: 'Miembros',
    tabLoans: 'Préstamos',
    tabBilling: 'Facturación',
    addBook: 'Añadir Libro',
    editBook: 'Editar Libro',
    searchBooks: 'Buscar libros por título, autor o ISBN...',
    bookTitle: 'Título',
    bookAuthor: 'Autor',
    bookYear: 'Año',
    bookISBN: 'ISBN',
    bookPublisher: 'Editorial',
    bookLanguage: 'Idioma',
    bookDDC: 'CDD',
    bookTags: 'Etiquetas (separadas por coma)',
    bookTotalCopies: 'Copias Totales',
    bookAvailableCopies: 'Disponibles',
    addMember: 'Añadir Miembro',
    editMember: 'Editar Miembro',
    searchMembers: 'Buscar miembros por nombre o email...',
    memberName: 'Nombre',
    memberEmail: 'Email',
    memberPhone: 'Teléfono',
    memberRole: 'Rol',
    memberStatus: 'Estado',
    lendBook: 'Prestar Libro',
    returnLoan: 'Devolver Préstamo',
    searchLoans: 'Buscar por título de libro o nombre de miembro...',
    loanBookTitle: 'Título del Libro',
    loanMemberName: 'Nombre del Miembro',
    loanDate: 'Fecha de Préstamo',
    loanDueDate: 'Fecha de Vencimiento',
    loanStatus: 'Estado',
    loanActions: 'Acciones',
    selectBook: 'Selecciona un libro',
    selectMember: 'Selecciona un miembro',
    billingTitle: 'Suscripción y Facturación',
    billingSubtitle: 'Elige el plan adecuado para tu biblioteca.',
    planFree: 'Gratis',
    planPro: 'Pro',
    planEnterprise: 'Empresa',
    currentPlan: 'Plan Actual',
    upgrade: 'Actualizar',
    downgrade: 'Bajar de plan',
    recommended: 'Recomendado',
    toastBookAdded: '¡Libro añadido con éxito!',
    toastBookUpdated: '¡Libro actualizado con éxito!',
    toastBookDeleted: 'Libro eliminado.',
    toastMemberAdded: '¡Miembro añadido con éxito!',
    toastMemberUpdated: '¡Miembro actualizado con éxito!',
    toastMemberDeleted: 'Miembro eliminado.',
    toastLoanAdded: '¡Libro prestado con éxito!',
    toastLoanReturned: '¡Préstamo devuelto con éxito!',
  },
  fr: {
    signOut: 'Se Déconnecter',
    loading: 'Chargement...',
    close: 'Fermer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    areYouSure: 'Êtes-vous sûr?',
    loginTitle: 'Gestionnaire de Bibliothèque Gundeshapur',
    loginSubtitle: 'Gestion de bibliothèque simple et abordable pour votre communauté.',
    loginButton: 'Se Connecter avec Google',
    adminTitle: "Panneau d'Administration - Gestion des Utilisateurs",
    adminDisplayName: "Nom d'Affichage",
    adminEmail: 'Email',
    adminPlan: 'Forfait',
    adminStatus: 'Statut',
    setupTitle: 'Bienvenue! Configurons votre bibliothèque.',
    setupSubtitle: 'Connectez la source de données de votre bibliothèque pour commencer.',
    setupOpt1Title: 'Option 1: Créer une Nouvelle Feuille',
    setupOpt1Desc: 'Nous créerons automatiquement une nouvelle feuille Google Sheets dans votre Google Drive.',
    setupOpt1Button: 'Créer et Connecter',
    setupOpt2Title: 'Option 2: Connecter une Feuille Existante',
    setupOpt2Desc: "Collez l'ID de votre feuille Google Sheets existante.",
    setupOpt2Button: 'Connecter',
    setupOpt2Placeholder: "Entrez l'ID de la feuille Google",
    dashboardTitle: 'Tableau de Bord de la Bibliothèque',
    backupButton: 'Sauvegarder les Données',
    backupButtonPro: 'Sauvegarder les Données (Pro)',
    exportButton: 'Exporter les Données',
    exportButtonEnt: 'Exporter les Données (Ent)',
    upgradeBannerTitle: 'Vous êtes sur le forfait Gratuit!',
    upgradeBannerSubtitle: 'Débloquez des fonctionnalités puissantes comme des livres illimités et des sauvegardes en mettant à niveau.',
    upgradeBannerButton: 'Mettre à Niveau',
    tabBooks: 'Livres',
    tabMembers: 'Membres',
    tabLoans: 'Emprunts',
    tabBilling: 'Facturation',
    addBook: 'Ajouter un Livre',
    editBook: 'Modifier le Livre',
    searchBooks: 'Rechercher des livres par titre, auteur ou ISBN...',
    bookTitle: 'Titre',
    bookAuthor: 'Auteur',
    bookYear: 'Année',
    bookISBN: 'ISBN',
    bookPublisher: 'Éditeur',
    bookLanguage: 'Langue',
    bookDDC: 'CDD',
    bookTags: 'Tags (séparés par virgule)',
    bookTotalCopies: 'Copies Totales',
    bookAvailableCopies: 'Disponibles',
    addMember: 'Ajouter un Membre',
    editMember: 'Modifier le Membre',
    searchMembers: 'Rechercher des membres par nom ou email...',
    memberName: 'Nom',
    memberEmail: 'Email',
    memberPhone: 'Téléphone',
    memberRole: 'Rôle',
    memberStatus: 'Statut',
    lendBook: 'Prêter un Livre',
    returnLoan: "Retourner l'Emprunt",
    searchLoans: 'Rechercher par titre de livre ou nom de membre...',
    loanBookTitle: 'Titre du Livre',
    loanMemberName: 'Nom du Membre',
    loanDate: "Date d'Emprunt",
    loanDueDate: "Date d'Échéance",
    loanStatus: 'Statut',
    loanActions: 'Actions',
    selectBook: 'Sélectionnez un livre',
    selectMember: 'Sélectionnez un membre',
    billingTitle: 'Abonnement et Facturation',
    billingSubtitle: 'Choisissez le forfait qui convient à votre bibliothèque.',
    planFree: 'Gratuit',
    planPro: 'Pro',
    planEnterprise: 'Entreprise',
    currentPlan: 'Forfait Actuel',
    upgrade: 'Mettre à niveau',
    downgrade: 'Rétrograder',
    recommended: 'Recommandé',
    toastBookAdded: 'Livre ajouté avec succès!',
    toastBookUpdated: 'Livre mis à jour avec succès!',
    toastBookDeleted: 'Livre supprimé.',
    toastMemberAdded: 'Membre ajouté avec succès!',
    toastMemberUpdated: 'Membre mis à jour avec succès!',
    toastMemberDeleted: 'Membre supprimé.',
    toastLoanAdded: 'Livre prêté avec succès!',
    toastLoanReturned: 'Emprunt retourné avec succès!',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('locale') as Locale) || 'en');

    const setLanguage = (lang: Locale) => {
        setLocale(lang);
        localStorage.setItem('locale', lang);
    };

    const t = (key: keyof (typeof translations)['en']) => {
        return translations[locale][key] || translations['en'][key];
    };

    return (
        <LanguageContext.Provider value={{ locale, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};

// --- TOAST/NOTIFICATION CONTEXT ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 5000); // Auto-dismiss after 5 seconds
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};


// --- AUTH CONTEXT (Unchanged from previous step) ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = db.doc(db, 'users', firebaseUser.uid);
        const userDoc = await db.getDoc(userRef) as any;

        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // New user, create a document for them
          const isSuperAdmin = firebaseUser.email === SUPER_ADMIN_EMAIL;
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: isSuperAdmin ? 'admin' : 'user',
            sheetId: null,
            plan: 'free',
            subscriptionStatus: 'active',
          };
          await db.setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signIn = async () => {
    try {
        setLoading(true);
        await auth.signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Authentication error:", error);
        setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await auth.signOut(auth);
    setUser(null);
    setLoading(false);
  };
    
  const updateSheetId = async (sheetId: string) => {
      if (!user) return;
      setLoading(true);
      const userRef = db.doc(db, 'users', user.uid);
      await db.setDoc(userRef, { sheetId }, { merge: true });
      setUser(prevUser => prevUser ? { ...prevUser, sheetId } : null);
      localStorage.setItem('sheetId', sheetId);
      setLoading(false);
  };
    
  const updateSubscription = async (plan: 'free' | 'pro' | 'enterprise') => {
      if (!user) return;
      setLoading(true);
      const userRef = db.doc(db, 'users', user.uid);
      await db.setDoc(userRef, { plan, subscriptionStatus: 'active' }, { merge: true });
      setUser(prevUser => prevUser ? { ...prevUser, plan, subscriptionStatus: 'active' } : null);
      setLoading(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    updateSheetId,
    updateSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- RENDER APP ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
          <ToastProvider>
             <App />
          </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);