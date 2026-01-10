// src/app/opensign/placeholder/[docId]/page.tsx
"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/opensign/redux/store";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
} from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import PlaceHolderSign from "@/opensign/pages/PlaceHolderSign";
import { MemoryRouter, Routes, Route } from "react-router";

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

interface PlaceholderPageProps {
  params: Promise<{
    docId: string;
  }>;
}

export default async function PlaceholderPage({
  params,
}: PlaceholderPageProps) {
  const { docId } = await params;

  if (!docId) {
    return (
      <div className="p-4">
        <p>Document ID is required</p>
      </div>
    );
  }

  // Create a wrapper that provides React Router context for the original component
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/${docId}`]}>
        <DndProvider options={HTML5toTouch}>
          <Routes>
            <Route path="/:docId" element={<PlaceHolderSign />} />
          </Routes>
        </DndProvider>
      </MemoryRouter>
    </Provider>
  );
}
