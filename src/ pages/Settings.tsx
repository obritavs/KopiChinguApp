import React from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
} from "@ionic/react";
import Header from "../components/Header"; 
const Settings: React.FC = () => {
  return (
    <IonPage>
      <Header title="Settings" />

      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel>Enable Notifications</IonLabel>
            <IonToggle slot="end" />
          </IonItem>

          <IonItem>
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle slot="end" />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
