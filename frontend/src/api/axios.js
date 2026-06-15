import axios from "axios";

const API = axios.create({
  baseURL: "https://linkforge-backend-3ps1.onrender.com/api",
});

export default API;