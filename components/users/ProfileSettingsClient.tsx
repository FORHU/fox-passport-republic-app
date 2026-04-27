'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/features/useProfile';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/hooks/auth/useAuth';
import AvatarUploader from '@/components/users/AvatarUploader';

type Section = 'profile' | 'security' | 'danger';

function SectionButton({
  active,
  icon,
  label,
  onClick,
  danger,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active
          ? danger
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20'
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      {label}
    </button>
  );
}

function StatusBadge({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        type === 'success'
          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
          : 'bg-red-500/10 border border-red-500/20 text-red-400'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {message}
    </div>
  );
}

export default function ProfileSettingsClient() {
  const router = useRouter();
  const logout = useLogout();
  const storeUser = useAuthStore(state => state.user);
  const { profile, isLoading, updateProfile, changePassword, deleteAccount } = useProfile();

  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete form
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setUsername(profile.username ?? '');
      setPhone(profile.phone ?? '');
      setProfileImage(profile.imgId ?? '');
    }
  }, [profile]);

  const flash = (message: string, type: 'success' | 'error') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        profileImage: profileImage.trim() || undefined,
      });
      flash('Profile updated successfully', 'success');
    } catch (err: any) {
      flash(err?.response?.data?.message ?? 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      flash('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      flash('New password must be at least 6 characters', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      flash('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      flash(err?.response?.data?.message ?? 'Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== 'DELETE') {
      flash('Type DELETE to confirm', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await deleteAccount(deletePassword);
      await logout();
      router.push('/');
    } catch (err: any) {
      flash(err?.response?.data?.message ?? 'Failed to delete account', 'error');
      setIsSaving(false);
    }
  };

  const displayName = profile?.name || storeUser?.name || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const roleLabel = (profile?.systemRole || storeUser?.systemRole || 'user')
    .replace('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-body antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 h-20 flex items-center gap-4">
          <Link
            href="/user"
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold">Account Settings</h1>
            <p className="text-xs text-white/40">{profile?.email || storeUser?.email}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-28 space-y-6">
            {/* Avatar card */}
            <div className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-6 text-center">
              <div className="flex justify-center mb-4">
                <AvatarUploader
                  currentUrl={profileImage || undefined}
                  initials={initials}
                  onUploaded={(url) => setProfileImage(url)}
                />
              </div>
              <p className="font-display font-bold text-white truncate">{displayName}</p>
              <p className="text-xs text-white/30 mt-0.5">@{profile?.username || storeUser?.username}</p>
              <span className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40">
                {roleLabel}
              </span>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              <SectionButton active={activeSection === 'profile'} icon="person" label="Profile" onClick={() => setActiveSection('profile')} />
              <SectionButton active={activeSection === 'security'} icon="lock" label="Security" onClick={() => setActiveSection('security')} />
              <SectionButton active={activeSection === 'danger'} icon="delete_forever" label="Delete Account" onClick={() => setActiveSection('danger')} danger />
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-4">
          {status && <StatusBadge message={status.message} type={status.type} />}

          {isLoading ? (
            <div className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-12 text-center text-white/30 text-sm">
              Loading profile…
            </div>
          ) : activeSection === 'profile' ? (
            <form onSubmit={handleUpdateProfile} className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-8 space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold mb-1">Personal Information</h2>
                <p className="text-sm text-white/40">Update your name, username, and contact details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon="badge">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input-field"
                  />
                </Field>
                <Field label="Username" icon="alternate_email">
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="input-field"
                  />
                </Field>
                <Field label="Email address" icon="mail" hint="Contact support to change email">
                  <input
                    type="email"
                    value={profile?.email || storeUser?.email || ''}
                    disabled
                    className="input-field opacity-40 cursor-not-allowed"
                  />
                </Field>
                <Field label="Phone number" icon="phone">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="input-field"
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-[#ccff00] text-black font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving
                    ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    : <span className="material-symbols-outlined text-[18px]">save</span>
                  }
                  Save Changes
                </button>
              </div>
            </form>
          ) : activeSection === 'security' ? (
            <form onSubmit={handleChangePassword} className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-8 space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold mb-1">Change Password</h2>
                <p className="text-sm text-white/40">Choose a strong password of at least 6 characters.</p>
              </div>

              <div className="space-y-4">
                <Field label="Current password" icon="lock">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                  />
                </Field>
                <Field label="New password" icon="lock_open">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </Field>
                <Field label="Confirm new password" icon="lock_open">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#ccff00] text-black font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving
                  ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-[18px]">key</span>
                }
                Update Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleDeleteAccount} className="bg-[#0f111a] border border-red-500/10 rounded-[2rem] p-8 space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-red-400 mb-1">Delete Account</h2>
                <p className="text-sm text-white/40">
                  This is permanent. All your data — bookings, badges, stamps, and listings — will be erased.
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-sm text-red-300 space-y-1">
                <p className="font-bold">Before you delete:</p>
                <ul className="text-white/40 space-y-0.5 list-disc list-inside">
                  <li>Cancel any active bookings first</li>
                  <li>Download any data you want to keep</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <div className="space-y-4">
                <Field label="Confirm your password" icon="lock">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                  />
                </Field>
                <Field label='Type "DELETE" to confirm' icon="warning">
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={e => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    required
                    className="input-field placeholder:text-white/20"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSaving || deleteConfirmation !== 'DELETE'}
                className="px-6 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {isSaving
                  ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                }
                Delete My Account
              </button>
            </form>
          )}
        </main>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(204,255,0,0.4);
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-white/50 uppercase tracking-widest">
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-white/25">{hint}</p>}
    </div>
  );
}
