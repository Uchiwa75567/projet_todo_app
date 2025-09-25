import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await taskService.getNotifications();
        setNotifications(notifs);
        const count = await taskService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/tasks" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              TodoList App
            </Link>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/tasks"
              className={`text-sm font-medium transition-colors ${
                isActive('/tasks')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes Tâches
            </Link>
            <Link
              to="/history"
              className={`text-sm font-medium transition-colors ${
                isActive('/history')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Historique
            </Link>
          </div>

          {/* Profil utilisateur et menu mobile */}
          <div className="flex items-center space-x-4">
            {/* Menu mobile */}
            <div className="md:hidden">
              <select
                onChange={(e) => navigate(e.target.value)}
                value={location.pathname}
                className="text-sm border-gray-300 rounded-md"
              >
                <option value="/tasks">Mes Tâches</option>
                <option value="/history">Historique</option>
              </select>
            </div>

            {/* Informations utilisateur */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown des notifications */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50 notification-dropdown">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Aucune notification
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200">
                          <button
                            onClick={async () => {
                              try {
                                await taskService.markAllAsRead();
                                setNotifications(notifications.map(n => ({ ...n, read: true })));
                                setUnreadCount(0);
                              } catch (error) {
                                console.error('Erreur:', error);
                              }
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Tout marquer comme lu
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || 'Utilisateur'}
                </span>
                <span className="text-xs text-gray-500">
                  ID: {user?.id}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;