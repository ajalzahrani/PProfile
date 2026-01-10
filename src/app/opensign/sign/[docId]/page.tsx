"use client";
import { Provider } from "react-redux";
import { store } from "@/opensign/redux/store";
import OpenSignRouter from "../../opensign-router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SignPageProps {
  params: Promise<{
    docId: string;
  }>;
  searchParams: Promise<{
    contactId?: string;
    sendmail?: string;
    data?: string;
  }>;
}

export default function SignPage({ params, searchParams }: SignPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [docId, setDocId] = useState<string>("");
  const [contactId, setContactId] = useState<string | undefined>();
  const [sendmail, setSendmail] = useState<string | undefined>();
  const [data, setData] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolvedParams = await params;
        const resolvedSearchParams = await searchParams;

        // console.log("=== SignPage Debug Info ===");
        // console.log("Current URL:", window.location.href);
        // console.log("URL search params:", window.location.search);
        // console.log("Extracted docId from URL:", resolvedParams.docId);
        // console.log("Extracted contactId:", resolvedSearchParams.contactId);
        // console.log("Extracted sendmail:", resolvedSearchParams.sendmail);
        // console.log("Extracted data:", resolvedSearchParams.data);
        // console.log("Full searchParams object:", resolvedSearchParams);
        // console.log("Full params object:", resolvedParams);
        // console.log("===========================");

        setDocId(resolvedParams.docId);
        setContactId(resolvedSearchParams.contactId);
        setSendmail(resolvedSearchParams.sendmail);
        setData(resolvedSearchParams.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading params:", error);
        setIsLoading(false);
      }
    };

    loadParams();
  }, [params, searchParams]);

  // Check authentication status
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      // User is not authenticated, redirect to login with callback URL
      const currentUrl = window.location.href;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (status === "authenticated" && docId) {
      // User is authenticated and we have docId, proceed
      setIsLoading(false);
    }
  }, [status, docId, router]);

  // Decode the data parameter if present
  const [decodedContactId, setDecodedContactId] = useState<
    string | undefined
  >();
  const [decodedSendmail, setDecodedSendmail] = useState<string | undefined>();

  useEffect(() => {
    if (data) {
      try {
        const decodedData = atob(data);
        const [docIdFromData, email, contactIdFromData, sendmailFromData] =
          decodedData.split("/");

        // Use decoded values if not provided directly
        setDecodedContactId(contactId || contactIdFromData);
        setDecodedSendmail(
          sendmail || (sendmailFromData === "true" ? "true" : "false")
        );

        // console.log("Decoded data:", {
        //   docIdFromData,
        //   email,
        //   contactIdFromData,
        //   sendmailFromData,
        //   decodedContactId: contactId || contactIdFromData,
        //   decodedSendmail:
        //     sendmail || (sendmailFromData === "true" ? "true" : "false"),
        // });
      } catch (error) {
        console.error("Error decoding data parameter:", error);
        setDecodedContactId(contactId);
        setDecodedSendmail(sendmail);
      }
    } else {
      setDecodedContactId(contactId);
      setDecodedSendmail(sendmail);
    }
  }, [data, contactId, sendmail]);

  // console.log("SignPage mounted with:", {
  //   docId,
  //   contactId: decodedContactId,
  //   sendmail: decodedSendmail,
  // });

  if (isLoading || status === "loading") {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!docId) {
    return (
      <div className="p-4">
        <p>Document ID is required</p>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <OpenSignRouter
        docId={docId}
        contactId={decodedContactId}
        sendmail={decodedSendmail}
      />
    </Provider>
  );
}
