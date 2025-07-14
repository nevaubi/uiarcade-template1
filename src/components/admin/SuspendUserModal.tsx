import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, User, Mail } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  status?: string | null;
}

interface SuspendUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isSuspended = user?.status === 'suspended';
  const action = isSuspended ? 'reactivate' : 'suspend';
  const actionTitle = isSuspended ? 'Reactivate User' : 'Suspend User';

  const handleAction = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const newStatus = isSuspended ? 'active' : 'suspended';
      const updates: any = { 
        status: newStatus,
        suspended_at: isSuspended ? null : new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User has been ${isSuspended ? 'reactivated' : 'suspended'} successfully`,
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className={`h-5 w-5 ${isSuspended ? 'text-green-600' : 'text-red-600'}`} />
            {actionTitle}
          </DialogTitle>
          <DialogDescription>
            {isSuspended 
              ? 'This will reactivate the user account and restore their access.'
              : 'This will suspend the user account and prevent them from logging in.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.full_name || 'No name'}</span>
              <Badge variant={isSuspended ? 'destructive' : 'default'}>
                {user.status || 'active'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
          </div>

          {/* Warning */}
          <div className={`border rounded-lg p-4 ${isSuspended ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${isSuspended ? 'text-green-600' : 'text-red-600'}`} />
              <div className="space-y-1">
                <p className={`font-medium ${isSuspended ? 'text-green-800' : 'text-red-800'}`}>
                  {isSuspended ? 'Reactivation Confirmation' : 'Suspension Warning'}
                </p>
                <p className={`text-sm ${isSuspended ? 'text-green-700' : 'text-red-700'}`}>
                  {isSuspended 
                    ? 'The user will regain access to their account and all features.'
                    : 'The user will lose access to their account immediately. They will not be able to log in until reactivated.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              variant={isSuspended ? "default" : "destructive"}
              disabled={loading}
            >
              {loading ? 'Processing...' : `${isSuspended ? 'Reactivate' : 'Suspend'} User`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendUserModal;