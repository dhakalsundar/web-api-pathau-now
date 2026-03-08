'use client';

import React from 'react';

interface TimelineStep {
  id: string;
  status: string;
  title: string;
  description?: string;
  timestamp?: string;
  location?: string;
  completed?: boolean;
  current?: boolean;
  icon?: string;
}

interface VerticalTimelineProps {
  steps: TimelineStep[];
  currentStatusId?: string;
  orientation?: 'left' | 'right' | 'center';
  showConnector?: boolean;
  animated?: boolean;
}

export default function VerticalTimeline({
  steps,
  currentStatusId,
  orientation = 'center',
  showConnector = true,
  animated = true,
}: VerticalTimelineProps) {
  const getStatusColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      CREATED: 'bg-gray-100 text-gray-600 border-gray-300',
      ASSIGNED: 'bg-blue-100 text-blue-600 border-blue-300',
      PICKED: 'bg-blue-100 text-blue-600 border-blue-300',
      IN_TRANSIT: 'bg-yellow-100 text-yellow-600 border-yellow-300',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-600 border-orange-300',
      DELIVERED: 'bg-green-100 text-green-600 border-green-300',
      FAILED: 'bg-red-100 text-red-600 border-red-300',
      CANCELLED: 'bg-purple-100 text-purple-600 border-purple-300',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-600 border-gray-300';
  };

  const getStatusIcon = (status: string, customIcon?: string): string => {
    if (customIcon) return customIcon;

    const iconMap: { [key: string]: string } = {
      CREATED: '',
      ASSIGNED: '',
      PICKED: '',
      IN_TRANSIT: '',
      OUT_FOR_DELIVERY: '',
      DELIVERED: '',
      FAILED: '',
      CANCELLED: '',
    };
    return iconMap[status] || '';
  };

  const getCircleSize = (isCurrent?: boolean): string => {
    return isCurrent ? 'w-16 h-16' : 'w-12 h-12';
  };

  const getTextAlignment = (): string => {
    if (orientation === 'left') return 'text-right pr-8';
    if (orientation === 'right') return 'text-left pl-8';
    return 'text-center';
  };

  const getColumnLayout = (): string => {
    if (orientation === 'left') return 'items-end';
    if (orientation === 'right') return 'items-start';
    return 'items-center';
  };

  const getConnectorPosition = (): string => {
    if (orientation === 'left') return 'right-0 translate-x-1/2';
    if (orientation === 'right') return 'left-0 -translate-x-1/2';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div className="w-full">
      <div className="space-y-6 relative">
        {/* Vertical Connector Line */}
        {showConnector && steps.length > 1 && (
          <div
            className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 via-gray-300 to-gray-200 ${getConnectorPosition()}`}
            style={{ height: 'calc(100% - 2rem)' }}
          />
        )}

        {/* Timeline Steps */}
        {steps.map((step, index) => {
          const isCurrent = currentStatusId ? step.id === currentStatusId : step.current;
          const isCompleted = step.completed || (currentStatusId && steps.findIndex(s => s.id === currentStatusId) >= index);
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <div
              key={step.id}
              className={`flex ${getColumnLayout()} relative ${animated ? 'animate-fadeIn' : ''}`}
              style={{
                animationDelay: animated ? `${index * 100}ms` : '0ms',
              }}
            >
              {/* Step Circle - Left Position */}
              {orientation === 'left' && (
                <div className="order-3">
                  <div className={`relative inline-flex justify-center items-center`}>
                    <div
                      className={`${getCircleSize(isCurrent)} rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 transform ${
                        isCurrent
                          ? 'scale-110 shadow-lg ring-4 ring-offset-2 ring-blue-400'
                          : 'shadow-md hover:shadow-lg'
                      } ${
                        isCompleted
                          ? 'bg-green-500 text-white border-2 border-green-600'
                          : isCurrent
                          ? `${getStatusColor(step.status)} border-2 border-blue-500`
                          : `${getStatusColor(step.status)} border-2`
                      }`}
                    >
                      {getStatusIcon(step.status, step.icon)}
                    </div>

                    {/* Pulse Animation for Current */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse" />
                    )}
                  </div>
                </div>
              )}

              {/* Step Content - Left Position */}
              {orientation === 'left' && (
                <div className="order-2 pr-6 flex-1">
                  <div className={getTextAlignment()}>
                    <h4
                      className={`font-bold text-lg ${
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    )}
                    {step.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                         {step.location}
                      </p>
                    )}
                    {step.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                         {new Date(step.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step Circle - Right Position */}
              {orientation === 'right' && (
                <div className="order-1">
                  <div className={`relative inline-flex justify-center items-center`}>
                    <div
                      className={`${getCircleSize(isCurrent)} rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 transform ${
                        isCurrent
                          ? 'scale-110 shadow-lg ring-4 ring-offset-2 ring-blue-400'
                          : 'shadow-md hover:shadow-lg'
                      } ${
                        isCompleted
                          ? 'bg-green-500 text-white border-2 border-green-600'
                          : isCurrent
                          ? `${getStatusColor(step.status)} border-2 border-blue-500`
                          : `${getStatusColor(step.status)} border-2`
                      }`}
                    >
                      {getStatusIcon(step.status, step.icon)}
                    </div>

                    {/* Pulse Animation for Current */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse" />
                    )}
                  </div>
                </div>
              )}

              {/* Step Content - Right Position */}
              {orientation === 'right' && (
                <div className="order-2 pl-6 flex-1">
                  <div className={getTextAlignment()}>
                    <h4
                      className={`font-bold text-lg ${
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    )}
                    {step.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                         {step.location}
                      </p>
                    )}
                    {step.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                         {new Date(step.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step Circle & Content - Center Position */}
              {orientation === 'center' && (
                <>
                  <div className="flex-1 text-right pr-8">
                    {index % 2 === 0 && (
                      <div>
                        <h4
                          className={`font-bold text-lg ${
                            isCurrent
                              ? 'text-blue-600'
                              : isCompleted
                              ? 'text-green-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.description && (
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        )}
                        {step.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {step.location}</p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                             {new Date(step.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative flex justify-center">
                    <div
                      className={`${getCircleSize(isCurrent)} rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 transform ${
                        isCurrent
                          ? 'scale-110 shadow-lg ring-4 ring-offset-2 ring-blue-400'
                          : 'shadow-md hover:shadow-lg'
                      } ${
                        isCompleted
                          ? 'bg-green-500 text-white border-2 border-green-600'
                          : isCurrent
                          ? `${getStatusColor(step.status)} border-2 border-blue-500`
                          : `${getStatusColor(step.status)} border-2`
                      }`}
                    >
                      {getStatusIcon(step.status, step.icon)}
                    </div>

                    {/* Pulse Animation for Current */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 text-left pl-8">
                    {index % 2 === 1 && (
                      <div>
                        <h4
                          className={`font-bold text-lg ${
                            isCurrent
                              ? 'text-blue-600'
                              : isCompleted
                              ? 'text-green-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.description && (
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        )}
                        {step.location && (
                          <p className="text-xs text-gray-500 mt-1"> {step.location}</p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                             {new Date(step.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Connector to Next Step */}
              {showConnector && index < steps.length - 1 && (
                <div
                  className={`absolute w-1 bg-gradient-to-b from-gray-300 to-gray-200 top-[calc(100%+1rem)] h-6 ${getConnectorPosition()}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
