import React, { useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { IconCheck, IconRobot } from './Icons';

interface NotificationItemProps {
  notification: AppNotification;
  onDismiss: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startExit = () => {
        setIsExiting(true);
        // After the animation duration, call dismiss
        const dismissTimer = setTimeout(() => onDismiss(notification.id), 300);
        return () => clearTimeout(dismissTimer);
    }
    const exitTimer = setTimeout(startExit, 4000); // Notification visible for 4 seconds

    return () => clearTimeout(exitTimer);
  }, [notification.id, onDismiss]);
  
  const handleDismiss = () => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
  }
  
  const icon = notification.type === 'success' 
    ? <IconCheck className="w-5 h-5 text-green-400" /> 
    : <IconRobot className="w-5 h-5 text-blue-400" />;

  return (
    <div
      className={`w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 flex items-start gap-3 transition-all duration-300 ease-in-out transform ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">AI Automation</p>
        <p className="text-sm text-slate-300">{notification.message}</p>
      </div>
       <button onClick={handleDismiss} className="text-slate-500 hover:text-white text-xl" aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: AppNotification[];
  onDismiss: (id: number) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-3">
      {notifications.map(n => (
        <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};