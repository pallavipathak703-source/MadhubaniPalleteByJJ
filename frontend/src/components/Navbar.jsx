import { memo } from "react";
import logo from "../assets/logo.jpg";
import { useCart } from "../context/CartContext";

function NavbarComponent() {
  const { cartCount, openCart } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <a href="#home">
          <img
            src={logo}
            alt="Madhubani Palette Logo"
            loading="eager"
          />
        </a>
      </div>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#shop">Collection</a>
        <a href="#about">Artist</a>
        <a href="#contact">Contact</a>
        <button
          type="button"
          className="cart-button"
          onClick={openCart}
          aria-label={`Open shopping bag with ${cartCount} items`}
        >
          <span className="cart-button-icon">🛍</span>
          <span className="cart-button-label">Bag</span>
          <span className="cart-badge">{cartCount}</span>
        </button>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
