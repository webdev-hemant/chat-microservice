const axios = require("axios");
const { API_GATEWAY_ENDPOINT } = require("../config/allEnv");

const axiosInternal = axios.create({
  baseURL: API_GATEWAY_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = { axiosInternal };
