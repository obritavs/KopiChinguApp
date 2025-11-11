import {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonAvatar, 
    IonText,
    IonRow,
    IonCol,
    IonGrid,
    useIonRouter,
    IonModal, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonInput, 
    IonItemDivider,
    IonNote, 
    IonSpinner 
} from "@ionic/react";
import { 
    star, 
    timeOutline, 
    locationOutline, 
    logOutOutline, 
    personCircleOutline,
    createOutline,
    cameraOutline,
    informationCircleOutline
} from "ionicons/icons";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Account.css"; 
import Header from "../components/Header"; 
import { auth, storage, db } from '../firebase-config'; 
import { onAuthStateChanged, signOut, User, updateProfile } from 'firebase/auth'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 


interface UserProfile {
    uid: string;
    name: string;
    email: string;
    stamps: number;
    orders: number;
    tier: string;
    photoURL?: string; 
    firstName: string; 
    lastName: string;
    phoneNumber: string; 
}

const defaultUser: UserProfile = {
    uid: '',
    name: 'Guest User',
    email: 'Please log in',
    stamps: 0,
    orders: 0,
    tier: 'Bronze',
    photoURL: undefined,
    firstName: 'Guest',
    lastName: 'User',
    phoneNumber: 'N/A',
};

// 💡 NEW Interface for the details update handler
interface DetailUpdates {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}


const useAuth = () => {
    const router = useIonRouter();
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>(defaultUser);

    const fetchCustomProfileData = useCallback(async (user: User) => {
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        let dbData = { firstName: '', lastName: '', phoneNumber: '' };

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                dbData.firstName = data.firstName || displayName;
                dbData.lastName = data.lastName || '';
                dbData.phoneNumber = data.phoneNumber || 'N/A';
            } else {
                 dbData.firstName = displayName;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            dbData.firstName = displayName;
        }

        setUserProfile({
            uid: user.uid,
            name: displayName,
            email: user.email || 'N/A',
            stamps:0, 
            orders: 0,
            tier: 'Regular', 
            photoURL: user.photoURL || undefined, 
            firstName: dbData.firstName,
            lastName: dbData.lastName,
            phoneNumber: dbData.phoneNumber,
        });
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);

            if (user) {
                fetchCustomProfileData(user);
            } else {
                setUserProfile(defaultUser);
            }
        });
        return () => unsubscribe();
    }, [fetchCustomProfileData]);

    // Function to update Firebase Auth profile, local state, and Firestore Display Name/Photo
    const handleProfileUpdate = async (newName: string, photoFile?: File) => {
        if (!firebaseUser) return;

        let newPhotoURL = firebaseUser.photoURL;

        if (photoFile) {
            console.log('Uploading photo to Firebase Storage...');
            try {
                const storageRef = ref(storage, `profile_pictures/${firebaseUser.uid}/${photoFile.name}`);
                const snapshot = await uploadBytes(storageRef, photoFile);
                newPhotoURL = await getDownloadURL(snapshot.ref);
                console.log('Photo uploaded. URL:', newPhotoURL);
            } catch (error) {
                console.error('Photo upload failed:', error);
                newPhotoURL = firebaseUser.photoURL;
            }
        }
        
        // Simple name splitting for database consistency (assumes first word is first name)
        const parts = newName.trim().split(' ');
        const newFirstName = parts[0];
        const newLastName = parts.slice(1).join(' ') || '';


        try {
            // 1. Update Firebase Auth profile
            await updateProfile(firebaseUser, { 
                displayName: newName, 
                photoURL: newPhotoURL 
            });
            
            // 2. Update the corresponding Firestore document
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userDocRef, {
                firstName: newFirstName,
                lastName: newLastName, 
                photoURL: newPhotoURL,
            });

            // 3. Update local state immediately
            setUserProfile(prev => ({
                ...prev,
                name: newName,
                firstName: newFirstName,
                lastName: newLastName,
                photoURL: newPhotoURL || undefined,
            }));

            console.log('Profile updated successfully!');
            
        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };
    
    // 💡 NEW: Function to update Firestore Details (First Name, Last Name, Phone Number)
    const handleDetailsUpdate = async (updates: DetailUpdates) => {
        if (!firebaseUser) return;

        try {
            // Update Firestore document
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userDocRef, {
                firstName: updates.firstName,
                lastName: updates.lastName,
                phoneNumber: updates.phoneNumber,
            });
            
            // Update local state
            setUserProfile(prev => ({
                ...prev,
                firstName: updates.firstName,
                lastName: updates.lastName,
                phoneNumber: updates.phoneNumber,
            }));

            // If the user name was derived from the firstName, update Auth display name too
            const newDisplayName = `${updates.firstName} ${updates.lastName}`.trim();
            if (newDisplayName && newDisplayName !== firebaseUser.displayName) {
                await updateProfile(firebaseUser, { displayName: newDisplayName });
                setUserProfile(prev => ({
                    ...prev,
                    name: newDisplayName,
                }));
            }
            
            console.log('Personal details updated successfully!');

        } catch (error) {
            console.error('Details update failed:', error);
            // Optionally show error to user
        }
    };


    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.setItem("user_logged_in", "false"); 
            router.push('/login', 'root', 'replace');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return { user: userProfile, firebaseUser, logout, handleProfileUpdate, handleDetailsUpdate }; // 💡 Export new handler
};

