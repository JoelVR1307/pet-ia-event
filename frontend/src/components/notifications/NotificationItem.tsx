import React from 'react';
import { type Notification, NotificationType } from '../../types/notification.types';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  showActions?: boolean;
  onDelete?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  showActions = false,
  onDelete
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_CANCELLED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      
      case 'HEALTH_ALERT':
      case 'VACCINATION_DUE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      
      case 'NEW_FOLLOWER':
      case 'POST_LIKED':
      case 'POST_COMMENTED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      
      case 'SYSTEM_UPDATE':
      case 'MAINTENANCE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      
      case 'PREDICTION_READY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'HEALTH_ALERT':
      case 'VACCINATION_DUE':
        return 'text-red-600 bg-red-100';
      
      case 'APPOINTMENT_REMINDER':
      case 'APPOINTMENT_CONFIRMED':
        return 'text-blue-600 bg-blue-100';
      
      case 'APPOINTMENT_CANCELLED':
        return 'text-orange-600 bg-orange-100';
      
      case 'NEW_FOLLOWER':
      case 'POST_LIKED':
      case 'POST_COMMENTED':
        return 'text-green-600 bg-green-100';
      
      case 'PREDICTION_READY':
        return 'text-purple-600 bg-purple-100';
      
      case 'SYSTEM_UPDATE':
      case 'MAINTENANCE':
        return 'text-gray-600 bg-gray-100';
      
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days}d`;
    } else {
      return notificationDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getNotificationTitle = (type: NotificationType) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return 'Recordatorio de cita';
      case 'APPOINTMENT_CONFIRMED':
        return 'Cita confirmada';
      case 'APPOINTMENT_CANCELLED':
        return 'Cita cancelada';
      case 'HEALTH_ALERT':
        return 'Alerta de salud';
      case 'VACCINATION_DUE':
        return 'Vacuna pendiente';
      case 'NEW_FOLLOWER':
        return 'Nuevo seguidor';
      case 'POST_LIKED':
        return 'Me gusta en tu publicación';
      case 'POST_COMMENTED':
        return 'Nuevo comentario';
      case 'PREDICTION_READY':
        return 'Predicción lista';
      case 'SYSTEM_UPDATE':
        return 'Actualización del sistema';
      case 'MAINTENANCE':
        return 'Mantenimiento programado';
      default:
        return 'Notificación';
    }
  };

  return (
    <div
      className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-l-4 ${
        notification.read 
          ? 'border-transparent bg-white' 
          : 'border-blue-500 bg-blue-50'
      }`}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationColor(notification.type)}`}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
              {notification.title || getNotificationTitle(notification.type)}
            </p>
            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatTimeAgo(notification.createdAt)}
            </p>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 ml-2">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" title="No leída" />
              )}
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  title="Eliminar notificación"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Additional Data */}
        {notification.data && (
          <div className="mt-2 text-xs text-gray-500">
            {notification.type === 'APPOINTMENT_REMINDER' && notification.data.appointmentDate && (
              <span>Fecha: {new Date(notification.data.appointmentDate).toLocaleDateString('es-ES')}</span>
            )}
            {notification.type === 'NEW_FOLLOWER' && notification.data.followerName && (
              <span>De: {notification.data.followerName}</span>
            )}
            {notification.type === 'POST_LIKED' && notification.data.postTitle && (
              <span>Publicación: {notification.data.postTitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;