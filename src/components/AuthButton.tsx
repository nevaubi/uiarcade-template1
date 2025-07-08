
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <Button variant="ghost" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transform hover:translate-y-[-1px] transition-all duration-200"
      onClick={() => navigate('/auth')}
    >
      Sign In
    </Button>
  );
};

export default AuthButton;
