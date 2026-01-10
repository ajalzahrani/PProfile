"use client";
import { MemoryRouter, Routes, Route } from "react-router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
} from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

// Helper function to get current user from session
const getCurrentUserFromSession = async () => {
  try {
    const response = await fetch("/api/opensign/users/me");
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

// Helper function to check if user is an assigned signer
const checkIfUserIsAssignedSigner = async (document: any, currentUser: any) => {
  if (!currentUser || !document?.Signers) return false;

  // Check if current user is in the signers list
  const isAssignedSigner = document.Signers.some((signer: any) => {
    return (
      signer.UserId?.objectId === currentUser.objectId ||
      signer.objectId === currentUser.objectId ||
      signer.Email === currentUser.email
    );
  });

  console.log("Signer authorization check:", {
    currentUserId: currentUser.objectId,
    currentUserEmail: currentUser.email,
    documentSigners: document.Signers,
    isAssignedSigner,
  });

  return isAssignedSigner;
};

// Dynamic imports to prevent SSR issues
const PdfRequestFiles = dynamic(
  () => import("@/opensign/pages/PdfRequestFiles"),
  {
    ssr: false,
    loading: () => <div className="p-4">Loading OpenSign...</div>,
  }
);

const PlaceHolderSign = dynamic(
  () => import("@/opensign/pages/PlaceHolderSign"),
  {
    ssr: false,
    loading: () => <div className="p-4">Loading OpenSign...</div>,
  }
);

const HTML5toTouch = {
  backends: [
    { id: "html5", backend: HTML5Backend, transition: MouseTransition },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

interface OpenSignRouterProps {
  docId: string;
  contactId?: string;
  sendmail?: string;
}

// Helper function to find contactId for authenticated user
const findContactIdForUser = (
  document: any,
  currentUser: any
): string | undefined => {
  if (!currentUser || !document?.Signers) return undefined;

  // Find the signer record that matches the current user
  const matchingSigner = document.Signers.find((signer: any) => {
    return (
      signer.UserId?.objectId === currentUser.objectId ||
      signer.objectId === currentUser.objectId ||
      signer.Email === currentUser.email
    );
  });

  console.log("Finding contactId for user:", {
    currentUserId: currentUser.objectId,
    currentUserEmail: currentUser.email,
    matchingSigner: matchingSigner?.objectId,
  });

  return matchingSigner?.objectId;
};

export default function OpenSignRouter({
  docId,
  contactId,
  sendmail,
}: OpenSignRouterProps) {
  const [documentStatus, setDocumentStatus] = useState<
    "loading" | "placeholder" | "sign" | "error"
  >("loading");
  const [error, setError] = useState<string>("");
  const [resolvedContactId, setResolvedContactId] = useState<
    string | undefined
  >(contactId);

  useEffect(() => {
    const checkDocumentStatus = async () => {
      try {
        console.log("Checking document status for:", docId);

        // Fetch document details from your API
        const response = await fetch(`/api/opensign/documents/${docId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const documentData = await response.json();
        console.log("Document data:", documentData);

        // The API returns an array, so get the first element
        const document = Array.isArray(documentData)
          ? documentData[0]
          : documentData;

        // Check if document has placeholders/signers assigned
        const hasPlaceholders =
          document?.Placeholders && document.Placeholders.length > 0;
        const hasSignedUrl = document?.SignedUrl;
        const isCompleted = document?.IsCompleted;
        const hasSigners = document?.Signers && document.Signers.length > 0;

        console.log("Document status check:", {
          hasPlaceholders,
          hasSignedUrl,
          isCompleted,
          hasSigners,
          contactId,
          placeholders: document?.Placeholders,
        });

        // Enhanced decision logic with authentication:
        // 1. If contactId is provided (from sharing link) -> Always sign mode (user is a signer)
        // 2. If document is completed or has SignedUrl -> Sign mode (document finalized for signing)
        // 3. If no contactId but user is authenticated, check if they're an assigned signer
        // 4. If document has no placeholders -> Placeholder mode (need to add placeholders)
        // 5. If document has placeholders but not sent for signing -> Placeholder mode (still editing)

        if (contactId) {
          console.log(
            "Routing to sign mode - user is a signer from sharing link"
          );
          setResolvedContactId(contactId);
          setDocumentStatus("sign");
        } else if (isCompleted || hasSignedUrl) {
          // Check if current authenticated user is an assigned signer
          const currentUser = await getCurrentUserFromSession();
          const isAssignedSigner = await checkIfUserIsAssignedSigner(
            document,
            currentUser
          );

          if (isAssignedSigner) {
            // Find and set the contactId for this authenticated user
            const userContactId = findContactIdForUser(document, currentUser);
            setResolvedContactId(userContactId);

            console.log(
              "Routing to sign mode - authenticated user is assigned signer",
              { userContactId }
            );
            setDocumentStatus("sign");
          } else {
            console.log(
              "Access denied - user is not an assigned signer for this document"
            );
            setError("You are not authorized to sign this document");
            setDocumentStatus("error");
          }
        } else {
          console.log(
            "Routing to placeholder mode - document creator editing placeholders"
          );
          setDocumentStatus("placeholder");
        }
      } catch (error) {
        console.error("Error checking document status:", error);
        setError("Failed to load document");
        setDocumentStatus("error");
      }
    };

    if (docId) {
      checkDocumentStatus();
    }
  }, [docId]);

  if (documentStatus === "loading") {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Checking document status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (documentStatus === "error") {
    return (
      <div className="p-4">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <p>Document ID: {docId}</p>
        </div>
      </div>
    );
  }

  if (documentStatus === "placeholder") {
    console.log("Rendering PlaceHolderSign component");
    return (
      <DndProvider options={HTML5toTouch}>
        <MemoryRouter initialEntries={[`/placeHolderSign/${docId}`]}>
          <Routes>
            <Route
              path="/placeHolderSign/:docId"
              element={<PlaceHolderSign />}
            />
          </Routes>
        </MemoryRouter>
      </DndProvider>
    );
  }

  // documentStatus === 'sign'
  console.log("Rendering PdfRequestFiles component", {
    originalContactId: contactId,
    resolvedContactId,
  });
  const routePath = resolvedContactId
    ? `/recipientSignPdf/${docId}/${resolvedContactId}`
    : `/recipientSignPdf/${docId}`;
  const queryString = sendmail ? `?sendmail=${sendmail}` : "";

  return (
    <DndProvider options={HTML5toTouch}>
      <MemoryRouter initialEntries={[`${routePath}${queryString}`]}>
        <Routes>
          <Route
            path="/recipientSignPdf/:docId"
            element={<PdfRequestFiles />}
          />
          <Route
            path="/recipientSignPdf/:docId/:contactId"
            element={<PdfRequestFiles />}
          />
        </Routes>
      </MemoryRouter>
    </DndProvider>
  );
}
