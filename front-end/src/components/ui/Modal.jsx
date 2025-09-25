import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    small: 'sm:max-w-md',
    medium: 'sm:max-w-lg',
    large: 'sm:max-w-2xl',
    full: 'sm:max-w-full sm:m-4'
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Cette div aide à centrer le modal verticalement */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

        <div 
          className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 text-left align-middle bg-white rounded-lg shadow-xl transform transition-all`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* En-tête */}
          {title && (
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900" id="modal-headline">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="close-btn"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
