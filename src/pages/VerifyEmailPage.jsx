import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("Aucun jeton de vérification trouvé. Veuillez vérifier le lien dans votre e-mail.");
      return;
    }

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage("Votre e-mail a été vérifié avec succès !");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { state: { message: 'E-mail vérifié. Vous pouvez maintenant vous connecter.' } });
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || "La vérification a échoué. Le jeton est peut-être invalide ou expiré.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-fadeIn">
        <div className="mb-6 flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            status === 'verifying' ? 'bg-blue-50' : 
            status === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {status === 'verifying' && <EnvelopeIcon className="w-10 h-10 text-blue-500 animate-pulse" />}
            {status === 'success' && <CheckCircleIcon className="w-10 h-10 text-green-500" />}
            {status === 'error' && <XCircleIcon className="w-10 h-10 text-red-500" />}
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {status === 'verifying' ? 'Vérification de votre e-mail...' : 
           status === 'success' ? 'Compte vérifié !' : 'Échec de la vérification'}
        </h1>
        
        <p className="text-gray-500 mb-8 font-medium">
          {message}
        </p>

        {status === 'verifying' && <LoadingSpinner size="md" />}
        
        {status !== 'verifying' && (
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Aller à la page de connexion
            </Link>
            <Link to="/" className="block text-sm text-gray-400 font-bold hover:text-orange-500 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
