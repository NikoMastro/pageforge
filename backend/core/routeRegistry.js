const express = require("express");

class RouteRegistry {
  constructor() {
    this.router = express.Router();
    this.routes = new Map();
  }

  register(path, route) {
    if (this.routes.has(path)) {
      throw new Error(`Route ${path} is already registered`);
    }

    this.routes.set(path, route);
    this.router.use(path, route.getRouter());
    return this;
  }

  getRouter() {
    return this.router;
  }
}

module.exports = RouteRegistry;
