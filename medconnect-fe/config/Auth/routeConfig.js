export const routeConfig = {
  "/": {
    authRequired: false,
  },
  "/dang-nhap": {
    authRequired: false,
    redirectIfAuth: "/redirectByRole",
  },
  // "/dang-ky": {
  //   authRequired: false,
  //   redirectIfAuth: "/redirectByRole",
  // },

  "/admin/trang-chu": {
    authRequired: true,
    roles: ["admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/",
  },
  "/admin/*": {
    authRequired: true,
    roles: ["admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/",
  },

  "/bac-si/trang-chu": {
    authRequired: true,
    roles: ["doctor", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/",
  },
  "/bac-si/*": {
    authRequired: true,
    roles: ["doctor", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/",
  },

  "/nguoi-dung/trang-chu": {
    authRequired: true,
    roles: ["patient", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/",
  },
  "/nguoi-dung/*": {
    authRequired: true,
    roles: ["patient", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/",
  },
};
