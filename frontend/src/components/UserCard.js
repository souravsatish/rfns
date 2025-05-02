import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function UserCard({ name, steps }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {name}
        </Typography>
        <Typography variant="body2">Steps: {steps}</Typography>
      </CardContent>
    </Card>
  );
}
