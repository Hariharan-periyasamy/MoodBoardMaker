import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Copy, RefreshCw, CheckCircle, Globe, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareModal({
  isOpen,
  onClose,
  board,
  onEnableSharing,
  onDisableSharing,
  onRegenerate,
  isLoading
}) {
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const shareUrl = board?.shareToken
    ? `${window.location.origin}/share/${board.shareToken}`
    : '';

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Share link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    onRegenerate();
    setShowRegenerateConfirm(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Board">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {board?.shareEnabled ? (
                <><Globe className="w-4 h-4 text-emerald-500" /> Public Access On</>
              ) : (
                <><Lock className="w-4 h-4 text-slate-500" /> Private Board</>
              )}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {board?.shareEnabled
                ? 'Anyone with the link can view this board.'
                : 'Only you can see this board.'}
            </p>
          </div>
          <div>
            {board?.shareEnabled ? (
              <Button
                variant="danger"
                size="sm"
                onClick={onDisableSharing}
                loading={isLoading}
              >
                Disable Link
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onEnableSharing}
                loading={isLoading}
              >
                Create Link
              </Button>
            )}
          </div>
        </div>

        {board?.shareEnabled && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Public Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="input flex-1 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                  onClick={(e) => e.target.select()}
                />
                <Button onClick={handleCopy} className="flex gap-2 min-w-[100px]">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {showRegenerateConfirm ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                        Regenerate link?
                      </h5>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 mb-3">
                        The current link will stop working immediately. You will need to share the new link with anyone who needs access.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowRegenerateConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleRegenerate}
                          loading={isLoading}
                        >
                          Yes, Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px]">
                    Need to revoke access? Regenerate a new link to invalidate the old one.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    onClick={() => setShowRegenerateConfirm(true)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
