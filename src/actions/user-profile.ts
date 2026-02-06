"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { personSchema } from "./persons.validation";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

/**
 * Upload a file to the server
 */
async function uploadFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create the images directory if it doesn't exist
  const imagesDir = "repo/images";
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Generate a unique filename
  const uniqueFilename = `${Date.now()}-${file.name}`;
  const filePath = `${imagesDir}/${uniqueFilename}`;

  // Write the file
  fs.writeFileSync(filePath, buffer);

  // Return the API route path for the image
  return `/api/images/${uniqueFilename}`;
}

export async function updateUserProfile(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if user already has a person profile
  const existingPerson = await prisma.person.findFirst({
    where: { userId: session.user.id as string },
  });

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
    return { success: false, error: "Invalid fields" + validatedFields.error };
  }

  try {
    // Handle file upload
    const file = formData.get("file") as File;
    let pictureLink: string | null = null;

    if (file && file.size > 0) {
      // If updating and has existing picture, delete old one
      if (existingPerson?.pictureLink) {
        const oldPicturePath = path.join(
          process.cwd(),
          "repo/images",
          path.basename(existingPerson.pictureLink),
        );
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      pictureLink = await uploadFile(file);
    } else if (existingPerson) {
      // Keep existing picture if no new file uploaded
      pictureLink = existingPerson.pictureLink;
    }

    if (existingPerson) {
      // Update existing profile
      // Build update data object
      const updateData: any = {
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
        pictureLink,
        cardExpiryAt: personData.cardExpiryAt || existingPerson.cardExpiryAt,
        isActive: personData.isActive,
      };

      // Handle relations - connect if value provided, disconnect if empty string and was previously set
      if (personData.nationalityId && personData.nationalityId !== "") {
        updateData.nationality = { connect: { id: personData.nationalityId } };
      } else if (personData.nationalityId === "" && existingPerson.nationalityId) {
        updateData.nationality = { disconnect: true };
      }

      if (personData.unitId && personData.unitId !== "") {
        updateData.unit = { connect: { id: personData.unitId } };
      } else if (personData.unitId === "" && existingPerson.unitId) {
        updateData.unit = { disconnect: true };
      }

      if (personData.rankId && personData.rankId !== "") {
        updateData.rank = { connect: { id: personData.rankId } };
      } else if (personData.rankId === "" && existingPerson.rankId) {
        updateData.rank = { disconnect: true };
      }

      // jobTitleId is required, so always connect if provided
      if (personData.jobTitleId && personData.jobTitleId !== "") {
        updateData.jobTitle = { connect: { id: personData.jobTitleId } };
      }

      if (personData.sponsorId && personData.sponsorId !== "") {
        updateData.sponsor = { connect: { id: personData.sponsorId } };
      } else if (personData.sponsorId === "" && existingPerson.sponsorId) {
        updateData.sponsor = { disconnect: true };
      }

      const updatedPerson = await prisma.person.update({
        where: { id: existingPerson.id },
        data: updateData,
      });

      revalidatePath("/user-profile");
      return { success: true, person: updatedPerson };
    } else {
      // Create new profile
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
          pictureLink,
          cardExpiryAt: personData.cardExpiryAt || new Date(),
          isActive: personData.isActive,
        },
      });

      revalidatePath("/user-profile");
      return { success: true, person: newPerson };
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    return {
      success: false,
      error: "Failed to save profile information. " + error,
    };
  }
}
