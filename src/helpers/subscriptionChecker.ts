import prisma from "../shared/prisma";

export const canUseAccount = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: "USER" },
    select: {
      isSubscribed: true,
      createdAt: true,
    },
  });

  if (!user) return false;

  const { isSubscribed, createdAt } = user;

  const expiryDate = new Date(createdAt);
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  const now = new Date();

  if (now < expiryDate) {
    return true;
  }

  if (isSubscribed) {
    return true;
  }

  return false;
};
