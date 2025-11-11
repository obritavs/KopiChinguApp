import React, { useState, useMemo, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonToast,
    IonText,
    IonSearchbar,
    IonBadge,
    IonTabBar,
    IonTabButton,
    IonAlert,
} from "@ionic/react";
import {
    addCircle,
    heart,
    heartOutline,
    cafe,
    fastFood,
    star,
    pint,
    chevronForwardCircleOutline,
    chevronBackCircleOutline,
    cart,
    informationCircleOutline,
    chevronDown,
    chevronUp,
    homeOutline,
    personCircleOutline,
    basketOutline,
    swapHorizontalOutline,
    bicycle,
    cloudDownloadOutline,
} from "ionicons/icons";
import Header from "../components/Header";
import "./Shop.css";
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';


interface Product {
    id: number;
    name: string;
    price: number;
    img: string;
    description: string;
    ingredients: string;
}

interface Advertisement {
    id: number;
    title: string;
    subtitle: string;
    bgColor: string;
    textColor: string;
    buttonText: string;
    buttonColor: string;
    action: 'hot' | 'cart' | 'pastries';
    icon: string;
    promoColor: string;
}

interface Banner {
    id: number;
    imgUrl: string;
    action?: 'link' | 'product' | 'promo';
    target?: string;
}

const advertisements: Advertisement[] = [
    {
        id: 1,
        title: "2X STAMPS BONUS! 🎉",
        subtitle: "Order any Hot Brew today and get double loyalty stamps!",
        bgColor: "#0b378c",
        textColor: "#FFD700",
        buttonText: "Shop Hot Brews",
        buttonColor: "warning",
        action: 'hot',
        icon: star,
        promoColor: '#FFD700',
    },
    {
        id: 2,
        title: "FREE DELIVERY! 🛵",
        subtitle: "Orders over ₱500 get delivery for free.",
        bgColor: "#FFD700",
        textColor: "#072661",
        buttonText: "Go to Cart",
        buttonColor: "primary",
        action: 'cart',
        icon: bicycle,
        promoColor: '#072661',
    },
    {
        id: 3,
        title: "PASTRY SPECIAL! 🥐",
        subtitle: "Buy 2 Croffles, get 1 free. Limited time offer!",
        bgColor: "#6F8FAF",
        textColor: "white",
        buttonText: "Shop Pastries",
        buttonColor: "tertiary",
        action: 'pastries',
        icon: fastFood,
        promoColor: 'white',
    },
];

const banners: Banner[] = [
    { id: 1, imgUrl: '/assets/bannerkopii.jpg', action: 'promo', target: 'SUMMERKOPI' },
    { id: 2, imgUrl: '/assets/bannerkopi.jpg'},
];

