import { useEffect, useState } from "react";
import { me } from "../lib/auth";

export function useMe() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, isAdmin: user?.role === "admin" };
}