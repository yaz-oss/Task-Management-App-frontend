import axios from "axios";

const API = axios.create({
  baseURL: "https://task-managment-app-backend.onrender.com",
});

export default API;
