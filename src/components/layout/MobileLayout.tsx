import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, Wallet, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/create", icon: PlusCircle, label: "Create" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function MobileLayout({ children, hideNav = false }: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-[480px] mx-auto bg-background relative">
      {/* Messages floating button */}
      {!hideNav && (
        <button
          onClick={() => navigate("/messages")}
          className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-y-auto scrollbar-hide",
        !hideNav && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-50">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const isCreate = item.path === "/create";

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-full transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isCreate ? (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center -mt-4 shadow-lg glow-gold">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  ) : (
                    <>
                      <Icon className={cn(
                        "w-6 h-6 transition-transform duration-200",
                        isActive && "scale-110"
                      )} />
                      <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
