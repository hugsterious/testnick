import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import { Role } from "../utils/roles";

interface CustomRequest extends Request {
  user: { role: Role; userId: string };
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, userId } = (req as CustomRequest).user;

    if (role === Role.Admin) {
      const users = await User.find().populate("manager");
      return res.json(users);
    }

    if (role === Role.Manager) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subordinateUsers = await getSubordinateUsers(userId);
      const responseData = { user, subordinateUsers };
      return res.json(responseData);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json([user]);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSubordinateUsers = async (managerId: string) => {
  const subordinateUsers = await User.find({ manager: managerId });

  const nestedSubordinateUsers: IUser[] = [];
  let stack = subordinateUsers.slice();

  while (stack.length > 0) {
    const user = stack.pop();
    if (user) {
      const subordinates = await User.find({ manager: user._id });
      nestedSubordinateUsers.push(...subordinates);
      stack = stack.concat(subordinates);
    }
  }

  return nestedSubordinateUsers;
};

export const updateManager = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { managerId } = req.body;
    const { role, userId: requesterId } = (req as CustomRequest).user;

    if (!managerId) {
      return res.status(400).json({ message: "Manager ID is required" });
    }

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      role === Role.Admin ||
      (role === Role.Manager && requesterId === userToUpdate.manager)
    ) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { manager: managerId },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }

      return res.json(updatedUser);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error updating manager:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