const modernStyles = `
    .cobalt-segment-container {
        padding: 0 16px;
        margin-bottom: 15px;
    }

    .k-segment-cobalt {
        --background: #072661;
        --border-radius: 10px;
        border: none;
        overflow: hidden;
    }

    .k-segment-cobalt ion-segment-button {
        --color: white;
        --color-checked: #FFD700;
        --background-checked: #0b378c;
        --indicator-color: transparent;
        font-weight: 500;
        padding: 5px 0;
        border-radius: 0;
        border-left: 1px solid rgba(255, 255, 255, 0.2);
    }

    .k-segment-cobalt ion-segment-button ion-label {
        font-size: 0.85em;
    }
    .k-segment-cobalt ion-segment-button ion-icon {
        font-size: 1.2em;
    }

    ion-tab-bar {
        --background: #072661;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        position: fixed;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 95%;
        max-width: 500px;
        padding: 5px 0;
        border-top: none;
        height: 60px;
        z-index: 10;
        transition: transform 0.3s ease-out;
    }

    ion-tab-button {
        --color: #ccc;
        --color-selected: #FFD700;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0;
        --padding-top: 5px;
        --padding-bottom: 5px;
        --padding-start: 5px;
        --padding-end: 5px;
    }

    ion-tab-button[aria-selected="true"] {
        background-color: #0b378c;
        border-radius: 15px;
        margin: 0 4px;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    ion-tab-button ion-icon {
        font-size: 1.5em;
    }
    
    ion-tab-button ion-label {
        font-size: 0.7em;
        font-weight: 600;
    }

    .shop-content {
        --padding-bottom: 80px;
    }

    .kopi-alert .alert-wrapper {
        --background: white;
        border-radius: 15px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        max-width: 340px;
    }
    .kopi-alert .alert-head {
        padding-top: 20px;
        padding-bottom: 10px;
        text-align: center;
    }
    .kopi-alert .alert-title {
        color: #072661;
        font-weight: 700;
        font-size: 1.4em;
        margin-bottom: 5px;
    }
    .kopi-alert .alert-sub-title {
        color: #333;
        font-size: 0.95em;
        line-height: 1.4;
    }
    .kopi-alert .alert-message {
        color: #555;
        padding: 0 20px 20px 20px;
        text-align: center;
    }
    .kopi-alert .alert-button-group {
        flex-direction: row;
        padding: 0;
        margin: 0;
        justify-content: center;
    }
    .kopi-alert .alert-button {
        flex: 1 1 50%;
        color: #0b378c;
        font-weight: 600;
        padding: 15px 0;
        border-top: 1px solid #eee;
        margin: 0;
        
        display: flex;
        align-items: center;
        justify-content: center; 
        text-align: center; 
        
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .kopi-alert .alert-button:first-of-type {
        border-right: 1px solid #eee;
    }
    .kopi-alert .alert-button:hover:not(.alert-button-selected) {
        background-color: #f5f5f5;
    }
    .kopi-alert .alert-button:active:not(.alert-button-selected) {
        background-color: #e0e0e0;
    }

    .kopi-alert .alert-button-selected {
        background-color: #0b378c;
        color: #FFD700;
        font-weight: bold;
        border-top: 1px solid #072661; 
    }
    .kopi-alert .alert-button-selected:first-of-type {
        border-right-color: #072661;
    }
    .kopi-alert .alert-button-inner {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ad-carousel-container {
        margin-top: 20px;
        margin-bottom: 25px;
        position: relative;
        padding: 0 16px;
    }

    .ad-carousel-scroll {
        display: flex;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        gap: 15px;
        padding-bottom: 5px;
    }

    .ad-carousel-scroll::-webkit-scrollbar {
        display: none;
    }

    .ad-card {
        flex: 0 0 85%;
        max-width: 85%;
        scroll-snap-align: start;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 100px;
        transition: all 0.2s ease;
    }

    .ad-text-container {
        flex: 1;
        padding-right: 10px;
    }

    .ad-card h4 {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 1.2em;
    }

    .ad-card p {
        font-size: 0.9em;
        line-height: 1.3;
    }

    .banner-carousel-container {
        margin-top: 15px;
        margin-bottom: 25px;
        padding: 0 16px;
        position: relative;
    }

    .banner-carousel-scroll {
        display: flex;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        gap: 10px;
        padding-bottom: 5px;
    }

    .banner-carousel-scroll::-webkit-scrollbar {
        display: none;
    }

    .banner-card {
        flex: 0 0 90%;
        max-width: 90%;
        scroll-snap-align: start;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        min-height: 120px;
        cursor: pointer;
    }
    
    .banner-card img {
        width: 100%;
        height: auto;
        display: block;
        object-fit: cover;
    }
    /* --- NEW CSS STYLE FOR DOWNLOAD BUTTON --- */
    .download-apk-button {
        margin: 10px 16px 20px 16px; 
        height: 40px; 
        font-weight: bold;
        --border-radius: 8px;
    }
`;

