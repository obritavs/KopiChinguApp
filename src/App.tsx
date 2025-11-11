import {
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    setupIonicReact,
    // Add Tab components to imports
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
    homeOutline, // Shop/Home
    basketOutline, // Cart
    heartOutline, // Favorites
    personCircleOutline, // Account
    bagHandleOutline, // Orders
} from 'ionicons/icons';

// ⚡️ STRIPE IMPORTS
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import Menu from "./components/Menu";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Import all required pages
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
import Loyalty from "./pages/Loyalty";
import Addresses from "./pages/Addresses";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import History from "./pages/History"; 
import Products from "./pages/Products"; 
import AboutApp from "./pages/AboutApp"; 
import Developers from "./pages/Developers";
import Contact from "./pages/Contact";

import { CartProvider } from './context/CartContext'; 
import { FavoritesProvider } from './context/FavoritesContext'; 

import "@ionic/react/css/core.css";
// ... (rest of Ionic CSS imports)
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "./theme/variables.css";

setupIonicReact();

// 1. ⚡️ Initialize Stripe Promise
// NOTE: Replace "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY" with your actual Stripe Publishable Key.
const stripePromise = loadStripe("pk_test_51O9c4NImQOQyT78vS3c4hV03S0fD...");

// --- NEW COMPONENT FOR TABS AND AUTHENTICATED ROUTES ---
const Tabs: React.FC = () => {
    return (
        <FavoritesProvider> 
            {/* IonTabs defines the routing area that includes the TabBar */}
            <IonTabs>
                {/* 1. IonRouterOutlet for all page content */}
                <IonRouterOutlet id="main">
                    {/* Define the pages that are viewable within the tabs context */}
                    <Route path="/page/Shop" exact component={Shop} />
                    <Route path="/page/Cart" exact component={Cart} />
                    <Route path="/page/Favorites" exact component={Favorites} />
                    <Route path="/page/Orders" exact component={Orders} />
                    <Route path="/page/Account" exact component={Account} />
                    <Route path="/page/Checkout" exact component={Checkout} /> 
                    <Route path="/page/Loyalty" exact component={Loyalty} />
                    <Route path="/page/Settings" exact component={Settings} />
                    <Route path="/page/Addresses" exact component={Addresses} />
                    <Route path="/page/History" exact component={History} />
                    <Route path="/page/Products" exact component={Products} />
                    <Route path="/page/AboutApp" exact component={AboutApp} />
                    <Route path="/page/Developers" exact component={Developers} />
                    <Route path="/page/Contact" exact component={Contact} />

                    {/* Redirecting the tab's base URL to the default page */}
                    <Redirect exact from="/" to="/page/Shop" />
                    <Redirect exact from="/page" to="/page/Shop" />
                </IonRouterOutlet>

                {/* 2. IonTabBar defines the persistent bar at the bottom */}
                <IonTabBar slot="bottom">
                    <IonTabButton tab="shop" href="/page/Shop">
                        <IonIcon icon={homeOutline} />
                        <IonLabel>Shop</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="orders" href="/page/Orders">
                        <IonIcon icon={bagHandleOutline} />
                        <IonLabel>Orders</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="cart" href="/page/Cart">
                        <IonIcon icon={basketOutline} />
                        <IonLabel>Cart</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="favorites" href="/page/Favorites">
                        <IonIcon icon={heartOutline} />
                        <IonLabel>Favorites</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="account" href="/page/Account">
                        <IonIcon icon={personCircleOutline} />
                        <IonLabel>Account</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </FavoritesProvider> 
    );
};
// -----------------------------------------------------------------


const App: React.FC = () => {
    const [introSeen, setIntroSeen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hasSeenIntro = localStorage.getItem("intro_seen") === "true";
        const loggedIn = localStorage.getItem("user_logged_in") === "true";
        setIntroSeen(hasSeenIntro);
        setIsLoggedIn(loggedIn);
        setLoading(false);
    }, []);

    const handleIntroFinish = () => {
        localStorage.setItem("intro_seen", "true");
        setIntroSeen(true);
    };

    const handleLoginSuccess = () => {
        localStorage.setItem("user_logged_in", "true");
        setIsLoggedIn(true);
    };

    if (loading) return <IonApp />; 

    return (
        <IonApp>
            <IonReactRouter>
                <CartProvider> 
                    {!introSeen ? (
                        <Intro onFinish={handleIntroFinish} />
                    ) : !isLoggedIn ? (
                        <IonRouterOutlet>
                            {/* Unauthenticated Routes */}
                            <Route path="/login" exact>
                                <Login onLoginSuccess={handleLoginSuccess} />
                            </Route>
                            <Route path="/signup" exact>
                                <Signup onSignupSuccess={handleLoginSuccess} />
                            </Route>
                            <Redirect exact from="/" to="/login" />
                            <Redirect from="/page/*" to="/login" />
                        </IonRouterOutlet>
                    ) : (
                        // Authenticated Routes now wrapped in Elements and SplitPane
                        <Elements stripe={stripePromise}>
                            <IonSplitPane contentId="main">
                                <Menu />
                                {/* Route to the new Tabs component which handles all authenticated pages */}
                                <Route path="/page" component={Tabs} />
                                {/* Ensure the root redirects to the tab's default path */}
                                <Redirect exact from="/" to="/page/Shop" />
                            </IonSplitPane>
                        </Elements>
                    )}
                </CartProvider>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;
