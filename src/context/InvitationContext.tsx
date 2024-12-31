import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { baseUrl, getAuthHeaders } from '@/config';

interface InvitationContextType {
  inviteUser: (email: string, role: 'user' | 'superadmin') => Promise<void>;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const InvitationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const BASE_URL = `${baseUrl}/inviteUser`;

  const inviteUser = async (email: string, role: 'user' | 'superadmin') => {
    try {
      await axios.post(BASE_URL, { email, role }, getAuthHeaders());
      toast.success('Invitation sent successfully');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation');
    }
  };

  return (
    <InvitationContext.Provider value={{ inviteUser }}>
      {children}
    </InvitationContext.Provider>
  );
};

export const useInvitationContext = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitationContext must be used within an InvitationProvider');
  }
  return context;
};
