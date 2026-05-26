'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GET_METHOD } from '@/lib/req';

export type FrontendUser = {
  _id: string;
  email?: string;
  phone?: string;
  roles?: any[];

  firstname?: string;
  lastname?: string;

  fullName: string;
  name?: string;
  avatar?: string;
  cover?: string;
  address: string;
  createdAt?: string;
};

type UserContextType = {
  user: FrontendUser | null;
  setUser: React.Dispatch<React.SetStateAction<FrontendUser | null>>;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function toFrontendUser(raw: any): FrontendUser {
  const u = raw?.data ?? raw;

  return {
    _id: u._id,
    email: u.email,
    phone: u.phone,
    roles: u.roles,
    firstname: u.firstname,
    lastname: u.lastname,

    fullName: `${u.lastname ?? ''} ${u.firstname ?? ''}`.trim(),
    name: `${u.lastname ?? ''} ${u.firstname ?? ''}`.trim(),
    avatar: u.avatar || '',
    cover: u.cover || '',
    address: Array.isArray(u.address) ? u.address.join(', ') : '',
    createdAt: u.createdAt,
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await GET_METHOD('/api/account');
      if (!res || res?.success === false) {
        setUser(null);
      } else {
        setUser(toFrontendUser(res));
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchMe, }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
};