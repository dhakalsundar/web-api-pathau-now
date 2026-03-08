'use client';

import VerticalTimeline from '@/app/components/VerticalTimeline';

export default function VerticalTimelineDemo() {
  // Example 1: Shipment Tracking Timeline
  const shipmentSteps = [
    {
      id: 'created',
      status: 'CREATED',
      title: 'Order Created',
      description: 'Your shipment has been created and is pending assignment',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Dhaka',
      icon: '',
      completed: true,
    },
    {
      id: 'assigned',
      status: 'ASSIGNED',
      title: 'Rider Assigned',
      description: 'Ahmed Khan has been assigned to your shipment',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Dhaka',
      icon: '',
      completed: true,
    },
    {
      id: 'picked',
      status: 'PICKED',
      title: 'Picked Up',
      description: 'Package has been picked up from sender location',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Dhaka',
      icon: '',
      completed: true,
    },
    {
      id: 'in_transit',
      status: 'IN_TRANSIT',
      title: 'In Transit',
      description: 'Your package is on the way to delivery address',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Dhaka to Chittagong',
      icon: '',
      current: true,
      completed: false,
    },
    {
      id: 'out_for_delivery',
      status: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      description: 'Package is out for final delivery today',
      timestamp: undefined,
      location: 'Chittagong',
      icon: '',
      completed: false,
    },
    {
      id: 'delivered',
      status: 'DELIVERED',
      title: 'Delivered',
      description: 'Package successfully delivered',
      timestamp: undefined,
      location: 'Chittagong',
      icon: '',
      completed: false,
    },
  ];

  // Example 2: Simple Process Timeline
  const processSteps = [
    {
      id: 'step1',
      status: 'CREATED',
      title: 'Application Submitted',
      description: 'Your application has been received',
      timestamp: new Date().toISOString(),
      icon: '',
      completed: true,
    },
    {
      id: 'step2',
      status: 'ASSIGNED',
      title: 'Under Review',
      description: 'Our team is reviewing your application',
      timestamp: new Date().toISOString(),
      current: true,
      icon: '',
      completed: false,
    },
    {
      id: 'step3',
      status: 'IN_TRANSIT',
      title: 'Approval In Progress',
      description: 'Final approvals are being processed',
      icon: '',
      completed: false,
    },
    {
      id: 'step4',
      status: 'DELIVERED',
      title: 'Approved',
      description: 'Your application has been approved',
      icon: '',
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vertical Timeline Component</h1>
          <p className="text-lg text-gray-600">
            Responsive timeline with dynamic status highlighting and multiple layout options
          </p>
        </div>

        {/* Example 1: Center Layout (Default) */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Example 1: Center Layout</h2>
          <p className="text-gray-600 mb-8">
            Default center layout with alternating content placement. Perfect for detailed timelines.
          </p>
          <VerticalTimeline steps={shipmentSteps} currentStatusId="in_transit" orientation="center" />
        </section>

        {/* Example 2: Left Layout */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Example 2: Left Layout</h2>
          <p className="text-gray-600 mb-8">
            Content positioned on the right with circle indicator on the left. Great for focused display.
          </p>
          <VerticalTimeline steps={processSteps} currentStatusId="step2" orientation="left" />
        </section>

        {/* Example 3: Right Layout */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Example 3: Right Layout</h2>
          <p className="text-gray-600 mb-8">
            Content positioned on the left with circle indicator on the right. Mirror layout available.
          </p>
          <VerticalTimeline steps={processSteps} currentStatusId="step2" orientation="right" />
        </section>

        {/* Example 4: No Connector */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Example 4: Without Connector</h2>
          <p className="text-gray-600 mb-8">
            Timeline without the connecting line between steps. Useful for compact displays.
          </p>
          <VerticalTimeline steps={shipmentSteps} currentStatusId="in_transit" orientation="left" showConnector={false} />
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-600 mb-2">✨ Dynamic Status Highlighting</h3>
              <p className="text-gray-700">
                Current status automatically highlighted with pulse animation and larger circle.
                Completed steps show green checkmark.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-600 mb-2">📐 3 Layout Orientations</h3>
              <p className="text-gray-700">
                Choose between center (alternating), left, or right layout. Each optimized for different use cases.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-600 mb-2">🎨 Tailwind Styling</h3>
              <p className="text-gray-700">
                Fully styled with Tailwind CSS. Status-specific colors, hover effects, and responsive design.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-orange-600 mb-2">🔄 Dynamic Step Rendering</h3>
              <p className="text-gray-700">
                Pass any array of steps. Component automatically handles rendering, colors, and animations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-red-600 mb-2">⏱️ Timestamp & Location</h3>
              <p className="text-gray-700">
                Display timestamps and locations for each step. Formatted automatically with emojis.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-indigo-600 mb-2">💫 Smooth Animations</h3>
              <p className="text-gray-700">
                Built-in pulse animation for current step. Staggered appearance animation for all steps.
              </p>
            </div>
          </div>
        </section>

        {/* Props Documentation */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Props Documentation</h2>

          {/* TimelineStep Props */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">TimelineStep Interface</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`interface TimelineStep {
  id: string;              // Unique identifier for step
  status: string;          // Status code (CREATED, ASSIGNED, etc)
  title: string;           // Step title/heading
  description?: string;    // Optional detailed description
  timestamp?: string;      // ISO timestamp for step
  location?: string;       // Location information
  completed?: boolean;     // Whether step is complete
  current?: boolean;       // Whether this is current step
  icon?: string;           // Optional emoji icon override
}`}
            </pre>
          </div>

          {/* VerticalTimeline Props */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">VerticalTimeline Props</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`interface VerticalTimelineProps {
  steps: TimelineStep[];           // Array of timeline steps
  currentStatusId?: string;        // ID of current step (or use step.current)
  orientation?: 'left'            // 'center' (default), 'left', or 'right'
              | 'right'
              | 'center';
  showConnector?: boolean;         // Show connecting line (default: true)
  animated?: boolean;              // Enable staggered animations (default: true)
}`}
            </pre>
          </div>
        </section>

        {/* Usage Example */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Example</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import VerticalTimeline from '@/app/components/VerticalTimeline';

// Define your steps
const steps = [
  {
    id: 'step1',
    status: 'CREATED',
    title: 'Order Created',
    description: 'Order has been created',
    timestamp: new Date().toISOString(),
    location: 'Dhaka',
    completed: true,
    icon: ''
  },
  {
    id: 'step2',
    status: 'IN_TRANSIT',
    title: 'In Transit',
    description: 'On the way to delivery',
    current: true,
    location: 'Highway',
    icon: ''
  }
];

// Use the component
<VerticalTimeline 
  steps={steps}
  orientation="center"
  showConnector={true}
  animated={true}
/>

// Or specify current status by ID
<VerticalTimeline 
  steps={steps}
  currentStatusId="step2"
  orientation="left"
/>`}
          </pre>
        </section>

        {/* Status Color Mapping */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Colors & Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'CREATED', emoji: '', color: 'bg-gray-100', colorName: 'Gray' },
              { status: 'ASSIGNED', emoji: '', color: 'bg-blue-100', colorName: 'Blue' },
              { status: 'PICKED', emoji: '', color: 'bg-blue-100', colorName: 'Blue' },
              { status: 'IN_TRANSIT', emoji: '', color: 'bg-yellow-100', colorName: 'Yellow' },
              { status: 'OUT_FOR_DELIVERY', emoji: '', color: 'bg-orange-100', colorName: 'Orange' },
              { status: 'DELIVERED', emoji: '', color: 'bg-green-100', colorName: 'Green' },
              { status: 'FAILED', emoji: '', color: 'bg-red-100', colorName: 'Red' },
              { status: 'CANCELLED', emoji: '', color: 'bg-purple-100', colorName: 'Purple' },
            ].map(({ status, emoji, color, colorName }) => (
              <div key={status} className="border border-gray-200 rounded-lg p-4 text-center">
                <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                  {emoji}
                </div>
                <p className="font-bold text-sm text-gray-900">{status}</p>
                <p className="text-xs text-gray-500">{colorName}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Customization Tips */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customization Tips</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900">Custom Icons</h3>
              <p className="text-gray-700">
                Pass any emoji in the `icon` field to override the default status icon.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-gray-900">Dynamic Status Colors</h3>
              <p className="text-gray-700">
                Component automatically colors steps based on the status field. Supports 8 common shipment statuses.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-gray-900">Responsive Design</h3>
              <p className="text-gray-700">
                Mobile-optimized with adjusted spacing. Center layout alternates for better mobile readability.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-bold text-gray-900">Animations</h3>
              <p className="text-gray-700">
                Disable animations with `animated={'{false}'}` for better performance on slow devices.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
