import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, authCardVariants } from '../utils/motionVariants';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: Star, text: 'Unlimited boards and inspirations' },
  { icon: Zap, text: 'AI-powered color palette extraction' },
  { icon: Shield, text: 'Private & public sharing controls' },
];

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authRegister({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        toast.error('Cannot connect to API server. Please ensure the backend is running.');
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        {/* Animated background */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-fuchsia-900/30 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-md text-center space-y-8"
        >
          <motion.div variants={fadeUpItem} className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-xl"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUpItem}>
            <h1 className="text-5xl font-black tracking-tight mb-3">Join MoodBoard</h1>
            <p className="text-white/80 text-lg leading-relaxed font-light">
              Start your creative journey. Build beautiful boards, track inspiration, and share your vision.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                variants={fadeUpItem}
                whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.18)' }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                className="flex items-center gap-4 text-left p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"
                >
                  <Icon className="w-4.5 h-4.5" />
                </motion.div>
                <span className="text-sm font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Left Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-[#0a0a0f]">
        <motion.div
          variants={authCardVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:hidden flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">MoodBoard</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Free forever. No credit card required.</p>
          </motion.div>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {[
              {
                id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name',
                reg: register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } }),
                error: errors.name,
              },
              {
                id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com',
                reg: register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }),
                error: errors.email,
              },
            ].map(({ id, label, type, placeholder, reg, error }) => (
              <motion.div key={id} variants={fadeUpItem}>
                <label className="label">{label}</label>
                <input type={type} className={`input ${error ? 'input-error' : ''}`} placeholder={placeholder} {...reg} />
                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="error-msg">
                      ⚠ {error.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            <motion.div variants={fadeUpItem}>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 6 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {showPw ? (
                      <motion.div key="off" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <EyeOff className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="on" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Eye className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="error-msg">
                    ⚠ {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeUpItem}>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password"
                {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })}
              />
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="error-msg">
                    ⚠ {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeUpItem}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary btn-lg w-full mt-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Free Account
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
