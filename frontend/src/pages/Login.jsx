import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../utils/motionVariants';
import SplitText from '../components/ui/SplitText';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, ArrowRight, Layers, Image, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import ParticleField, { OrbitRing } from '../components/ui/ParticleField';

// Morphing blob keyframes (SVG path morphing via clip-path)
const BLOB_PATHS = [
  'polygon(70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%, 30% 0%)',
  'polygon(60% 0%, 100% 20%, 100% 80%, 60% 100%, 40% 100%, 0% 80%, 0% 20%, 40% 0%)',
  'polygon(80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%, 20% 0%)',
  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 50% 100%, 0% 75%, 0% 25%, 50% 0%)',
];

const featureItems = [
  { icon: Image, title: 'Visual Inspiration', desc: 'Upload & organize images into stunning boards' },
  { icon: Globe, title: 'Share Publicly', desc: 'Share your mood boards with the world' },
  { icon: Layers, title: 'AI Color Palette', desc: 'Extract dominant colors from every image' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back! ✨');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        {/* Ambient particles */}
        <ParticleField count={28} />

        {/* Morphing blob background */}
        <motion.div
          className="absolute w-[500px] h-[500px] bg-white/5 blur-2xl"
          animate={{ clipPath: BLOB_PATHS }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />

        {/* Secondary morphing blob */}
        <motion.div
          className="absolute w-[300px] h-[300px] bg-white/8 blur-xl bottom-20 right-20"
          animate={{ clipPath: BLOB_PATHS.slice().reverse() }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-md text-center space-y-8"
        >
          {/* Logo with orbit ring */}
          <motion.div variants={fadeUpItem} className="flex items-center justify-center mb-4">
            <div className="relative">
              <OrbitRing radius={40} dotCount={8} color="rgba(255,255,255,0.4)" duration={7} />
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl"
              >
                <Sparkles className="w-8 h-8 text-white drop-shadow" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={fadeUpItem}>
            <h1 className="text-5xl font-black tracking-tight mb-3">
              MoodBoard
            </h1>
            <p className="text-white/80 text-lg leading-relaxed font-light">
              Your AI-powered creative hub for collecting, organizing, and sharing visual inspiration.
            </p>
          </motion.div>

          {/* Feature cards with hover tilt */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-3 text-left">
            {featureItems.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUpItem}
                whileHover={{ x: 8, scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 12 }}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-white/70 text-xs mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-[#0a0a0f] relative overflow-hidden">
        {/* Subtle background gradient pulse */}
        <motion.div
          className="absolute top-1/3 -right-32 w-64 h-64 rounded-full bg-primary-500/5 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:hidden flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">MoodBoard</span>
          </motion.div>

          {/* Heading — character stagger */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white overflow-hidden">
              <SplitText text="Welcome back" delay={0.2} stagger={0.05} />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-slate-500 dark:text-slate-400 mt-2"
            >
              Sign in to continue to your boards
            </motion.p>
          </div>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Email field */}
            <motion.div variants={fadeUpItem}>
              <label className="label">Email Address</label>
              <motion.div
                animate={{ boxShadow: focused === 'email' ? '0 0 0 3px rgba(124,58,237,0.2)' : '0 0 0 0px transparent' }}
                className="rounded-xl"
              >
                <input
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                />
              </motion.div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="error-msg overflow-hidden">
                    ⚠ {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password field */}
            <motion.div variants={fadeUpItem}>
              <label className="label">Password</label>
              <motion.div
                animate={{ boxShadow: focused === 'password' ? '0 0 0 3px rgba(124,58,237,0.2)' : '0 0 0 0px transparent' }}
                className="rounded-xl relative"
              >
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Your password"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  {...register('password', { required: 'Password is required' })}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {showPw
                      ? <motion.div key="off" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: -90 }} transition={{ duration: 0.2 }}><EyeOff className="w-4 h-4" /></motion.div>
                      : <motion.div key="on" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} exit={{ rotateY: 90 }} transition={{ duration: 0.2 }}><Eye className="w-4 h-4" /></motion.div>
                    }
                  </AnimatePresence>
                </motion.button>
              </motion.div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="error-msg overflow-hidden">
                    ⚠ {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTA Submit */}
            <motion.div variants={fadeUpItem}>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary btn-lg w-full mt-2 relative overflow-hidden group"
                whileHover={{ scale: 1.02, boxShadow: '0 0 36px -6px rgba(124,58,237,0.6)' }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 -skew-x-12"
                  animate={{ x: ['-120%', '200%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', width: '50%' }}
                />
                {loading ? (
                  <span className="flex items-center gap-2 relative">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2 relative">
                    Sign In
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                Create one free
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
