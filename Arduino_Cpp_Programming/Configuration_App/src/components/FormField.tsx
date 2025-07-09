import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  description?: string;
  error?: string;
}

export default function FormField({ label, children, description, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}