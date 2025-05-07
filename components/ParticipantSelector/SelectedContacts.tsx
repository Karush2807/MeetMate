import React from 'react';
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SelectedContactsProps } from './types';

const SelectedContacts: React.FC<SelectedContactsProps> = ({ contacts, onRemoveContact }) => {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Selected Participants</h3>
      <div className="flex flex-wrap gap-2">
        {contacts.map((contact) => (
          <Badge key={contact.id} variant="secondary" className="flex items-center gap-1">
            {contact.name}
            <button
              onClick={() => onRemoveContact(contact.id)}
              className="ml-1 rounded-full hover:bg-muted"
              aria-label={`Remove ${contact.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectedContacts;
