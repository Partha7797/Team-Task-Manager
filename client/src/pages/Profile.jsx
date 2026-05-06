import { Save, ShieldCheck, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import RoleBadge from '../components/RoleBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate, initials } from '../utils/format';

const Profile = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    password: ''
  });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      password: ''
    });
  }, [user]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) return;

      try {
        const { data } = await api.get('/users');
        setUsers(data.users);
      } catch (error) {
        toast.error(error.message);
      }
    };

    loadUsers();
  }, [isAdmin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
      }

      await updateProfile(payload);
      toast.success('Profile updated');
      setForm((current) => ({ ...current, password: '' }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (memberId, role) => {
    try {
      const { data } = await api.patch(`/users/${memberId}/role`, { role });
      setUsers((current) => current.map((member) => (member._id === data.user._id ? data.user : member)));
      toast.success('Role updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="panel p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-ink text-xl font-bold text-white dark:bg-brand-600">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-950 dark:text-white">{user?.name}</h2>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="mt-2">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-email">
              Email
            </label>
            <input
              id="profile-email"
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-bio">
              Bio
            </label>
            <textarea
              id="profile-bio"
              className="input min-h-24"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-password">
              New password
            </label>
            <input
              id="profile-password"
              className="input"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="panel p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            {isAdmin ? <UserCog className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white">
              {isAdmin ? 'Team Members' : 'Account Access'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? 'Admins can adjust user roles.' : 'Your role controls project and task permissions.'}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Joined</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {users.map((member) => (
                    <tr key={member._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            {initials(member.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-950 dark:text-white">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(member.createdAt)}</td>
                      <td className="px-4 py-3">
                        <select
                          className="input max-w-36 py-2"
                          value={member.role}
                          onChange={(event) => updateRole(member._id, event.target.value)}
                          disabled={member._id === user?._id}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <RoleBadge role={user?.role} />
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Members can view project work assigned to their teams and update eligible task statuses. Admins manage
              projects, project members, task assignment, and deletion rules.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
