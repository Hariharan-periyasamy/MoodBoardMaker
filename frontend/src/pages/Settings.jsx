import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../utils/motionVariants';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Palette, Lock, Trash2, ChevronRight, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const THEME_OPTIONS = [
  { id: 'violet', label: 'Violet', color: '#7C3AED' },
  { id: 'blue', label: 'Ocean Blue', color: '#2563EB' },
  { id: 'emerald', label: 'Emerald', color: '#059669' },
  { id: 'rose', label: 'Rose', color: '#DB2777' },
];

export default function Settings() {
  const { isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState('violet');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const pwForm = useForm();
  const delForm = useForm();

  const handleChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      pwForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      setPasswordOpen(false);
      pwForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async (data) => {
    setDelLoading(true);
    try {
      await authApi.deleteAccount({ password: data.password });
      toast.success('Account deleted');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-slate-900 dark:text-slate-100"
      >
        Settings
      </motion.h1>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Appearance */}
        <motion.div variants={fadeUpItem}>
          <SettingsSection title="Appearance" icon={<Sun className="w-5 h-5" />}>
            {/* Dark Mode Toggle */}
            <SettingsRow
              label="Dark Mode"
              description="Switch between light and dark interface"
              action={
                <motion.button
                  onClick={toggle}
                  className={`toggle ${isDark ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  role="switch"
                  aria-checked={isDark}
                  whileTap={{ scale: 0.94 }}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`toggle-thumb ${isDark ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </motion.button>
              }
            />

            {/* Theme Selection */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Accent Theme
                <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ml-1">UI Preview Only</span>
              </p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2"
              >
                {THEME_OPTIONS.map(({ id, label, color }) => (
                  <motion.button
                    key={id}
                    variants={fadeUpItem}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedTheme(id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                      selectedTheme === id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                    <AnimatePresence>
                      {selectedTheme === id && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          className="ml-auto text-primary-600 dark:text-primary-400 text-xs"
                        >
                          ✓
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* Security */}
        <motion.div variants={fadeUpItem}>
          <SettingsSection title="Security" icon={<Lock className="w-5 h-5" />}>
            <SettingsRow
              label="Change Password"
              description="Update your account password"
              action={
                <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
                  Change <ChevronRight className="w-4 h-4" />
                </Button>
              }
            />
          </SettingsSection>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeUpItem}>
          <SettingsSection title="Danger Zone" icon={<AlertTriangle className="w-5 h-5 text-red-500" />} danger>
            <SettingsRow
              label="Delete Account"
              description="Permanently delete your account and all your boards. This cannot be undone."
              action={
                <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              }
            />
          </SettingsSection>
        </motion.div>
      </motion.div>

      {/* Change Password Modal */}
      <Modal isOpen={passwordOpen} onClose={() => { setPasswordOpen(false); pwForm.reset(); }} title="Change Password">
        <form onSubmit={pwForm.handleSubmit(handleChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            error={pwForm.formState.errors.currentPassword?.message}
            {...pwForm.register('currentPassword', { required: 'Current password is required' })}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            error={pwForm.formState.errors.newPassword?.message}
            {...pwForm.register('newPassword', {
              required: 'New password required',
              minLength: { value: 6, message: 'At least 6 characters' },
            })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            error={pwForm.formState.errors.confirmPassword?.message}
            {...pwForm.register('confirmPassword', { required: 'Please confirm new password' })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => { setPasswordOpen(false); pwForm.reset(); }}>
              Cancel
            </Button>
            <Button className="flex-1" type="submit" loading={pwLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); delForm.reset(); }} title="Delete Account" size="sm">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              This will permanently delete your account and <strong>all your boards</strong>. You will lose all your data.
            </p>
          </motion.div>
          <form onSubmit={delForm.handleSubmit(handleDeleteAccount)} className="space-y-4">
            <Input
              label="Confirm with your password"
              type="password"
              placeholder="Enter your password"
              error={delForm.formState.errors.password?.message}
              {...delForm.register('password', { required: 'Password is required to confirm deletion' })}
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" type="button" onClick={() => { setDeleteOpen(false); delForm.reset(); }}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" type="submit" loading={delLoading}>
                Delete Account
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function SettingsSection({ title, icon, children, danger }) {
  return (
    <div className={`card overflow-hidden ${danger ? 'border-red-200 dark:border-red-900' : ''}`}>
      <div className={`px-5 py-4 border-b flex items-center gap-2 ${
        danger
          ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10'
          : 'border-slate-200 dark:border-slate-800'
      }`}>
        <span className={danger ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'}>{icon}</span>
        <h3 className={`font-semibold ${danger ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'}`}>
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function SettingsRow({ label, description, action }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex items-center justify-between gap-4"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}
