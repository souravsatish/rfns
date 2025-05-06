// import React, { useEffect, useState } from "react";
// import { Container, Typography, Grid, Box } from "@mui/material";
// import axios from "axios";
// import { db, doc, getDoc, setDoc, collection, getDocs } from "../firebase";
// import { useLocation } from "react-router-dom";
// import Navbar from "./Navbar";
// import UserCard from "./UserCard";

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

// export default function Dashboard() {
//   const query = useQuery();
//   const code = query.get("code");
//   const [user, setUser] = useState(null);
//   const [allUsers, setAllUsers] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       if (!code) return;

//       try {
//         const res = await axios.post(
//           `${process.env.REACT_APP_BACKEND_URL}/api/fitbit/exchange-code`,
//           { code }
//         );

//         const { profile, steps } = res.data;

//         const userId = profile.encodedId;
//         const name = profile.fullName || profile.displayName || "Unknown User";
//         const email = profile.email || "not_provided@fitbit.com";

//         const userRef = doc(db, "users", userId);
//         const userSnap = await getDoc(userRef);

//         if (!userSnap.exists()) {
//           await setDoc(userRef, {
//             name,
//             email,
//             steps,
//           });
//         }

//         setUser({ ...profile, name, email, steps });

//         // Fetch all users
//         const usersSnapshot = await getDocs(collection(db, "users"));
//         const users = usersSnapshot.docs.map((doc) => doc.data());
//         setAllUsers(users);
//       } catch (err) {
//         console.error(
//           "Error fetching Fitbit data or saving to Firestore:",
//           err
//         );
//       }
//     }

//     fetchData();
//   }, [code]);

//   if (!user) return <Typography>Loading...</Typography>;

//   return (
//     <>
//       <Navbar />
//       <Container>
//         <Grid container spacing={2}>
//           {/* Left side: Logged-in user info */}
//           <Grid item xs={12} md={4}>
//             <Box>
//               <Typography variant="h4" gutterBottom>
//                 Welcome, {user.name}
//               </Typography>
//               <Typography>Email: {user.email}</Typography>
//               <Typography>Today's Steps: {user.steps}</Typography>
//             </Box>
//           </Grid>

//           {/* Right side: All users */}
//           <Grid item xs={12} md={8}>
//             <Typography variant="h6" gutterBottom>
//               All Users
//             </Typography>
//             {allUsers.map((u, idx) => (
//               <UserCard key={idx} name={u.name} steps={u.steps} />
//             ))}
//           </Grid>
//         </Grid>
//       </Container>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import axios from "axios";
import { db, doc, getDoc, setDoc, collection, getDocs } from "../firebase";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import UserCard from "./UserCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Dashboard() {
  const query = useQuery();
  const code = query.get("code");
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        let accessData;

        if (code) {
          // Case 1: User just logged in — exchange code for token
          const res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/fitbit/exchange-code`,
            { code }
          );

          accessData = res.data;

          // Save refresh token for later use
          localStorage.setItem("fitbit_refresh_token", accessData.refresh_token);
        } else {
          // Case 2: User refreshed page — use stored refresh token
          const storedRefreshToken = localStorage.getItem("fitbit_refresh_token");
          if (!storedRefreshToken) return;

          // Refresh access token
          const res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/fitbit/refresh-token`,
            { refresh_token: storedRefreshToken }
          );

          const access_token = res.data.access_token;

          // Get profile and steps with new token
          const [profileRes, stepsRes] = await Promise.all([
            axios.get("https://api.fitbit.com/1/user/-/profile.json", {
              headers: { Authorization: `Bearer ${access_token}` },
            }),
            axios.get(
              `https://api.fitbit.com/1/user/-/activities/date/${new Date()
                .toISOString()
                .split("T")[0]}.json`,
              {
                headers: { Authorization: `Bearer ${access_token}` },
              }
            ),
          ]);

          accessData = {
            profile: profileRes.data.user,
            steps: stepsRes.data.summary.steps,
            refresh_token: res.data.refresh_token,
          };

          // Save new refresh token
          localStorage.setItem("fitbit_refresh_token", res.data.refresh_token);
        }

        const { profile, steps } = accessData;
        const userId = profile.encodedId;
        const name = profile.fullName || profile.displayName || "Unknown User";
        const email = profile.email || "not_provided@fitbit.com";

        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name,
            email,
            steps,
          });
        }

        setUser({ ...profile, name, email, steps });

        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data());
        setAllUsers(users);
      } catch (err) {
        console.error("Error fetching Fitbit data or saving to Firestore:", err);
      }
    }

    fetchData();
  }, [code]);

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <>
      <Navbar />
      <Container>
        <Grid container spacing={2}>
          {/* Logged-in user */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Welcome, {user.name}
              </Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Today's Steps: {user.steps}</Typography>
            </Box>
          </Grid>

          {/* All users */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              All Users
            </Typography>
            {allUsers.map((u, idx) => (
              <UserCard key={idx} name={u.name} steps={u.steps} />
            ))}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
