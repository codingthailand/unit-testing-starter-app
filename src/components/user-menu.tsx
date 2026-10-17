"use client";

import { BookOpen, LayoutDashboard, LogOut, Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

type UserMenuProps = {
  name: string;
  email: string;
  isAdmin: boolean;
};

export default function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 rounded-full px-2" data-testid="nav-user-menu" variant="ghost">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate md:inline" data-testid="nav-user-name">
            สวัสดี, {name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="font-medium">{name}</div>
          <div className="truncate text-muted-foreground text-xs">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link data-testid="menu-my-courses" href="/my-courses">
            <BookOpen /> คอร์สของฉัน
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link data-testid="menu-orders" href="/orders">
            <Receipt /> ประวัติการสั่งซื้อ
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link data-testid="menu-admin" href="/admin">
              <LayoutDashboard /> ระบบหลังบ้าน
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="logout-button" onSelect={handleLogout}>
          <LogOut /> ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
