import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';

const THEME_COLORS = [
  { hex: '#7C3AED', label: 'Violet' },
  { hex: '#2563EB', label: 'Blue' },
  { hex: '#059669', label: 'Emerald' },
  { hex: '#D97706', label: 'Amber' },
  { hex: '#DC2626', label: 'Red' },
  { hex: '#DB2777', label: 'Pink' },
  { hex: '#0891B2', label: 'Cyan' },
  { hex: '#65A30D', label: 'Lime' },
];

export default function BoardForm({ onSubmit, loading, defaultValues, submitLabel = 'Create Board' }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      themeColor: '#7C3AED',
      visibility: 'private',
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) reset({ ...defaultValues });
  }, [defaultValues]);

  const selectedColor = watch('themeColor');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <Input
        label="Board Title *"
        placeholder="e.g. Travel Inspiration"
        error={errors.title?.message}
        {...register('title', {
          required: 'Title is required',
          minLength: { value: 1, message: 'Title too short' },
          maxLength: { value: 100, message: 'Title too long (max 100 chars)' },
        })}
      />

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          className="input resize-none h-24"
          placeholder="What's this board about?"
          {...register('description', {
            maxLength: { value: 500, message: 'Description too long (max 500 chars)' },
          })}
        />
        {errors.description && <p className="error-msg">{errors.description.message}</p>}
      </div>

      {/* Theme Color */}
      <div>
        <label className="label">Theme Color</label>
        <div className="flex flex-wrap gap-2">
          {THEME_COLORS.map(({ hex, label }) => (
            <button
              key={hex}
              type="button"
              title={label}
              onClick={() => setValue('themeColor', hex)}
              className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                selectedColor === hex ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div>
        <label className="label">Visibility</label>
        <div className="flex gap-3">
          {['private', 'public'].map((v) => (
            <label
              key={v}
              className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all capitalize text-sm font-medium ${
                watch('visibility') === v
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <input type="radio" value={v} {...register('visibility')} className="hidden" />
              {v === 'private' ? '🔒' : '🌐'} {v.charAt(0).toUpperCase() + v.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
