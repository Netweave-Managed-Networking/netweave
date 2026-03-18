
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const port = process.env.PORT;
  axios.defaults.baseURL = `http://localhost:${port}`;
};
