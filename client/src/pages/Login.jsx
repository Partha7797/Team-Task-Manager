import { ArrowRight, ClipboardList, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-100">Team Task</p>
              <p className="text-xl font-bold">Manager</p>
            </div>
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight">Work moves faster when ownership is clear.</h1>
            <p className="mt-5 text-base leading-7 text-gray-300">
              Projects, assignments, deadlines, and role-based permissions stay in one focused workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm text-gray-300">
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">RBAC</p>
              <p className="mt-1">Admin and member flows</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">JWT</p>
              <p className="mt-1">Secure API access</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-2xl font-bold text-white">REST</p>
              <p className="mt-1">Clean integrations</p>
            </div>
          </div>
        </section>

        <main className="flex items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold">Team Task Manager</p>
            </div>

            <div className="panel p-6 sm:p-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Sign in</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Continue to your team workspace.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

                <button type="submit" className="w-full btn-primary" disabled={submitting}>
                  {submitting ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                New here?{' '}
                <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-600 dark:text-brand-400">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
