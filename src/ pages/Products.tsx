import { IonPage, IonContent, IonText, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { leafOutline, sparklesOutline, nutritionOutline } from 'ionicons/icons';
import React from 'react';
import Header from '../components/Header';

const Products: React.FC = () => {
    return (
        <IonPage>
            <Header title="About Our Products" />
            <IonContent className="ion-padding">
                <IonText>
                    <h2>Quality & Sourcing Philosophy</h2>
                    <p>
                        Every item on our menu is crafted with care, emphasizing freshness, local sourcing, and delicious flavor. We believe that high-quality ingredients lead to a superior product experience.
                    </p>
                </IonText>

                <IonList>
                    <IonItem lines="none">
                        <IonIcon icon={leafOutline} slot="start" color="success" />
                        <IonLabel>
                            <h3>Sustainable Coffee</h3>
                            <p>All beans are locally and ethically sourced, ensuring fair trade practices.</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem lines="none">
                        <IonIcon icon={sparklesOutline} slot="start" color="warning" />
                        <IonLabel>
                            <h3>Handmade Pastries</h3>
                            <p>Our pastries are baked fresh daily, utilizing traditional methods and local ingredients.</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem lines="none">
                        <IonIcon icon={nutritionOutline} slot="start" color="primary" />
                        <IonLabel>
                            <h3>Health Conscious Options</h3>
                            <p>We offer a variety of vegan, gluten-free, and low-sugar alternatives.</p>
                        </IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Products;
