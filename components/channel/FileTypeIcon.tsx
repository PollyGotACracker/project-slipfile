import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  type LucideIcon,
} from "lucide-react";

const EXTENSION_ICON: Record<string, LucideIcon> = {
  pdf: FileText,
  txt: FileText,
  md: FileText,
  doc: FileText,
  docx: FileText,
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
  json: FileCode,
  html: FileCode,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,
  zip: FileArchive,
  rar: FileArchive,
  "7z": FileArchive,
  mp3: FileAudio,
  wav: FileAudio,
  mp4: FileVideo,
  mov: FileVideo,
  webm: FileVideo,
};

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

interface FileTypeIconProps {
  fileName: string;
  className?: string;
}

export function FileTypeIcon({ fileName, className }: FileTypeIconProps) {
  const Icon = EXTENSION_ICON[getExtension(fileName)] ?? File;
  return <Icon className={className ?? "size-4 text-muted-foreground"} />;
}
