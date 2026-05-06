import {
  CalendarClock,
  Check,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  UserRoundCheck,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate, initials, isOverdue, priorityStyles, statusStyles } from '../utils/format';

const statuses = ['Todo', 'In Progress', 'Completed'];

const blankForm = {
  title: '',
  description: '',
  assignedTo: '',
  projectId: '',
  status: 'Todo',
  priority: 'Medium',
  deadline: ''
};

const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const TaskBoard = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [filters, setFilters] = useState({ search: '', projectId: '', priority: '' });
  const [form, setForm] = useState(blankForm);

  const loadData = async () => {
    setLoading(true);

    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users')
      ]);
      setTasks(tasksRes.data.tasks);
      setProjects(projectsRes.data.projects);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.projectId),
    [form.projectId, projects]
  );

  const availableAssignees = selectedProject?.members?.length ? selectedProject.members : users;

  const filteredTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search) ||
        task.projectId?.title?.toLowerCase().includes(search);
      const matchesProject = !filters.projectId || task.projectId?._id === filters.projectId;
      const matchesPriority = !filters.priority || task.priority === filters.priority;

      return matchesSearch && matchesProject && matchesPriority;
    });
  }, [filters, tasks]);

  const tasksByStatus = useMemo(
    () =>
      statuses.reduce((acc, status) => {
        acc[status] = filteredTasks.filter((task) => task.status === status);
        return acc;
      }, {}),
    [filteredTasks]
  );

  const getInitialTaskForm = () => {
    const firstProject = projects[0];
    const firstMember = firstProject?.members?.[0];

    return {
      ...blankForm,
      projectId: firstProject?._id || '',
      assignedTo: isAdmin ? firstMember?._id || '' : user?._id || ''
    };
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm(getInitialTaskForm());
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      projectId: task.projectId?._id || '',
      status: task.status,
      priority: task.priority,
      deadline: toInputDate(task.deadline)
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTask(null);
    setForm(blankForm);
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find((item) => item._id === projectId);
    const firstMember = project?.members?.[0]?._id || '';
    setForm((current) => ({
      ...current,
      projectId,
      assignedTo: isAdmin ? firstMember : user?._id || ''
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        assignedTo: isAdmin ? form.assignedTo : user._id
      };

      const { data } = editingTask ? await api.put(`/tasks/${editingTask._id}`, payload) : await api.post('/tasks', payload);

      setTasks((current) =>
        editingTask ? current.map((task) => (task._id === data.task._id ? data.task : task)) : [data.task, ...current]
      );
      toast.success(editingTask ? 'Task updated' : 'Task created');
      closeForm();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (task, status) => {
    if (status === task.status) return;

    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status });
      setTasks((current) => current.map((item) => (item._id === data.task._id ? data.task : item)));
      toast.success('Task status updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteTask = async () => {
    if (!pendingDelete) return;
    setSaving(true);

    try {
      await api.delete(`/tasks/${pendingDelete._id}`);
      setTasks((current) => current.filter((task) => task._id !== pendingDelete._id));
      toast.success('Task deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const canUpdateTask = (task) =>
    isAdmin || task.assignedTo?._id === user?._id || task.createdBy?._id === user?._id;

  const canDeleteTask = (task) => isAdmin || task.createdBy?._id === user?._id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search tasks"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </div>
          <select
            className="input"
            value={filters.projectId}
            onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              className="input pl-10"
              value={filters.priority}
              onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
            >
              <option value="">Any priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <button type="button" className="btn-primary" onClick={openCreate} disabled={!projects.length}>
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      {formOpen ? (
        <section className="panel p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAdmin ? 'Assign a task to a member of the selected project.' : 'New member tasks are assigned to you.'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close task form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="task-title">
                Title
              </label>
              <input
                id="task-title"
                className="input"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="task-project">
                Project
              </label>
              <select
                id="task-project"
                className="input"
                value={form.projectId}
                onChange={(event) => handleProjectChange(event.target.value)}
                required
              >
                <option value="" disabled>
                  Select project
                </option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="label" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                className="input min-h-24"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div>
              <label className="label" htmlFor="task-assignee">
                Assigned user
              </label>
              <select
                id="task-assignee"
                className="input"
                value={form.assignedTo}
                onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
                disabled={!isAdmin}
                required
              >
                <option value="" disabled>
                  Select member
                </option>
                {(isAdmin ? availableAssignees : users.filter((member) => member._id === user?._id)).map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-deadline">
                Deadline
              </label>
              <input
                id="task-deadline"
                className="input"
                type="date"
                value={form.deadline}
                onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="input"
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                disabled={!isAdmin && editingTask}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="input"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 lg:col-span-2">
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                <Check className="h-4 w-4" />
                {saving ? 'Saving...' : editingTask ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => (
            <div key={status} className="panel h-96 animate-pulse bg-gray-100 dark:bg-gray-900" />
          ))}
        </div>
      ) : projects.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => (
            <section key={status} className="rounded-lg border border-gray-200 bg-gray-100/70 p-3 dark:border-gray-800 dark:bg-gray-900/45">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={statusStyles[status]}>{status}</Badge>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {tasksByStatus[status]?.length || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {tasksByStatus[status]?.length ? (
                  tasksByStatus[status].map((task) => (
                    <article key={task._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-950 dark:text-white">{task.title}</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.projectId?.title}</p>
                        </div>
                        <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {task.description || 'No task description yet.'}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          <UserRoundCheck className="mr-1 h-3.5 w-3.5" />
                          {task.assignedTo?.name || 'Unassigned'}
                        </Badge>
                        <Badge
                          className={
                            isOverdue(task.deadline, task.status)
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                          }
                        >
                          <CalendarClock className="mr-1 h-3.5 w-3.5" />
                          {formatDate(task.deadline)}
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          {initials(task.assignedTo?.name)}
                        </div>
                        <select
                          className="input h-9 flex-1 py-1.5 text-xs"
                          value={task.status}
                          onChange={(event) => updateTaskStatus(task, event.target.value)}
                          disabled={!canUpdateTask(task)}
                        >
                          {statuses.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-4 flex gap-2">
                        {isAdmin ? (
                          <button type="button" className="flex-1 btn-secondary py-2" onClick={() => openEdit(task)}>
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                        ) : null}
                        {canDeleteTask(task) ? (
                          <button type="button" className="btn-danger px-3 py-2" onClick={() => setPendingDelete(task)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
                    No tasks
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects available" message="Create or join a project before adding tasks." />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete task"
        message="This removes the task from the project board."
        confirmLabel="Delete task"
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteTask}
        loading={saving}
      />
    </div>
  );
};

export default TaskBoard;
