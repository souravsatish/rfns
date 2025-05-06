 const express = require("express");
 const axios = require("axios");
 require("dotenv").config();
 const router = express.Router();

 const TOKEN_URL = "https://api.fitbit.com/oauth2/token";

 const getToday = () => new Date().toISOString().split("T")[0];

 function getAuthHeader() {
   return (
     "Basic " +
     Buffer.from(
       `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
     ).toString("base64")
   );
 }

 async function exchangeCodeForTokens(code) {
   const params = new URLSearchParams();
   params.append("client_id", process.env.FITBIT_CLIENT_ID);
   params.append("grant_type", "authorization_code");
   params.append("redirect_uri", process.env.REDIRECT_URI);
   params.append("code", code);

   const response = await axios.post(TOKEN_URL, params, {
     headers: {
       Authorization: getAuthHeader(),
       "Content-Type": "application/x-www-form-urlencoded",
     },
   });

   return response.data;
 }

 async function refreshAccessToken(refresh_token) {
   const params = new URLSearchParams();
   params.append("grant_type", "refresh_token");
   params.append("refresh_token", refresh_token);
   params.append("client_id", process.env.FITBIT_CLIENT_ID);

   const response = await axios.post(TOKEN_URL, params, {
     headers: {
       Authorization: getAuthHeader(),
       "Content-Type": "application/x-www-form-urlencoded",
     },
   });

   return response.data;
 }

 router.post("/exchange-code", async (req, res) => {
   const { code } = req.body;

   try {
     // getting access tokens
     const tokenData = await exchangeCodeForTokens(code);
     const access_token = tokenData.access_token;
     const refresh_token = tokenData.refresh_token;

     //fetching profile data
     const profileRes = await axios.get(
       "https://api.fitbit.com/1/user/-/profile.json",
       {
         headers: { Authorization: `Bearer ${access_token}` },
       }
     );
     const profile = profileRes.data.user;

     //days step count
     const today = getToday();
     const stepsRes = await axios.get(
       `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
       {
         headers: { Authorization: `Bearer ${access_token}` },
       }
     );

     const steps = stepsRes.data.summary.steps;

     res.json({
       profile,
       steps,
       refresh_token,
     });
   } catch (err) {
     console.error("Fitbit error:", err.response?.data || err.message);
     res.status(500).json({
       success: false,
       errors: err.response?.data.errors || [err.message],
     });
   }
 });

 module.exports = router;


//const express = require("express");
//const axios = require("axios");
//require("dotenv").config();
//const router = express.Router();
//
//const TOKEN_URL = "https://api.fitbit.com/oauth2/token";
//
//const getToday = () => new Date().toISOString().split("T")[0];
//
//function getAuthHeader() {
//  return (
//    "Basic " +
//    Buffer.from(
//      `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
//    ).toString("base64")
//  );
//}
//
//async function exchangeCodeForTokens(code) {
//  const params = new URLSearchParams();
//  params.append("client_id", process.env.FITBIT_CLIENT_ID);
//  params.append("grant_type", "authorization_code");
//  params.append("redirect_uri", process.env.REDIRECT_URI);
//  params.append("code", code);
//
//  const response = await axios.post(TOKEN_URL, params, {
//    headers: {
//      Authorization: getAuthHeader(),
//      "Content-Type": "application/x-www-form-urlencoded",
//    },
//  });
//
//  return response.data;
//}
//
//async function refreshAccessToken(refresh_token) {
//  const params = new URLSearchParams();
//  params.append("grant_type", "refresh_token");
//  params.append("refresh_token", refresh_token);
//  params.append("client_id", process.env.FITBIT_CLIENT_ID);
//
//  const response = await axios.post(TOKEN_URL, params, {
//    headers: {
//      Authorization: getAuthHeader(),
//      "Content-Type": "application/x-www-form-urlencoded",
//    },
//  });
//
//  return response.data;
//}
//
//router.post("/exchange-code", async (req, res) => {
//  const { code } = req.body;
//
//  try {
//    // Step 1: Get access tokens
//    const tokenData = await exchangeCodeForTokens(code);
//    let access_token = tokenData.access_token;
//    let refresh_token = tokenData.refresh_token;
//
//    let profileRes, stepsRes;
//
//    try {
//      // Step 2: Try fetching profile
//      profileRes = await axios.get("https://api.fitbit.com/1/user/-/profile.json", {
//        headers: { Authorization: `Bearer ${access_token}` },
//      });
//    } catch (err) {
//      // Step 3: If token expired, refresh it
//      if (err.response?.status === 401) {
//        const refreshed = await refreshAccessToken(refresh_token);
//        access_token = refreshed.access_token;
//        refresh_token = refreshed.refresh_token;
//
//        profileRes = await axios.get("https://api.fitbit.com/1/user/-/profile.json", {
//          headers: { Authorization: `Bearer ${access_token}` },
//        });
//      } else {
//        throw err;
//      }
//    }
//
//    const profile = profileRes.data.user;
//
//    // Step 4: Fetch steps using latest token
//    stepsRes = await axios.get(
//      `https://api.fitbit.com/1/user/-/activities/date/${getToday()}.json`,
//      {
//        headers: { Authorization: `Bearer ${access_token}` },
//      }
//    );
//    const steps = stepsRes.data.summary.steps;
//
//    res.json({
//      profile,
//      steps,
//      refresh_token,
//    });
//  } catch (err) {
//    console.error("Fitbit error:", err.response?.data || err.message);
//    res.status(500).json({
//      success: false,
//      errors: err.response?.data.errors || [err.message],
//    });
//  }
//});
//
//// Optional: Manual refresh endpoint for testing
//router.post("/refresh-token", async (req, res) => {
//  const { refresh_token } = req.body;
//
//  try {
//    const tokenData = await refreshAccessToken(refresh_token);
//    res.json(tokenData);
//  } catch (err) {
//    console.error("Refresh error:", err.response?.data || err.message);
//    res.status(500).json({
//      success: false,
//      errors: err.response?.data.errors || [err.message],
//    });
//  }
//});
//
//module.exports = router;
