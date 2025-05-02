import React from "react";
import { Button, Container, Typography } from "@mui/material";

export default function Login() {
  const handleLogin = () => {
    const clientId = "23Q88D";
    const redirectUri = "http://localhost:3000/fitbit-callback";
    const scope = "profile activity";
    const url = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}`;
    window.location.href = url;
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Login with Fitbit
      </Typography>
      <Button variant="contained" onClick={handleLogin}>
        Login with Fitbit
      </Button>
    </Container>
  );
}
