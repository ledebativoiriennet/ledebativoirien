"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      style={{ 
        width: '100%',
        display: 'block', 
        padding: '0.75rem', 
        textAlign: 'center', 
        backgroundColor: '#ef4444', 
        borderRadius: '4px', 
        color: 'white', 
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
    >
      Se déconnecter
    </button>
  );
}
