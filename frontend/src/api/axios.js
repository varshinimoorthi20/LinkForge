import axios from "axios";

const API = axios.create({
  baseURL: "https://linkforge-production-2973.up.railway.app/api",
});

export default API;