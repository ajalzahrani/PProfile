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

- [ ] Should has Approval role
- [ ] Should appove completed profile.
- [ ] Should allow Approval role to edit profile to upload new documents
- [ ] Should include user location Should view all requiremnts for a
      jobtitle or location

### How to solve

$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npm run prisma:generate;
