import React from "react";
import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonIcon,
    IonCard,
    IonButtons,
    useIonRouter,
} from "@ionic/react";
import {
    addCircle,
    removeCircle,
    trashOutline,
    walletOutline,
} from "ionicons/icons";
import "./Page.css";
import Header from "../components/Header";
import { useCart } from '../context/CartContext'; 

import { auth } from '../firebase-config'; 

const Cart: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart } = useCart(); 
    const router = useIonRouter(); 

    const handleAdd = (id: number) => {
        updateQuantity(id, 1);
    };

    const handleRemove = (id: number) => {
        updateQuantity(id, -1);
    };

    const handleDelete = (id: number) => {
        removeFromCart(id);
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const deliveryFee = 50;
    const total = subtotal + deliveryFee;
    const handleCheckout = () => {
        if (auth.currentUser) {
            router.push('/page/Checkout');
        } else {
            alert("Please log in or sign up to proceed to checkout."); 
            router.push('/login');
        }
    };


    return (
        <IonPage>
            <Header title="My Cart" />

            <IonContent className="ion-padding">
                <IonCard>
                    <IonList>
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <IonItem key={item.id}> 
                                    <IonLabel>
                                        <h2>{item.name}</h2>
                                        <p>
                                            ₱ {(item.price * item.quantity).toLocaleString("en-PH", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                    </IonLabel>
                                    <IonButtons slot="end">
                                        <IonButton
                                            fill="clear"
                                            size="small"
                                            color="medium"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            <IonIcon icon={removeCircle} />
                                        </IonButton>
                                        <IonNote className="ion-padding-horizontal">
                                            {item.quantity}
                                        </IonNote>
                                        <IonButton
                                            fill="clear"
                                            size="small"
                                            color="primary"
                                            onClick={() => handleAdd(item.id)}
                                        >
                                            <IonIcon icon={addCircle} />
                                        </IonButton>
                                        <IonButton
                                            fill="clear"
                                            size="small"
                                            color="danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <IonIcon icon={trashOutline} />
                                        </IonButton>
                                    </IonButtons>
                                </IonItem>
                            ))
                        ) : (
                            <IonItem>
                                <IonLabel className="ion-text-center">
                                    <h2>Your cart is empty 🛒</h2>
                                </IonLabel>
                            </IonItem>
                        )}
                    </IonList>
                </IonCard>

                {cartItems.length > 0 && (
                    <>
                     
                        <IonCard className="ion-margin-top">
                            <IonItem>
                                <IonLabel>Subtotal</IonLabel>
                                <IonNote slot="end">
                                    ₱ {subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </IonNote>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Delivery Fee</IonLabel>
                                <IonNote slot="end">
                                    ₱ {deliveryFee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </IonNote>
                            </IonItem>
                            <IonItem>
                                <IonLabel><strong>Total</strong></IonLabel>
                                <IonNote slot="end" color="success">
                                    <strong>
                                        ₱ {total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                    </strong>
                                </IonNote>
                            </IonItem>
                        </IonCard>

                        <IonButton
                            expand="full"
                            color="success"
                            className="ion-margin-top"
                            onClick={handleCheckout} 
                        >
                            <IonIcon slot="start" icon={walletOutline} />
                            Proceed to Checkout
                        </IonButton>
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Cart;
