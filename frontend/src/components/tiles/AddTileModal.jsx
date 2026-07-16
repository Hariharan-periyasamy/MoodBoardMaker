import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUploader from './ImageUploader';

const TILE_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706',
  '#DC2626', '#DB2777', '#0891B2', '#65A30D',
];

export default function AddTileModal({ isOpen, onClose, onSubmit, editTile, loading, aiSuggestedColor }) {
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      caption: '',
      themeColor: '#7C3AED',
    },
  });

  const selectedColor = watch('themeColor');

  useEffect(() => {
    if (isOpen) {
      if (editTile) {
        reset({
          caption: editTile.caption || '',
          themeColor: aiSuggestedColor || editTile.themeColor || '#7C3AED',
        });
        setImageUrl(editTile.imageUrl || '');
        setTagsInput(Array.isArray(editTile.tags) ? editTile.tags.join(', ') : '');
      } else {
        reset({
          caption: '',
          themeColor: aiSuggestedColor || '#7C3AED',
        });
        setImageUrl('');
        setTagsInput('');
      }
    }
  }, [isOpen, editTile, reset, aiSuggestedColor]);

  const displayColors = Array.from(new Set(aiSuggestedColor ? [aiSuggestedColor, ...TILE_COLORS] : TILE_COLORS));

  const handleFormSubmit = (data) => {
    if (!imageUrl) {
      errors.imageUrl = { message: 'Image is required' };
      return;
    }

    // Process comma-separated tags
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const submissionData = {
      ...data,
      imageUrl,
      tags: tagsArray,
    };

    onSubmit(submissionData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTile ? 'Edit Inspiration' : 'Add Inspiration'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Component for File Drop and Presets */}
        <div>
          <label className="label">Inspiration Image *</label>
          <ImageUploader
            onUploadSuccess={setImageUrl}
            currentUrl={imageUrl}
            themeColor={selectedColor}
          />
          {!imageUrl && (
            <p className="text-xs text-red-500 mt-1">Please select, upload, or paste an image</p>
          )}
        </div>

        {/* Caption */}
        <Input
          label="Caption"
          placeholder="Write a short title/caption for this item..."
          error={errors.caption?.message}
          {...register('caption', {
            maxLength: { value: 200, message: 'Caption cannot exceed 200 characters' },
          })}
        />

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <input
            type="text"
            className="input"
            placeholder="Nature, travel, UI design (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">Separate boards with commas</p>
        </div>

        {/* Theme Accent Color Swatches */}
        <div>
          <label className="label">Accent Theme Color</label>
          <div className="flex gap-2">
            {displayColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-7 h-7 rounded-lg transition-transform relative ${
                  selectedColor === color ? 'ring-2 ring-primary-500 scale-110' : 'hover:scale-[1.05]'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setValue('themeColor', color)}
              >
                {color === aiSuggestedColor && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 border border-white rounded-full" title="AI Suggested Color" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading} disabled={!imageUrl}>
            {editTile ? 'Save Changes' : 'Add Inspiration'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
