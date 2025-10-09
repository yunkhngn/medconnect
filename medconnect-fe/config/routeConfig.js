export const routeConfig = {
  "/": {
    authRequired: false,
    redirectIfAuth: "/redirectByRole",
  },
  "/login": {
    authRequired: false,
    redirectIfAuth: "/redirectByRole",
  },

  "/admin/dashboard": {
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

  "/doctor/dashboard": {
    authRequired: true,
    roles: ["doctor", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
  "/doctor/*": {
    authRequired: true,
    roles: ["doctor", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },

  "/patient/dashboard": {
    authRequired: true,
    roles: ["patient", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
  "/patient/*": {
    authRequired: true,
    roles: ["patient", "admin"],
    redirectIfNotAuth: "/",
    redirectIfUnauthorized: "/403",
  },
};
