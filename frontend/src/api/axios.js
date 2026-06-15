import axios from "axios";

const API = axios.create({
  baseURL: "https://your-railway-domain.up.railway.app/api",
});

export default API;