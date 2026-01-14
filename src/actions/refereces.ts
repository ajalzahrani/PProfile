"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkServerPermission } from "@/lib/server-permissions";
import { Prisma } from "@prisma/client";

type ModelType = "nationality" | "unit" | "rank" | "sponsor" | "jobTitle";

type returnType = {
  success: boolean;
  message?: string;
  data?: any;
};

type PrismaModel = {
  findMany: () => Promise<any[]>;
  create: (args: { data: any }) => Promise<any>;
  update: (args: { where: { id: string }; data: any }) => Promise<any>;
  delete: (args: { where: { id: string } }) => Promise<any>;
};

const getModel = (model: ModelType): PrismaModel => {
  return prisma[model] as unknown as PrismaModel;
};

export async function getItems(model: ModelType): Promise<returnType> {
  await checkServerPermission(model + ":read");
  const items = await getModel(model).findMany();
  return { success: true, data: items };
}

export async function createItem(
  model: ModelType,
  data: any
): Promise<returnType> {
  await checkServerPermission(model + ":create");
  const result = await getModel(model).create({ data });

  if (result) {
    revalidatePath(`/references/${model}`);
    return { success: true, message: `${model} created successfully` };
  }
  return { success: false, message: `Failed to create ${model}` };
}

export async function updateItem(
  model: ModelType,
  id: string,
  data: any
): Promise<returnType> {
  await checkServerPermission(model + ":update");
  const result = await getModel(model).update({
    where: { id },
    data,
  });

  if (result) {
    revalidatePath(`/references/${model}`);
    return { success: true, message: `${model} updated successfully` };
  }
  return { success: false, message: `Failed to update ${model}` };
}

export async function deleteItem(
  model: ModelType,
  id: string
): Promise<returnType> {
  await checkServerPermission(model + ":delete");
  const result = await getModel(model).delete({
    where: { id },
  });

  if (result) {
    revalidatePath(`/references/${model}`);
    return { success: true, message: `${model} deleted successfully` };
  }
  return { success: false, message: `Failed to delete ${model}` };
}
