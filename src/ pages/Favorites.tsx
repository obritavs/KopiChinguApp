import React, { useMemo } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonText,
} from '@ionic/react';
import { addCircle, heart, heartOutline, cart } from 'ionicons/icons';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const ALL_PRODUCTS = [
    { id: 1, name: "Dalgona Crunch Latte", price: 130, img: "/assets/dalgona.jpg" },
    { id: 2, name: "Hallyu Cold Brew", price: 100, img: "/assets/americano.jpg" },
    { id: 3, name: "Seoul Sweet Vanilla", price: 120, img: "/assets/vanilla.jpg" },
    { id: 4, name: "Busan Dark Mocha", price: 95, img: "/assets/mocha.jpg" },
    { id: 5, name: "K-Drama Caramel Macchiato", price: 100, img: "/assets/caramel.jpg" },
    { id: 14, name: "Kopi Chingu Vietnamese", price: 165, img: "/assets/vietnam.jpg" },
    { id: 15, name: "Kopi Chingu Injeolmi Cloud", price: 180, img: "/assets/cloud.jpg" },
    { id: 16, name: "Kopi Chingu Budae Jjigae Latte", price: 155, img: "/assets/army.jpg" },
    { id: 17, name: "Kopi Chingu Jeju Strawberry Matcha", price: 170, img: "/assets/matchastraw.jpg" },
    { id: 18, name: "Kopi Chingu Jeju Matcha Fusion", price: 190, img: "/assets/matcha.jpg" },
    { id: 6, name: "Jjimjilbang Hot Mocha", price: 95, img: "/assets/hotmocha.jpg" },
    { id: 7, name: "Gangnam Caramel Macchiato", price: 100, img: "/assets/hot2.jpg" },
    { id: 8, name: "Soju Shot Espresso", price: 90, img: "/assets/hot3.jpg" },
    { id: 9, name: "Winter Sonata Latte", price: 120, img: "/assets/hot4.jpg" },
    { id: 10, name: "Morning Chocolate Latte", price: 100, img: "/assets/hot5.jpg" },
    { id: 11, name: "Plain Croffle", price: 150, img: "/assets/croffle.jpg" },
    { id: 12, name: "Strawberries & Cream Croffle", price: 150, img: "/assets/strawberrrycroffle.jpg" },
    { id: 13, name: "Matcha Croffle", price: 150, img: "/assets/matchacroffle.jpg" },
    { id: 100, name: "Frappuccino", price: 150, img: "/assets/frappe1.jpg" },
    { id: 101, name: "Kopi Frappe", price: 160, img: "/assets/matchafrappe.jpg" },
    { id: 102, name: "Seasonal Mango Smoothie", price: 140, img: "/assets/manggo.jpg" },
];

// --- Temporary Style Fix ---
// This CSS should ideally be in a global stylesheet like favorites.css
// to ensure the images render cleanly in the list view.
const productListStyles = `
    .kopi-product-list-item {
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .product-list-img-col {
        padding-right: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 100px; /* Constrain the column width */
        min-width: 100px;
    }
    .product-list-image {
        width: 80px; /* Fixed width */
        height: 80px; /* Fixed height for a clean square look */
        object-fit: cover; /* Ensures image covers the area without stretching */
        border-radius: 8px; /* Slightly rounded corners */
        margin: 10px 0;
    }
    .product-list-details-col {
        padding-left: 0;
    }
    .product-list-title {
        font-size: 1.1em;
        font-weight: 600;
        color: #072661; /* Tertiary color */
    }
    .product-list-price {
        font-size: 1.0em;
        color: #B58800; /* Light gold accent */
    }
    .product-list-actions-col {
        text-align: center;
        padding-right: 15px;
    }
`;
// ----------------------------

const Favorites: React.FC = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    // Filter products based on the favorites list
    const favoritedProducts = useMemo(() => {
        return ALL_PRODUCTS.filter(product => favorites.includes(product.id));
    }, [favorites]);

    const handleOrder = (product: typeof ALL_PRODUCTS[0]) => {
        addToCart(product);
        // A toast could be added here for feedback, similar to Shop.tsx
    };

    return (
        <IonPage>
            {/* Inject the temporary styles */}
            <style>{productListStyles}</style>

            <Header title="My Favorites" />
            <IonContent className="ion-padding favorites-content">
                

                {favoritedProducts.length === 0 ? (
                    <IonText color="medium" className="ion-padding ion-text-center">
                        <p className="ion-padding-top">You haven't favorited any products yet. Go find your bias!</p>
                        <IonIcon icon={heartOutline} size="large" />
                    </IonText>
                ) : (
                    <IonGrid className="ion-no-padding">
                        <IonRow>
                            {favoritedProducts.map((product) => (
                                <IonCol size="12" size-md="6" size-lg="4" key={product.id}>
                                    <IonCard className="kopi-product-list-item">
                                        <IonGrid className="ion-no-padding">
                                            <IonRow className="ion-align-items-center ion-no-margin">
                                                <IonCol size="auto" className="product-list-img-col">
                                                    <img
                                                        src={product.img}
                                                        alt={product.name}
                                                        className="product-list-image"
                                                    />
                                                </IonCol>
                                                <IonCol className="product-list-details-col">
                                                    <IonCardTitle className="product-list-title">
                                                        {product.name}
                                                    </IonCardTitle>
                                                    <IonCardSubtitle className="product-list-price">
                                                        ₱ {product.price.toLocaleString()}
                                                    </IonCardSubtitle>
                                                </IonCol>
                                                <IonCol size="auto" className="product-list-actions-col">
                                                    <IonButton
                                                        fill="clear"
                                                        color="tertiary"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOrder(product);
                                                        }}
                                                    >
                                                        <IonIcon slot="icon-only" icon={addCircle} />
                                                    </IonButton>
                                                    <IonButton
                                                        fill="clear"
                                                        color="danger"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(product.id);
                                                        }}
                                                    >
                                                        {/* Always show filled heart on the Favorites page */}
                                                        <IonIcon slot="icon-only" icon={heart} />
                                                    </IonButton>
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCard>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Favorites;
