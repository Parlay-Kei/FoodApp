import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Helper to get the remaining cooldown time from localStorage
const getRemainingCooldown = (): number => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const cooldownEndTime = localStorage.getItem('auth_cooldown_end');
    if (!cooldownEndTime) return 0;
    
    const endTime = parseInt(cooldownEndTime, 10);
    const now = Date.now();
    
    // If the cooldown has expired, return 0
    if (now >= endTime) {
      localStorage.removeItem('auth_cooldown_end');
      return 0;
    }
    
    // Return the remaining seconds
    return Math.ceil((endTime - now) / 1000);
  } catch (error) {
    console.error('Error reading cooldown from localStorage:', error);
    return 0;
  }
};

// Helper to set the cooldown end time in localStorage
const setCooldownEndTime = (durationSeconds: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const endTime = Date.now() + (durationSeconds * 1000);
    localStorage.setItem('auth_cooldown_end', endTime.toString());
  } catch (error) {
    console.error('Error setting cooldown in localStorage:', error);
  }
};

export const useLogin = () => {
  // Initialize cooldown from localStorage
  const [cooldown, setCooldown] = useState<number>(() => getRemainingCooldown());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const login = async (email: string, password: string) => {
    if (cooldown > 0) return; // still cooling off
    
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });

      if (error?.status === 429) { // Supabase rate-limit
        // Set cooldown in both state and localStorage
        setCooldownEndTime(15);
        setCooldown(15); // local 15-s lock
      } else if (error) {
        toast.error(error.message); // wrong pw, etc.
      } else {
        toast.success("Logged in successfully!");
        router.push("/menu");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async (email: string) => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Magic link sent to your email!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  // Initialize cooldown from localStorage on mount
  useEffect(() => {
    const initialCooldown = getRemainingCooldown();
    if (initialCooldown > 0) {
      setCooldown(initialCooldown);
    }
  }, []);

  // countdown tick
  useEffect(() => {
    if (!cooldown) return;
    
    const id = setInterval(() => {
      const remaining = getRemainingCooldown();
      setCooldown(remaining);
    }, 1000);
    
    return () => clearInterval(id);
  }, [cooldown]);

  return { login, sendMagicLink, cooldown, loading };
};
