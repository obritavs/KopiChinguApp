import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonToast,
  useIonToast 
} from "@ionic/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Login.css";

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config'; 


interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const history = useHistory();
  const [presentToast] = useIonToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const goToSignup = () => {
    history.push("/signup");
  };

  const showSuccessToast = async () => {
    presentToast({
      message: 'Logged in successfully! Welcome back!',
      duration: 3000,
      position: 'top',
      color: 'success',
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const user = userCredential.user;
      
      const idToken = await user.getIdToken(); 

      localStorage.setItem("authToken", idToken); 
      localStorage.setItem("user_logged_in", "true"); 

      await showSuccessToast(); 

      if (onLoginSuccess) onLoginSuccess();
      history.push("/page/Shop");
      
    } catch (firebaseError: any) {
      console.error("Firebase Login failed:", firebaseError.message);
      
      let errorMessage = 'Login failed. Please try again.';

      if (firebaseError.code === 'auth/invalid-email' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Try again later.';
      }

      setError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-page">
        <div className="login-container">
          <img
            src="/assets/logo.png"
            alt="KopiChingu Logo"
            className="login-logo"
          />
          <h1 className="login-title">LOGIN</h1>
          <p className="login-subtitle">Welcome back, Chingu</p>

          
          {/* Display Error Message */}
          {error && (
            <IonText color="danger">
              <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
            </IonText>
          )}

          <IonInput
            placeholder="Email"
            type="email"
            className="input-box"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
          <IonInput
            placeholder="Password"
            type="password"
            className="input-box"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />

          <IonButton
            expand="block"
            shape="round"
            className="login-button"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IonSpinner name="dots" /> Logging In...
              </>
            ) : (
              'Log In'
            )}
          </IonButton>

          <IonText color="medium">
            <p className="signup-text">
              Don’t have an account?{" "}
              <span className="signup-link" onClick={goToSignup}>
                Sign Up
              </span>
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
