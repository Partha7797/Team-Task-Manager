import { AlertCircle, CheckCircle2, Clock3, FolderKanban, ListChecks, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { formatDate, isOverdue, priorityStyles, statusStyles } from '../utils/format';

const normalizeCounts = (counts = []) =>
  counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.stats);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statusCounts = useMemo(() => normalizeCounts(stats?.statusCounts), [stats]);
  const priorityCounts = useMemo(() => normalizeCounts(stats?.priorityCounts), [stats]);
  const statusTotal = Object.values(statusCounts).reduce((sum, value) => sum + value, 0) || 1;
  const priorityTotal = Object.values(priorityCounts).reduce((sum, value) => sum + value, 0) || 1;

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="panel h-36 animate-pulse bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total tasks" value={stats?.totalTasks || 0} icon={ListChecks} tone="sky" />
        <StatCard title="Completed" value={stats?.completedTasks || 0} icon={CheckCircle2} tone="emerald" />
        <StatCard title="Pending" value={stats?.pendingTasks || 0} icon={Clock3} tone="amber" />
        <StatCard title="Overdue" value={stats?.overdueTasks || 0} icon={AlertCircle} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Task Progress</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status distribution across accessible work.</p>
            </div>
            <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-100">
              {stats?.myTasks || 0} assigned to you
            </Badge>
          </div>

          <div className="mt-6 space-y-5">
            {['Todo', 'In Progress', 'Completed'].map((status) => {
              const count = statusCounts[status] || 0;
              const percent = Math.round((count / statusTotal) * 100);

              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{status}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count} tasks</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${
                        status === 'Completed'
                          ? 'bg-emerald-500'
                          : status === 'In Progress'
                            ? 'bg-sky-500'
                            : 'bg-gray-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Project Statistics</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio status at a glance.</p>
            </div>
            <div className="rounded-md bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ['Total', stats?.projectStats?.total || 0],
              ['Active', stats?.projectStats?.active || 0],
              ['Planning', stats?.projectStats?.planning || 0],
              ['Completed', stats?.projectStats?.completed || 0]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5">
          <h2 className="text-lg font-bold text-gray-950 dark:text-white">Priority Mix</h2>
          <div className="mt-5 space-y-4">
            {['Low', 'Medium', 'High', 'Urgent'].map((priority) => {
              const count = priorityCounts[priority] || 0;
              const percent = Math.round((count / priorityTotal) * 100);

              return (
                <div key={priority} className="flex items-center gap-3">
                  <Badge className={priorityStyles[priority]}>{priority}</Badge>
                  <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'Urgent'
                          ? 'bg-rose-500'
                          : priority === 'High'
                            ? 'bg-orange-500'
                            : priority === 'Medium'
                              ? 'bg-amber-500'
                              : 'bg-gray-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-200">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white">Upcoming Work</h2>
          </div>

          <div className="mt-5 space-y-3">
            {stats?.upcomingTasks?.length ? (
              stats.upcomingTasks.map((task) => (
                <article
                  key={task._id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-950 dark:text-white">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {task.projectId?.title || 'No project'} · {formatDate(task.deadline)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusStyles[task.status]}>{task.status}</Badge>
                      <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                      {isOverdue(task.deadline, task.status) ? (
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200">Overdue</Badge>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No upcoming tasks" message="Your active task queue is clear." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
