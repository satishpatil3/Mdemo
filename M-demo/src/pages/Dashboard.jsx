import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/authService";
import { toast } from "../context/ToastContext";

/**
 * Dashboard Container Component
 *
 * Resolves the authenticated user's access role from Firestore ('admin' | 'pro' | 'plus'),
 * verifies account signup status, and renders the unified dashboard view with role-based permissions.
 */
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("plus");
  const [loading, setLoading] = useState(true);

  // Fetch the current user's role from Firestore upon authentication
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;

      try {
        const cleanEmail = user.email ? user.email.trim().toLowerCase() : "";

        // Admin fallback safeguard: ensure uninterrupted session for default admin account
        if (cleanEmail === "admin@example.com") {
          setRole("admin");
          setLoading(false);
          return;
        }

        let userRole = null;
        let isSignedUp = false;

        // 1. Direct UID lookup (Primary method: setDoc(doc(db, "users", uid)))
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data?.role) {
              userRole = String(data.role).trim().toLowerCase();
            }
            if (data?.isSignedUp === true || userRole === "admin") {
              isSignedUp = true;
            }
          }
        } catch (uidErr) {
          console.warn("Direct UID lookup error:", uidErr);
        }

        // 2. Fallback to querying by email if not found by direct UID
        if (!userRole) {
          const q = query(
            collection(db, "users"),
            where("email", "==", cleanEmail)
          );

          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            toast.error("Account not found in database. Please register on the Signup page first.");
            await logout();
            navigate("/login");
            return;
          }

          // Prioritize signed-up document if multiple exist
          for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            if (data?.role) {
              const r = String(data.role).trim().toLowerCase();
              if (data.isSignedUp === true || docSnap.id === user.uid) {
                userRole = r;
                isSignedUp = true;
                break;
              } else if (!userRole) {
                userRole = r;
              }
            }
            if (data?.isSignedUp === true || data?.role === "admin") {
              isSignedUp = true;
            }
          }
        }

        // Normalize resolved role to lowercase
        const cleanRole = (userRole || "plus").trim().toLowerCase();

        // Ensure users pre-added by admin must complete signup before accessing workspace
        if (!isSignedUp && cleanEmail !== "admin@example.com" && cleanRole !== "admin") {
          toast.warning("Signup Pending: You must register on the Signup page before accessing Dashboard.");
          await logout();
          navigate("/login");
          return;
        }

        console.log(`[Dashboard] Verified session for ${cleanEmail} with role: ${cleanRole}`);
        setRole(cleanRole);
        setLoading(false);
      } catch (error) {
        console.error("Dashboard role resolution error:", error);
        setRole("plus");
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, navigate]);

  // Loading state with centered spinner
  if (loading) {
    return (
      <>
        <Navbar role={role} />
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar role={role} />

      <main className="min-h-screen bg-slate-100 p-8 pt-24">
        <AdminDashboard role={role} />
      </main>
    </>
  );
}

export default Dashboard;
