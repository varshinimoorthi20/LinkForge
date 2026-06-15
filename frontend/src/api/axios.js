import axios from "axios";

const API = axios.create({
  baseURL: "https://linkforge-production-5d61.up.railway.app/api",
});

export default API;