import { 
    IonPage, 
    IonContent, 
    IonText, 
    IonCard, 
    IonCardContent, 
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonLabel
} from '@ionic/react';
import { 
    star, 
    checkmarkCircle, 
    ellipseOutline,
    giftOutline 
} from 'ionicons/icons';
import React, { useState, useEffect } from 'react'; 
import Header from '../components/Header'; 

import { auth, db } from '../firebase-config'; 
import { doc, getDoc } from 'firebase/firestore'; 

interface LoyaltyCard {
    currentStamps: number;
    rewardGoal: number; 
    tier: 'Regular' | 'V.I.P.';
    userId: string;
}

interface StampSlotProps {
    isEarned: boolean;
    number: number;
    isReward: boolean;
}

const StampSlot: React.FC<StampSlotProps> = ({ isEarned, number, isReward }) => {
    return (
        <IonCol size="2.4" className="ion-text-center stamp-col">
            <div className={`stamp-circle ${isEarned ? 'earned' : 'empty'} ${isReward ? 'reward' : ''}`}>
                <IonIcon 
                    icon={isEarned ? checkmarkCircle : isReward ? giftOutline : ellipseOutline} 
                    color={isEarned ? 'warning' : 'medium'}
                    size="large"
                />
                <IonText color={isEarned ? 'dark' : 'medium'} className="stamp-number">
                    {number}
                </IonText>
            </div>
        </IonCol>
    );
};

const Loyalty: React.FC = () => {
    const [loyaltyData, setLoyaltyData] = useState<LoyaltyCard | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLoyaltyData = async () => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const cardRef = doc(db, 'loyaltyCards', user.uid);
            const cardSnap = await getDoc(cardRef);

            if (cardSnap.exists()) {
                setLoyaltyData(cardSnap.data() as LoyaltyCard);
            }
        } catch (error) {
            console.error("Error fetching loyalty data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoyaltyData();
    }, []);

    const currentStamps = loyaltyData?.currentStamps ?? 0;
    const rewardGoal = loyaltyData?.rewardGoal ?? 10;
    const tier = loyaltyData?.tier ?? 'Regular';

    const stampsToGoal = rewardGoal - currentStamps;
    
    const stampSlots = Array.from({ length: rewardGoal }, (_, index) => {
        const number = index + 1;
        return (
            <StampSlot
                key={number}
                number={number}
                isEarned={number <= currentStamps}
                isReward={number === rewardGoal}
            />
        );
    });
    
    if (loading) {
         return (
            <IonPage>
                <Header title="Stamp Card Loyalty" />
                <IonContent className="ion-padding ion-text-center">
                    <IonText color="primary"><p>Loading loyalty card...</p></IonText>
                </IonContent>
            </IonPage>
        );
    }
    
    if (!auth.currentUser) {
        return (
            <IonPage>
                <Header title="Stamp Card Loyalty" />
                <IonContent className="ion-padding ion-text-center">
                    <IonText color="danger">
                        <h2 className="ion-padding-top">Not Logged In</h2>
                        <p>Please log in to view your loyalty status.</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }


    return (
        <IonPage>
            <Header title="Stamp Card Loyalty" />

            <IonContent className="loyalty-content">

                <IonCard className="ion-margin-vertical loyalty-status-card">
                    <IonCardContent className="ion-text-center">
                        <IonChip color={tier === 'V.I.P.' ? 'warning' : 'primary'}>
                            <IonIcon icon={star} />
                            <IonLabel>{tier} Member</IonLabel>
                        </IonChip>

                        <IonText color="dark" className="ion-margin-top">
                            <h2 className="ion-no-margin">Your Stamp Progress</h2>
                        </IonText>

                        {currentStamps < rewardGoal ? (
                            <IonText color="primary">
                                <h1>{stampsToGoal} More Stamp{stampsToGoal !== 1 ? 's' : ''} for a FREE Drink!</h1>
                            </IonText>
                        ) : (
                            <IonText color="success">
                                <h1>REWARD EARNED! Claim your free coffee.</h1>
                            </IonText>
                        )}
                        <p>Total **{currentStamps}/{rewardGoal}** collected</p>
                    </IonCardContent>
                </IonCard>

                <IonCard className="ion-margin-horizontal stamp-card">
                    <IonCardContent>
                        <IonGrid>
                            <IonRow className="ion-justify-content-center">
                                {stampSlots.slice(0, 5)}
                            </IonRow>
                            <IonRow className="ion-justify-content-center ion-margin-top">
                                {stampSlots.slice(5, 10)}
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>

                <IonCard className="ion-margin-horizontal ion-margin-bottom">
                    <IonCardContent>
                        <IonText color="dark">
                            <h3>How It Works:</h3>
                        </IonText>
                        <ul>
                            <li>Earn **1 Stamp** for every **completed order** (delivery or pick-up).</li>
                            <li>Collect **{rewardGoal} stamps** to unlock a free standard drink of your choice.</li>
                            <li>Stamps reset to zero upon redemption, starting your journey to the next reward!</li>
                            <li>Your **{tier}** status grants you early access to new seasonal drinks.</li>
                        </ul>
                    </IonCardContent>
                </IonCard>

            </IonContent>
        </IonPage>
    );
};

export default Loyalty;
