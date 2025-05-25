import Link from 'next/link';
import { ComponentType } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: ComponentType<{ className?: string }>;
}

export default function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  actionLink, 
  icon: Icon 
}: EmptyStateProps) {
  return (
    <div className="text-center py-8" role="status" aria-label="Empty state">
      {Icon && (
        <div className="flex justify-center mb-4" aria-hidden="true">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      
      {actionLabel && actionLink && (
        <Link 
          href={actionLink} 
          className="btn-primary"
          aria-label={actionLabel}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
} 