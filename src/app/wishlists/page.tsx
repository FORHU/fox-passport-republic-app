import WishlistsClient from "./WishlistsClient";
import MobileWishlistView from "@/features/wishlist/components/MobileWishlistView";

export const metadata = { title: "Wishlists – FoxPassport" };

export default function WishlistsPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileWishlistView />
      </div>
      <div className="hidden lg:block">
        <WishlistsClient />
      </div>
    </>
  );
}
