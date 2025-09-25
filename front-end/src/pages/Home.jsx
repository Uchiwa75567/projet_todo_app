import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="gradient-bg">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          TodoList App
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Organisez vos tâches efficacement avec notre application de gestion de todos
        </p>
        
        <div className="space-x-4">
          {isAuthenticated() ? (
            <Link
              to="/tasks"
              className="home-btn"
            >
              Voir mes tâches
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="home-btn mr-4"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="border-btn"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;