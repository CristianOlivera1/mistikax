"use client";

import { useState, type ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";

type StoreShellProps = {
  announcementText: string | null;
  header: ReactNode;
  children: ReactNode;
};

export function StoreShell({
  announcementText,
  header,
  children,
}: StoreShellProps) {
  const [announcementVisible, setAnnouncementVisible] = useState(
    announcementText !== null,
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        {announcementVisible && announcementText !== null ? (
          <AnnouncementBar
            text={announcementText}
            onDismiss={() => setAnnouncementVisible(false)}
          />
        ) : null}
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
