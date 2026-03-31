import { Toaster } from "@/components/ui/sonner";
import { Cloud, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

function useExitProtection() {
  const backPressedOnce = useRef(false);
  const backPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Push a dummy state so we can intercept the back button
    window.history.pushState({ exitProtected: true }, "");

    const handlePopState = () => {
      if (backPressedOnce.current) {
        // Second press within 3s — allow exit
        return;
      }

      // First press — re-push state and show warning
      window.history.pushState({ exitProtected: true }, "");
      backPressedOnce.current = true;

      toast("बाहेर पडण्यासाठी पुन्हा दाबा", {
        duration: 3000,
        position: "bottom-center",
      });

      if (backPressTimer.current) clearTimeout(backPressTimer.current);
      backPressTimer.current = setTimeout(() => {
        backPressedOnce.current = false;
      }, 3000);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (backPressTimer.current) clearTimeout(backPressTimer.current);
    };
  }, []);
}

export default function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useExitProtection();

  // When actor becomes available and we have an identity, fetch profile
  useEffect(() => {
    if (!identity || !actor || isFetching || profileChecked) return;

    let cancelled = false;
    setCheckingProfile(true);

    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile) {
          setUsername(profile.username);
        }
        setProfileChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setProfileChecked(true);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [identity, actor, isFetching, profileChecked]);

  // Reset when identity clears
  useEffect(() => {
    if (!identity) {
      setUsername(null);
      setProfileChecked(false);
    }
  }, [identity]);

  const handleLogout = () => {
    clear();
    setUsername(null);
    setProfileChecked(false);
  };

  const isLoading =
    isInitializing ||
    checkingProfile ||
    (!!identity && isFetching && !profileChecked);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Cloud className="w-6 h-6 text-primary-foreground" />
        </div>
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Storage King...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      {username ? (
        <Dashboard username={username} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthenticated={setUsername} />
      )}
    </>
  );
}
