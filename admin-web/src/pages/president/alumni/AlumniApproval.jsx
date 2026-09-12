import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PresidentAlumniApproval() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/president/students", { replace: true });
  }, [navigate]);

  return null;
}
