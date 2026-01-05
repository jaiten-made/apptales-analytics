export const isLocalhostHostname = (): boolean => {
  const { hostname } = window.location;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
};
