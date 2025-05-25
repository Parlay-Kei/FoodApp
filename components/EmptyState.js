import Link from 'next/link';

export default function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  actionLink, 
  icon: Icon = null 
}) {
  return (
    <div className="text-center py-8">
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      
      {actionLabel && actionLink && (
        <Link href={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
