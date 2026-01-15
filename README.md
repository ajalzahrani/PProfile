# P-Profile

## Core Features

- Upload documents ⬆️
- Search & filtering ✅
- Category system 🗃️
- Download support ⬇️
- Versioning 🔢
- Revert logic 🔄
- Audit log 🕵️
- Roles & permissions 🔐

## Valued Features

- Sealed document 🔒
  - [OpenSign](https://www.opensignlabs.com/) - for document sealing

## Tech stack

- Next.js
- Tailwind CSS
- Shadcn UI
- Lucid
- Prisma
- PostgreSQL

## Lib References

- [React PDF](https://react-pdf.org/)
- [React PDF Viewer](https://github.com/wojtekmaj/react-pdf-viewer)
- [PDF.js Worker](https://github.com/mozilla/pdf.js/releases/tag/v4.8.69)

## TODOs

### Document Approval

- [ ] Block document from editing once department approved a document.
- [ ] Interduce partial approve state. Indicating which department has approved the document.

### Document Versioning and document structure

- [ ] Document in draft state should be in draft folder, with multiple versions.
- [ ] Document in published state should be in published folder, with multiple final versions.
- [ ] When document is published, move only approved one final version to published folder.
- [ ] Abort upload process if version is not created or any error occurs.

### How to solve

$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npm run prisma:generate;
