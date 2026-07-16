import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { aiDesignApi } from '../../api/aiDesign';
import {
  Sparkles, ChevronDown, ChevronUp, Copy, Check, RefreshCw,
  Palette, Wand2, Eye, Shield, X, Zap, TriangleAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Animation Variants ─────────────────────────────────
const panelVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

const cardStagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

// ─── Color Swatch ─────────────────────────────────────────
function ColorSwatch({ hex, name, size = 'md', onClick, showHex = true }) {
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopied(true);
    toast.success(`${hex} copied!`);
    setTimeout(() => setCopied(false), 1500);
  };

  const sizeMap = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12' };

  return (
    <motion.button
      whileHover={{ scale: 1.18, y: -3 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick || copy}
      className={`${sizeMap[size]} rounded-xl border-2 border-white/20 shadow-lg relative group flex-shrink-0 cursor-pointer`}
      style={{ backgroundColor: hex }}
      title={`${name} • ${hex}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20"
      >
        {copied ? (
          <Check className="w-3 h-3 text-white drop-shadow" />
        ) : (
          <Copy className="w-3 h-3 text-white drop-shadow" />
        )}
      </motion.div>
      {showHex && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {hex}
        </div>
      )}
    </motion.button>
  );
}

// ─── Role Color Card ──────────────────────────────────────
function RoleColorCard({ color, onApply }) {
  const wcagLabel = color.wcagAAA ? 'AAA' : color.wcagAA ? 'AA' : null;
  const contrastOk = color.wcagAA;

  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -2, boxShadow: `0 8px 25px -8px ${color.hex}66` }}
      className="card p-3 space-y-2.5 cursor-default"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.12 }}
          className="w-11 h-11 rounded-xl border border-white/10 shadow-md flex-shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{color.role}</span>
            {wcagLabel && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${contrastOk ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                {wcagLabel}
              </span>
            )}
          </div>
          <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{color.name}</div>
          <div className="font-mono text-xs text-slate-400">{color.hex}</div>
        </div>
        <button
          onClick={() => onApply?.(color.hex)}
          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors whitespace-nowrap"
        >
          Apply
        </button>
      </div>
      {color.reason && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-1 border-l-2 border-primary-200 dark:border-primary-800">
          {color.reason}
        </p>
      )}
      <div className="flex items-center gap-1.5 text-[10px]">
        {contrastOk ? (
          <><Shield className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">✔ {color.label} contrast ({color.contrastRatio}:1)</span></>
        ) : (
          <><TriangleAlert className="w-3 h-3 text-amber-500" /><span className="text-amber-600 dark:text-amber-400">⚠ Low contrast ({color.contrastRatio}:1)</span></>
        )}
      </div>
    </motion.div>
  );
}

// ─── Harmony Section ─────────────────────────────────────
function HarmonySection({ harmonies }) {
  const harmonyList = Object.values(harmonies || {});

  return (
    <motion.div variants={cardStagger} initial="hidden" animate="visible" className="space-y-2">
      {harmonyList.map((h) => (
        <motion.div
          key={h.name}
          variants={cardItem}
          whileHover={{ y: -1 }}
          className="card p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{h.name}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">{h.description}</p>
          <div className="flex gap-1.5 flex-wrap">
            {h.colors.map((hex, i) => (
              <ColorSwatch key={i} hex={hex} name={hex} size="md" showHex={false} />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Theme Card ───────────────────────────────────────────
function ThemeCard({ theme, onApply }) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -3, boxShadow: '0 16px 40px -12px rgba(0,0,0,0.25)' }}
      className={`card p-3 space-y-2 border-2 transition-all ${theme.recommended ? 'border-primary-200 dark:border-primary-800/60' : 'border-transparent'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{theme.emoji}</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-white">{theme.theme}</span>
          {theme.recommended && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              ✦ Recommended
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        {theme.colors.map((hex, i) => (
          <motion.div
            key={i}
            whileHover={{ scaleY: 1.4, y: -2 }}
            className="h-6 flex-1 rounded-md shadow-sm"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <button
        onClick={() => onApply?.(theme.colors)}
        className="w-full text-[11px] font-semibold py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
      >
        Apply {theme.theme} Theme
      </button>
    </motion.div>
  );
}

// ─── Collapsible Section ──────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-white flex-1">{title}</span>
        {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold">{badge}</span>}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="content"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────
export default function AIDesignAssistant({ boardId, onApplyColor, onClose }) {
  const [imageUrl, setImageUrl] = useState('');
  const [activeImageUrl, setActiveImageUrl] = useState('');

  const {
    data: recs,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['ai-design', boardId],
    queryFn: () => aiDesignApi.getBoardRecommendations(boardId).then((r) => r.data.data),
    enabled: !!boardId,
    staleTime: 60000,
  });

  const {
    data: imageAnalysis,
    isLoading: imageLoading,
    refetch: analyzeRefetch,
  } = useQuery({
    queryKey: ['ai-image-analysis', activeImageUrl],
    queryFn: () => aiDesignApi.analyzeImage(activeImageUrl).then((r) => r.data.data),
    enabled: !!activeImageUrl,
    staleTime: 300000,
  });

  const handleAnalyzeImage = useCallback(() => {
    if (!imageUrl.trim()) return toast.error('Enter an image URL first');
    setActiveImageUrl(imageUrl.trim());
  }, [imageUrl]);

  const handleApply = useCallback((hex) => {
    onApplyColor?.(hex);
    toast.success(`${hex} applied as theme color! ✨`);
  }, [onApplyColor]);

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Design Assistant</h2>
          <p className="text-[10px] text-slate-400">Board-aware color intelligence</p>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <motion.div animate={{ rotate: isFetching ? 360 : 0 }} transition={{ duration: 1, repeat: isFetching ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-20 skeleton rounded-2xl"
              />
            ))}
          </div>
        )}

        {isError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 text-center space-y-2">
            <Wand2 className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-400">Unable to analyze board. Make sure tiles exist.</p>
            <button onClick={() => refetch()} className="text-xs text-primary-500 hover:underline">Try again</button>
          </motion.div>
        )}

        {recs && (
          <motion.div variants={cardStagger} initial="hidden" animate="visible" className="space-y-3">

            {/* Board Context */}
            <motion.div variants={cardItem} className="card p-3 flex items-center gap-3">
              <div className="flex gap-1">
                {recs.boardColors.slice(0, 7).map((hex, i) => (
                  <ColorSwatch key={i} hex={hex} name={hex} size="sm" showHex={false} />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{recs.boardTitle}</p>
                <p className="text-[10px] text-slate-400">{recs.totalTiles} tiles · {recs.boardColors.length} extracted colors</p>
              </div>
            </motion.div>

            {/* Role-Based Recommendations */}
            <Section title="Recommended Colors" icon={Wand2} defaultOpen={true} badge={recs.roleColors?.length}>
              <motion.div variants={cardStagger} initial="hidden" animate="visible" className="space-y-2">
                {recs.roleColors?.map((color) => (
                  <RoleColorCard key={color.role} color={color} onApply={handleApply} />
                ))}
              </motion.div>
            </Section>

            {/* Extracted Board Palette */}
            <Section title="Board Palette" icon={Palette} badge={recs.boardColors.length}>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {recs.boardColors.map((hex, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <ColorSwatch hex={hex} name={hex} size="md" showHex={false} onClick={() => handleApply(hex)} />
                    <span className="text-[9px] font-mono text-slate-400">{hex.slice(0, 7)}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Color Harmonies */}
            <Section title="Color Harmonies" icon={Zap} badge="5">
              <HarmonySection harmonies={recs.harmonies} />
            </Section>

            {/* Suggested Themes */}
            <Section title="Suggested Themes" icon={Eye} badge="10">
              <motion.div variants={cardStagger} initial="hidden" animate="visible" className="space-y-2">
                {recs.themes?.slice(0, 6).map((theme) => (
                  <ThemeCard key={theme.theme} theme={theme} onApply={(colors) => handleApply(colors[0])} />
                ))}
              </motion.div>
            </Section>

            {/* Tile Styles */}
            <Section title="Smart Tile Styling" icon={Shield}>
              <div className="space-y-2 pt-1">
                {Object.values(recs.tileStyles || {}).map((style) => (
                  <motion.div
                    key={style.role}
                    variants={cardItem}
                    className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="w-7 h-7 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: style.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{style.role}</div>
                      <div className="text-[10px] font-mono text-slate-400">{style.hex}</div>
                    </div>
                    <button
                      onClick={() => handleApply(style.hex)}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                    >
                      Use
                    </button>
                  </motion.div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Image Analysis */}
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white">Analyze Image</span>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL to analyze..."
                className="input text-xs flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeImage()}
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAnalyzeImage}
                disabled={imageLoading}
                className="btn-primary btn-sm px-3 flex-shrink-0"
              >
                {imageLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </motion.div>
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {imageAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 space-y-3"
                >
                  {/* Top extracted colors */}
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Top 5 Extracted Colors</p>
                    <div className="flex gap-2">
                      {imageAnalysis.extractedColors?.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <ColorSwatch hex={c.hex} name={c.name} size="lg" showHex={false} onClick={() => handleApply(c.hex)} />
                          <span className="text-[9px] font-mono text-slate-400">{c.hex.slice(0, 7)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended */}
                  {imageAnalysis.recommended && (
                    <div className="card p-3 border-l-4" style={{ borderLeftColor: imageAnalysis.recommended.hex }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl shadow-md" style={{ backgroundColor: imageAnalysis.recommended.hex }} />
                        <div className="flex-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Best Pick</div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">{imageAnalysis.recommended.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{imageAnalysis.recommended.hex}</div>
                        </div>
                        <button
                          onClick={() => handleApply(imageAnalysis.recommended.hex)}
                          className="btn-primary btn-sm"
                        >Apply</button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">{imageAnalysis.recommended.reason}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Generated At */}
        {recs?.generatedAt && (
          <p className="text-center text-[9px] text-slate-300 dark:text-slate-700 pb-2">
            Generated {new Date(recs.generatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
