/**
 * Axios instance for the public (no-auth) dashboard page — deliberately
 * separate from lib/api.js's authenticated client: this one never attaches
 * a Bearer token and never reacts to a 401 by clearing the session, since
 * there's no session here to clear. Same reasoning as the backend keeping
 * /api/public/dashboard as its own router instead of folding it into the
 * authenticated analytics routes.
 */
import axios from "axios";
import { API_BASE_URL } from "./api";

const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api/public`,
});

export default publicApi;
