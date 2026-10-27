import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputClass =
    "w-full p-3 text-white bg-zinc-950 border border-zinc-700 rounded-lg placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500";
const labelClass = "block mb-1 text-sm font-medium text-zinc-300";

const Profile = () => {
    const { user, authLoading, refreshUser } = useAuth();

    // Profile form state
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: ''
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password change form state
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullName') {
            const sanitizedValue = value.replace(/[0-9]/g, '');
            if (sanitizedValue !== value) {
                setProfileError('Numbers are not allowed in the Full Name field.');
            } else if (profileError === 'Numbers are not allowed in the Full Name field.') {
                setProfileError('');
            }
            return setProfileData({ ...profileData, [name]: sanitizedValue });
        }
        setProfileData({ ...profileData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        const trimmedName = profileData.fullName.trim();
        if (!trimmedName) {
            return setProfileError('Full Name cannot be empty.');
        }
        if (/\d/.test(trimmedName)) {
            return setProfileError('Full Name cannot contain numbers.');
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
            return setProfileError('Full Name must contain only letters.');
        }
        if (!/^[0-9]{10}$/.test(profileData.phone.trim())) {
            return setProfileError('Phone number must be exactly 10 digits.');
        }


        setProfileSaving(true);
        try {
            await api.patch('/customers/profile', {
                fullName: profileData.fullName.trim(),
                phone: profileData.phone.trim()
            });
            await refreshUser();
            setProfileSuccess('Profile updated successfully!');
            setTimeout(() => setProfileSuccess(''), 4000);
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.oldPassword || !passwordData.newPassword) {
            return setPasswordError('Please enter both current and new password.');
        }
        if (passwordData.newPassword.length < 6) {
            return setPasswordError('New password must be at least 6 characters.');
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setPasswordError('New passwords do not match.');
        }

        setPasswordSaving(true);
        try {
            await api.patch('/customers/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordSuccess('Password changed successfully!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSuccess(''), 4000);
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setPasswordSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-xl text-zinc-400">Loading your profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-xl px-4 py-16 mx-auto text-center">
                <div className="p-8 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <div className="text-5xl">🔒</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-white">Login Required</h1>
                    <p className="mt-2 text-zinc-400">Please log in to view and manage your profile settings.</p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 mt-6 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl px-4 py-10 mx-auto">
            {/* Header / Avatar banner */}
            <div className="flex flex-col items-start justify-between gap-6 p-6 border sm:flex-row sm:items-center bg-zinc-900 border-zinc-800 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 text-2xl font-extrabold text-white rounded-full bg-gradient-to-tr from-fuchsia-600 to-violet-600 ring-4 ring-zinc-800">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">{user.fullName}</h1>
                        <p className="text-sm text-zinc-400">{user.email}</p>
                        <span className="inline-block px-2.5 py-0.5 mt-1.5 text-xs font-semibold rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                            Verified FanTickets member
                        </span>
                    </div>
                </div>

                {/* Quick Action Navigation */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/my-listings"
                        className="px-4 py-2 text-sm font-semibold text-white transition-colors border rounded-lg bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    >
                        🎟️ My Listings
                    </Link>
                    <Link
                        to="/orders"
                        className="px-4 py-2 text-sm font-semibold text-white transition-colors border rounded-lg bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    >
                        📦 Orders
                    </Link>
                    <Link
                        to="/wishlist"
                        className="px-4 py-2 text-sm font-semibold text-white transition-colors border rounded-lg bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    >
                        ♥ Wishlist
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-2">
                {/* 1. Edit Profile Information */}
                <div className="p-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl">✏️</span>
                        <h2 className="text-xl font-bold text-white">Edit Profile Details</h2>
                    </div>

                    {profileSuccess && (
                        <div className="p-3 mb-4 text-sm text-emerald-300 border rounded-lg bg-emerald-500/10 border-emerald-500/30">
                            ✓ {profileSuccess}
                        </div>
                    )}
                    {profileError && (
                        <div className="p-3 mb-4 text-sm text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">
                            {profileError}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="fullName" className={labelClass}>Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={profileData.fullName}
                                onChange={handleProfileChange}
                                className={inputClass}
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full p-3 text-zinc-400 bg-zinc-950/50 border border-zinc-800 rounded-lg cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-zinc-500">Email is linked to ticket transfers and cannot be changed.</p>
                        </div>

                        <div>
                            <label htmlFor="phone" className={labelClass}>Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                maxLength="10"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                className={inputClass}
                                placeholder="10-digit mobile number"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={profileSaving}
                            className="w-full py-3 mt-2 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50"
                        >
                            {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
                        </button>
                    </form>
                </div>

                {/* 2. Change Password */}
                <div className="p-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl">🔒</span>
                        <h2 className="text-xl font-bold text-white">Security & Password</h2>
                    </div>

                    {passwordSuccess && (
                        <div className="p-3 mb-4 text-sm text-emerald-300 border rounded-lg bg-emerald-500/10 border-emerald-500/30">
                            ✓ {passwordSuccess}
                        </div>
                    )}
                    {passwordError && (
                        <div className="p-3 mb-4 text-sm text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">
                            {passwordError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="oldPassword" className={labelClass}>Current Password</label>
                            <input
                                id="oldPassword"
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className={inputClass}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className={labelClass}>New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                minLength="6"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={inputClass}
                                placeholder="Min. 6 characters"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                minLength="6"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={inputClass}
                                placeholder="Repeat new password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="w-full py-3 mt-2 font-bold text-white transition-colors border rounded-lg bg-zinc-800 border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                        >
                            {passwordSaving ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
