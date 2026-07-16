import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../utils/motionVariants';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '../api/boards';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import SlotCounter from '../components/ui/SlotCounter';
import SplitText from '../components/ui/SplitText';
import { useForm } from 'react-hook-form';
import { formatFull } from '../utils/dateUtils';
import { Calendar, Layers, Edit3, LogOut, Mail, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AVATAR_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706',
  '#DC2626', '#DB2777', '#0891B2', '#65A30D',
];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['board-stats'],
    queryFn: () => boardsApi.getStats().then((r) => r.data.data),
    staleTime: 30000,
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: { name: user?.name || '', bio: user?.bio || '', avatarColor: user?.avatarColor || '#7C3AED' },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      updateUser(data.data);
      setEditOpen(false);
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const onOpenEdit = () => {
    reset({ name: user?.name, bio: user?.bio, avatarColor: user?.avatarColor });
    setEditOpen(true);
  };

  const selectedColor = watch('avatarColor');

  const statItems = [
    { label: 'Total Boards', value: stats?.total ?? 0, icon: '🎨', delay: 0 },
    { label: 'Active', value: stats?.active ?? 0, icon: '✅', delay: 0.1 },
    { label: 'Archived', value: stats?.archived ?? 0, icon: '🗄', delay: 0.2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 overflow-hidden">
        <SplitText text="My Profile" delay={0.05} stagger={0.06} />
      </h1>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 24 }}
        className="card overflow-hidden"
      >
        {/* Animated banner */}
        <motion.div
          className="h-28 w-full relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${user?.avatarColor}33, ${user?.avatarColor}88)` }}
        >
          {/* Moving shimmer on banner */}
          <motion.div
            className="absolute inset-0 -skew-x-12"
            animate={{ x: ['-120%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', width: '50%' }}
          />
        </motion.div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.2 }}
              whileHover={{ scale: 1.08 }}
            >
              <Avatar name={user?.name} color={user?.avatarColor} size="xl" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-2"
            >
              <Button variant="secondary" size="sm" onClick={onOpenEdit}>
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user?.name}</h2>
            {user?.bio && <p className="text-slate-500 dark:text-slate-400 mt-1">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {formatFull(user?.createdAt)}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats — Slot counter cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4"
      >
        {statItems.map(({ label, value, icon, delay }) => (
          <motion.div
            key={label}
            variants={fadeUpItem}
            whileHover={{ y: -5, boxShadow: '0 16px 40px -8px rgba(124,58,237,0.18)' }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className="card p-5 text-center cursor-default relative overflow-hidden"
          >
            {/* Background glow on hover */}
            <motion.div
              className="absolute inset-0 bg-primary-50/50 dark:bg-primary-900/10 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <p className="text-3xl mb-1">{icon}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              <SlotCounter value={value} delay={delay} duration={1} />
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 space-y-4"
      >
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Account Information</h3>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          <InfoRow icon={User} label="Name" value={user?.name} index={0} />
          <InfoRow icon={Mail} label="Email" value={user?.email} index={1} />
          <InfoRow icon={Calendar} label="Member Since" value={formatFull(user?.createdAt)} index={2} />
          {user?.bio && <InfoRow icon={FileText} label="Bio" value={user.bio} index={3} />}
        </motion.div>
      </motion.div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
          <Input label="Full Name" error={errors.name?.message}
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })} />
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none h-20" placeholder="Tell us about yourself…"
              {...register('bio', { maxLength: { value: 200, message: 'Max 200 characters' } })} />
          </div>
          <div>
            <label className="label">Avatar Color</label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((c, i) => (
                <motion.button
                  key={c}
                  type="button"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 18 }}
                  whileHover={{ scale: 1.25, y: -3, boxShadow: `0 6px 16px ${c}55` }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setValue('avatarColor', c)}
                  className={`w-9 h-9 rounded-full border-4 transition-all ${selectedColor === c ? 'border-slate-700 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" loading={updateMutation.isPending} className="w-full">
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, index = 0 }) {
  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ x: 4, backgroundColor: 'rgba(124,58,237,0.03)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex items-center gap-3 py-2.5 px-2 rounded-lg border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <motion.div whileHover={{ scale: 1.2, rotate: 12 }} transition={{ type: 'spring', stiffness: 400 }}>
        <Icon className="w-4 h-4 text-primary-400 flex-shrink-0" />
      </motion.div>
      <span className="text-sm text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">{value}</span>
    </motion.div>
  );
}
