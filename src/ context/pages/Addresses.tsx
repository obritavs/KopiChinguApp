import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    useIonRouter
} from "@ionic/react";
import { 
    locationOutline, 
    addOutline, 
    createOutline, 
    trashOutline 
} from "ionicons/icons";
import React, { useState } from "react";
import Header from "../components/Header"; 

// --- 1. Address Data Structure ---

interface Address {
    id: number;
    title: string;
    street: string;
    city: string;
    zip: string;
    notes?: string;
}

// Mock Data
const initialAddresses: Address[] = [
    { 
        id: 1, 
        title: "Home (Primary)", 
        street: "123 Cherry Blossom Lane", 
        city: "Quezon City", 
        zip: "1100", 
        notes: "Leave package with the guard."
    },
    { 
        id: 2, 
        title: "Office", 
        street: "Unit 501, Tech Hub Tower", 
        city: "Makati City", 
        zip: "1209",
        notes: "Deliver before 5 PM."
    },
];

// --- 2. Address Form Modal Component ---

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: Omit<Address, 'id'>, currentId?: number) => void;
    addressToEdit?: Address;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, addressToEdit }) => {
    const [title, setTitle] = useState(addressToEdit?.title || '');
    const [street, setStreet] = useState(addressToEdit?.street || '');
    const [city, setCity] = useState(addressToEdit?.city || 'Quezon City');
    const [zip, setZip] = useState(addressToEdit?.zip || '');
    const [notes, setNotes] = useState(addressToEdit?.notes || '');

    // Reset state when the modal opens/closes
    React.useEffect(() => {
        if (addressToEdit) {
            setTitle(addressToEdit.title);
            setStreet(addressToEdit.street);
            setCity(addressToEdit.city);
            setZip(addressToEdit.zip);
            setNotes(addressToEdit.notes || '');
        } else {
            // Reset for new address
            setTitle('');
            setStreet('');
            setCity('Quezon City');
            setZip('');
            setNotes('');
        }
    }, [addressToEdit, isOpen]);

    const handleSave = () => {
        if (!title || !street || !city || !zip) {
            alert("Please fill in required fields.");
            return;
        }

        const newAddressData: Omit<Address, 'id'> = { title, street, city, zip, notes };
        onSave(newAddressData, addressToEdit?.id);
        onClose();
    };

    const modalTitle = addressToEdit ? "Edit Delivery Address" : "Add New Address";

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{modalTitle}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">Address Title (e.g., Home, Work) *</IonLabel>
                        <IonInput 
                            value={title} 
                            onIonChange={e => setTitle(e.detail.value!)}
                            placeholder="My Apartment"
                            required
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Street Address / Unit No. *</IonLabel>
                        <IonTextarea 
                            value={street} 
                            onIonChange={e => setStreet(e.detail.value!)}
                            placeholder="Building name, unit, house number..."
                            rows={2}
                            required
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">City / Area *</IonLabel>
                        <IonSelect 
                            value={city} 
                            placeholder="Select City" 
                            onIonChange={e => setCity(e.detail.value!)}
                        >
                            <IonSelectOption value="Quezon City">Quezon City</IonSelectOption>
                            <IonSelectOption value="Makati City">Makati City</IonSelectOption>
                            <IonSelectOption value="Taguig City">Taguig City</IonSelectOption>
                            <IonSelectOption value="Pasig City">Pasig City</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">ZIP Code *</IonLabel>
                        <IonInput 
                            value={zip} 
                            onIonChange={e => setZip(e.detail.value!)}
                            placeholder="e.g., 1100"
                            type="number"
                            required
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Delivery Notes (Optional)</IonLabel>
                        <IonTextarea 
                            value={notes} 
                            onIonChange={e => setNotes(e.detail.value!)}
                            placeholder="Gate code, landmark, security instructions..."
                            rows={2}
                        />
                    </IonItem>
                </IonList>

                <IonButton expand="full" className="ion-margin-top" onClick={handleSave}>
                    {addressToEdit ? "Update Address" : "Save New Address"}
                </IonButton>
            </IonContent>
        </IonModal>
    );
};

// --- 3. Main Addresses Page Component ---

const Addresses: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [showModal, setShowModal] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | undefined>(undefined);

    const handleSaveAddress = (newAddressData: Omit<Address, 'id'>, currentId?: number) => {
        if (currentId) {
            // Edit existing address
            setAddresses(prev => prev.map(addr => 
                addr.id === currentId ? { ...newAddressData, id: currentId } as Address : addr
            ));
        } else {
            // Add new address
            const newId = Date.now(); // Simple ID generation
            setAddresses(prev => [...prev, { ...newAddressData, id: newId } as Address]);
        }
    };

    const handleEditClick = (address: Address) => {
        setAddressToEdit(address);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setAddressToEdit(undefined); // Clear address to edit
    }

    return (
        <IonPage>
            <Header title="Saved Addresses" />

            <IonContent fullscreen>
                {/* Button to Add New Address */}
                <IonButton 
                    expand="block" 
                    fill="outline" 
                    className="ion-padding ion-margin"
                    onClick={() => { setAddressToEdit(undefined); setShowModal(true); }}
                >
                    <IonIcon icon={addOutline} slot="start" />
                    Add New Address
                </IonButton>

                <IonList lines="full">
                    {addresses.length === 0 ? (
                        <IonItem>
                            <IonLabel color="medium">No saved addresses. Add one to speed up checkout!</IonLabel>
                        </IonItem>
                    ) : (
                        addresses.map(address => (
                            <IonItem key={address.id}>
                                <IonIcon slot="start" icon={locationOutline} color="primary" />
                                <IonLabel>
                                    <h2>{address.title}</h2>
                                    <p>{address.street}, {address.city} {address.zip}</p>
                                    {address.notes && <p className="ion-text-wrap ion-text-sm" color="medium">Note: {address.notes}</p>}
                                </IonLabel>
                                <IonButton 
                                    slot="end" 
                                    fill="clear" 
                                    color="medium" 
                                    onClick={() => handleEditClick(address)}
                                >
                                    <IonIcon icon={createOutline} />
                                </IonButton>
                                <IonButton 
                                    slot="end" 
                                    fill="clear" 
                                    color="danger" 
                                    onClick={() => handleDelete(address.id)}
                                >
                                    <IonIcon icon={trashOutline} />
                                </IonButton>
                            </IonItem>
                        ))
                    )}
                </IonList>
            </IonContent>

            {/* Address Modal */}
            <AddressModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSave={handleSaveAddress}
                addressToEdit={addressToEdit}
            />
        </IonPage>
    );
};

export default Addresses;
