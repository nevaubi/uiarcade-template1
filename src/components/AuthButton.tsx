
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <Button variant="ghost" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {user.email}
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      onClick={() => navigate('/auth')}
    >
      Sign In
    </Button>
  );
};

export default AuthButton;
