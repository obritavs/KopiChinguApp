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
    cameraOutline 
} from "ionicons/icons";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Account.css"; 
import Header from "../components/Header"; 
import { auth, storage } from '../firebase-config'; 
import { onAuthStateChanged, signOut, User, updateProfile } from 'firebase/auth'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    stamps: number;
    orders: number;
    tier: string;
    photoURL?: string; 
}

const defaultUser: UserProfile = {
    uid: '',
    name: 'Guest User',
    email: 'Please log in',
    stamps: 0,
    orders: 0,
    tier: 'Bronze',
    photoURL: undefined,
};



const useAuth = () => {
    const router = useIonRouter();
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>(defaultUser);

    const fetchCustomProfileData = useCallback((user: User) => {
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        
        setUserProfile({
            uid: user.uid,
            name: displayName,
            email: user.email || 'N/A',
            stamps:0, 
            orders: 0,
            tier: 'Regular', 
            photoURL: user.photoURL || undefined, 
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

    // C. Function to update Firebase Auth profile and local state
    const handleProfileUpdate = async (newName: string, photoFile?: File) => {
        if (!firebaseUser) return;

        let newPhotoURL = firebaseUser.photoURL;

        if (photoFile) {
            console.log('Uploading photo to Firebase Storage...');
            try {
                // 1. Upload photo to Firebase Storage
                const storageRef = ref(storage, `profile_pictures/${firebaseUser.uid}/${photoFile.name}`);
                const snapshot = await uploadBytes(storageRef, photoFile);
                newPhotoURL = await getDownloadURL(snapshot.ref);
                console.log('Photo uploaded. URL:', newPhotoURL);
            } catch (error) {
                console.error('Photo upload failed:', error);
                // Optionally show a toast error here
                newPhotoURL = firebaseUser.photoURL; // Revert to old URL if upload fails
            }
        }

        try {
            // 2. Update Firebase Auth profile (name and photoURL)
            await updateProfile(firebaseUser, { 
                displayName: newName, 
                photoURL: newPhotoURL 
            });

            // 3. Update local state immediately
            setUserProfile(prev => ({
                ...prev,
                name: newName,
                photoURL: newPhotoURL || undefined,
            }));

            console.log('Profile updated successfully!');
            
        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };

    // D. Firebase Logout Function (Remains the same)
    const logout = async () => {
        // ... (logout logic)
        try {
            await signOut(auth);
            localStorage.setItem("user_logged_in", "false"); 
            router.push('/login', 'root', 'replace');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return { user: userProfile, firebaseUser, logout, handleProfileUpdate };
};

// --- EDIT PROFILE MODAL COMPONENT ---

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
    
    // Use the name for initial state sync
    useEffect(() => {
        setNewName(currentName);
        setPhotoFile(undefined); // Clear file on open
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
        // Pass both name and optional file to the parent handler
        await onSave(newName.trim(), photoFile); 
        setIsSaving(false);
        onClose();
    };

    // Reference to hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Personal Info</IonTitle>
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
                        <IonLabel position="stacked">Name</IonLabel>
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
                            <IonNote>Email/Tier changes handled separately.</IonNote>
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

// --- ACCOUNT PAGE COMPONENT ---

const Account: React.FC = () => {
    const { user, logout, firebaseUser, handleProfileUpdate } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);

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
                            {/* Check for photoURL first */}
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
                            onClick={() => setShowEditModal(true)}
                            disabled={!firebaseUser} // Disable if not logged in
                        >
                            <IonIcon icon={createOutline} slot="start" />
                            Edit Profile
                        </IonButton>

                        <IonGrid className="ion-margin-top profile-stats-grid">
                            <IonRow>
                                <IonCol size="4">
                                    <IonText color="dark"><strong>{stampProgress}</strong></IonText>
                                    <p className="ion-no-margin" color="medium">Stamps</p>
                                </IonCol>
                                <IonCol size="4">
                                    <IonText color="dark"><strong>{user.orders}</strong></IonText>
                                    <p className="ion-no-margin" color="medium">Orders</p>
                                </IonCol>
                                <IonCol size="4">
                                    <IonText color="dark"><strong>{user.tier}</strong></IonText>
                                    <p className="ion-no-margin" color="medium">Tier</p>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>

                {/* --- Navigation List (Simplified) --- */}
                <IonList lines="full" className="ion-margin-top profile-nav-list">
                    
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

            {/* --- Edit Profile Modal Render --- */}
            <EditProfileModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentName={user.name}
                onSave={handleProfileUpdate}
            />
        </IonPage>
    );
};

export default Account;
