import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import './NotFound.css';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container animate-fade-in">
      <div className="not-found-card glass-panel">
        <div className="not-found-icon-bubble">
          <Compass size={40} />
        </div>
        <h2 className="not-found-title">404 — Off the Board</h2>
        <p className="not-found-desc">
          The requested coordinate or rank does not exist on this platform.
        </p>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Home size={18} />}
          onClick={() => navigate('/')}
        >
          Return to Command Center
        </Button>
      </div>
    </div>
  );
};
