"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useApplyDocumentActions,
  createDocument,
  createDocumentHandle,
} from "@sanity/sdk-react";
import { SearchInput } from "@/components/admin/shared";
import { DocumentGridSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { CourseGrid } from "./CourseGrid";
import type { CourseListProps } from "./types";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export function CourseList({ projectId, dataset }: CourseListProps) {
  const router = useRouter();
  const [isCreating, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const apply = useApplyDocumentActions();

  const handleCreateCourse = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "course",
      });

      await apply(createDocument(newDocHandle));
      router.push(`/admin/courses/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Courses
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage your courses and their content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/admin/ai-course-creator")}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create with AI
          </Button>
          <Button
            onClick={handleCreateCourse}
            disabled={isCreating}
            variant="outline"
            className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New course
          </Button>
        </div>
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search courses..."
      />

      <Suspense fallback={<DocumentGridSkeleton count={4} />}>
        <CourseGrid
          projectId={projectId}
          dataset={dataset}
          onCreateCourse={handleCreateCourse}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { CourseListProps } from "./types";
