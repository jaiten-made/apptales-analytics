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
import { useSendMagicLinkMutation } from "../../../lib/redux/api/auth/auth";

/**
 * Mock SignIn screen for magic link authentication.
 * Only collects an email and simulates sending a magic link.
 */
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendMagicLink] = useSendMagicLinkMutation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    try {
      if (!email.trim()) throw new Error("Email is required");
      const emailPattern = /.+@.+\..+/;
      if (!emailPattern.test(email)) throw new Error("Invalid email format");
      sendMagicLink({ email });
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
      setError("Failed to send magic link");
    } finally {
      setLoading(false);
    }
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
          noValidate
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
