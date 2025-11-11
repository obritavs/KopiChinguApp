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
import React from 'react';
import Header from '../components/Header'; 
import './Loyalty.css';


// Define the expected properties for the Loyalty component
interface LoyaltyProps {
    currentStamps: number;
    tier: string;
    rewardGoal: number;
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

// --- LOYALTY PAGE COMPONENT ---

// Component now accepts props
const Loyalty: React.FC<LoyaltyProps> = ({ currentStamps = 0, rewardGoal = 10, tier = 'Regular' }) => {
    // Note: I set default values for robustness, but you should ensure they are provided when used.

    const stampsToGoal = rewardGoal - currentStamps;
    
    // Create an array of stamp slots based on the goal
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

    return (
        <IonPage>
            <Header title="Stamp Card Loyalty" />

            <IonContent className="loyalty-content">

                {/* --- Current Status Card --- */}
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
                        <p>Total {currentStamps}/{rewardGoal} collected</p>
                    </IonCardContent>
                </IonCard>

                {/* --- Stamp Grid Visualization --- */}
                <IonCard className="ion-margin-horizontal stamp-card">
                    <IonCardContent>
                        <IonGrid>
                            {/* Row 1: Stamps 1-5 */}
                            <IonRow className="ion-justify-content-center">
                                {stampSlots.slice(0, 5)}
                            </IonRow>
                            {/* Row 2: Stamps 6-10 */}
                            <IonRow className="ion-justify-content-center ion-margin-top">
                                {stampSlots.slice(5, 10)}
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>

                {/* --- Program Details --- */}
                <IonCard className="ion-margin-horizontal ion-margin-bottom">
                    <IonCardContent>
                        <IonText color="dark">
                            <h3>How It Works:</h3>
                        </IonText>
                        <ul>
                            <li>Earn 1 Stamp for every coffee drink purchase (any size).</li>
                            <li>Collect {rewardGoal} stamps to unlock a free standard drink of your choice.</li>
                            <li>Stamps reset to zero upon redemption, starting your journey to the next reward!</li>
                            <li>Your {tier} status grants you early access to new seasonal drinks.</li>
                        </ul>
                    </IonCardContent>
                </IonCard>

            </IonContent>
        </IonPage>
    );
};

export default Loyalty;
