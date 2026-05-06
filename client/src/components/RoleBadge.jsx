const roleClasses = {
  admin: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  member: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200'
};

const RoleBadge = ({ role }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleClasses[role] || roleClasses.member}`}>
    {role === 'admin' ? 'Admin' : 'Member'}
  </span>
);

export default RoleBadge;
