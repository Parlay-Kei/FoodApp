type SpinnerSize = 'xs' | 'sm' | 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
}

export default function LoadingSpinner({ size = 'medium' }: LoadingSpinnerProps) {
  const sizeClasses: Record<SpinnerSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}
    />
  );
} 