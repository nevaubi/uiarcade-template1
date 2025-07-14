import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Shield, CreditCard, Clock } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  status?: string | null;
}

interface SubscriberInfo {
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  is_admin: boolean;
  created_at: string;
  stripe_customer_id: string | null;
}

interface UserDetailsModalProps {
  user: UserProfile | null;
  subscriber: SubscriberInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  subscriber,
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [pendingAdminStatus, setPendingAdminStatus] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setIsAdmin(subscriber?.is_admin || false);
    }
  }, [user, subscriber]);

  const handleAdminStatusChange = (newStatus: boolean) => {
    if (!isEditing) return;
    
    setPendingAdminStatus(newStatus);
    setShowAdminConfirmation(true);
  };

  const confirmAdminStatusChange = () => {
    setIsAdmin(pendingAdminStatus);
    setShowAdminConfirmation(false);
  };

  const cancelAdminStatusChange = () => {
    setShowAdminConfirmation(false);
  };

  const handleSave = async () => {
    if (!user || !user.email) return;

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) {
        console.error('UserDetailsModal: Profile update error:', profileError);
        toast({
          title: "Error",
          description: `Failed to update profile: ${profileError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Update admin status in subscribers table
      if (subscriber) {
        // Update existing subscriber record
        const { error: subscriberError } = await supabase
          .from('subscribers')
          .update({ 
            is_admin: isAdmin,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);

        if (subscriberError) {
          console.error('UserDetailsModal: Subscriber update error:', subscriberError);
          toast({
            title: "Error",
            description: `Failed to update subscriber: ${subscriberError.message}`,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Create new subscriber record if none exists
        const { error: subscriberError } = await supabase
          .from('subscribers')
          .insert({
            email: user.email,
            user_id: user.id,
            is_admin: isAdmin,
            subscribed: false,
            updated_at: new Date().toISOString()
          });

        if (subscriberError) {
          console.error('UserDetailsModal: Subscriber creation error:', subscriberError);
          toast({
            title: "Error",
            description: `Failed to create subscriber record: ${subscriberError.message}`,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "User details updated successfully",
      });

      setIsEditing(false);
      onUserUpdated();
    } catch (error) {
      console.error('UserDetailsModal: Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user details';
      toast({
        title: "Error",
        description: `Unexpected error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      {user.full_name || 'No name provided'}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status || 'active'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Joined</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administrator Access
                </Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Switch
                    checked={isAdmin}
                    onCheckedChange={handleAdminStatusChange}
                    disabled={!isEditing}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isAdmin ? 'User has admin privileges' : 'Regular user account'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          {subscriber && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subscription Status</Label>
                    <div className="mt-1">
                      <Badge variant={subscriber.subscribed ? 'default' : 'secondary'}>
                        {subscriber.subscribed ? 'Active' : 'Free'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Plan Tier</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      {subscriber.subscription_tier || 'Free Plan'}
                    </div>
                  </div>
                </div>

                {subscriber.subscription_end && (
                  <div>
                    <Label>Subscription Expires</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {new Date(subscriber.subscription_end).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {subscriber.stripe_customer_id && (
                  <div>
                    <Label>Stripe Customer ID</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm">
                      {subscriber.stripe_customer_id}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Details
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showAdminConfirmation} onOpenChange={setShowAdminConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAdminStatus ? 'Grant Administrator Privileges' : 'Revoke Administrator Privileges'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAdminStatus ? (
                <>
                  Are you sure you want to grant administrator privileges to{' '}
                  <strong>{user?.full_name || user?.email}</strong>? This will give them full access to all admin features.
                </>
              ) : (
                <>
                  Are you sure you want to revoke administrator privileges from{' '}
                  <strong>{user?.full_name || user?.email}</strong>? They will lose access to all admin features.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAdminStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAdminStatusChange}>
              {pendingAdminStatus ? 'Grant Admin Access' : 'Revoke Admin Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default UserDetailsModal;