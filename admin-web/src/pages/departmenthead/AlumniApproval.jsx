import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DepartmentHeadAlumniApproval() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/department-head/alumni", { replace: true });
  }, [navigate]);

  return null;
}
