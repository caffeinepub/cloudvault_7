import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthScreenProps {
  onAuthenticated: (username: string) => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { actor } = useActor();

  const [loginPassword, setLoginPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isIIConnecting = loginStatus === "logging-in";

  const handleRegister = async () => {
    if (!regUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsRegistering(true);
    try {
      if (!identity) {
        await login();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (actor) {
        await actor.register(regUsername.trim());
        await actor.saveCallerUserProfile({ username: regUsername.trim() });
        toast.success("Account created successfully!");
        onAuthenticated(regUsername.trim());
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("already registered")) {
        toast.error(
          "This identity already has an account. Please use the Sign In tab.",
        );
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleIILogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch {
      toast.error("Connection failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.11 0.03 252) 0%, oklch(0.15 0.04 248) 100%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.97 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.97 0 0) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-glow">
            <Cloud className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            CloudVault
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your private media, secured in the cloud
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6 bg-muted">
              <TabsTrigger
                value="login"
                className="flex-1 data-[state=active]:bg-accent data-[state=active]:text-primary"
                data-ocid="auth.login.tab"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 data-[state=active]:bg-accent data-[state=active]:text-primary"
                data-ocid="auth.register.tab"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="login-password"
                  className="text-muted-foreground text-xs uppercase tracking-wider font-semibold"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showLoginPw ? "text" : "password"}
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleIILogin()}
                    className="pl-9 pr-10 bg-muted border-border"
                    data-ocid="auth.login.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showLoginPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                onClick={handleIILogin}
                disabled={isIIConnecting || isLoggingIn}
                data-ocid="auth.login.submit_button"
              >
                {isIIConnecting || isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  <>Sign In to CloudVault</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Authentication secured by Internet Identity
              </p>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-username"
                  className="text-muted-foreground text-xs uppercase tracking-wider font-semibold"
                >
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-username"
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="pl-9 bg-muted border-border"
                    data-ocid="auth.register.input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-password"
                  className="text-muted-foreground text-xs uppercase tracking-wider font-semibold"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showRegPw ? "text" : "password"}
                    placeholder="Create a password (min 6 chars)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-9 pr-10 bg-muted border-border"
                    data-ocid="auth.register.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRegPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                onClick={handleRegister}
                disabled={isRegistering || isIIConnecting}
                data-ocid="auth.register.submit_button"
              >
                {isRegistering || isIIConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  <>Create Account</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your data is private and encrypted
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: "🔒", label: "Encrypted" },
            { icon: "☁️", label: "Cloud-native" },
            { icon: "📱", label: "Any Device" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-card rounded-xl p-3 text-center border border-border"
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="text-xs font-medium text-muted-foreground">
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
