import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import CartCount from "@/components/cart-count";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";

const Navbar = async () => {
  const user = await getSessionUser();

  return (
    <nav className="sticky top-0 z-40 print:hidden h-16 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          {/* Desktop Menu */}
          <NavMenu className="hidden lg:block" />
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="relative" size="icon" variant="ghost">
            <Link aria-label="ตะกร้า" data-testid="nav-cart" href="/cart">
              <ShoppingCart className="size-5" />
              <span className="-top-0.5 -right-0.5 absolute flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                <CartCount />
              </span>
            </Link>
          </Button>

          <ThemeToggle />

          {!user && (
            <>
              <Button asChild className="hidden sm:inline-flex" variant="ghost">
                <Link data-testid="nav-login" href="/login">
                  เข้าสู่ระบบ
                </Link>
              </Button>
              <Button asChild>
                <Link data-testid="nav-signup" href="/signup">
                  สมัครสมาชิก
                </Link>
              </Button>
            </>
          )}

          {user && <UserMenu email={user.email} isAdmin={user.role === "admin"} name={user.name} />}

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
