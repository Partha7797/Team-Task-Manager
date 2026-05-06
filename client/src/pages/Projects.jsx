import { CalendarDays, Edit3, FolderPlus, Plus, Search, Trash2, UsersRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import RoleBadge from '../components/RoleBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate, initials, statusStyles } from '../utils/format';

const blankForm = {
  title: '',
  description: '',
  deadline: '',
  status: 'Planning',
  members: []
};

const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const Projects = () => {
  const { isAdmin, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
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

  const filteredProjects = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return projects;

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(value) ||
        project.description?.toLowerCase().includes(value) ||
        project.status.toLowerCase().includes(value)
    );
  }, [projects, search]);

  const openCreate = () => {
    setEditingProject(null);
    setForm({ ...blankForm, members: user?._id ? [user._id] : [] });
    setFormOpen(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      deadline: toInputDate(project.deadline),
      status: project.status,
      members: project.members?.map((member) => member._id) || []
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProject(null);
    setForm(blankForm);
  };

  const toggleMember = (memberId) => {
    setForm((current) => {
      const exists = current.members.includes(memberId);
      return {
        ...current,
        members: exists ? current.members.filter((id) => id !== memberId) : [...current.members, memberId]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        members: form.members
      };

      const { data } = editingProject
        ? await api.put(`/projects/${editingProject._id}`, payload)
        : await api.post('/projects', payload);

      setProjects((current) =>
        editingProject
          ? current.map((project) => (project._id === data.project._id ? data.project : project))
          : [data.project, ...current]
      );
      toast.success(editingProject ? 'Project updated' : 'Project created');
      closeForm();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async () => {
    if (!pendingDelete) return;
    setSaving(true);

    try {
      await api.delete(`/projects/${pendingDelete._id}`);
      setProjects((current) => current.filter((project) => project._id !== pendingDelete._id));
      toast.success('Project deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Search projects"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {isAdmin ? (
          <button type="button" className="btn-primary" onClick={openCreate}>
            <FolderPlus className="h-4 w-4" />
            New project
          </button>
        ) : null}
      </div>

      {formOpen && isAdmin ? (
        <section className="panel p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add the registered users who should collaborate on this project.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close project form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="grid gap-5 lg:grid-cols-[1fr_0.9fr]" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="title">
                  Project name
                </label>
                <input
                  id="title"
                  className="input"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  className="input min-h-28"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="deadline">
                    Deadline
                  </label>
                  <input
                    id="deadline"
                    className="input"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className="input"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option>Planning</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Team members</label>
              <div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                {users.map((member) => (
                  <label
                    key={member._id}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      checked={form.members.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                    />
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-sm font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {initials(member.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                    <RoleBadge role={member.role} />
                  </label>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Plus className="h-4 w-4" />
                  {saving ? 'Saving...' : editingProject ? 'Save changes' : 'Create project'}
                </button>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel h-56 animate-pulse bg-gray-100 dark:bg-gray-900" />
          ))}
        </div>
      ) : filteredProjects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <article key={project._id} className="panel flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-gray-950 dark:text-white">{project.title}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(project.deadline)}
                  </p>
                </div>
                <Badge className={statusStyles[project.status]}>{project.status}</Badge>
              </div>

              <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-600 dark:text-gray-300">
                {project.description || 'No project description yet.'}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <UsersRound className="h-4 w-4" />
                {project.members?.length || 0} members
              </div>

              <div className="mt-3 flex -space-x-2 overflow-hidden">
                {project.members?.slice(0, 5).map((member) => (
                  <div
                    key={member._id}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-bold text-gray-700 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-200"
                    title={member.name}
                  >
                    {initials(member.name)}
                  </div>
                ))}
                {project.members?.length > 5 ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-700 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-100">
                    +{project.members.length - 5}
                  </div>
                ) : null}
              </div>

              {isAdmin ? (
                <div className="mt-6 flex gap-2">
                  <button type="button" className="flex-1 btn-secondary" onClick={() => openEdit(project)}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button type="button" className="btn-danger px-3" onClick={() => setPendingDelete(project)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects found" message="Projects you can access will appear here." />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete project"
        message="Deleting a project also removes its related tasks."
        confirmLabel="Delete project"
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteProject}
        loading={saving}
      />
    </div>
  );
};

export default Projects;
