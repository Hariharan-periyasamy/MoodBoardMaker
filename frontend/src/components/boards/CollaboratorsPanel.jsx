import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '../../api/boards';
import { useForm } from 'react-hook-form';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { UserPlus, Trash2, Crown, Eye, Edit3, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_ICONS = { owner: Crown, editor: Edit3, viewer: Eye };
const ROLE_COLORS = {
  owner: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  editor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  viewer: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export default function CollaboratorsPanel({ board, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const collaborators = board?.collaborators || [];

  const inviteMutation = useMutation({
    mutationFn: (data) => boardsApi.inviteCollaborator
      ? boardsApi.inviteCollaborator(board._id, data)
      : fetch(`/api/boards/${board._id}/collaborators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(data),
        }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board._id] });
      setInviteOpen(false);
      reset();
      toast.success('Collaborator invited! 🎉');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to invite collaborator'),
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => boardsApi.removeCollaborator
      ? boardsApi.removeCollaborator(board._id, userId)
      : fetch(`/api/boards/${board._id}/collaborators/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board._id] });
      toast.success('Collaborator removed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove collaborator'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Board Collaborators" size="md">
      <div className="space-y-5">
        {/* Owner */}
        <div>
          <p className="section-header">Board Owner</p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40">
            <Avatar name={board?.ownerName || 'Owner'} color="#D97706" size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{board?.ownerName || 'You (Owner)'}</p>
            </div>
            <span className={`badge ${ROLE_COLORS.owner} gap-1`}>
              <Crown className="w-3 h-3" /> Owner
            </span>
          </div>
        </div>

        {/* Collaborators list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">
              Collaborators {collaborators.length > 0 && `(${collaborators.length})`}
            </p>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-3.5 h-3.5" /> Invite
            </Button>
          </div>

          {collaborators.length === 0 ? (
            <div className="text-center py-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No collaborators yet</p>
              <p className="text-xs text-slate-400 mt-1">Invite people to work together</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab) => {
                const user = collab.user || {};
                const RoleIcon = ROLE_ICONS[collab.role] || Edit3;
                return (
                  <div key={collab._id || user._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <Avatar name={user.name || 'Collaborator'} color={user.avatarColor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email || ''}</p>
                    </div>
                    <span className={`badge ${ROLE_COLORS[collab.role] || ROLE_COLORS.viewer} gap-1 flex-shrink-0`}>
                      <RoleIcon className="w-3 h-3" /> {collab.role}
                    </span>
                    <button
                      onClick={() => removeMutation.mutate(user._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Remove collaborator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Role info */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Permissions</p>
          {[
            { role: 'Editor', desc: 'Can upload, edit, delete, and move tiles' },
            { role: 'Viewer', desc: 'Can only view the board and tiles' },
          ].map(({ role, desc }) => (
            <div key={role} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold mt-0.5 w-14 flex-shrink-0 text-slate-700 dark:text-slate-300">{role}:</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); reset(); }} title="Invite Collaborator" size="sm">
        <form onSubmit={handleSubmit((data) => inviteMutation.mutate(data))} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="collaborator@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
            })}
          />
          <div>
            <label className="label">Role</label>
            <select className="input" {...register('role')}>
              <option value="editor">Editor — Can upload, edit, delete tiles</option>
              <option value="viewer">Viewer — Read-only access</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={inviteMutation.isPending}>
              <UserPlus className="w-4 h-4" /> Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
}
