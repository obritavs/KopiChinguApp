import {
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonListHeader,
} from '@ionic/react';
import React from 'react';

import { useLocation } from 'react-router-dom';

import { 
    cartOutline, cartSharp, 
    personOutline, personSharp, 
    heartOutline, heartSharp, 
    settingsOutline, settingsSharp, 
    logOutOutline, logOutSharp,
    cafeOutline, cafeSharp,
    receiptOutline, receiptSharp,
    informationCircleOutline, informationCircleSharp, 
    peopleOutline, peopleSharp,
    bookOutline, bookSharp,
    codeSlashOutline, codeSlashSharp,
    callOutline, callSharp
} from 'ionicons/icons';
import './Menu.css';

interface AppPage {
    url: string;
    iosIcon: string;
    mdIcon: string;
    title: string;
}

const appPages: AppPage[] = [
    {
        title: 'Coffee & Pastries',
        url: '/page/Shop',
        iosIcon: cafeOutline, 
        mdIcon: cafeSharp
    },
    {
        title: 'My Orders',
        url: '/page/Orders',
        iosIcon: receiptOutline, 
        mdIcon: receiptSharp
    },
    {
        title: 'My Cart',
        url: '/page/Cart',
        iosIcon: cartOutline,
        mdIcon: cartSharp
    },
    {
        title: 'My Account',
        url: '/page/Account',
        iosIcon: personOutline,
        mdIcon: personSharp
    },
    {
        title: 'Favorites',
        url: '/page/Favorites',
        iosIcon: heartOutline,
        mdIcon: heartSharp
    },
];

const infoPages: AppPage[] = [
    {
        title: 'Company History',
        url: '/page/History',
        iosIcon: bookOutline, 
        mdIcon: bookSharp
    },
    {
        title: 'About Our Products',
        url: '/page/Products',
        iosIcon: cafeOutline, 
        mdIcon: cafeSharp
    },
    {
        title: 'About the App',
        url: '/page/AboutApp',
        iosIcon: informationCircleOutline,
        mdIcon: informationCircleSharp
    },
    {
        title: 'Developers',
        url: '/page/Developers',
        iosIcon: codeSlashOutline,
        mdIcon: codeSlashSharp
    },
    {
        title: 'Contact Us',
        url: '/page/Contact',
        iosIcon: callOutline,
        mdIcon: callSharp
    },
];
const utilityLinks: AppPage[] = [
    {
        title: 'Settings',
        url: '/page/Settings',
        iosIcon: settingsOutline,
        mdIcon: settingsSharp
    },
    {
        title: 'Logout',
        url: '/logout', 
        iosIcon: logOutOutline,
        mdIcon: logOutSharp
    }
];

const Menu: React.FC = () => {
    const location = useLocation();

    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("user.email");
    // ------------------------------------

    const handleLogout = () => {
        localStorage.removeItem('user_logged_in'); 
        localStorage.removeItem('intro_seen');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/'; 
    };

    const renderMenuItems = (pages: AppPage[], listId: string) => (
        <IonList id={listId}>
            {pages.map((page, index) => (
                <IonMenuToggle key={index} autoHide={false}>
                    <IonItem 
                        className={location.pathname.startsWith(page.url) ? 'selected' : ''} 
                        routerLink={page.url} 
                        routerDirection="none" 
                        lines="none" 
                        detail={false}
                        onClick={page.title === 'Logout' ? handleLogout : undefined}
                        button={page.title === 'Logout'}
                    >
                        <IonIcon aria-hidden="true" slot="start" ios={page.iosIcon} md={page.mdIcon} />
                        <IonLabel>{page.title}</IonLabel>
                    </IonItem>
                </IonMenuToggle>
            ))}
        </IonList>
    );

    return (
        <IonMenu contentId="main" type="overlay" id="main-menu">
            <IonContent>
             
                <div id="menu-header">
                    <div className="name-and-email">
                        <div className="menu-username">{userName}</div>
                        <IonNote className="menu-useremail">{userEmail}</IonNote>
                    </div>
        
                    <div className="logo-text ion-margin-top">Kopi Chingu</div>
                    <IonNote className="menu-slogan">"Where Coffee Meets Comfort, and Friends Feel Like Home"</IonNote>
                </div>
               
                {renderMenuItems(appPages, "app-list")}
                <IonList id="info-list" className="ion-margin-top">
                    <IonListHeader>
                        <IonLabel>Information</IonLabel>
                    </IonListHeader>
                    {renderMenuItems(infoPages, "info-list")}
                </IonList>
                <IonList id="utility-list" className="ion-margin-top">
                
                    <IonMenuToggle autoHide={false}>
                        <IonItem 
                            className={location.pathname.startsWith(utilityLinks[0].url) ? 'selected' : ''} 
                            routerLink={utilityLinks[0].url} 
                            routerDirection="none" 
                            lines="none" 
                            detail={false}
                        >
                            <IonIcon aria-hidden="true" slot="start" ios={utilityLinks[0].iosIcon} md={utilityLinks[0].mdIcon} />
                            <IonLabel>{utilityLinks[0].title}</IonLabel>
                        </IonItem>
                    </IonMenuToggle>

                    <IonMenuToggle autoHide={false}>
                        <IonItem 
                            onClick={handleLogout} 
                            lines="none" 
                            detail={false} 
                            button
                            className="logout-button"
                        >
                            <IonIcon aria-hidden="true" slot="start" ios={utilityLinks[1].iosIcon} md={utilityLinks[1].mdIcon} />
                            <IonLabel>{utilityLinks[1].title}</IonLabel>
                        </IonItem>
                    </IonMenuToggle>
                </IonList>

            </IonContent>
        </IonMenu>
    );
};

export default Menu;