const Shop: React.FC = () => {
    const history = useHistory();
    const { addToCart, cartItems } = useCart();
    const { favorites, toggleFavorite } = useFavorites();

    const [category, setCategory] = useState("iced");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

    const [showAlert, setShowAlert] = useState(false);
    
    const [selectedOrderType, setSelectedOrderType] = useState<string | null>(
        localStorage.getItem('kopiChinguSelectedOrderType')
    );


    useEffect(() => {
        if (!selectedOrderType) {
            setShowAlert(true);
        }
    }, [selectedOrderType]);

    const handleOrderTypeSelection = (type: 'pickup' | 'delivery') => {
        setSelectedOrderType(type);
        localStorage.setItem('kopiChinguSelectedOrderType', type);
        setShowAlert(false);

        const message = type === 'pickup'
            ? "✅ Mode set to Pick-up! Your order will be ready at the counter."
            : "🛵 Mode set to Delivery! Please ensure your address is correct.";
        setToastMessage(message);
        setShowToast(true);
    }

    const handleDownloadApk = () => {
        const fileId = '1AXt8LxH_rb2R7QHAixvkrQxYe281GUTl';
        const apkUrl = `https://drive.google.com/uc?export=download&id=${fileId}`; 
        
        setToastMessage("⬇️ Starting Kopi Chingu APK download...");
        setShowToast(true);
        window.open(apkUrl, '_blank');
    };


    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const products: { [key: string]: Product[] } = {
        iced: [
            { id: 1, name: "Dalgona Crunch", price: 130, img: "/assets/dalgona.png", description: "Sweet, creamy, and crunchy Korean-style whipped coffee, served cold.", ingredients: "Milk, Espresso, Sweet Cream Foam, Caramel/Sugar Topping." },
            { id: 2, name: "Hallyu Cold Brew", price: 100, img: "/assets/americano.png", description: "Smooth, strong, and highly caffeinated cold brew coffee.", ingredients: "Cold Brew Concentrate, Filtered Water, Ice." },
            { id: 3, name: "Seoul Sweet Vanilla", price: 120, img: "/assets/vanilla.png", description: "Classic vanilla latte, perfectly balanced for a sweet treat.", ingredients: "Milk, Espresso, Vanilla Syrup, Ice." },
            { id: 4, name: "Busan Dark Mocha", price: 95, img: "/assets/mocha.jpg", description: "Rich, dark chocolate mixed with a strong espresso base.", ingredients: "Milk, Espresso, Dark Chocolate Sauce, Ice." },
            { id: 5, name: "Caramel Macchiato", price: 100, img: "/assets/caramel.jpg", description: "Layered drink with vanilla syrup, milk, espresso shots, and caramel drizzle.", ingredients: "Milk, Vanilla Syrup, Espresso, Caramel Sauce, Ice." },
            { id: 14, name: "Chingu Vietnamese", price: 165, img: "/assets/vietnam.jpg", description: "Strong Vietnamese coffee with sweet condensed milk, iced.", ingredients: "Vietnamese Coffee Beans, Condensed Milk, Water, Ice." },
            { id: 15, name: "Kopi Chingu Cloud", price: 180, img: "/assets/cloud.png", description: "Iced latte topped with a fluffy cream flavored with Korean roasted soybean powder.", ingredients: "Milk, Espresso, Injeolmi Cream, Roasted Soybean Powder, Ice." },
            { id: 16, name: "Barista Drink", price: 155, img: "/assets/barista.jpg", description: "A bold fusion of espresso and sweet cream with a playful Korean twist — rich, toasty, and just the right balance of sweetness and spice.",   ingredients: "Espresso, steamed milk, brown sugar syrup, cinnamon, and a hint of Korean red bean flavor."},
            { id: 17, name: "Strawberry Matcha", price: 170, img: "/assets/matchastraw.jpg", description: "Layers of fresh strawberry puree, milk, and premium Jeju matcha.", ingredients: "Milk, Strawberry Puree, Jeju Matcha Powder, Ice." },
            { id: 18, name: "Kopi Chingu Matcha", price: 190, img: "/assets/matcha.png", description: "A rich, complex iced drink featuring high-grade Jeju matcha.", ingredients: "Milk, Jeju Matcha Powder, Simple Syrup, Ice." },
        ],
        hot: [
            { id: 6, name: "Hot Mocha", price: 95, img: "/assets/hotmocha.png", description: "Warm and comforting hot mocha, perfect for relaxing.", ingredients: "Milk, Espresso, Chocolate Sauce, Steamed Milk Foam." },
            { id: 7, name: "Caramel Macchiato", price: 100, img: "/assets/hot2.png", description: "Sweet and layered caramel macchiato, served hot.", ingredients: "Milk, Vanilla Syrup, Espresso, Caramel Sauce, Steamed Milk." },
            { id: 8, name: "Soju Shot Espresso", price: 90, img: "/assets/hot3.jpg", description: "A double shot of espresso for maximum energy.", ingredients: "Double Shot Espresso, Water (optional)." },
            { id: 9, name: "Winter Sonata Latte", price: 120, img: "/assets/hot4.png", description: "Signature warming latte with a hint of spice.", ingredients: "Milk, Espresso, Spice Blend Syrup, Steamed Milk." },
            { id: 10, name: "Morning Chocolate Latte", price: 100, img: "/assets/hot5.png", description: "Rich hot chocolate with a subtle coffee note.", ingredients: "Milk, Chocolate Powder/Syrup, Espresso (optional), Steamed Milk." },
        ],
        pastries: [
            { id: 11, name: "Plain Croffle", price: 150, img: "/assets/Croffle.png", description: "A fusion of croissant and waffle, flaky and crispy.", ingredients: "Croissant Dough, Sugar, Butter." },
            { id: 12, name: "Strawberry Croffle", price: 150, img: "/assets/strawberry croffle.png", description: "Crispy croffle topped with fresh strawberries and sweet cream.", ingredients: "Croffle Base, Fresh Strawberries, Whipped Cream, Sugar Powder." },
            { id: 13, name: "Matcha Croffle", price: 150, img: "/assets/matchacroffle.png", description: "Croffle infused and topped with premium Matcha flavoring.", ingredients: "Croffle Base, Matcha Powder, Sugar Glaze." },
            { id: 14, name: "Tiramisu Cake", price: 150, img: "/assets/tiramisu.png", description: "Classic Italian coffee-flavored dessert.", ingredients: "Ladyfingers, Mascarpone Cheese, Eggs, Sugar, Coffee, Cocoa Powder." },
            { id: 15, name: "Matcha Tiramisu Cake", price: 150, img: "/assets/tiramisum.png", description: "A Korean-inspired twist on Tiramisu using rich Matcha.", ingredients: "Ladyfingers, Mascarpone Cheese, Eggs, Sugar, Matcha Powder." },
        ],
    };

    const featuredProductsList: Product[] = [
        { id: 100, name: "Caramel Frappuccino", price: 150, img: "/assets/frappe1.png", description: "Blended ice drink topped with whipped cream.", ingredients: "Milk, Ice, Coffee Syrup, Sugar, Whipped Cream." },
        { id: 101, name: "Kopi Frappe", price: 160, img: "/assets/Mocha Frappe.png", description: "Our signature mocha frappuccino blended to perfection.", ingredients: "Milk, Ice, Mocha Sauce, Espresso, Whipped Cream." },
        { id: 102, name: "Matcha Frappe", price: 180, img: "/assets/matchafrappee.png", description: "Refreshing smoothie made with real Philippine mangoes.", ingredients: "Fresh Mango, Milk/Yogurt, Ice, Sugar (optional)." },
    ];

    const carouselRef = React.useRef<HTMLDivElement>(null);
    const adCarouselRef = React.useRef<HTMLDivElement>(null);
    const bannerCarouselRef = React.useRef<HTMLDivElement>(null);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'right' ? 250 : -250;
            carouselRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const scrollAdCarousel = (direction: 'left' | 'right') => {
        if (adCarouselRef.current) {
            const scrollAmount = direction === 'right' ? 300 : -300;
            adCarouselRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const scrollBannerCarousel = (direction: 'left' | 'right') => {
        if (bannerCarouselRef.current) {
            const scrollAmount = direction === 'right' ? 320 : -320;
            bannerCarouselRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handleOrder = (product: Product) => {
        if (!selectedOrderType) {
            setToastMessage(`🚨 Please select Pick-up or Delivery first!`);
            setShowToast(true);
            setShowAlert(true);
            return;
        }

        const { id, name, price } = product;
        addToCart({ id, name, price });
        setToastMessage(`🛒 ${name} added to cart for ${selectedOrderType === 'pickup' ? 'Pick-up' : 'Delivery'}!`);
        setShowToast(true);
    };

    const handleToggleDetails = (productId: number) => {
        setExpandedProduct(expandedProduct === productId ? null : productId);
    };

    const handleAdAction = (action: 'hot' | 'cart' | 'pastries') => {
        if (action === 'hot') {
            setCategory('hot');
        } else if (action === 'pastries') {
            setCategory('pastries');
        } else if (action === 'cart') {
            history.push('/page/Cart');
        }
    };

    const handleBannerAction = (banner: Banner) => {
        if (banner.action === 'promo' && banner.target) {
            setToastMessage(`🎉 Promo Code copied: ${banner.target}`);
            setShowToast(true);
        } else if (banner.action === 'link' && banner.target) {
            window.open(banner.target, '_system');
        } else if (banner.action === 'product' && banner.target) {
            const targetId = parseInt(banner.target);
            if (!isNaN(targetId)) {
                const allProducts: Product[] = Object.values(products).flat();
                const product = allProducts.find(p => p.id === targetId);
                if (product) {
                    setCategory(Object.keys(products).find(key => products[key].some(p => p.id === targetId)) || 'iced');
                    setExpandedProduct(targetId);
                } else {
                    setToastMessage(`Product not found.`);
                    setShowToast(true);
                }
            }
        }
    }

    const filteredProducts = useMemo(() => {
        const allProducts: Product[] = Object.values(products).flat();

        if (searchTerm === "") {
            return products[category as keyof typeof products] || [];
        }

        const lowerCaseSearch = searchTerm.toLowerCase();

        return allProducts.filter(product =>
            product.name.toLowerCase().includes(lowerCaseSearch) ||
            product.description.toLowerCase().includes(lowerCaseSearch) ||
            product.ingredients.toLowerCase().includes(lowerCaseSearch)
        );
    }, [category, searchTerm, products]);

    const gridColumns = {
        xs: 6,
        sm: 6,
        md: 4,
        lg: 3,
    };


    return (
        <IonPage>
            <style>{modernStyles}</style>

            <Header
                title="Kopi Chingu Café"
                rightAction={
                    <IonButton
                        fill="clear"
                        color="light"
                        className="cart-icon-white"
                        onClick={() => history.push('/page/Cart')}
                    >
                        <IonIcon slot="icon-only" icon={cart} />
                        {cartCount > 0 && (
                            <IonBadge color="danger" slot="end" className="cart-badge-shop">
                                {cartCount}
                            </IonBadge>
                        )}
                    </IonButton>
                }
            />
            <IonContent className="ion-padding shop-content">

                <div className="top-search-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonText className="greeting-text">
                            Annyeong Chingu! 👋 {selectedOrderType && (
                                <span style={{ fontSize: '0.8em', color: 'white', marginLeft: '5px' }}>
                                    ({selectedOrderType === 'pickup' ? 'Pick-up Mode' : 'Delivery Mode'})
                                </span>
                            )}
                        </IonText>
                        {selectedOrderType && (
                            <IonButton 
                                fill="clear" 
                                size="small" 
                                color="light" 
                                onClick={() => setShowAlert(true)} 
                                style={{ 
                                    '--padding-end': '0', 
                                    '--padding-start': '0',
                                    height: 'auto',
                                    minHeight: '24px',
                                }}
                            >
                                <IonIcon icon={swapHorizontalOutline} slot="icon-only" />
                            </IonButton>
                        )}
                    </div>
                    <div className="search-bar">
                        <IonSearchbar
                            placeholder="Search for coffee or pastries..."
                            value={searchTerm}
                            onIonChange={e => setSearchTerm(e.detail.value!)}
                            debounce={300}
                            className="kopi-searchbar"
                        />
                    </div>
                </div>

                {/* --- DOWNLOAD APK BUTTON ADDED HERE --- */}
                <IonButton
                    expand="block"
                    fill="solid"
                    color="primary"
                    className="download-apk-button"
                    onClick={handleDownloadApk}
                >
                    <IonIcon icon={cloudDownloadOutline} slot="start" />
                    Download Kopi Chingu App (APK)
                </IonButton>
                {/* --- END DOWNLOAD APK BUTTON --- */}

                {/* --- BANNER IMAGE CAROUSEL --- */}
                <div className="banner-carousel-container">
                    <IonButton
                        fill="clear"
                        size="large"
                        className="carousel-arrow left"
                        onClick={() => scrollBannerCarousel('left')}
                        color="primary"
                        style={{ zIndex: 5, left: 10 }}
                    >
                        <IonIcon icon={chevronBackCircleOutline} />
                    </IonButton>

                    <div ref={bannerCarouselRef} className="banner-carousel-scroll">
                        {banners.map((banner) => (
                            <div 
                                key={banner.id} 
                                className="banner-card ion-no-margin"
                                onClick={() => handleBannerAction(banner)}
                            >
                                <img
                                    src={banner.imgUrl}
                                    alt={`Promotional Banner ${banner.id}`}
                                />
                            </div>
                        ))}
                    </div>

                    <IonButton
                        fill="clear"
                        size="large"
                        className="carousel-arrow right"
                        onClick={() => scrollBannerCarousel('right')}
                        color="primary"
                        style={{ zIndex: 5, right: 10 }}
                    >
                        <IonIcon icon={chevronForwardCircleOutline} />
                    </IonButton>
                </div>
                {/* --- END BANNER IMAGE CAROUSEL --- */}

                <div className="carousel-container">
                    <IonButton
                        fill="clear"
                        size="large"
                        className="carousel-arrow left"
                        onClick={() => scrollCarousel('left')}
                        color="tertiary"
                    >
                        <IonIcon icon={chevronBackCircleOutline} />
                    </IonButton>

                    <div ref={carouselRef} className="featured-carousel-scroll">
                        {featuredProductsList.map((product) => (
                            <IonCard key={product.id} className="featured-product-card">
                                <IonGrid>
                                    <IonRow className="ion-align-items-center">
                                        <IonCol size="6">
                                            <img
                                                src={product.img}
                                                alt={product.name}
                                                className="featured-product-image"
                                            />
                                        </IonCol>
                                        <IonCol size="6">
                                            <IonCardHeader className="featured-card-header">
                                                <IonIcon icon={star} color="warning" className="featured-icon" />
                                                <IonCardTitle className="featured-product-title">
                                                    {product.name}
                                                </IonCardTitle>
                                                <IonCardSubtitle className="featured-product-price">
                                                    ₱ {product.price.toLocaleString()}
                                                </IonCardSubtitle>
                                            </IonCardHeader>
                                            <IonCardContent className="ion-no-padding">
                                                <IonButton
                                                    expand="block"
                                                    fill="solid"
                                                    color="tertiary"
                                                    className="featured-order-button"
                                                    onClick={() => handleOrder(product)}
                                                >
                                                    Order Now
                                                </IonButton>
                                            </IonCardContent>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonCard>
                        ))}
                    </div>

                    <IonButton
                        fill="clear"
                        size="large"
                        className="carousel-arrow right"
                        onClick={() => scrollCarousel('right')}
                        color="tertiary"
                    >
                        <IonIcon icon={chevronForwardCircleOutline} />
                    </IonButton>
                </div>

                {/* --- ADVERTISEMENT CAROUSEL --- */}
                <div className="ad-carousel-container">
                    <IonButton
                        fill="clear"
                        size="small"
                        className="carousel-arrow left"
                        onClick={() => scrollAdCarousel('left')}
                        color="primary"
                        style={{ zIndex: 5, left: 10 }}
                    >
                        <IonIcon icon={chevronBackCircleOutline} />
                    </IonButton>

                    <div ref={adCarouselRef} className="ad-carousel-scroll">
                        {advertisements.map((ad) => (
                            <IonCard 
                                key={ad.id} 
                                className="ad-card ion-no-margin"
                                style={{ '--background': ad.bgColor }}
                                onClick={() => handleAdAction(ad.action)}
                            >
                                <IonIcon icon={ad.icon} size="large" style={{ color: ad.promoColor, minWidth: '40px' }}/>
                                <div className="ad-text-container">
                                    <IonText style={{ color: ad.textColor }}>
                                        <h4 className="ion-no-margin" style={{ color: ad.textColor }}>{ad.title}</h4>
                                    </IonText>
                                    <IonText style={{ color: ad.textColor }}>
                                        <p className="ion-no-margin">{ad.subtitle}</p>
                                    </IonText>
                                </div>
                                <IonButton 
                                    fill="solid" 
                                    color={ad.buttonColor} 
                                    size="small"
                                    style={{ '--box-shadow': 'none', fontWeight: 'bold' }}
                                >
                                    {ad.buttonText}
                                </IonButton>
                            </IonCard>
                        ))}
                    </div>

                    <IonButton
                        fill="clear"
                        size="large"
                        className="carousel-arrow right"
                        onClick={() => scrollAdCarousel('right')}
                        color="primary"
                        style={{ zIndex: 5, right: 10 }}
                    >
                        <IonIcon icon={chevronForwardCircleOutline} />
                    </IonButton>
                </div>
                {/* --- END ADVERTISEMENT CAROUSEL --- */}


                {searchTerm === "" && (
                    <div className="cobalt-segment-container">
                        <IonSegment
                            value={category}
                            onIonChange={(e) => setCategory(String(e.detail.value))}
                            scrollable
                            className="k-segment-cobalt"
                        >
                            <IonSegmentButton value="iced">
                                <IonIcon icon={pint} />
                                <IonLabel>Iced Drinks</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="hot">
                                <IonIcon icon={cafe} />
                                <IonLabel>Hot Brews</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="pastries">
                                <IonIcon icon={fastFood} />
                                <IonLabel>Desserts</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>
                )}

                <div className="product-list">
                    <h3 className="ion-padding-start ion-no-margin">
                        {searchTerm !== ""
                            ? "Search Results"
                            : `Our ${category.charAt(0).toUpperCase() + category.slice(1)} Selection`}
                    </h3>

                    <IonGrid>
                        <IonRow className="ion-justify-content-start">
                            {filteredProducts.map((product) => (
                                <React.Fragment key={product.id}>
                                    <IonCol sizeXs={gridColumns.xs.toString()} sizeSm={gridColumns.sm.toString()} sizeMd={gridColumns.md.toString()} sizeLg={gridColumns.lg.toString()}>
                                        <IonCard className="kopi-product-grid-card">
                                            <div className="card-img-container" onClick={() => handleToggleDetails(product.id)}>
                                                <img
                                                    src={product.img}
                                                    alt={product.name}
                                                    className="product-grid-image"
                                                />
                                            </div>
                                            <IonCardHeader className="ion-text-center">
                                                <IonCardTitle className="product-grid-title">{product.name}</IonCardTitle>
                                                <IonCardSubtitle className="product-grid-price light-gold-accent-text">₱ {product.price.toLocaleString()}</IonCardSubtitle>
                                            </IonCardHeader>
                                            <IonCardContent className="ion-no-padding">
                                                <IonRow className="ion-align-items-center ion-justify-content-center ion-no-padding">
                                                    <IonCol size="4" className="ion-text-center ion-no-padding">
                                                        <IonButton
                                                            fill="clear"
                                                            color="danger"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(product.id);
                                                            }}
                                                        >
                                                            <IonIcon
                                                                slot="icon-only"
                                                                icon={favorites.includes(product.id) ? heart : heartOutline}
                                                            />
                                                        </IonButton>
                                                    </IonCol>
                                                    <IonCol size="4" className="ion-text-center ion-no-padding">
                                                        <IonButton
                                                            fill="clear"
                                                            color="tertiary"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleDetails(product.id);
                                                            }}
                                                        >
                                                            <IonIcon
                                                                slot="icon-only"
                                                                icon={expandedProduct === product.id ? chevronUp : informationCircleOutline}
                                                            />
                                                        </IonButton>
                                                    </IonCol>
                                                    <IonCol size="4" className="ion-text-center ion-no-padding">
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
                                                    </IonCol>
                                                </IonRow>
                                            </IonCardContent>
                                        </IonCard>
                                    </IonCol>

                                    {expandedProduct === product.id && (
                                        <IonCol size="12" className="ion-no-padding ion-padding-horizontal">
                                            <div className="product-dropdown-details ion-padding-vertical ion-margin-bottom" style={{
                                                border: '1px solid #eee',
                                                borderRadius: '8px',
                                                backgroundColor: '#fff',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                            }}>
                                                <h4 style={{ color: '#072661', fontWeight: 'bold', fontSize: '1.1em', padding: '0 16px', marginBottom: '8px' }}>Description:</h4>
                                                <p style={{ color: '#555', padding: '0 16px', marginBottom: '15px', lineHeight: '1.4' }}>{product.description}</p>

                                                <h4 style={{ color: '#072661', fontWeight: 'bold', fontSize: '1.1em', padding: '0 16px', marginBottom: '8px' }}>Ingredients:</h4>
                                                <p style={{ color: '#555', padding: '0 16px', lineHeight: '1.4' }}>{product.ingredients}</p>

                                                <IonButton
                                                    expand="block"
                                                    fill="solid"
                                                    color="tertiary"
                                                    className="ion-margin-top ion-margin-horizontal"
                                                    style={{ height: '40px' }}
                                                    onClick={() => {
                                                        handleOrder(product);
                                                        setExpandedProduct(null);
                                                    }}
                                                >
                                                    <IonIcon slot="start" icon={addCircle} />
                                                    Add to Cart (₱{product.price.toLocaleString()})
                                                </IonButton>
                                            </div>
                                        </IonCol>
                                    )}
                                </React.Fragment>
                            ))}
                        </IonRow>
                    </IonGrid>

                    {filteredProducts.length === 0 && (
                        <IonText color="medium" className="ion-padding">
                            <p className="ion-text-center">No products found matching "**{searchTerm}**".</p>
                        </IonText>
                    )}
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={1500}
                    color="tertiary"
                />

                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => {
                        setShowAlert(false);
                        if (!selectedOrderType) {
                        }
                    }}
                    header="Welcome Back! 🌟"
                    subHeader="How would you like to receive your Kopi Chingu order today?"
                    cssClass="kopi-alert"
                    buttons={[
                        {
                            text: selectedOrderType === 'pickup'
                                ? `🚶 Pick-up ✅`
                                : `🚶 Pick-up`,
                            cssClass: selectedOrderType === 'pickup' ? 'alert-button-selected' : '',
                            handler: () => {
                                handleOrderTypeSelection('pickup');
                            }
                        },
                        {
                            text: selectedOrderType === 'delivery'
                                ? `🛵 Delivery ✅`
                                : `🛵 Delivery`,
                            cssClass: selectedOrderType === 'delivery' ? 'alert-button-selected' : '',
                            handler: () => {
                                handleOrderTypeSelection('delivery');
                            }
                        }
                    ]}
                />


            </IonContent>


            <IonTabBar slot="bottom" className="kopi-tab-bar">
                <IonTabButton tab="shop" href="/page/Shop">
                    <IonIcon icon={homeOutline} />
                    <IonLabel>Home</IonLabel>
                </IonTabButton>

                <IonTabButton tab="favorites" onClick={() => history.push('/page/Favorites')}>
                    <IonIcon icon={heartOutline} />
                    <IonLabel>Favorites</IonLabel>
                </IonTabButton>

                <IonTabButton tab="cart" onClick={() => history.push('/page/Cart')}>
                    <IonIcon icon={basketOutline} />
                    <IonLabel>Cart</IonLabel>
                    {cartCount > 0 && (
                        <IonBadge color="danger">{cartCount}</IonBadge>
                    )}
                </IonTabButton>

                <IonTabButton tab="profile" onClick={() => history.push('/page/Profile')}>
                    <IonIcon icon={personCircleOutline} />
                    <IonLabel>Profile</IonLabel>
                </IonTabButton>
            </IonTabBar>


        </IonPage>
    );
};

export default Shop;
