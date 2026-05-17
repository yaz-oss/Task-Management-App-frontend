import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

const GoogleSuccess = () => {

  const navigate =
    useNavigate();

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get("token") ||
      params.get("accessToken") ||
      params.get("jwt") ||
      localStorage.getItem(
        "token"
      );

    const role =
      params.get("role") ||
      localStorage.getItem(
        "role"
      ) ||
      "user";

    const username =
      params.get("username") || "";

    if (token) {

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "role",
        role
      );

      if (username) {

        localStorage.setItem(
          "username",
          username
        );
      }

      navigate(
        role === "admin"
          ? "/admin"
          : "/dashboard",
        { replace: true }
      );
    }

    else {

      navigate(
        "/",
        { replace: true }
      );
    }

  }, [navigate]);

  return <div>Logging in...</div>;
};

export default
  GoogleSuccess;
