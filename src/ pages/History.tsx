import { 
    IonPage, 
    IonContent, 
    IonText, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonIcon,
    IonGrid,
} from '@ionic/react';
import { 
    homeOutline,      
    leafOutline,      
    storefrontOutline,
    heartOutline,     
} from 'ionicons/icons';
import React from 'react';
import Header from '../components/Header'; 
import './History.css'; 

const History: React.FC = () => {
    return (
        <IonPage>
            <Header title="Our Story" />
            <IonContent className="ion-padding history-content">
                
                <IonText color="dark" className="ion-text-center ion-margin-bottom">
                    <h1>The Journey of Kopi Chingu</h1>
                    <p>
                        Kopi Chingu means 'Coffee Friend'. Our story is about bringing the best coffee and friendship together.
                    </p>
                </IonText>
                
                <IonGrid className="ion-no-padding ion-margin-top">
                    
                    <IonCard className="timeline-card cobalt-blue-card">
                        <IonCardHeader>
                            <IonIcon icon={homeOutline} color="light" slot="start" size="large" />
                    
                            <IonCardTitle color="light">2025: The First Sip 🇰🇷🇵🇭</IonCardTitle> 
                        </IonCardHeader>
                        <IonCardContent>
                            <p className="ion-text-justify">
                                Kopi Chingu was founded with a simple vision: merge the rich, comforting taste of Filipino coffee with the modern, cozy atmosphere of a Korean café (Chingu means 'friend' in Korean). We started as a small, humble pop-up shop, quickly captivating the local community.
                            </p>
                        </IonCardContent>
                    </IonCard>
                   
                    <IonCard className="timeline-card cobalt-blue-card">
                        <IonCardHeader>
                            <IonIcon icon={leafOutline} color="light" slot="start" size="large" />
                    
                            <IonCardTitle color="light">Sustainably Sourced</IonCardTitle> 
                        </IonCardHeader>
                        <IonCardContent>
                            <p className="ion-text-justify">
                                Our commitment to quality begins at the source. We partner directly with local farms in the Cordillera region, ensuring every bean is ethically and sustainably grown. This support helps small-scale farmers thrive while guaranteeing the highest, freshest quality in your cup.
                            </p>
                        </IonCardContent>
                    </IonCard>

                    <IonCard className="timeline-card cobalt-blue-card">
                        <IonCardHeader>
                            <IonIcon icon={storefrontOutline} color="light" slot="start" size="large" />
                            {/* Title color set to "light" */}
                            <IonCardTitle color="light">Building the Chingu Family</IonCardTitle> 
                        </IonCardHeader>
                        <IonCardContent>
                            <p className="ion-text-justify">
                                We’ve grown beyond a coffee shop; we are a community hub. Known for our friendly atmosphere and unique blends, we strive to be the place where every customer feels like a "chingu." Our growth is a direct reflection of the support and loyalty of our friends.
                            </p>
                        </IonCardContent>
                    </IonCard>

                    
                    <IonCard className="timeline-card cobalt-blue-card">
                        <IonCardHeader>
                            <IonIcon icon={heartOutline} color="light" slot="start" size="large" />
                            
                            <IonCardTitle color="light">The Future of Friendship</IonCardTitle> 
                        </IonCardHeader>
                        <IonCardContent>
                            <p className="ion-text-justify">
                                Our mission remains constant: Comfort, Community, and Quality. Whether you order a quick delivery or sit down with us, we promise a delightful experience fueled by passion and friendship.
                            </p>
                        </IonCardContent>
                    </IonCard>
                    
                </IonGrid>
                
              
                <div style={{ height: '100px' }}></div> 

            </IonContent>
        </IonPage>
    );
};

export default History;
