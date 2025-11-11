import React from "react";
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from "@ionic/react";

interface HeaderProps {
  title: string;
  rightAction?: React.ReactNode; 
}

const Header: React.FC<HeaderProps> = ({ title, rightAction }) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>
        
        <IonTitle>{title}</IonTitle>
                {rightAction && (
          <IonButtons slot="end">
            {rightAction}
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
