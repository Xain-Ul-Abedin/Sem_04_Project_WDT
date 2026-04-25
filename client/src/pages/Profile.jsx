import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Calendar,
  Camera,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const PANELS = {
  profile: 'profile',
  security: 'security',
};

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState(PANELS.profile);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const userInitial = useMemo(
    () => user?.name?.trim()?.charAt(0)?.toUpperCase() || 'Z',
    [user?.name]
  );
  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }

    return user?.avatar || '';
  }, [avatarFile, user?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarFile, avatarPreview]);

  const handleProfileChange = (event) => {
    setProfileData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] || null;
    setAvatarFile(file);
  };

  const handlePasswordChange = (event) => {
    setPasswordData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const onUpdateProfile = async (event) => {
    event.preventDefault();
    setIsUpdatingProfile(true);
    const payload = new FormData();
    payload.append('name', profileData.name);
    payload.append('phone', profileData.phone);
    if (avatarFile) {
      payload.append('avatar', avatarFile);
    }
    const success = await updateProfile(payload);
    if (success) {
      setAvatarFile(null);
    }
    setIsUpdatingProfile(false);
  };

  const onRemoveAvatar = async () => {
    if (!user?.avatar && !avatarFile) {
      toast.error('There is no profile image to remove');
      return;
    }

    setIsUpdatingProfile(true);
    const payload = new FormData();
    payload.append('name', profileData.name);
    payload.append('phone', profileData.phone);
    payload.append('removeAvatar', 'true');

    const success = await updateProfile(payload);
    if (success) {
      setAvatarFile(null);
    }
    setIsUpdatingProfile(false);
  };

  const onChangePassword = async (event) => {
    event.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setIsUpdatingPassword(true);
    const success = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }

    setIsUpdatingPassword(false);
  };

  const onDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Deactivate this account? You will lose access until support reactivates it.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const response = await api.delete('/auth/me');
      toast.success(response.message || 'Account deactivated');
      logout();
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to deactivate account');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const navButtonClass = (panel) =>
    `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
      activePanel === panel
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/15'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen pt-24 pb-14">
      <div className="section-shell">
        <section className="surface-panel overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
                <Shield className="h-4 w-4" />
                Account Center
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Keep your Lahore Zoo visits, profile, and security in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Update your visitor details, manage password security, and jump straight
                into your bookings without losing the premium feel of the site.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-900 p-6 text-white shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white/10 text-3xl font-black uppercase ring-1 ring-white/20">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={user?.name || 'Profile avatar'} className="h-full w-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-900 shadow-lg transition hover:bg-emerald-50">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">Member</p>
                  <h2 className="mt-2 truncate text-2xl font-bold">{user?.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Role</p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-semibold uppercase">
                    <BadgeCheck className="h-5 w-5 text-amber-300" />
                    {user?.role}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Phone</p>
                  <p className="mt-2 text-lg font-semibold">
                    {user?.phone || 'Add your number'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {user?.role !== 'admin' ? (
                  <Link to="/my-bookings" className="btn btn-secondary rounded-full px-6">
                    <Calendar className="h-4 w-4" />
                    My Bookings
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setActivePanel(PANELS.security)}
                  className="btn btn-ghost rounded-full border border-white/15 px-6 text-white hover:bg-white/10"
                >
                  <Lock className="h-4 w-4" />
                  Security
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="surface-panel rounded-[1.75rem] p-4">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                Workspace
              </p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setActivePanel(PANELS.profile)}
                  className={navButtonClass(PANELS.profile)}
                >
                  <User className="h-4 w-4" />
                  Profile Information
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel(PANELS.security)}
                  className={navButtonClass(PANELS.security)}
                >
                  <Lock className="h-4 w-4" />
                  Security & Password
                </button>
              </div>
            </div>

            <div className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                Quick Details
              </p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p>{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <p>{profileData.phone || 'Not added yet'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-red-100 bg-red-50/80 p-5 shadow-[0_12px_30px_rgba(239,68,68,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                Danger Zone
              </p>
              <p className="mt-3 text-sm leading-6 text-red-700/80">
                Deactivation signs you out immediately and blocks future logins until support
                restores the account.
              </p>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={isUpdatingProfile}
                className="btn btn-error mt-5 w-full rounded-full"
              >
                <Trash2 className="h-4 w-4" />
                Deactivate Account
              </button>
            </div>
          </aside>

          <section className="space-y-8">
            {activePanel === PANELS.profile ? (
              <div className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                      Profile
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      Personal information
                    </h2>
                  </div>
                  <p className="max-w-xl text-sm text-slate-500">
                    Keep your contact details up to date so booking updates and support
                    requests stay accurate.
                  </p>
                </div>

                <form onSubmit={onUpdateProfile} className="mt-6 space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-black/5 bg-slate-50 p-5 md:col-span-2">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="avatar">
                          {avatarPreview ? (
                            <div className="h-20 w-20 overflow-hidden rounded-3xl ring ring-emerald-100 ring-offset-2 ring-offset-white">
                              <img src={avatarPreview} alt={user?.name || 'Profile avatar'} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-3xl font-black uppercase text-emerald-800">
                              {userInitial}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Upload a JPG, PNG, or WEBP image up to 5MB. This photo appears anywhere your account is shown.
                          </p>
                        </div>
                        <label className="btn btn-outline btn-primary rounded-full">
                          <Camera className="h-4 w-4" />
                          Choose Photo
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                        <button
                          type="button"
                          className="btn btn-ghost rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={onRemoveAvatar}
                          disabled={isUpdatingProfile || (!user?.avatar && !avatarFile)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove Photo
                        </button>
                      </div>
                    </div>

                    <label className="form-control">
                      <div className="label px-1">
                        <span className="label-text font-semibold text-slate-700">Full Name</span>
                      </div>
                      <input
                        type="text"
                        name="name"
                        className="input input-bordered h-14 w-full rounded-2xl bg-white"
                        value={profileData.name}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <label className="form-control">
                      <div className="label px-1">
                        <span className="label-text font-semibold text-slate-700">Phone Number</span>
                      </div>
                      <input
                        type="text"
                        name="phone"
                        className="input input-bordered h-14 w-full rounded-2xl bg-white"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </label>
                  </div>

                  <label className="form-control">
                    <div className="label px-1">
                      <span className="label-text font-semibold text-slate-700">
                        Email Address
                      </span>
                    </div>
                    <input
                      type="email"
                      className="input input-bordered h-14 w-full rounded-2xl bg-slate-100 text-slate-500"
                      value={user?.email || ''}
                      disabled
                    />
                  </label>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="btn btn-primary rounded-full px-8"
                    >
                      {isUpdatingProfile ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {activePanel === PANELS.security ? (
              <div className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                      Security
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      Password and sign-in safety
                    </h2>
                  </div>
                  <p className="max-w-xl text-sm text-slate-500">
                    Use a strong password with uppercase, number, and special characters to
                    protect your bookings and visitor details.
                  </p>
                </div>

                <form onSubmit={onChangePassword} className="mt-6 space-y-6">
                  <label className="form-control">
                    <div className="label px-1">
                      <span className="label-text font-semibold text-slate-700">
                        Current Password
                      </span>
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      className="input input-bordered h-14 w-full rounded-2xl bg-white"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </label>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="form-control">
                      <div className="label px-1">
                        <span className="label-text font-semibold text-slate-700">
                          New Password
                        </span>
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        className="input input-bordered h-14 w-full rounded-2xl bg-white"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </label>

                    <label className="form-control">
                      <div className="label px-1">
                        <span className="label-text font-semibold text-slate-700">
                          Confirm New Password
                        </span>
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="input input-bordered h-14 w-full rounded-2xl bg-white"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </label>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    Changing your password refreshes your session token, so your account stays
                    secure without forcing you through a broken sign-in loop.
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="btn btn-outline btn-primary rounded-full px-8"
                    >
                      {isUpdatingPassword ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
