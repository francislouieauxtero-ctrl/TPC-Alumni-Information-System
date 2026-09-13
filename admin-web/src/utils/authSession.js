export const extractAuthSession = (responseData) => {
  const data = responseData?.data;
  const payload = data && typeof data === "object" ? data : responseData;
  const user =
    payload?.user ??
    payload?.session ??
    (payload?.id !== undefined ? payload : null) ??
    responseData?.user ??
    responseData?.session ??
    null;

  return {
    token: payload?.token ?? responseData?.token ?? null,
    user,
  };
};

export const storeAuthSession = (token, user) => {
  const departmentId = user?.departmentId ?? user?.department?.id ?? "";
  const schoolId = user?.schoolId ?? user?.school_id ?? "";
  const departmentName = user?.department?.name ?? "";

  localStorage.setItem("token", token ?? "");
  localStorage.setItem("userId", user?.id != null ? String(user.id) : "");
  localStorage.setItem("userRole", user?.role ?? "");
  localStorage.setItem("userName", user?.name ?? "");
  localStorage.setItem("userEmail", user?.email ?? "");
  localStorage.setItem("userAvatar", user?.avatar ?? "");
  localStorage.setItem(
    "departmentId",
    departmentId !== "" ? String(departmentId) : "",
  );
  localStorage.setItem(
    "schoolId",
    schoolId !== "" ? String(schoolId) : "",
  );
  localStorage.setItem(
    "userDepartment",
    departmentId !== "" ? String(departmentId) : "",
  );
  localStorage.setItem("userDepartmentName", departmentName);
  localStorage.removeItem("departmentName");
  window.dispatchEvent(new Event("user-profile-updated"));
};
