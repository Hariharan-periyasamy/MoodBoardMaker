import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const Input = forwardRef(function Input(
  { label, error, className = '', helpText, leftIcon: LeftIcon, rightElement, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            LeftIcon && 'pl-10',
            rightElement && 'pr-10',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="error-msg">{error}</p>}
      {helpText && !error && (
        <p className="text-xs text-slate-500 mt-1">{helpText}</p>
      )}
    </div>
  );
});

export default Input;
