import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AuthSuccess() {
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // decode token to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));

      setUserFromToken({
        id: payload.id,
        email: payload.email,
      });

      navigate("/dashboard");
    }
  }, []);

  return ;
}