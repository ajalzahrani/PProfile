// src/app/opensign/sign/[docId]/[contactId]/page.tsx
"use client";
import { Provider } from "react-redux";
import { store } from "@/opensign/redux/store";
import PdfRequestFiles from "@/opensign/pages/PdfRequestFiles";
import { MemoryRouter, Routes, Route } from "react-router";

interface SignWithContactPageProps {
  params: Promise<{
    docId: string;
    contactId: string;
  }>;
  searchParams: {
    sendmail?: string;
  };
}

export default async function SignWithContactPage({
  params,
  searchParams,
}: SignWithContactPageProps) {
  const { docId, contactId } = await params;
  const { sendmail } = searchParams;

  if (!docId) {
    return (
      <div className="p-4">
        <p>Document ID is required</p>
      </div>
    );
  }

  // Construct the React Router path for PdfRequestFiles
  const routePath = `/recipientSignPdf/${docId}/${contactId}`;
  const queryString = sendmail ? `?sendmail=${sendmail}` : "";

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[`${routePath}${queryString}`]}>
        <Routes>
          <Route
            path="/recipientSignPdf/:docId/:contactId"
            element={<PdfRequestFiles />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
