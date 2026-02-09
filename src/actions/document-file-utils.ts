import path from "path";
import { mkdir , writeFile} from "fs/promises";
import { FileType } from "@/actions/documents.validation";

/**
 * ### Get organized file path for document
 * Call this function to get the absolute and relative file paths for a document based on document 
 * @param documentId - The ID of the document
 * @param fileName - The name of the file
 * @param fileType - The type of the file
 * @param versionNumber - The version number of the file
 * @returns The absolute and relative file paths for the document
 */
export async function getOrganizedFilePath(
  documentId: string,
  fileName: string,
  fileType: FileType,
  versionNumber?: number
): Promise<{ absolutePath: string; relativePath: string }> {
  const baseDir = path.join(process.cwd(), "public", "uploads", documentId);
  const typeDir = path.join(baseDir, fileType);

  let finalFileName: string;

  switch (fileType) {
    case FileType.DRAFT:
      finalFileName = `v${versionNumber}_${Date.now()}_${fileName}`;
      break;
    case FileType.TEMP:
      finalFileName = `temp_${Date.now()}_${fileName}`;
      break;
    case FileType.SIGNED:
      finalFileName = fileName;
      break;
    case FileType.PUBLISHED:
      finalFileName = `v${versionNumber}_${Date.now()}_${fileName}`;
      break;
    default:
      finalFileName = fileName;
  }

  const absolutePath = path.join(typeDir, finalFileName);
  const relativePath = `/uploads/${documentId}/${fileType}/${finalFileName}`;

  return { absolutePath: absolutePath, relativePath: relativePath };
}

/**
 * ### Save file with organized structure
 * Call this function to save a file with the organized structure
 * @param documentId - The ID of the document
 * @param fileName - The name of the file
 * @param buffer - The buffer of the file
 * @param documentStatus - The status of the document
 * @param versionNumber - The version number of the file
 * @returns The relative path of the file
 * @returns The error if the file is not saved
 */
export async function saveOrganizedFile(
  documentId: string,
  fileName: string,
  buffer: Buffer,
  documentStatus: string,
  versionNumber?: number
): Promise<{ error?: string; relativePath?: string }> {

    // Determine file type based on document status
  const fileType =
    documentStatus != "SIGNED" && documentStatus != "PUBLISHED"
      ? FileType.DRAFT
      : documentStatus == "SIGNED"
      ? FileType.SIGNED
      : FileType.PUBLISHED;

  const { absolutePath, relativePath } = await getOrganizedFilePath(
    documentId,
    fileName,
    fileType,
    versionNumber
  );

  try {
    // Create directory if it doesn't exist
    await mkdir(path.dirname(absolutePath), { recursive: true }).catch((err: any) => {
      console.error("Error creating directory:", err);
      return { error: "Error creating directory: " + err.message, relativePath: undefined };
    });

    // Write file
    await writeFile(absolutePath, buffer).catch((err: any) => {
      console.error("Error saving organized file:", err);
      return { error: "Error saving organized file: " + err.message };
    });
    return { relativePath: relativePath, error: undefined };
  } catch (error) {
    console.error("Error saving organized file:", error);
    return { error: "Error saving organized file: " + error, relativePath: undefined };
  }
}