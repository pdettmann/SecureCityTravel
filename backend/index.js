// query user with password and email
// send user details (profile)
// check pw against have I been pwned
// check pw against confirmPassword in frontend
// solarqube

const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
