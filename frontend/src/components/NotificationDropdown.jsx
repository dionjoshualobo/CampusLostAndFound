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
    console.log('Opening contact modal for userId:', senderId);
    setSelectedUserId(senderId);
    setShowContactModal(true);
    setIsOpen(false); // Close the dropdown when opening the modal
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className={`dropdown${isOpen ? ' show' : ''}`} ref={dropdownRef}>
        <button
          className="btn btn-link nav-link position-relative"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <i className="bi bi-bell"></i>
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {unreadCount}
            </span>
          )}
        </button>

        <div 
          className={`dropdown-menu dropdown-menu-end${isOpen ? ' show' : ''}`} 
          style={{ minWidth: '350px', maxHeight: '400px', overflowY: 'auto' }}
        >
          <h6 className="dropdown-header">Notifications</h6>

          {isLoading ? (
            <div className="px-3 py-2">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-2">No notifications</div>
          ) : (
            <>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`dropdown-item d-flex align-items-center ${!notification.isRead ? 'bg-light' : ''}`}
                >
                  <div className="flex-grow-1">
                    <Link
                      to={`/items/${notification.itemId}`}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-decoration-none text-dark"
                    >
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">{formatDate(notification.createdAt, true)}</small>
                    </Link>

                    <div className="mt-1">
                      <button
                        className="btn btn-sm btn-link px-0 text-primary"
                        onClick={(e) => handleViewContact(notification.senderId, e)}
                      >
                        View Contact Info
                      </button>

                      {!notification.isRead && (
                        <button
                          className="btn btn-sm btn-link text-secondary ms-2"
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
                        className="btn btn-sm btn-link text-danger ms-2"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="Delete notification"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
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
