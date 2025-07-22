import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer: React.FC = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: "#22292f",
      color: "#fff",
      py: 4,
      px: { xs: 2, sm: 8 },
      mt: 8,
      textAlign: "center",
      borderTop: "1px solid #28292c",
    }}
  >
    <Box mb={2}>
      <Link
        href="mailto:hello@forsynse.com"
        color="#34af45"
        underline="hover"
        sx={{ mx: 1, fontWeight: 600 }}
      >
        hello@forsynse.com
      </Link>
      <Link
        href="tel:813-358-8474"
        color="#34af45"
        underline="hover"
        sx={{ mx: 1, fontWeight: 600 }}
      >
        813-358-8474
      </Link>
      <Link
        href="https://forsynse.com/"
        color="#34af45"
        underline="hover"
        sx={{ mx: 1, fontWeight: 600 }}
        target="_blank"
        rel="noopener"
      >
        forsynse.com
      </Link>
    </Box>
    <Typography variant="body2" color="#e0e7ef" mb={1}>
      &copy; {new Date().getFullYear()} ForSynse LLC. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
