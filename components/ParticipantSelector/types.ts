export interface Contact {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    isInMyContacts?: boolean;
  }
  
  export interface ParticipantSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectParticipants: (participants: Contact[]) => void;
    initialSelectedParticipants?: Contact[];
  }
  
  export interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
  }
  
  export interface ContactListProps {
    contacts: Contact[];
    isLoading: boolean;
    error: string | null;
    selectedContacts: Contact[];
    onToggleContact: (contact: Contact) => void;
    searchQuery: string;
  }
  
  export interface SelectedContactsProps {
    contacts: Contact[];
    onRemoveContact: (contactId: string) => void;
  }
  