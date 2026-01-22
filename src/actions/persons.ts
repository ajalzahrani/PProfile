"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PersonFormValues, personSchema } from "./persons.validation";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

/**
 * Get all persons
 */
export async function getPersons() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const persons = await prisma.person.findMany({
      orderBy: {
        firstName: "asc",
      },
      include: {
        nationality: true,
        jobTitle: true,
      },
    });
    return { success: true, persons };
  } catch (error) {
    console.error("Error fetching persons:", error);
    return { success: false, error: "Error fetching persons" };
  }
}

/**
 * Get person by ID
 */
export async function getPersonById(personId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const person = await prisma.person.findUnique({
      where: { userId: personId },
      include: {
        nationality: true,
        jobTitle: true,
        unit: true,
        rank: true,
        sponsor: true,
      },
    });
    return { success: true, person };
  } catch (error) {
    console.error("Error fetching person:", error);
    return { success: false, error: "Error fetching person" };
  }
}

/**
 * Upload a file to the server
 */
export async function uploadFile(file: File) {
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

/**
 * Create a new person
 */
export async function createPerson(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Extract form fields
  const personData = {
    firstName: formData.get("firstName") as string,
    secondName: formData.get("secondName") as string,
    thirdName: formData.get("thirdName") as string,
    lastName: formData.get("lastName") as string,
    dob: new Date(formData.get("dob") as string),
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
    // Get the file from the form
    const file = formData.get("file") as File;
    let pictureLink: string | undefined;

    if (file) {
      pictureLink = await uploadFile(file);
    }

    // const newPerson = await prisma.person.create({
    //   data: {
    //     firstName: personData.firstName,
    //     secondName: personData.secondName,
    //     thirdName: personData.thirdName,
    //     lastName: personData.lastName,
    //     gender: personData.gender,
    //     dob: personData.dob,
    //     citizenship: personData.citizenship,
    //     noriqama: personData.noriqama,
    //     mrn: personData.mrn,
    //     employeeNo: personData.employeeNo,
    //     nationality: {
    //       connect: { id: personData.nationalityId },
    //     },
    //     unit: personData.unitId
    //       ? {
    //           connect: { id: personData.unitId },
    //         }
    //       : undefined,
    //     rank: personData.rankId
    //       ? {
    //           connect: { id: personData.rankId },
    //         }
    //       : undefined,
    //     jobTitle: personData.jobTitleId
    //       ? {
    //           connect: { id: personData.jobTitleId },
    //         }
    //       : undefined,
    //     sponsor: personData.sponsorId
    //       ? {
    //           connect: { id: personData.sponsorId },
    //         }
    //       : undefined,
    //     pictureLink: pictureLink || null,
    //     cardExpiryAt: personData.cardExpiryAt || new Date(),
    //     isActive: personData.isActive,
    //   },
    // });

    revalidatePath("/persons");
    return { success: true };
  } catch (error) {
    console.error("Error creating person:", error);
    return { success: false, error: "Error creating person", details: error };
  }
}

/**
 * Update a person
 */
export async function updatePerson(personId: string, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Extract form fields
  const personData = {
    firstName: formData.get("firstName") as string,
    secondName: formData.get("secondName") as string,
    thirdName: formData.get("thirdName") as string,
    lastName: formData.get("lastName") as string,
    dob: formData.get("dob")
      ? new Date(formData.get("dob") as string)
      : undefined,
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
    return {
      success: false,
      error: "Invalid fields",
      details: validatedFields.error,
    };
  }

  try {
    // Get the current person to check for existing picture
    const currentPerson = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!currentPerson) {
      return { success: false, error: "Person not found" };
    }

    const file = formData.get("file") as File;
    let pictureLink = currentPerson.pictureLink;

    if (file) {
      // Delete old picture if it exists
      if (currentPerson.pictureLink) {
        const oldPicturePath = path.join(
          process.cwd(),
          "repo/images",
          path.basename(currentPerson.pictureLink),
        );
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }

      // Upload new picture
      pictureLink = await uploadFile(file);
    }

    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        ...validatedFields.data,
        pictureLink,
      },
    });

    revalidatePath("/persons");
    return { success: true, person: updatedPerson };
  } catch (error) {
    console.error("Error updating person:", error);
    return { success: false, error: "Error updating person" };
  }
}

/**
 * Deactivate a person
 */
export async function deactivatePerson(personId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: { isActive: false },
    });

    revalidatePath("/persons");

    return { success: true, person: updatedPerson };
  } catch (error) {
    console.error("Error deactivating person:", error);
    return { success: false, error: "Error deactivating person" };
  }
}
