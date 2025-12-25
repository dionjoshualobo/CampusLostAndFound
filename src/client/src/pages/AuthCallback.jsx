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
        // Get the code from URL params (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        let session = null;
        let authError = null;
        
        if (code) {
          // PKCE flow - exchange code for session
          console.log('Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          session = data?.session;
          authError = error;
        } else if (accessToken) {
          // Implicit flow - token is in the hash
          console.log('Getting session from hash...');
          const { data, error } = await supabase.auth.getSession();
          session = data?.session;
          authError = error;
        } else {
          // Try to get existing session
          console.log('Attempting to get existing session...');
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve({ data: { session: null }, error: new Error('Session fetch timeout') }), 5000)
          );
          const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
          session = data?.session;
          authError = error;
        }
        
        if (authError) {
          console.error('Auth callback error:', authError);
          if (!mounted) return;
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (session) {
          const user = session.user;
          
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
          login(session.access_token, userData);

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
