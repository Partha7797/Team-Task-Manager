const StatCard = ({ title, value, icon: Icon, tone = 'emerald', detail }) => {
  const toneMap = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200'
  };

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-md p-3 ${toneMap[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{detail}</p> : null}
    </div>
  );
};

export default StatCard;
