import axios from "axios";

const API = axios.create({
  baseURL: "https://linkforge-16ha.onrender.com/api",
});

export default API;