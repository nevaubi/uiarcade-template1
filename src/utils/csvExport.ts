
export interface ExportableUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_status: string;
  subscription_tier: string;
  is_admin: boolean;
}

export interface ExportableSubscriber {
  email: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string;
  is_admin: boolean;
  created_at: string;
}

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const prepareUsersForExport = (users: any[], subscribers: any[]): ExportableUser[] => {
  return users.map(user => {
    const subscriber = subscribers.find(sub => sub.email === user.email);
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.full_name || '',
      created_at: new Date(user.created_at).toLocaleDateString(),
      subscription_status: subscriber?.subscribed ? 'Active' : 'Inactive',
      subscription_tier: subscriber?.subscription_tier || 'None',
      is_admin: subscriber?.is_admin || false
    };
  });
};

export const prepareSubscribersForExport = (subscribers: any[]): ExportableSubscriber[] => {
  return subscribers.map(sub => ({
    email: sub.email,
    subscribed: sub.subscribed,
    subscription_tier: sub.subscription_tier || 'None',
    subscription_end: sub.subscription_end ? new Date(sub.subscription_end).toLocaleDateString() : 'N/A',
    is_admin: sub.is_admin,
    created_at: sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'
  }));
};
