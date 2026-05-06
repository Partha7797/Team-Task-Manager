export const formatDate = (date) => {
  if (!date) return 'No deadline';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

export const isOverdue = (date, status) => {
  if (!date || status === 'Completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
};

export const statusStyles = {
  Todo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  'In Progress': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  Planning: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  Archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
};

export const priorityStyles = {
  Low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
  Urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200'
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
