import { IonPage, IonContent, IonText, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { mailOutline, callOutline, locationOutline } from 'ionicons/icons';
import React from 'react';
import Header from '../components/Header';

const Contact: React.FC = () => {
    return (
        <IonPage>
            <Header title="Contact Us" />
            <IonContent className="ion-padding">
                <IonText>
                    <h2>Get in Touch</h2>
                    <p>
                        We'd love to hear from you! Whether you have feedback, questions about an order, or just want to say hello, here's how you can reach the Kopi Chingu team.
                    </p>
                </IonText>

                <IonList lines="full">
                    <IonItem href="mailto:support@kopichingu.com">
                        <IonIcon icon={mailOutline} slot="start" color="primary" />
                        <IonLabel>
                            <h3>Email Support</h3>
                            <p>support@kopichingu.com</p>
                        </IonLabel>
                    </IonItem>

                    <IonItem href="tel:+639123456789">
                        <IonIcon icon={callOutline} slot="start" color="secondary" />
                        <IonLabel>
                            <h3>Phone / Hot-Line</h3>
                            <p>+63 912 345 6789</p>
                        </IonLabel>
                    </IonItem>

                    <IonItem button onClick={() => alert('Opening maps to our location!')}>
                        <IonIcon icon={locationOutline} slot="start" color="tertiary" />
                        <IonLabel>
                            <h3>Visit Our Location</h3>
                            <p>123 Coffee Lane, Quezon City, Philippines</p>
                        </IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Contact;
