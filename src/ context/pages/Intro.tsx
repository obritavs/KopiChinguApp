import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
} from "@ionic/react";
import React from "react";
import "./Intro.css";

interface IntroProps {
  onFinish: () => void;
}

const Intro: React.FC<IntroProps> = ({ onFinish }) => {
  const handleStart = () => {
    localStorage.setItem("intro_seen", "true");
    onFinish();
  };

  return (
    <IonPage>
      <IonContent fullscreen className="intro-container">
        <div className="intro-card">
          <img src="/assets/logo.png" alt="Kopi Chingu Logo" className="intro-logo" />

          <IonText>
            <h1 className="intro-title">Welcome</h1>
            <p className="intro-text">
               Where Coffee Meets Comfort,  
              and Friends Feel Like Home
            </p>
          </IonText>

          <div className="button-group">
            <IonButton expand="block" className="sign-in-btn" onClick={handleStart}>
              Login
            </IonButton>
            <IonButton expand="block" fill="outline" className="sign-up-btn">
              Sign Up
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Intro;
