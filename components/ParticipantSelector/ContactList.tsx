import React from 'react';
import { Check, User } from "lucide-react";
import { ContactListProps } from './types';
import { Loader2 } from "lucide-react";

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading,
  error,
  selectedContacts,
  onToggleContact,
  searchQuery
}) => {
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading contacts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading contacts: {error}</p>
        <p className="text-sm mt-2">Please try again later or add participants manually.</p>
      </div>
    );
  }

  if (filteredContacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? (
          <>
            <p>No contacts found matching "{searchQuery}"</p>
            <p className="text-sm mt-2">Try a different search or add this person as a new contact.</p>
          </>
        ) : (
          <p>No contacts available. Add participants manually.</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[300px]">
      <ul className="divide-y">
        {filteredContacts.map((contact) => {
          const isSelected = selectedContacts.some(c => c.id === contact.id);
          
          return (
            <li 
              key={contact.id}
              className={`flex items-center p-3 hover:bg-muted cursor-pointer ${
                isSelected ? 'bg-muted/50' : ''
              }`}
              onClick={() => onToggleContact(contact)}
            >
              <div className="flex-shrink-0 mr-3">
                {contact.photoUrl ? (
                  <img 
                    src={contact.photoUrl} 
                    alt={contact.name} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{contact.name}</p>
                <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
              </div>
              <div className="flex-shrink-0 ml-2">
                {isSelected && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ContactList;
