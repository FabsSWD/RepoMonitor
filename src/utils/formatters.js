export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'justo ahora';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
};

export const getEventColor = (type) => {
  switch (type) {
    case 'push':
      return 'bg-blue-500';
    case 'branch':
      return 'bg-green-500';
    case 'pr':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};