const fs = require("fs");


const http = require("http");

 

const crypto = require("crypto");

 

const usersData = JSON.parse(fs.readFileSync("users.json"));

 

let refreshToken = null;

 

function generateToken() {

  return crypto.randomBytes(32).toString("hex");

}

 

function findUserByUsername(username) {

  return usersData.user.find((user) => user.username === username);

}

 

function hashPassword(password) {

  const hash = crypto.createHash("sha256");

 

  hash.update(password);

 

  return hash.digest("hex");

}

 

function verifyPassword(password, hashedPassword) {

  return hashPassword(password) === hashedPassword;

}

 

function isAdminUser(user) {

  return user.username === "admin@example.com";

}

 

const bearerTokenExpirationMinutes = 2;

 

const bearerTokenExpirationMs = bearerTokenExpirationMinutes * 60 * 1000;

 

const refreshTokenExpirationMinutes = 5;

 

const refreshTokenExpirationMs = refreshTokenExpirationMinutes * 60 * 1000;

 

const server = http.createServer((req, res) => {

  if (req.method === "OPTIONS") {

    // Handle preflight requests

 

    res.writeHead(200, {

      "Access-Control-Allow-Origin": "http://localhost:3001",

 

      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

 

      "Access-Control-Allow-Headers": "Content-Type, Authorization",

 

      "Access-Control-Allow-Credentials": true,

    });

 

    res.end();

 

    return;

  }

 

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");

 

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

 

  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

 

  res.setHeader("Access-Control-Allow-Credentials", true);

 

  if (req.url === "/login" && req.method === "POST") {

    let body = "";

 

    req.on("data", (chunk) => {

      body += chunk.toString();

    });

 

    req.on("end", () => {

      try {

        const { username, password, rememberMe } = JSON.parse(body);

 

        const user = findUserByUsername(username);

 

        if (!user || !verifyPassword(password, user.password)) {

          res.writeHead(401, { "Content-Type": "text/plain" });

 

          res.end("Unauthorized");

 

          return;

        }

 

        const bearerToken = generateToken();

 

        if (rememberMe) {

          refreshToken = generateToken();

          user.refreshToken = refreshToken;

          //user.rememberMe = true;

          user.refreshTokenExpiration = new Date(

            Date.now() + refreshTokenExpirationMs

          ).toISOString();

         

        } else {

          user.refreshToken = null;

          user.refreshTokenExpiration = null; // Set refresh token and its expiration to null

          user.rememberMe = false;

        }

        user.bearerToken = bearerToken;

 

        const expiration = new Date(

          Date.now() +

            (rememberMe ? refreshTokenExpirationMs : bearerTokenExpirationMs)

        );

 

        user.expiration = expiration.toISOString();

 

        fs.writeFileSync("users.json", JSON.stringify(usersData, null, 2));

 

        res.writeHead(200, { "Content-Type": "application/json" });

 

        res.end(JSON.stringify({ bearerToken, refreshToken }));

      } catch (error) {

        console.error(error);

 

        res.writeHead(500, { "Content-Type": "text/plain" });

 

        res.end("Internal Server Error");

      }

    });

  }

  else if (req.url === "/refresh" && req.method === "POST") {

    console.log("Refresh request received");

 

    let body = "";

    req.on("data", (chunk) => {

      body += chunk.toString();

    });

 

    req.on("end", () => {

      try {

        const { refreshToken } = JSON.parse(body);

        console.log("Received refresh token:", refreshToken);

 

        // Find the user based on the refresh token in JSON

      const user = usersData.user.find((user) => user.refreshToken === refreshToken);

 

      if (!user) {

        console.log("Refresh token not found");

        res.writeHead(401, { "Content-Type": "text/plain" });

        res.end("Unauthorized");

        return;

      }

 

        const now = Date.now();

 

        if (user.refreshTokenExpiration && new Date(user.refreshTokenExpiration) < now) {

          console.log("Refresh token has expired");

          res.writeHead(401, { "Content-Type": "text/plain" });

          res.end("Unauthorized");

        } else {

          console.log("Refreshing token...");

          console.log("Refresh token expiration:", user.refreshTokenExpiration);

          console.log("Current time:", new Date());

 

          if (user.bearerTokenExpiration && new Date(user.bearerTokenExpiration) < now) {

            console.log("Bearer token has expired, generating new one...");

 

            const bearerToken = generateToken();

            user.bearerToken = bearerToken;

 

            const expiration = new Date(now + bearerTokenExpirationMs);

            user.bearerTokenExpiration = expiration.toISOString();

 

            fs.writeFileSync("users.json", JSON.stringify(usersData, null, 2));

 

            console.log("New bearer token:", bearerToken);

            console.log("New bearer token expiration:", expiration);

          }

 

          const bearerToken = user.bearerToken;

 

          res.writeHead(200, { "Content-Type": "application/json" });

          res.end(JSON.stringify({ bearerToken }));

        }

      } catch (error) {

        console.error(error);

        res.writeHead(500, { "Content-Type": "text/plain" });

        res.end("Internal Server Error");

      }

    });

  }

  else {

    res.writeHead(404, { "Content-Type": "text/plain" });

 

    res.end("Not Found");

  }

});

 

const PORT = process.env.PORT || 3000;

 

server.listen(PORT, () => {

  console.log(`Server running at http://localhost:${PORT}`);

});

 