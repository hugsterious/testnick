import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";

interface AuthenticatedRequest extends Request {
  user?: IUser & { userId: string };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Missing authentication token" });
    }

    let decodedToken: any;
    if (process.env.JWT_SECRET) {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET) as any;
      const user: IUser | null = await User.findById(decodedToken.userId);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid authentication token" });
      }
      req.user = {
        ...(user.toObject() as IUser),
        userId: user._id.toString(),
      } as IUser & { userId: string };
    } else {
      throw new Error("JWT_SECRET is not defined");
    }

    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({ message: "Invalid authentication token" });
  }
};
