import { ArrowRight, ClipboardList, Lock, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await signup(form);
      toast.success('Account created');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <main className="flex items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold">Team Task Manager</p>
            </div>

            <div className="panel p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Create account</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Start with an admin owner or join as a member.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="label" htmlFor="name">
                    Name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      className="input pl-10"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      className="input pl-10"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      className="input pl-10"
                      type="password"
                      minLength={6}
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className="input"
                    value={form.role}
                    onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button type="submit" className="w-full btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-600 dark:text-brand-400">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </main>

        <section className="hidden bg-white p-10 dark:bg-gray-900 lg:flex lg:flex-col lg:justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Project health</p>
              <div className="mt-5 space-y-3">
                <div className="h-2 rounded-full bg-emerald-500" />
                <div className="h-2 w-10/12 rounded-full bg-sky-500" />
                <div className="h-2 w-7/12 rounded-full bg-amber-500" />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Task mix</p>
              <div className="mt-5 flex h-28 items-end gap-3">
                <div className="h-16 flex-1 rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-24 flex-1 rounded-md bg-brand-500" />
                <div className="h-10 flex-1 rounded-md bg-rose-500" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-4xl font-bold leading-tight text-gray-950 dark:text-white">Plan, assign, finish, repeat.</p>
            <p className="mt-5 max-w-md text-base leading-7 text-gray-500 dark:text-gray-400">
              Admins shape the workspace while members focus on the work assigned to them.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
