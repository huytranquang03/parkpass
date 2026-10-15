import { Link, Outlet, useMatch } from "react-router";
import Layout from "@/components/ui/Layout";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import CartItemRow from "@/features/cart/components/CartItemRow";
import { useTheme } from "@/features/theme/themeContext";
import { useAuth } from "@/features/auth/authContext";
import {
  selectTotalPrice,
  selectTotalQuantity,
  useCartStore,
} from "@/features/cart/cartStore";
import styles from "./AppLayout.module.css";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import AttractionSearch from "@/features/attractions/components/AttractionSearch";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

interface HeaderCartButtonProps {
  totalQuantity: number;
  onClick: () => void;
}

function HeaderCartButton({ totalQuantity, onClick }: HeaderCartButtonProps) {
  return (
    <Button
      className={styles.cartButton}
      variant="ghost"
      iconOnly
      aria-label={`Mở giỏ hàng, hiện có ${totalQuantity} vé`}
      onClick={onClick}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>

      {totalQuantity > 0 && (
        <span className={styles.cartBadge} aria-hidden="true">
          {totalQuantity > 9 ? "9+" : totalQuantity}
        </span>
      )}
    </Button>
  );
}

export default function AppLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isAttractionDetail = useMatch("/attractions/:id") !== null;
  const isAttractionList = useMatch("/") !== null;
  // const { items, totalQuantity, totalPrice, dispatch } = useCart();

  const items = useCartStore((state) => state.items);
  const totalQuantity = useCartStore(selectTotalQuantity);
  const totalPrice = useCartStore(selectTotalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const { theme, toggleTheme } = useTheme();
  const { user, status, logout } = useAuth();

  function getInitials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return (
    <>
      <Layout
        compactHeaderOnMobile={isAttractionDetail}
        searchHeaderOnMobile={isAttractionList}
        header={
          <>
            <nav
              className={`${styles.headerNav} ${
                isAttractionDetail ? styles.detailDesktopHeader : ""
              } ${isAttractionList ? styles.listHeader : ""}`}
              aria-label="Điều hướng chính"
            >
              <Link className={styles.logo} to="/">
                <span className={styles.logoMark} aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 9V6h20v3a3 3 0 0 0 0 6v3H2v-3a3 3 0 0 0 0-6z" />
                    <path d="M13 6v12" />
                  </svg>
                </span>
                ParkPass
              </Link>
              <AttractionSearch
                className={isAttractionList ? styles.listHeaderSearch : ""}
              />
              <Button
                className={styles.themeButton}
                variant="ghost"
                iconOnly
                aria-label="Đổi giao diện sáng tối"
                aria-pressed={theme === "dark"}
                onClick={toggleTheme}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              </Button>

              <HeaderCartButton
                totalQuantity={totalQuantity}
                onClick={() => setIsCartOpen(true)}
              />

              {status === "anonymous" && (
                <Link className={styles.loginLink} to="/login">
                  Đăng nhập
                </Link>
              )}

              {status === "authenticated" && user && (
                <>
                  <Link
                    className={styles.avatar}
                    to="/orders"
                    aria-label="Tài khoản và đơn hàng"
                  >
                    {getInitials(user.name)}
                  </Link>

                  <Button
                    className={styles.accountAction}
                    variant="ghost"
                    onClick={logout}
                  >
                    Đăng xuất
                  </Button>
                </>
              )}
            </nav>

            {isAttractionDetail && (
              <nav
                className={styles.mobileDetailHeader}
                aria-label="Điều hướng trang chi tiết"
              >
                <Link
                  className={styles.mobileBackLink}
                  to="/"
                  aria-label="Quay lại danh sách"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </Link>

                <span className={styles.mobileHeaderTitle}>Chi tiết</span>

                <HeaderCartButton
                  totalQuantity={totalQuantity}
                  onClick={() => setIsCartOpen(true)}
                />
              </nav>
            )}
          </>
        }
      >
        <Outlet />
      </Layout>
      <Drawer
        open={isCartOpen}
        title={totalQuantity > 0 ? `Giỏ vé · ${totalQuantity} vé` : "Giỏ vé"}
        onClose={() => setIsCartOpen(false)}
        footer={
          items.length > 0 ? (
            <>
              <div className={styles.cartTotal}>
                <span className={styles.cartTotalLabel}>
                  Tổng cộng ({totalQuantity} vé)
                </span>

                <strong className={styles.cartTotalPrice}>
                  {currencyFormatter.format(totalPrice)}
                </strong>
              </div>

              <Link
                className={styles.checkoutLink}
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
              >
                Thanh toán
              </Link>

              <p className={styles.cartCaption}>Vé giữ trong giỏ 30 phút.</p>
            </>
          ) : undefined
        }
      >
        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <EmptyState
              title="Giỏ vé đang trống"
              description="Chọn một trò chơi và thêm vé để bắt đầu."
              action={
                <Button variant="primary" onClick={() => setIsCartOpen(false)}>
                  Khám phá attraction
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* <div>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.attractionId}-${item.ticketType}`}
                  item={item}
                  // onQuantityChange={(quantity) =>
                  //   dispatch({
                  //     type: "UPDATE_QUANTITY",
                  //     payload: {
                  //       attractionId: item.attractionId,
                  //       ticketType: item.ticketType,
                  //       quantity,
                  //     },
                  //   })
                  // }
                  onQuantityChange={(quantity) =>
                    updateQuantity(item.attractionId, item.ticketType, quantity)
                  }
                  // onRemove={() =>
                  //   dispatch({
                  //     type: "REMOVE_ITEM",
                  //     payload: {
                  //       attractionId: item.attractionId,
                  //       ticketType: item.ticketType,
                  //     },
                  //   })
                  // }
                  onRemove={() =>
                    removeItem(item.attractionId, item.ticketType)
                  }
                />
              ))}
            </div>
            <p>
              <strong>Tổng cộng: {currencyFormatter.format(totalPrice)}</strong>
            </p>
            <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
              Tiến hành thanh toán
            </Link> */}
            <div className={styles.cartItems}>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.attractionId}-${item.ticketType}`}
                  item={item}
                  onQuantityChange={(quantity) =>
                    updateQuantity(item.attractionId, item.ticketType, quantity)
                  }
                  onRemove={() =>
                    removeItem(item.attractionId, item.ticketType)
                  }
                />
              ))}
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
