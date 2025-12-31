import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// ==========================================
// SHARED COMPONENTS
// ==========================================
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import SubscribeSection from "./Components/SubscribeSection";
import Layout from "./Layout/Layout";

// ==========================================
// HOME PAGE SECTIONS
// ==========================================
import Home from "./Components/Home";
import Categories from "./Components/Categories";
import Products from "./Components/Products";
import Trending from "./Components/Trending";
import PromoBanner from "./Components/PromoBanner";
import Newarrival from "./Components/Newarrival";
import Exploremore from "./Components/Exploremore";
import Branded from "./Components/Branded";

// ==========================================
// CORE PAGES
// ==========================================
import BookmarksPage from "./Components/BookmarksPage";
import CardDetailPage from "./Components/CardDetailPage";
import BrochuresPage from "./Components/BrochuresPage";
import WinterWearPage from "./Components/WinterWearPage";
import CardsPage from "./Components/CardsPage";
import AdminPanel from "./Components/Admin/AdminPanel";
import Cart from "./Components/Cart";
import SearchResults from "./Components/SearchResults";
import FavoritesPage from "./Components/FavoritesPage";
import AuthDebug from "./Components/AuthDebug";
import MyProjectsPage from "./Components/MyProjectsPage";
import PurchaseHistoryPage from "./Components/PurchaseHistoryPage";
import CheckoutPage from "./Components/CheckoutPage";
import OrderConfirmationPage from "./Components/OrderConfirmationPage";

// ==========================================
// CATEGORY PAGES
// ==========================================
import GreetingCardsPage from "./Components/GreetingCardsPage";
import PersonalisedCardsPage from "./Components/PersonalisedCardsPage";
import FramesPage from "./Components/FramesPage";
import PrintsPage from "./Components/PrintsPage";
import PostersPage from "./Components/PostersPage";
import PoloTshirtsPage from "./Components/PoloTshirtsPage";
import CertificatesPage from "./Components/CertificatesPage";
import BulkOrdersPage from "./Components/BulkOrdersPage";

// ==========================================
// AUTH PAGES
// ==========================================
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import PaymentModal from "./Components/PaymentModal";







function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== ADMIN PANEL (No Layout) ==================== */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* ==================== MAIN LAYOUT (With Navbar/Footer) ==================== */}
        <Route element={<Layout />}>
          {/* ==================== HOME PAGE ==================== */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <Categories />
                <Products />
                <Trending />
                <Branded />
                <PromoBanner />
                <Exploremore />
                <Newarrival />
                <Footer />
              </>
            }
          />

          {/* ==================== SEARCH PAGE ==================== */}
          <Route
            path="/search"
            element={
              <>
                <SearchResults />
                <Footer />
              </>
            }
          />

          {/* ==================== FAVORITES PAGE ==================== */}
          <Route
            path="/favorites"
            element={
              <>
                <FavoritesPage />
                <Footer />
              </>
            }
          />

          {/* ==================== MY PROJECTS PAGE ==================== */}
          <Route
            path="/projects"
            element={
              <>
                <MyProjectsPage />
                <Footer />
              </>
            }
          />

          {/* ==================== PURCHASE HISTORY PAGE ==================== */}
          <Route
            path="/purchase-history"
            element={
              <>
                <PurchaseHistoryPage />
                <Footer />
              </>
            }
          />

          {/* ==================== CHECKOUT PAGE ==================== */}
          <Route
            path="/checkout"
            element={
              <>
                <CheckoutPage />
                <Footer />
              </>
            }
          />

          {/* ==================== ORDER CONFIRMATION PAGE ==================== */}
          <Route
            path="/order-confirmation/:orderId"
            element={
              <>
                <OrderConfirmationPage />
                <Footer />
              </>
            }
          />

          {/* ==================== AUTH DEBUG (Development Only) ==================== */}
          <Route path="/auth-debug" element={<AuthDebug />} />

          {/* ==================== CART PAGE ==================== */}
          <Route path="/payment" element={<PaymentModal />} />
          <Route
            path="/cart"
            element={
              <>
                <Cart />
                <Footer />
              </>
            }
          />

          {/* ==================== AUTH ROUTES ==================== */}
          <Route
            path="/login"
            element={
              <>
                <Login />
                <Footer />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <Signup />
                <Footer />
              </>
            }
          />

          {/* ==================== VISITING CARDS ==================== */}
          <Route
            path="/bookmarks"
            element={
              <>
                <BookmarksPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/bookmarks/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== STATIONERY ==================== */}
          <Route
            path="/brochures"
            element={
              <>
                <BrochuresPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/brochures/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== STAMPS ==================== */}
          <Route
            path="/cards"
            element={
              <>
                <CardsPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/cards/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== SIGNS ==================== */}
          <Route
            path="/certificates"
            element={
              <>
                <CertificatesPage/>
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/certificates/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== LABELS ==================== */}
          <Route
            path="/greetingcards"
            element={
              <>
                <GreetingCardsPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/greetingcards/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== CLOTHING ==================== */}
          <Route
            path="/personalised"
            element={
              <>
                <PersonalisedCardsPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/personalised/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== GIFTS ==================== */}
          <Route
            path="/frames"
            element={
              <>
                <FramesPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/frames/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== WINTER WEAR ==================== */}
          {/* <Route
            path="/winter-wear"
            element={
              <>
                <WinterWearPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/winter-wear/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          /> */}

          {/* ==================== BULK ORDERS PAGE ==================== */}
          <Route
            path="/bulk-orders"
            element={
              <>
                <BulkOrdersPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/bulk-orders/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== PRINTS ==================== */}
          <Route
            path="/Prints"
            element={
              <>
                <PrintsPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/Prints/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== DRINKWARE ==================== */}
          <Route
            path="/posters"
            element={
              <>
                <PostersPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/posters/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== POLO T-SHIRTS ==================== */}
          {/* <Route
            path="/polo-tshirts"
            element={
              <>
                <PoloTshirtsPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />
          <Route
            path="/polo-tshirts/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          /> */}

          {/* ==================== GENERIC PRODUCT DETAIL ==================== */}
          <Route
            path="/products/:slug"
            element={
              <>
                <CardDetailPage />
                <SubscribeSection />
                <Footer />
              </>
            }
          />

          {/* ==================== 404 NOT FOUND ==================== */}
          <Route
            path="*"
            element={
              <>
                {/* <div className="min-h-screen bg-gray-50 py-16 px-6">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                      Page Not Found
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                      Sorry, the page you're looking for doesn't exist.
                    </p>
                    <div className="space-x-4">
                      <button
                        onClick={() => window.history.back()}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => (window.location.href = "/")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                      >
                        Go Home
                      </button>
                    </div>
                  </div>
                </div> */}
                <Footer />
              </>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;