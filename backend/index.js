// check pw against confirmPassword in frontend
// check if email is valid in frontend
// sonarqube

// in production I would use https (using letsencrypt for the certificate)
const http = require("http");

const app = require("./app");
const server = http.createServer(app);

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
