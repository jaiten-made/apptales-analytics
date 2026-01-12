import { ProvisioningRequestSchema } from "@apptales/events-schema";
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { useMemo, useState, type FormEvent } from "react";

type ProvisioningResponse = {
  projectId: string;
  trackerSnippet: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981",
    },
    background: {
      default: "#030712",
      paper: "#0f172a",
    },
  },
});

const copyToClipboard = async (value: string): Promise<void> => {
  if (!navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }
  await navigator.clipboard.writeText(value);
};

function App() {
  const [adminSecret, setAdminSecret] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisioningResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(
    () =>
      Boolean(
        adminSecret.trim() && clientEmail.trim() && organizationName.trim()
      ),
    [adminSecret, clientEmail, organizationName]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setResult(null);

    if (!apiBaseUrl) {
      setErrorMessage("API base URL is not configured.");
      return;
    }

    const parsed = ProvisioningRequestSchema.safeParse({
      clientEmail,
      organizationName,
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    if (!adminSecret.trim()) {
      setErrorMessage("Admin secret is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/provision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json().catch(() => null)) as
        | (ProvisioningResponse & { message?: string })
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Provisioning failed");
      }

      if (!payload) {
        throw new Error("Unexpected empty response");
      }

      setResult({
        projectId: payload.projectId,
        trackerSnippet: payload.trackerSnippet,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySnippet = async () => {
    if (!result?.trackerSnippet) return;
    try {
      await copyToClipboard(result.trackerSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Copy failed";
      setErrorMessage(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 600, width: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              INTERNAL
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
              Provisioning Portal
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Securely create a customer, project, and tracker snippet with a
              single submission. The admin secret never leaves this session.
            </Typography>
          </Box>

          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              type="password"
              required
              fullWidth
              label="Admin Secret"
              placeholder="Enter admin password"
              value={adminSecret}
              onChange={(event) => setAdminSecret(event.target.value)}
              helperText="Stored only in-memory for this tab. Sent as x-admin-secret."
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                type="email"
                required
                label="Client Email"
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
              />

              <TextField
                type="text"
                required
                label="Organization Name"
                placeholder="Acme Inc"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
              />
            </Box>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Provisioning..." : "Provision"}
              </Button>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Creates customer + project, emails the snippet and magic link.
              </Typography>
            </Box>
          </Paper>

          {result && (
            <Paper
              sx={{
                mt: 3,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    SUCCESS
                  </Typography>
                  <Typography variant="body2">
                    Project ID:{" "}
                    <Box
                      component="span"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                      }}
                    >
                      {result.projectId}
                    </Box>
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopySnippet}
                >
                  {copied ? "Copied" : "Copy Snippet"}
                </Button>
              </Box>
              <Box
                component="pre"
                sx={{
                  overflowX: "auto",
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  m: 0,
                }}
              >
                <code>{result.trackerSnippet}</code>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
