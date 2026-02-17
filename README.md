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

- [x] Should has Approval role
- [x] Should appove completed profile.
- [x] Should allow Approval role to edit profile to upload new documents
- [x] Should include user location Should view all requiremnts for a
      jobtitle or location
- [x] Edit back button in document/[id]/edit page
- [x] Add tanstack table for users
- [ ] Add application tour using https://driverjs.com/
- [x] Fix Date of Birth calendar component
- [ ] ERP Integration
  - [ ] Import job titles from ERP
  - [ ] Import departments from ERP

## Configuration

### File Storage Location

By default, uploaded files are stored in `public/uploads/` within the project directory. To store files outside the project folder (recommended for production), set the `STORAGE_PATH` environment variable:

**Windows:**

```env
STORAGE_PATH=C:\uploads
```

**Linux/Mac:**

```env
STORAGE_PATH=/var/uploads
```

**Notes:**

- The directory will be created automatically if it doesn't exist
- Ensure the application has read/write permissions to the storage directory
- File paths in the database remain relative (`/uploads/...`) for portability
- The API route `/api/pdf` automatically handles serving files from the configured storage location

### How to solve

$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npm run prisma:generate;
