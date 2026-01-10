export type DocumentId = string;

export interface OpenSignAdapter {
  // documents
  getDocument(
    docId: DocumentId
  ): Promise<{ id: string; name: string; pages: number; base64Pdf: string }>;
  listDocuments(params?: {
    search?: string;
  }): Promise<Array<{ id: string; name: string }>>;
  createDocument(input: {
    name: string;
    base64Pdf: string;
  }): Promise<{ id: string }>;
  updateDocument(input: { id: string; name?: string }): Promise<void>;
  // placeholders / widgets
  getPlaceholders(docId: DocumentId): Promise<any[]>; // shape matching OpenSign expectations
  updatePlaceholders(docId: DocumentId, placeholders: any[]): Promise<void>;
  // signing
  recordSignature(input: {
    docId: string;
    widgetKey: string;
    signerId: string;
    signUrl: string;
  }): Promise<void>;
  // users/signers
  getSigners(docId: DocumentId): Promise<any[]>;
  assignSigner(
    docId: DocumentId,
    signer: { id: string; email: string; role: string }
  ): Promise<void>;
}
