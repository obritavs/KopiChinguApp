import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonNote, IonButton, IonIcon, IonInput,
    IonRadioGroup, IonRadio, IonTextarea, IonText, IonSelect, IonSelectOption,
    IonModal,
    IonToggle, 
    IonAlert,
} from "@ionic/react";
import {
    locationOutline, cardOutline, checkmarkCircleOutline, walletOutline,
    bagHandleOutline, star, arrowForward, closeOutline, walkOutline, bicycleOutline,
    documentTextOutline, peopleOutline
} from "ionicons/icons";
import Header from "../components/Header";
import { useCart } from '../context/CartContext';

import { auth, db } from '../firebase-config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

import { useStripe, useElements, Elements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import "./Checkout.css";

const stripePromise = loadStripe("pk_test_51SR1BL6LLtokdsnyJ//P4ECwazog9xhco0HDmlc9UMwE6fjGFdUA4SfGGU90DEn6FrcdcW23yFTEyhQkS1yN"); 

const qcBarangays = [
    "Select Barangay...",
    "Bagumbayan","Cubao", "Diliman",
    "Kamuning", "Katipunan", "Loyola Heights",
    "Project 4", 
];

const CheckoutForm: React.FC = () => {
    const history = useHistory();
    const { cartItems, clearCart } = useCart();

    const stripe = useStripe();
    const elements = useElements();

    const [selectedOrderType] = useState<'pickup' | 'delivery'>(
        (localStorage.getItem('kopiChinguSelectedOrderType') as 'pickup' | 'delivery') || 'delivery'
    );
    const isDelivery = selectedOrderType === 'delivery';

    const [paymentMethod, setPaymentMethod] = useState<string>("card");
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("Select Barangay...");
    const [cardholderName, setCardholderName] = useState<string>("");
    
    // 💡 DISCOUNT STATE
    const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
    const [seniorCitizenID, setSeniorCitizenID] = useState("");
    const [seniorCardImage, setSeniorCardImage] = useState<File | null>(null);
    const [seniorCardPreview, setSeniorCardPreview] = useState<string | null>(null);
    
    // 💡 VOUCHER STATE
    const [voucherCodeInput, setVoucherCodeInput] = useState("");
    const [appliedVoucherDiscount, setAppliedVoucherDiscount] = useState(0); 
    const [showVoucherAlert, setShowVoucherAlert] = useState(false);
    const [voucherMessage, setVoucherMessage] = useState("");


    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const deliveryFee = isDelivery ? 50 : 0; 
   
    const seniorCitizenDiscount = isSeniorCitizen ? subtotal * 0.20 : 0;
    const seniorDiscountValue = parseFloat(seniorCitizenDiscount.toFixed(2));

    const finalDiscount = isSeniorCitizen ? seniorDiscountValue : appliedVoucherDiscount;

    const totalAfterDiscount = subtotal - finalDiscount;

    const total = totalAfterDiscount + deliveryFee;

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            if (user.displayName) {
                setName(user.displayName);
            }

            const fetchUserProfile = async () => {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();

                        if (data.contact) {
                            setContact(data.contact);
                        }

                        if (isDelivery) {
                            if (data.address) {
                                setAddress(data.address);
                            }
                          
                            if (data.city && qcBarangays.includes(data.city)) {
                                setCity(data.city);
                            } else {
                                setCity("Select Barangay...");
                            }
                        } else {
                            // Clear address fields if switching to Pick-up (as they are not needed)
                            setAddress(""); 
                            setCity("Select Barangay...");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            };

            fetchUserProfile();
        }
    }, [isDelivery]); 

  
    const handleApplyVoucher = () => {
        const code = voucherCodeInput.toUpperCase().trim();
        
       
        setAppliedVoucherDiscount(0);

        if (code === "") {
            setVoucherMessage("Please enter a voucher code.");
            setShowVoucherAlert(true);
            return;
        }
        if (isSeniorCitizen) {
            setVoucherMessage("Cannot use a voucher with the Senior Citizen discount. Please turn off the Senior Citizen discount to use a voucher.");
            setShowVoucherAlert(true);
            return;
        }
        
       
        let discount = 0;
        let successMessage = "";

        
            if (code === "KOPI100") {
            discount = 100.00; 
            successMessage = "Voucher 'KOPI100' applied successfully! You received ₱100.00 off.";
        } else if (code === "FREEDEL") {
            discount = 50.00; 
            successMessage = "Voucher 'FREEDEL' applied successfully! You received ₱50.00 off.";
        } else if (code === "KOPI20") {
            discount = subtotal * 0.20; 
            successMessage = "Voucher 'CHINGU20' applied successfully! You received 20% off your subtotal.";
        } else {
            setVoucherMessage(`Voucher code '${code}' is invalid or expired.`);
            setShowVoucherAlert(true);
            return;
        }

        setAppliedVoucherDiscount(discount);
        setVoucherMessage(successMessage);
        setShowVoucherAlert(true);
    };


    const saveOrderToFirestore = async (status: 'Paid' | 'Pending') => {
        const user = auth.currentUser;
        if (!user) return;
    
        const actualDiscountType = isSeniorCitizen 
            ? 'Senior Citizen (20%)' 
            : (appliedVoucherDiscount > 0 ? `Voucher (${voucherCodeInput.toUpperCase()})` : 'None');

        const orderData = {
            userId: user.uid,
            userName: user.displayName || name,
            userEmail: user.email,
            
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totals: {
                subtotal: subtotal,
                deliveryFee: deliveryFee, 
            
                discountApplied: finalDiscount,
                discountType: actualDiscountType,
                total: total 
            },
            shipping: { 
                name, 
                contact, 
                address: isDelivery ? address : 'N/A (Pickup)', 
                city: isDelivery ? city : 'N/A (Pickup)' 
            },
            status: status,
            orderType: selectedOrderType, 
        };

        try {
            const ordersCollectionRef = collection(db, 'orders');
            await addDoc(ordersCollectionRef, {
                ...orderData,
                timestamp: serverTimestamp(),
            });
            console.log("Order successfully saved to Firestore!");
            setShowModal(true);
        } catch (error) {
            console.error("Failed to place order and save to Firestore:", error);
            alert("Error placing order. Please check console for details.");
        }
    }

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty! Add items before checking out.");
            history.push('/page/Shop');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to place an order.");
            history.push('/login');
            return;
        }

        if (!name || !contact) {
            alert("Please fill in your Name and Contact Number.");
            return;
        }
        
        if (isSeniorCitizen) {
    if (seniorCitizenID.trim().length < 5) {
        alert("Please provide a valid Senior Citizen ID number.");
        return;
    }
    if (!seniorCardImage) {
        alert("Please upload a photo of your Senior Citizen Card to apply the discount.");
        return;
    }
}

        if (isDelivery) {
            if (!address || city === "Select Barangay...") {
                alert("Please fill in all delivery address details, including selecting a Barangay.");
                return;
            }
        }
        
       
        if (paymentMethod === 'card' && (!cardholderName || !elements?.getElement(CardElement))) {
            alert("Please fill in the cardholder name and card details.");
            return;
        }


        if (paymentMethod === 'cod') {
            await saveOrderToFirestore('Pending');
        } else if (paymentMethod === 'card') {
            console.log("Card payment method selected. BYPASSING external payment process and forcing 'Paid' status.");

            try {
                await saveOrderToFirestore('Paid');
            } catch (error) {
                console.error("Failed to save 'Paid' order to Firestore:", error);
                alert("Error placing order. Please check console for details.");
            }
        }
    };
    
    const handleModalDismiss = () => {
        setShowModal(false);
        clearCart();
        history.push('/page/Orders');
    };
    
    if (cartItems.length === 0 && !showModal) {
        return (
            <IonPage className="checkout-page">
                <Header title="Checkout" />
          
                <IonContent className="ion-padding ion-text-center checkout-content"> 
                    <IonText color="tertiary">
                        <h2 className="ion-padding-top">Cart is empty!</h2>
                        <p>You need to add items to proceed to checkout.</p>
                    </IonText>
                    <IonButton 
                        routerLink="/page/Shop" 
                        color="tertiary" 
                        className="ion-margin-top"
                    >
                        Go to Shop
                    </IonButton>
                </IonContent>
            </IonPage>
        );
    }
    
    return (
      
        <IonPage className="checkout-page">
            <Header title="Checkout" />
          
            <IonContent className="ion-padding checkout-content">
             
                <IonCard className="ion-margin-bottom">
                    <IonCardHeader>
                        <IonIcon 
                            icon={isDelivery ? locationOutline : bagHandleOutline} 
                            slot="start" 
                            color="primary" 
                        />
                        <IonCardTitle className="ion-padding-start">
                            {isDelivery ? "Delivery Address" : "Pick-up Details"}
                            <IonNote color="tertiary" style={{fontSize: '0.9em', marginLeft: '5px', fontWeight: 'bold'}}>
                                ({selectedOrderType.toUpperCase()})
                            </IonNote>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList lines="full" className="ion-no-padding">
                            <IonItem>
                                <IonLabel position="stacked">Name</IonLabel>
                                <IonInput 
                                    value={name} 
                                    onIonChange={e => setName(e.detail.value!)} 
                                    required
                                    placeholder="Enter full name"
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position="stacked">{isDelivery ? "Contact Number" : "Contact Number for Notification"}</IonLabel>
                                <IonInput 
                                    value={contact} 
                                    onIonChange={e => setContact(e.detail.value!)} 
                                    type="tel" 
                                    required
                                    placeholder="e.g., 0917xxxxxxx"
                                />
                            </IonItem>
                      
                            {isDelivery && (
                                <>
                                    <IonItem>
                                        <IonLabel position="stacked">Street / House No. / Building</IonLabel>
                                        <IonTextarea 
                                            rows={2} 
                                            value={address} 
                                            onIonChange={e => setAddress(e.detail.value!)} 
                                            required
                                            placeholder="Street, house/unit number, building name"
                                        />
                                    </IonItem>
                                    
                                    <IonItem color="light"> 
                                        <IonLabel position="stacked">Barangay</IonLabel>
                                        <IonSelect 
                                            value={city} 
                                            onIonChange={e => setCity(e.detail.value)}
                                            interface="popover" 
                                            placeholder="Select your Barangay"
                                        >
                                            {qcBarangays.map((b) => (
                                                <IonSelectOption key={b} value={b} disabled={b === "Select Barangay..."}>
                                                    {b === "Select Barangay..." ? b : `${b}`}
                                                </IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </IonItem>
                                </>
                            )}
                            
                         
                            {!isDelivery && (
                                <IonItem lines="none" className="ion-margin-top" color="light">
                                    <IonIcon icon={walkOutline} slot="start" color="tertiary" />
                                    <IonLabel className="ion-text-wrap" color="medium">
                                        Your order will be prepared for Pick-up at the counter. We'll notify you via the contact number provided when it's ready.
                                    </IonLabel>
                                </IonItem>
                            )}
                        </IonList>
                    </IonCardContent>
                </IonCard>

       
                <IonCard className="ion-margin-bottom">
                    <IonCardHeader>
                        <IonIcon icon={peopleOutline} slot="start" color="primary" />
                        <IonCardTitle className="ion-padding-start">Discount / Voucher</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList lines="full" className="ion-no-padding">
                            
                
                            <IonItem>
                                <IonLabel>Senior Citizen (20% Off Subtotal)</IonLabel>
                                <IonToggle 
                                    slot="end" 
                                    checked={isSeniorCitizen} 
                                    onIonChange={e => {
                                        setIsSeniorCitizen(e.detail.checked);
                                        
                                        if (!e.detail.checked) setSeniorCitizenID(""); 
                                        setAppliedVoucherDiscount(0);
                                        setVoucherCodeInput("");
                                    }} 
                                    color="tertiary"
                                />
                            </IonItem>

                          {isSeniorCitizen && (
    <>
        <IonItem>
            <IonIcon icon={documentTextOutline} slot="start" color="medium" />
            <IonLabel position="stacked">Senior Citizen ID No.</IonLabel>
            <IonInput 
                value={seniorCitizenID} 
                onIonChange={e => setSeniorCitizenID(e.detail.value!)} 
                placeholder="Enter 10-digit ID"
                type="text"
                required
                inputmode="numeric"
                maxlength={10}
            />
        </IonItem>

        <IonItem>
            <IonLabel position="stacked">Upload Senior Citizen Card (Front)</IonLabel>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSeniorCardImage(file);
                    if (file) {
                        const previewURL = URL.createObjectURL(file);
                        setSeniorCardPreview(previewURL);
                    }
                }}
                style={{ marginTop: "8px" }}
            />

                                {seniorCardPreview && (
                                    <div style={{
                                        marginTop: "10px",
                                        textAlign: "center",
                                        width: "100%"
                                    }}>
                                        <IonText color="medium" style={{ fontSize: "0.9em" }}>
                                            Preview:
                                        </IonText>
                                        <img
                                            src={seniorCardPreview}
                                            alt="Senior Card Preview"
                                            style={{
                                                display: "block",
                                                margin: "8px auto",
                                                maxWidth: "200px",
                                                borderRadius: "8px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                            }}
                                        />
                                    </div>
                                )}
                            </IonItem>
                        </>
                    )}

                            <IonItem className="ion-margin-top" lines="none" color="light">
                                <IonIcon icon={documentTextOutline} slot="start" color="medium" />
                                <IonLabel position="stacked">Voucher / Promo Code</IonLabel>
                                <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
                                    <IonInput 
                                        value={voucherCodeInput} 
                                        onIonChange={e => setVoucherCodeInput(e.detail.value!)} 
                                        placeholder="Enter code"
                                        disabled={isSeniorCitizen} 
                                        style={{ flexGrow: 1 }}
                                    />
                                    <IonButton 
                                        
                                        onClick={handleApplyVoucher}
                                        disabled={isSeniorCitizen}
                                        color="tertiary" 
                                        style={{ minWidth: '100px' }} 
                                    >
                                        Apply
                                    </IonButton>
                                </div>
                               
                                {(appliedVoucherDiscount > 0 && !isSeniorCitizen) && (
                                    <IonNote color="success" className="ion-text-wrap ion-padding-top" style={{ display: 'block' }}>
                                        Applied: ₱ {appliedVoucherDiscount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                    </IonNote>
                                )}
                                {isSeniorCitizen && (
                                     <IonNote color="medium" className="ion-text-wrap ion-padding-top" style={{ display: 'block' }}>
                                        (Voucher disabled when Senior Citizen is active)
                                    </IonNote>
                                )}
                            </IonItem>
                            
                        </IonList>
                    </IonCardContent>
                </IonCard>
                
                <IonCard className="ion-margin-bottom">
                    <IonCardHeader>
                        <IonIcon icon={cardOutline} slot="start" color="primary" />
                        <IonCardTitle className="ion-padding-start">Payment Method</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonRadioGroup value={paymentMethod} onIonChange={e => setPaymentMethod(e.detail.value)}>
                            <IonItem><IonLabel>Credit/Debit Card</IonLabel><IonRadio slot="start" value="card" color="tertiary" /></IonItem>
                            <IonItem><IonLabel>Cash on {isDelivery ? 'Delivery' : 'Pick-up'}</IonLabel><IonRadio slot="start" value="cod" color="tertiary" /></IonItem>
                        </IonRadioGroup>

                        
                        {paymentMethod === 'card' && (
                            <>
                                <IonList lines="full" className="ion-no-padding ion-margin-top">
                                    <IonItem>
                                        <IonLabel position="stacked">Cardholder Name</IonLabel>
                                        <IonInput 
                                            value={cardholderName} 
                                            onIonChange={e => setCardholderName(e.detail.value!)} 
                                            required 
                                        />
                                    </IonItem>
                                    
                                    <IonItem>
                                      
                                        <div className="card-details-container">
                                            <IonLabel position="stacked" className="ion-padding-bottom">Card Details</IonLabel>
                                            <CardElement 
                                                options={{ 
                                                    style: { 
                                                        base: { 
                                                            fontSize: '16px',
                                                            '::placeholder': { color: '#888' }
                                                        } 
                                                    } 
                                                }} 
                                            />
                                        </div>
                                    </IonItem>
                                </IonList>
                                
                                <IonNote className="ion-padding-top ion-text-center" style={{ display: 'block', fontSize: '0.8em', color: '#6772E5' }}>
                                    Secured by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#6772E5', fontWeight: 'bold' }}>Stripe</a>
                                </IonNote>
                            </>
                        )}
                    </IonCardContent>
                </IonCard>

                <IonCard className="ion-margin-bottom">
                    <IonCardHeader>
                        <IonIcon icon={walletOutline} slot="start" color="primary" />
                        <IonCardTitle className="ion-padding-start">Order Summary</IonCardTitle>
                    </IonCardHeader>
                    <IonList lines="none">
                        <IonItem><IonLabel>Items ({cartItems.length})</IonLabel><IonNote slot="end">₱ {subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</IonNote></IonItem>
                        
                     
                        {finalDiscount > 0 && (
                            <IonItem color="secondary">
                                <IonLabel>
                                    <strong>
                                        {isSeniorCitizen ? 'Senior Citizen Discount (20%)' : `Voucher Discount (${voucherCodeInput.toUpperCase()})`}
                                    </strong>
                                </IonLabel>
                                <IonNote slot="end" color="danger">
                                    - ₱ {finalDiscount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </IonNote>
                            </IonItem>
                        )}
                        
                     
                        <IonItem>
                            <IonLabel>{isDelivery ? 'Delivery Fee' : 'Pick-up Fee'}</IonLabel>
                            <IonNote slot="end">
                                ₱ {deliveryFee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </IonNote>
                        </IonItem>

                   
                        <IonItem color="light" className="checkout-total-row">
                            <IonLabel><strong>Total Payment</strong></IonLabel>
                            <IonNote slot="end" color="success"><strong>₱ {total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></IonNote>
                        </IonItem>
                    </IonList>
                </IonCard>
                
                <IonButton
                    expand="full"
                    color="success"
                    className="ion-margin-top"
                    onClick={handlePlaceOrder}
                >
                    <IonIcon slot="start" icon={checkmarkCircleOutline} />
                    {`Place Order (₱ ${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })})`}
                </IonButton>
                
              
                <div style={{ height: '80px' }} />
                
            </IonContent>

            <IonAlert
                isOpen={showVoucherAlert}
                onDidDismiss={() => setShowVoucherAlert(false)}
                header={voucherMessage.includes("successfully") ? 'Success' : 'Notice'}
                message={voucherMessage}
                buttons={['OK']}
            />

            <IonModal 
                isOpen={showModal} 
                onDidDismiss={handleModalDismiss} 
                initialBreakpoint={1} 
                breakpoints={[0, 1]}
            >
                <IonContent className="ion-padding ion-text-center">
                    
                    <div className="ion-text-end">
                        <IonButton fill="clear" color="medium" onClick={handleModalDismiss}>
                            <IonIcon slot="icon-only" icon={closeOutline} />
                        </IonButton>
                    </div>

                    <div className="ion-padding-vertical">
                        <IonIcon 
                            icon={checkmarkCircleOutline} 
                            color="success" 
                            style={{ fontSize: '8em' }} 
                        />
                    </div>
                    
                    <IonCardTitle className="ion-padding-bottom">
                        Order Confirmed!
                    </IonCardTitle>
                    
                    <IonText color="medium">
                        <p style={{ maxWidth: '80%', margin: '0 auto 20px' }}>
                            Thank you for ordering from Kopi Chingu Café. Your order is now being prepared for {selectedOrderType}!
                        </p>
                    </IonText>

                    <IonCard className="ion-text-start ion-margin-top">
                        <IonCardContent>
                            <IonList lines="none">
                                <IonItem>
                                    <IonIcon icon={bagHandleOutline} slot="start" color="tertiary" />
                                    <IonLabel>Order Status</IonLabel>
                                    <IonNote slot="end" color={paymentMethod === 'card' ? 'success' : 'warning'}>
                                        {paymentMethod === 'card' ? 'PAID' : `PENDING (${isDelivery ? 'COD' : 'COP'})`}
                                    </IonNote>
                                </IonItem>
                                
                                <IonItem>
                                    <IonIcon icon={walletOutline} slot="start" color="tertiary" />
                                    <IonLabel>Total Amount</IonLabel>
                                    <IonNote slot="end" color="dark">
                                        ₱ {total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                    </IonNote>
                                </IonItem>
                                
                                <IonItem lines="full">
                                    <IonIcon icon={isDelivery ? locationOutline : walkOutline} slot="start" color="tertiary" />
                                    <IonLabel>{isDelivery ? "Deliver To" : "Pick-up Location"}</IonLabel>
                                    <IonNote slot="end" className="ion-text-wrap">
                                        {isDelivery ? `${address}, ${city}, QC` : 'Kopi Chingu Counter'}
                                    </IonNote>
                                </IonItem>

                                <IonItem>
                                    <IonIcon icon={star} slot="start" color="tertiary" />
                                    <IonLabel>Est. {isDelivery ? "Delivery Time" : "Ready Time"}</IonLabel>
                                    <IonNote slot="end" color="primary">
                                        {isDelivery ? '45 - 60 mins' : '15 - 20 mins'}
                                    </IonNote>
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>

                    <IonButton
                        expand="full"
                        color="tertiary"
                        className="ion-margin-top"
                        onClick={handleModalDismiss}
                    >
                        Track My Order
                        <IonIcon slot="end" icon={arrowForward} />
                    </IonButton>

                </IonContent>
            </IonModal>
            
        </IonPage>
    );
};

const Checkout: React.FC = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default Checkout;
