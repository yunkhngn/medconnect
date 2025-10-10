export const routeConfig = {
  "/": {
    authRequired: false,
    redirectIfAuth: "/redirectByRole",
  },
  "/dang-nhap": {
    authRequired: false,
    redirectIfAuth: "/redirectByRole",
  },

  "/admin/trang-chu": {
    authRequired: true,
    roles: ["admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
  "/admin/*": {
    authRequired: true,
    roles: ["admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },

  "/bac-si/trang-chu": {
    authRequired: true,
    roles: ["doctor", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
  "/bac-si/*": {
    authRequired: true,
    roles: ["doctor", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },

  "/nguoi-dung/trang-chu": {
    authRequired: true,
    roles: ["patient", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
  "/nguoi-dung/*": {
    authRequired: true,
    roles: ["patient", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
};
