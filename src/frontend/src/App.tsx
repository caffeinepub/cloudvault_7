import { Toaster } from "@/components/ui/sonner";
import { Cloud, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

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
        <p className="text-sm text-muted-foreground">Loading CloudVault...</p>
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
