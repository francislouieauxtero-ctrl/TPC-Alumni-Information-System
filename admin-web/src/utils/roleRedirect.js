export const getDashboardPath = (role) => {
  if (role === "super_admin") {
    return "/president/dashboard";
  }

  if (role === "admin") {
    return "/department-head/dashboard";
  }

  if (role === "user") {
    return "/student/dashboard";
  }

  return "/home";
};