// --- EDIT PROFILE MODAL COMPONENT (FOR DISPLAY NAME AND PHOTO) ---

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onSave: (newName: string, photoFile?: File) => void;
}

const EditProfileModal: React.FC<EditModalProps> = ({ isOpen, onClose, currentName, onSave }) => {
    const [newName, setNewName] = useState(currentName);
    const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        setNewName(currentName);
        setPhotoFile(undefined); 
    }, [currentName, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
        }
    };

    const handleSave = async () => {
        if (!newName.trim()) return;

        setIsSaving(true);
        await onSave(newName.trim(), photoFile); 
        setIsSaving(false);
        onClose();
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Display Name & Photo</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose} disabled={isSaving}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    
                    {/* --- Photo Upload Section --- */}
                    <IonItem lines="none" className="ion-margin-bottom">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <IonButton 
                            expand="full" 
                            fill="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                        >
                            <IonIcon icon={cameraOutline} slot="start" />
                            {photoFile ? `Selected: ${photoFile.name}` : "Upload New Profile Photo"}
                        </IonButton>
                    </IonItem>
                    
                    {/* --- Name Input Section --- */}
                    <IonItem>
                        <IonLabel position="stacked">Display Name</IonLabel>
                        <IonInput 
                            value={newName} 
                            placeholder="Enter your new name"
                            onIonChange={(e) => setNewName(e.detail.value!)}
                            clearInput
                            disabled={isSaving}
                        />
                    </IonItem>
                    
                    <IonItemDivider>
                        <IonLabel>
                            <IonNote>This updates your public display name.</IonNote>
                        </IonLabel>
                    </IonItemDivider>

                    <IonButton 
                        expand="full" 
                        className="ion-margin-top" 
                        onClick={handleSave} 
                        disabled={!newName.trim() || isSaving}
                    >
                        {isSaving ? <IonSpinner name="dots" /> : "Save Changes"}
                    </IonButton>
                </IonList>
            </IonContent>
        </IonModal>
    );
};


// --- 💡 NEW: EDIT DETAILS MODAL COMPONENT (FOR FIRESTORE FIELDS) ---

interface EditDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    onSave: (updates: DetailUpdates) => void;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setPhoneNumber(user.phoneNumber);
        }
    }, [user, isOpen]);

    const handleSave = async () => {
        if (!firstName.trim()) return; // Must have a first name

        setIsSaving(true);
        await onSave({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim(),
        });
        setIsSaving(false);
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Saved Details</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose} disabled={isSaving}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    
                    <IonItem>
                        <IonLabel position="stacked">First Name *</IonLabel>
                        <IonInput 
                            value={firstName} 
                            onIonChange={(e) => setFirstName(e.detail.value!)}
                            disabled={isSaving}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Last Name</IonLabel>
                        <IonInput 
                            value={lastName} 
                            onIonChange={(e) => setLastName(e.detail.value!)}
                            disabled={isSaving}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Phone Number</IonLabel>
                        <IonInput 
                            value={phoneNumber} 
                            onIonChange={(e) => setPhoneNumber(e.detail.value!)}
                            type="tel"
                            placeholder="(555) 555-5555"
                            disabled={isSaving}
                        />
                    </IonItem>

                    <IonItemDivider>
                        <IonLabel>
                            <IonNote>Updates saved contact information in the database.</IonNote>
                        </IonLabel>
                    </IonItemDivider>

                    <IonButton 
                        expand="full" 
                        className="ion-margin-top" 
                        onClick={handleSave} 
                        disabled={!firstName.trim() || isSaving}
                    >
                        {isSaving ? <IonSpinner name="dots" /> : "Save Details"}
                    </IonButton>
                </IonList>
            </IonContent>
        </IonModal>
    );
};


// --- PERSONAL DETAILS MODAL COMPONENT (WITH EDIT BUTTON) ---

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    onEditClick: () => void; // 💡 NEW Prop to open the edit modal
}

const PersonalDetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, user, onEditClick }) => {
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Account Details</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onEditClick}>
                            <IonIcon slot="icon-only" icon={createOutline} />
                        </IonButton>
                        <IonButton onClick={onClose}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList lines="full">
                    <IonItem>
                        <IonLabel>
                            <h2>First Name</h2>
                            <p>{user.firstName}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Last Name</h2>
                            <p>{user.lastName || 'Not Set'}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Phone Number</h2>
                            <p>{user.phoneNumber || 'N/A'}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Email (Auth)</h2>
                            <p>{user.email}</p>
                        </IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonModal>
    );
};


// --- ACCOUNT PAGE COMPONENT ---

const Account: React.FC = () => {
    // 💡 Added handleDetailsUpdate
    const { user, logout, firebaseUser, handleProfileUpdate, handleDetailsUpdate } = useAuth();
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false); 
    const [showDetailsEditModal, setShowDetailsEditModal] = useState(false); // 💡 NEW State

    const stampColor = user.tier === 'V.I.P.' ? 'warning' : 'medium';
    const stampProgress = user.stamps % 10; 
    
    return (
        <IonPage>
            <Header title="My Account" />

            <IonContent className="profile-content">
                
                {/* --- Profile Card --- */}
                <IonCard className="profile-header-card ion-no-margin">
                    <IonCardContent className="ion-text-center">
                        
                        <IonAvatar className="profile-avatar ion-margin-bottom">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={`${user.name}'s profile`} style={{ objectFit: 'cover' }} />
                            ) : user.name.charAt(0) !== 'G' ? (
                                <IonText color="light" style={{ fontSize: '40px' }}>
                                    {user.name.charAt(0)} 
                                </IonText>
                            ) : (
                                <IonIcon icon={personCircleOutline} size="large" />
                            )}
                        </IonAvatar>
                        
                        <IonText color="dark">
                            <h1 className="ion-no-margin">{user.name}</h1>
                        </IonText>
                        <IonText color="medium">
                            <p className="ion-no-margin">{user.email}</p>
                        </IonText>

                        <IonButton 
                            fill="clear" 
                            size="small" 
                            className="ion-margin-top" 
                            onClick={() => setShowProfileEditModal(true)}
                            disabled={!firebaseUser} 
                        >
                            <IonIcon icon={createOutline} slot="start" />
                            Edit Profile
                        </IonButton>

                    </IonCardContent>
                </IonCard>

                {/* --- Navigation List --- */}
                <IonList lines="full" className="ion-margin-top profile-nav-list">
                    
                    {/* Personal Details Item */}
                    <IonItem 
                        button 
                        detail 
                        onClick={() => setShowDetailsModal(true)}
                        disabled={!firebaseUser}
                    >
                        <IonIcon slot="start" icon={informationCircleOutline} color="secondary" />
                        <IonLabel>Personal Details</IonLabel>
                    </IonItem>

                    <IonItem button detail routerLink="/page/Loyalty">
                        <IonIcon slot="start" icon={star} color={stampColor} />
                        <IonLabel>
                            <h2>Stamp Card Loyalty</h2>
                            <p>You have {stampProgress}/10 stamps collected</p>
                        </IonLabel>
                    </IonItem>

                    <IonItem button detail routerLink="/page/Orders">
                        <IonIcon slot="start" icon={timeOutline} color="primary" />
                        <IonLabel>Order History</IonLabel>
                    </IonItem>

                    <IonItem button detail routerLink="/page/Addresses">
                        <IonIcon slot="start" icon={locationOutline} color="primary" />
                        <IonLabel>Saved Addresses</IonLabel>
                    </IonItem>
                    
                    {firebaseUser && (
                        <IonItem button className="ion-margin-top" onClick={logout}>
                            <IonIcon slot="start" icon={logOutOutline} color="danger" />
                            <IonLabel>Sign Out</IonLabel>
                        </IonItem>
                    )}
                </IonList>
                
            </IonContent>

            {/* --- Modals Render --- */}
            {/* 1. Display Name/Photo Edit Modal */}
            <EditProfileModal 
                isOpen={showProfileEditModal}
                onClose={() => setShowProfileEditModal(false)}
                currentName={user.name}
                onSave={handleProfileUpdate}
            />

            {/* 2. Personal Details View Modal */}
            <PersonalDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                user={user}
                // When 'Edit' is clicked in the Details view, close the view and open the edit modal
                onEditClick={() => {
                    setShowDetailsModal(false); 
                    setShowDetailsEditModal(true);
                }}
            />
            
            {/* 3. 💡 NEW: Personal Details Edit Modal */}
            <EditDetailsModal
                isOpen={showDetailsEditModal}
                onClose={() => setShowDetailsEditModal(false)}
                user={user}
                onSave={handleDetailsUpdate}
            />

        </IonPage>
    );
};

export default Account;
