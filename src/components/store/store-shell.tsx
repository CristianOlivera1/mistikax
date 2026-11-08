"use client";

import { Suspense, use, useEffect, useState, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeAnnouncement } from "@/features/content/types";
import { AnnouncementBar } from "./announcement-bar";

type StoreShellProps = {
  announcement: Promise<HomeAnnouncement>;
  header: ReactNode;
  children: ReactNode;
};

type StoreAnnouncementProps = {
  announcement: Promise<HomeAnnouncement>;
  onVisibilityChange: (visible: boolean) => void;
  onDismiss: () => void;
};

function StoreAnnouncement({
  announcement,
  onVisibilityChange,
  onDismiss,
}: StoreAnnouncementProps) {
  const content = use(announcement);

  useEffect(() => {
    onVisibilityChange(content.visible);
  }, [content.visible, onVisibilityChange]);

  if (!content.visible) return null;

  return <AnnouncementBar text={content.text} onDismiss={onDismiss} />;
}

export function StoreShell({
  announcement,
  header,
  children,
}: StoreShellProps) {
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <Suspense fallback={<Skeleton className="h-7 w-full rounded-none" />}>
          <StoreAnnouncement
            announcement={announcement}
            onVisibilityChange={setAnnouncementVisible}
            onDismiss={() => setAnnouncementVisible(false)}
          />
        </Suspense>
        {header}
      </div>
      <main
        className={`flex-1 ${announcementVisible ? "pt-[calc(6.75rem+5rem)]" : "pt-20"}`}
      >
        {children}
      </main>
    </>
  );
}
