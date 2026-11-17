import LandingHeader from "@/shared/components/layout/LandingHeader";
import WishlistsClient from "./WishlistsClient";
import MobileWishlistView from "@/features/wishlist/components/MobileWishlistView";

export const metadata = { title: "Wishlists – FoxPassport" };

// The shared app header (with its mobile menu and bottom nav) at every width,
// over the mobile or desktop wishlist grid.
export default function WishlistsPage() {
  return (
    <div className="min-h-screen bg-canvas font-body">
      <LandingHeader />
      <div className="lg:hidden">
        <MobileWishlistView />
      </div>
      <div className="hidden lg:block">
        <WishlistsClient />
      </div>
    </div>
  );
}
