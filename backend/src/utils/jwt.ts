import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"; // Aumentado para 1 dia por padrão, já que não há refresh

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};
