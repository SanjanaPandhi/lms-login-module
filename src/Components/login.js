import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

 

function Login() {

  const [username, setUsername] = useState("");

 

  const [password, setPassword] = useState("");

 

  const [usernameError, setUsernameError] = useState("");

 

  const [passwordError, setPasswordError] = useState("");

 

  const [loginSuccess, setLoginSuccess] = useState(false);

 

  const [bearerToken, setBearerToken] = useState("");

 

  const [refreshToken, setRefreshToken] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

 

  const validateForm = () => {

    let isValid = true;

 

    if (username.trim() === "") {

      setUsernameError("Email is required");

 

      isValid = false;

    } else if (!isValidEmail(username)) {

      setUsernameError("Invalid email format");

 

      isValid = false;

    } else {

      setUsernameError("");

    }

 

    if (password.length < 8) {

      setPasswordError("Password must be at least 8 characters");

 

      isValid = false;

    } else if (!hasSymbol(password)) {

      setPasswordError("Password must contain at least one symbol");

 

      isValid = false;

    } else if (!hasNumber(password)) {

      setPasswordError("Password must contain at least one number");

 

      isValid = false;

    } else if (!hasLetter(password)) {

      setPasswordError("Password must contain at least one letter");

 

      isValid = false;

    } else {

      setPasswordError("");

    }

 

    return isValid;

  };

 

  const isValidEmail = (email) => {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

 

    return emailPattern.test(email);

  };

 

  const hasSymbol = (str) => {

    const symbolPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

 

    return symbolPattern.test(str);

  };

 

  const hasNumber = (str) => {

    const numberPattern = /\d/;

 

    return numberPattern.test(str);

  };

 

  const hasLetter = (str) => {

    const letterPattern = /[a-zA-Z]/;

 

    return letterPattern.test(str);

  };

 

  const handleSubmit = async (e) => {

    e.preventDefault();

 

    if (validateForm()) {

      try {

        console.log("Submitting login form...");

 

        const response = await axios.post("http://localhost:3000/login", {

          username,

          password,

          rememberMe: rememberMe,

        });

 

        const { bearerToken, refreshToken } = response.data;

        console.log("Received tokens:", bearerToken, refreshToken);

 

        // Store the tokens in cookies

        Cookies.set("bearerToken", bearerToken);

        Cookies.set("refreshToken", refreshToken);

 

        // Set loginSuccess state to true upon successful login

        setLoginSuccess(true);

        //console.log("Login success:", loginSuccess);

 

        setBearerToken(bearerToken);

        setRefreshToken(refreshToken);

 

        // Clear form

        setUsername("");

        setPassword("");

      } catch (error) {

        console.error(error);

      }

    }

  };

 

  // ... (other code)

 

useEffect(() => {

  const storedBearerToken = Cookies.get("bearerToken");

  const storedRefreshToken = Cookies.get("refreshToken");

 

  console.log("Stored tokens:", storedBearerToken, storedRefreshToken);

 

  if (storedRefreshToken) {

    console.log("Stored refresh token found, refreshing token...");

 

    axios

      .post("http://localhost:3000/refresh", {

        refreshToken: storedRefreshToken,

      })

      .then((response) => {

        const { bearerToken } = response.data;

 

        // Update the stored bearer token

        Cookies.set("bearerToken", bearerToken);

        console.log("Updated bearer token:", bearerToken);

 

        setBearerToken(bearerToken);

        setLoginSuccess(true)

      })

      .catch((error) => {

        console.error("Refresh failed:", error);

        // Remove stored tokens on refresh failure

        Cookies.remove("bearerToken");

        Cookies.remove("refreshToken");

      });

  }

}, []);

 

 

  return (

    <div className="container">

      <div className="row justify-content-center">

        <div className="col-md-6">

          <div className="card mt-5">

            <div className="card-body">

              {loginSuccess ? (

                <div className="card">

                  <div className="card-body">

                    <h5 className="card-title">Thank You!</h5>

 

                    <p className="card-text">

                      You have successfully logged in.

                    </p>

                  </div>

                </div>

              ) : (

                <form onSubmit={handleSubmit}>

                  <div className="form-group">

                    <label htmlFor="username">Email</label>

 

                    <input

                      type="email"

                      className="form-control"

                      id="username"

                      value={username}

                      onChange={(e) => setUsername(e.target.value)}

                    />

 

                    {usernameError && (

                      <div className="text-danger">{usernameError}</div>

                    )}

                  </div>

 

                  <div className="form-group">

                    <label htmlFor="password">Password</label>

 

                    <input

                      type="password"

                      className="form-control"

                      id="password"

                      value={password}

                      onChange={(e) => setPassword(e.target.value)}

                    />

 

                    {passwordError && (

                      <div className="text-danger">{passwordError}</div>

                    )}

                  </div>

 

                  <div className="form-check">

                    <input

                      type="checkbox"

                      className="form-check-input"

                      id="rememberMe"

                      checked={rememberMe}

                      onChange={(e) => setRememberMe(e.target.checked)}

                    />

                    <label className="form-check-label" htmlFor="rememberMe">

                      Remember Me

                    </label>

                  </div>

 

                  <button type="submit" className="btn btn-primary">

                    Login

                  </button>

                </form>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

 

export default Login;