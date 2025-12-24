import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const AuthCallback = ({ login }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback - parse session from the redirect URL
        // Supabase v2 provides `getSessionFromUrl` to extract the OAuth session
        // after the provider redirects back to our app.
        const { data, error } = await supabase.auth.getSessionFromUrl();
        
        if (error) {
          console.error('Auth callback error:', error);
          if (!mounted) return;
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (data?.session) {
          const user = data.session.user;
          
          // Extract user data from OAuth response
          const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            userType: null, // Will be set during profile completion
            department: null,
            semester: null,
            contactInfo: null,
            profile_completed: false
          };

          // Set the session token and user data
          login(data.session.access_token, userData);

          // Stop local loading so component can redirect
          if (mounted) setLoading(false);
        } else {
          if (mounted) {
            setError('No authentication session found.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        if (mounted) {
          setError('An unexpected error occurred during authentication.');
          setLoading(false);
        }
      }
    };

    handleAuthCallback();

    // Safety timeout: if Supabase doesn't complete the redirect handling,
    // stop showing the spinner after 10s and show an error so the user can retry.
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        if (!error) setError('Authentication timed out. Please try signing in again.');
      }
    }, 10000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [login]);

  if (loading) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card">
              <div className="card-body p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4>Completing sign in...</h4>
                <p className="text-muted">Please wait while we set up your account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center p-4">
                <h4 className="text-danger">Authentication Error</h4>
                <p>{error}</p>
                <a href="/auth" className="btn btn-primary">
                  Try Again
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If login was successful we set loading false above; redirect to home.
  return <Navigate to="/" replace />;
};

export default AuthCallback;
