'use client';

interface TimelineEvent {
  status: string;
  message: string;
  timestamp: string;
  location?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

export default function Timeline({ events, currentStatus }: TimelineProps) {
  const statusSteps = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const statusEmojis: { [key: string]: string } = {
    PENDING: '',
    PICKED_UP: '',
    IN_TRANSIT: '',
    OUT_FOR_DELIVERY: '',
    DELIVERED: '',
    FAILED: '',
    CANCELLED: ''
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-200 text-gray-600';
      case 'PICKED_UP':
        return 'bg-blue-200 text-blue-600';
      case 'IN_TRANSIT':
        return 'bg-yellow-200 text-yellow-600';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-200 text-orange-600';
      case 'DELIVERED':
        return 'bg-green-200 text-green-600';
      case 'FAILED':
        return 'bg-red-200 text-red-600';
      case 'CANCELLED':
        return 'bg-purple-200 text-purple-600';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const isStatusComplete = (status: string) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    const statusIndex = statusSteps.indexOf(status);
    return statusIndex <= currentIndex;
  };

  return (
    <div className="w-full">
      {/* Timeline Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10"></div>

          {/* Progress Bar Filled */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 -z-10 transition-all duration-500"
            style={{
              width: `${(statusSteps.indexOf(currentStatus) / (statusSteps.length - 1)) * 100}%`
            }}
          ></div>

          {statusSteps.map((step) => (
            <div key={step} className="flex flex-col items-center relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  isStatusComplete(step)
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {statusEmojis[step]}
              </div>
              <p className="text-xs mt-2 font-semibold text-center text-gray-700 max-w-16 break-words">
                {step.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking History</h3>
        <div className="space-y-4">
          {events && events.length > 0 ? (
            events
              .slice()
              .reverse()
              .map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getStatusColor(event.status)}`}>
                      {statusEmojis[event.status]}
                    </div>
                    {index < events.length - 1 && (
                      <div className="w-1 bg-gray-200 absolute left-1/2 -translate-x-1/2 top-10" style={{ height: '50px' }}></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{event.status.replace('_', ' ')}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1"> {event.location}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-gray-500 py-8">No events yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
