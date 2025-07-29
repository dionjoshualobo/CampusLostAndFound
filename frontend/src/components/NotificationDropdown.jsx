import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../api';
import { formatDate } from '../utils/dateUtils';
import ContactInfoModal from './ContactInfoModal';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (id, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleViewContact = (senderId, event) => {
    event.preventDefault(); // Prevent the link from navigating
    event.stopPropagation(); // Prevent bubbling to parent elements
    setSelectedUserId(senderId);
    setShowContactModal(true);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className="dropdown dropdown-end" ref={dropdownRef}>
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" onClick={() => setIsOpen(!isOpen)}>
          <div className="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM7.07 8.07a7 7 0 10-1.41 1.41M13 10.93a4 4 0 00-5.66 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="badge badge-sm badge-primary indicator-item">{unreadCount}</span>
            )}
          </div>
        </div>

        <div tabIndex={0} className={`dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80 ${isOpen ? 'block' : 'hidden'}`}>
          <div className="menu-title">
            <span>Notifications</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-2">
              <span className="loading loading-spinner loading-sm"></span>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-2 text-base-content/70">No notifications</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`card card-compact mb-2 ${!notification.isRead ? 'bg-base-200' : 'bg-base-100'}`}
                >
                  <div className="card-body">
                    <Link
                      to={`/items/${notification.itemId}`}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="link link-hover text-base-content"
                    >
                      <p className="text-sm mb-1">{notification.message}</p>
                      <p className="text-xs text-base-content/70">{formatDate(notification.createdAt, true)}</p>
                    </Link>

                    <div className="card-actions justify-start mt-2">
                      <button
                        className="btn btn-xs btn-link text-primary"
                        onClick={(e) => handleViewContact(notification.senderId, e)}
                      >
                        View Contact Info
                      </button>

                      {!notification.isRead && (
                        <button
                          className="btn btn-xs btn-link text-base-content/70"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                      
                      <button
                        className="btn btn-xs btn-ghost text-error"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="Delete notification"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <ContactInfoModal
        userId={selectedUserId}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
};

export default NotificationDropdown;
