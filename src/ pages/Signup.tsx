import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner
} from "@ionic/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Signup.css";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../firebase-config'; 
interface SignupProps {
  onSignupSuccess?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const history = useHistory();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const goToLogin = () => {
    history.push("/login");
  };

  const saveUserDataToFirestore = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid); 
      await setDoc(userDocRef, {
        firstName,
        lastName,
        email,
        username,
        phone,
        address,
        createdAt: new Date()
      });
      console.log("User data successfully written to Firestore for UID:", uid);
    } catch (e) {
      console.error("Error adding document to Firestore: ", e);
    }
  }

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName || !username || !phone || !address) {
        setError('Please fill in all fields.'); 
        return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;
      await saveUserDataToFirestore(uid); 
      if (onSignupSuccess) onSignupSuccess();
      history.push("/login"); 

    } catch (firebaseError: any) {
      console.error("Firebase Signup failed:", firebaseError.message);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Must be at least 6 characters.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="signup-page">
        <div className="signup-container">
          <img
            src="/assets/logo.png"
            alt="KopiChingu Logo"
            className="login-logo"
          />
          <h1 className="signup-title">Hello Chingu !</h1>
          <p className="signup-subtitle">Join the KopiChingu family ☕</p>
          {error && (
            <IonText color="danger"> 
              <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
            </IonText>
          )}
          <IonInput 
              placeholder="First Name" 
              type="text" 
              className="input-box" 
              value={firstName}
              onIonChange={(e) => setFirstName(e.detail.value!)}
          />
          <IonInput 
              placeholder="Last Name" 
              type="text" 
              className="input-box" 
              value={lastName}
              onIonChange={(e) => setLastName(e.detail.value!)}
          />
          <IonInput 
              placeholder="Email" 
              type="email" 
              className="input-box" 
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
          />
          <IonInput 
            placeholder="Username" 
            type="text" 
            className="input-box" 
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
            />
            <IonInput 
                placeholder="Phone Number" 
                type="tel" 
                className="input-box"
                value={phone}
                onIonChange={(e) => setPhone(e.detail.value!)}
            />
            <IonInput 
                placeholder="Address" 
                type="text" 
                className="input-box" 
                value={address}
                onIonChange={(e) => setAddress(e.detail.value!)}
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
              className="signup-button" 
              onClick={handleSignup}
              disabled={isLoading}
          >
            {isLoading ? (
                <>
                  <IonSpinner name="dots" /> Creating Account...
                </>
              ) : (
                'Create Account'
              )}
          </IonButton>

          <IonText color="medium">
            <p className="login-text">
              Already have an account?{" "}
              <span onClick={goToLogin} className="login-link">
                Log In
              </span>
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
