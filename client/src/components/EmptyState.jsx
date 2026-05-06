import { ClipboardList } from 'lucide-react';

const EmptyState = ({ title, message }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
    <ClipboardList className="h-10 w-10 text-gray-400" />
    <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

export default EmptyState;
