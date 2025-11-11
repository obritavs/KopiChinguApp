import { IonPage, IonContent, IonText, IonList, IonItem, IonLabel, IonNote } from '@ionic/react';
import React from 'react';
import Header from '../components/Header';

const AboutApp: React.FC = () => {
    const appVersion = "1.2.0"; 

    return (
        <IonPage>
            <Header title="About the App" />
            <IonContent className="ion-padding">
                <IonText>
                    <h2>The Kopi Chingu Mobile Experience</h2>
                    <p>
                        This mobile application is designed to make your coffee and pastry experience seamless and convenient. From quick ordering to tracking your favorites, the Kopi Chingu app is your personal connection to our cafe.
                    </p>
                </IonText>
                
                <IonList lines="full">
                    <IonItem>
                        <IonLabel>App Version</IonLabel>
                        <IonNote slot="end" color="medium">{appVersion}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Framework</IonLabel>
                        <IonNote slot="end">Ionic React</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Backend</IonLabel>
                        <IonNote slot="end">Firebase Firestore & Auth</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>License</IonLabel>
                        <IonNote slot="end">MIT 2024</IonNote>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default AboutApp;
