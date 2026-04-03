import { useNotifications } from '../contexts/NotificationContext';

const typeClasses = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export default function Notifications() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg flex items-start space-x-3 animate-slide-in"
        >
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeClasses[n.type]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white break-words">{n.message}</p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-gray-400 hover:text-white flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}