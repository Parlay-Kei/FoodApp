import { getOrderStatusInfo } from '../lib/utils';

interface OrderStatusTrackerProps {
  status: string;
}

export default function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const statusInfo = getOrderStatusInfo(status);

  return (
    <div className="mb-8">
      <div className="relative">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full bg-${statusInfo.color}-500`}
            style={{ width: `${(statusInfo.step / 3) * 100}%` }}
          ></div>
        </div>
        
        {/* Status Points */}
        <div className="flex justify-between mt-2">
          <div className="text-center">
            <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${statusInfo.step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              {statusInfo.step > 1 ? '✓' : '1'}
            </div>
            <p className="text-xs mt-1">Received</p>
          </div>
          
          <div className="text-center">
            <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${statusInfo.step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {statusInfo.step > 2 ? '✓' : '2'}
            </div>
            <p className="text-xs mt-1">Preparing</p>
          </div>
          
          <div className="text-center">
            <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${statusInfo.step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <p className="text-xs mt-1">Ready</p>
          </div>
        </div>
      </div>
      
      {/* Current Status */}
      <div className={`mt-6 p-4 border-l-4 border-${statusInfo.color}-500 bg-${statusInfo.color}-50 rounded-r-lg`}>
        <h3 className="font-bold text-lg">{statusInfo.label}</h3>
        <p className="text-gray-600">{statusInfo.description}</p>
      </div>
    </div>
  );
} 