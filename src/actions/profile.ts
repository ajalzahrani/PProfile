"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { personSchema } from "./persons.validation";

export async function updatePersonProfile(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const dobValue = formData.get("dob");

  if (!dobValue) {
    return { success: false, error: "Date of birth is required" };
  }

  // Extract form fields
  const personData = {
    userId: session.user.id as string,
    firstName: formData.get("firstName") as string,
    secondName: formData.get("secondName") as string,
    thirdName: formData.get("thirdName") as string,
    lastName: formData.get("lastName") as string,
    dob: new Date(dobValue as string),
    gender: formData.get("gender") as string,
    citizenship: formData.get("citizenship") as string,
    noriqama: formData.get("noriqama") as string,
    mrn: formData.get("mrn") as string,
    employeeNo: formData.get("employeeNo") as string,
    jobTitleId: formData.get("jobTitleId") as string,
    nationalityId: formData.get("nationalityId") as string,
    unitId: formData.get("unitId") as string,
    rankId: formData.get("rankId") as string,
    sponsorId: formData.get("sponsorId") as string,
    cardExpiryAt: formData.get("cardExpiryAt")
      ? new Date(formData.get("cardExpiryAt") as string)
      : undefined,
    isActive: true,
  };

  const validatedFields = personSchema.safeParse(personData);

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error);
    return { success: false, error: "Invalid fields" };
  }

  try {
    const newPerson = await prisma.person.create({
      data: {
        user: {
          connect: { id: personData.userId },
        },
        firstName: personData.firstName,
        secondName: personData.secondName,
        thirdName: personData.thirdName,
        lastName: personData.lastName,
        gender: personData.gender,
        dob: personData.dob,
        citizenship: personData.citizenship,
        noriqama: personData.noriqama,
        mrn: personData.mrn,
        employeeNo: personData.employeeNo,
        nationality: personData.nationalityId
          ? { connect: { id: personData.nationalityId } }
          : undefined,
        unit: personData.unitId
          ? {
              connect: { id: personData.unitId },
            }
          : undefined,
        rank: personData.rankId
          ? {
              connect: { id: personData.rankId },
            }
          : undefined,
        jobTitle: personData.jobTitleId
          ? {
              connect: { id: personData.jobTitleId },
            }
          : undefined,
        sponsor: personData.sponsorId
          ? {
              connect: { id: personData.sponsorId },
            }
          : undefined,
        pictureLink: null,
        cardExpiryAt: personData.cardExpiryAt || new Date(),
        isActive: personData.isActive,
      },
    });

    return { success: true, person: newPerson };
  } catch (error) {
    return {
      success: false,
      error: "Failed to save profile information. " + error,
    };
  }
}
