import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertCircle } from "lucide-react";
import SearchBar from './SearchBar';
import ContactList from './ContactList';
import SelectedContacts from './SelectedContacts';
import { Contact, ParticipantSelectorProps } from './types';

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  isOpen,
  onClose,
  onSelectParticipants,
  initialSelectedParticipants = []
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>(initialSelectedParticipants);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { gapi } = await import('gapi-script');
      
      let authInstance = gapi.auth2?.getAuthInstance?.() || null;
      if (!authInstance) {
        console.log("Auth instance not found, initializing auth2...");
        await new Promise<void>((resolve) => {
          gapi.load('auth2', () => {
            gapi.auth2.init({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              scope: 'https://www.googleapis.com/auth/contacts.readonly',
            }).then(() => {
              console.log("auth2 initialized!");
              resolve();
            }).catch((error: any) => {
              console.error("Error initializing auth2:", error);
              resolve();
            });
          });
        });
        authInstance = gapi.auth2.getAuthInstance();
      }
      
      if (!authInstance?.isSignedIn.get()) {
        console.log("User not signed in, requesting sign-in...");
        await authInstance.signIn();
        console.log("Sign-in completed");
      }
      
      if (!gapi.client.people) {
        console.log("Loading People API...");
        await gapi.client.load('https://people.googleapis.com/$discovery/rest?version=v1');
      }
      
      console.log("Fetching contacts...");
      
      try {
        await gapi.client.request({
          path: 'https://people.googleapis.com/v1/people:searchContacts',
          params: {
            query: '',
            readMask: 'names,emailAddresses'
          }
        });
        console.log("Warmup request sent");
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (warmupErr) {
        console.warn("Warmup request failed, continuing anyway:", warmupErr);
      }
      
      const response = await gapi.client.request({
        path: 'https://people.googleapis.com/v1/people/me/connections',
        params: {
          personFields: 'names,emailAddresses,photos,memberships',
          sortOrder: 'FIRST_NAME_ASCENDING',
          pageSize: 1000
        }
      });
      
      console.log("Contacts API response:", response);
      
      const contactList: Contact[] = [];
      
      if (response.result.connections) {
        response.result.connections.forEach((person: any) => {
          if (person.emailAddresses && person.emailAddresses.length > 0) {
            const name = person.names && person.names.length > 0 
              ? person.names[0].displayName 
              : 'Unknown';
            
            const email = person.emailAddresses[0].value;
            
            const photoUrl = person.photos && person.photos.length > 0 
              ? person.photos[0].url 
              : undefined;
            
            const isInMyContacts = person.memberships && person.memberships.some((membership: any) => 
              membership.contactGroupMembership && 
              (membership.contactGroupMembership.contactGroupId === 'myContacts' ||
               membership.contactGroupMembership.contactGroupResourceName === 'contactGroups/myContacts')
            );
            
            contactList.push({
              id: person.resourceName,
              name,
              email,
              photoUrl,
              isInMyContacts: isInMyContacts || false
            });
          }
        });
      }
      
      console.log(`Found ${contactList.length} contacts with email addresses`);
      setContacts(contactList);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please check your connection and permissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, fetchContacts]);

  const handleToggleContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleConfirm = () => {
    onSelectParticipants(selectedContacts);
    onClose();
  };

  const handleAddNewContact = () => {
    onSelectParticipants([...selectedContacts]);
    onClose();
    if (searchQuery.trim()) {
      window.setTimeout(() => {
        const newContactEvent = new CustomEvent('addNewContact', { 
          detail: { name: searchQuery.trim() } 
        });
        window.dispatchEvent(newContactEvent);
      }, 100);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Participants</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <SearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
            />
            
            <div className="mt-4">
              <SelectedContacts 
                contacts={selectedContacts} 
                onRemoveContact={handleRemoveContact} 
              />
              
              <ContactList 
                contacts={contacts}
                isLoading={isLoading}
                error={error}
                selectedContacts={selectedContacts}
                onToggleContact={handleToggleContact}
                searchQuery={searchQuery}
              />
              
              {searchQuery && !isLoading && !error && contacts.filter(contact => 
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                contact.email.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Contact not found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Would you like to add "{searchQuery}" as a new contact?
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleAddNewContact}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Contact
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedContacts.length === 0}
            >
              Add {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ParticipantSelector;
