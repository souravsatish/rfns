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
      if (!code) return;

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/fitbit/exchange-code`,
          { code }
        );

        const { profile, steps } = res.data;

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

        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data());
        setAllUsers(users);
      } catch (err) {
        console.error(
          "Error fetching Fitbit data or saving to Firestore:",
          err
        );
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
          {/* Left side: Logged-in user info */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Welcome, {user.name}
              </Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Today's Steps: {user.steps}</Typography>
            </Box>
          </Grid>

          {/* Right side: All users */}
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
