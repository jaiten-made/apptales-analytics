import cors from "cors";
import { NextFunction, Request, Response } from "express";

interface CorsExceptionRule {
  path: string;
  methods: string[];
}

const getCorsOptions = (req: Request): cors.CorsOptions => {
  const exceptionRules: CorsExceptionRule[] = [
    { path: "/events", methods: ["POST", "OPTIONS"] },
  ];
  const matchesException = exceptionRules.some(
    (rule) =>
      rule.methods.includes(req.method) && req.path.startsWith(rule.path)
  );
  if (matchesException) {
    return { origin: true, credentials: true };
  }
  const allowedOrigins = [
    process.env.APP_BASE_URL!,
    process.env.TRACKER_BASE_URL!,
  ];
  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };
};

const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  cors(getCorsOptions(req))(req, res, next);
};

export default corsMiddleware;
