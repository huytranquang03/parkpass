import { Link, Outlet } from "react-router";
import Layout from "@/components/ui/Layout";
import { useCart } from "@/features/cart/cartContext";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import CartItemRow from "@/features/cart/components/CartItemRow";
import { useTheme } from "@/features/theme/themeContext";
import { useAuth } from "@/features/auth/authContext";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function AppLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, totalQuantity, totalPrice, dispatch } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, status, logout } = useAuth();

  return (
    <>
      <Layout
        header={
          <nav aria-label="Điều hướng chính">
            <Link to="/">ParkPass</Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
            >
              Toggle Theme
            </button>
            <button
              type="button"
              aria-label={`Mở giỏ hàng, hiện có ${totalQuantity} vé`}
              onClick={() => setIsCartOpen(true)}
            >
              Giỏ hàng
              {totalQuantity > 0 && (
                <span aria-hidden="true">{totalQuantity}</span>
              )}
            </button>

            {status === "anonymous" && <Link to="/login">Đăng nhập</Link>}

            {status === "authenticated" && user && (
              <>
                <span>Xin chào, {user.name}</span>
                <button type="button" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            )}
          </nav>
        }
      >
        <Outlet />
      </Layout>
      <Drawer
        open={isCartOpen}
        title="Giỏ hàng"
        onClose={() => setIsCartOpen(false)}
      >
        {items.length === 0 ? (
          <p>Giỏ hàng đang trống.</p>
        ) : (
          <>
            <div>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.attractionId}-${item.ticketType}`}
                  item={item}
                  onQuantityChange={(quantity) =>
                    dispatch({
                      type: "UPDATE_QUANTITY",
                      payload: {
                        attractionId: item.attractionId,
                        ticketType: item.ticketType,
                        quantity,
                      },
                    })
                  }
                  onRemove={() =>
                    dispatch({
                      type: "REMOVE_ITEM",
                      payload: {
                        attractionId: item.attractionId,
                        ticketType: item.ticketType,
                      },
                    })
                  }
                />
              ))}
            </div>
            <p>
              <strong>Tổng cộng: {currencyFormatter.format(totalPrice)}</strong>
            </p>
            <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
              Tiến hành thanh toán
            </Link>
          </>
        )}
      </Drawer>
    </>
  );
}
