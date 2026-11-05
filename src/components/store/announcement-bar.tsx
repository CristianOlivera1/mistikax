type AnnouncementBarProps = {
  text: string;
};

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  return (
    <div className="bg-foreground text-background px-6 py-2 text-center text-[11px] font-medium tracking-[0.2em] uppercase">
      {text}
    </div>
  );
}
