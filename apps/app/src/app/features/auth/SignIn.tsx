import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

/**
 * Mock SignIn screen for magic link authentication.
 * Only collects an email and simulates sending a magic link.
 */
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    // Basic email pattern (not exhaustive)
    const emailPattern = /.+@.+\..+/;
    if (!emailPattern.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    // Simulate async magic link sending
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      // In real implementation, call API and handle response.
      // console.log("Magic link requested for", email);
    }, 1000);
  }

  return (
    <Box className="flex w-full h-full items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <Paper variant="outlined" className="p-8 max-w-md w-full">
        <Stack spacing={2} alignItems="center" className="mb-2">
          <img
            src="/logo.svg"
            alt="Apptales Logo"
            className="h-12 w-auto opacity-90"
          />
          <Typography variant="h5" gutterBottom>
            Welcome to Apptales
          </Typography>
        </Stack>
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-8"
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            disabled={loading}
            placeholder="name@example.com"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            fullWidth
            size="large"
            sx={{ textTransform: "none" }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign in with email"}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
          {sent && <Alert severity="success">Magic link sent</Alert>}
        </Box>
      </Paper>
    </Box>
  );
}
