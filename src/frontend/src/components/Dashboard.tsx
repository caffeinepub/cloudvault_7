import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  Cloud,
  FileText,
  FolderOpen,
  Grid3x3,
  Image,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { FileMeta } from "../backend";
import { FileType } from "../fileTypes";
import { useDeleteFile, useListFiles } from "../hooks/useQueries";
import MediaCard from "./MediaCard";
import MediaDetailModal from "./MediaDetailModal";
import UploadDropzone from "./UploadDropzone";

type Filter = "all" | "photos" | "videos" | "documents";

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const SIDEBAR_ITEMS: { id: Filter; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Files", icon: <Grid3x3 className="w-4 h-4" /> },
  { id: "photos", label: "Photos", icon: <Image className="w-4 h-4" /> },
  { id: "videos", label: "Videos", icon: <Video className="w-4 h-4" /> },
  {
    id: "documents",
    label: "Documents",
    icon: <FileText className="w-4 h-4" />,
  },
];

const EXTRA_SIDEBAR = [
  { label: "Camera Roll", icon: <FolderOpen className="w-4 h-4" /> },
  { label: "Shared", icon: <FolderOpen className="w-4 h-4" /> },
  { label: "Albums", icon: <FolderOpen className="w-4 h-4" /> },
];

const SKELETON_KEYS = [
  "sk1",
  "sk2",
  "sk3",
  "sk4",
  "sk5",
  "sk6",
  "sk7",
  "sk8",
  "sk9",
  "sk10",
  "sk11",
  "sk12",
];

export default function Dashboard({ username, onLogout }: DashboardProps) {
  const { data: files = [], isLoading } = useListFiles();
  const deleteMutation = useDeleteFile();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedFile, setSelectedFile] = useState<FileMeta | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  const filtered = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = f.fileName
        .toLowerCase()
        .includes(search.toLowerCase());
      const ft = f.fileType as string;
      const matchesFilter =
        filter === "all" ||
        (filter === "photos" && ft === FileType.image) ||
        (filter === "videos" && ft === FileType.video) ||
        (filter === "documents" &&
          (ft === FileType.document || ft === FileType.other));
      return matchesSearch && matchesFilter;
    });
  }, [files, search, filter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleDelete = async (fileName: string) => {
    setDeletingFile(fileName);
    try {
      await deleteMutation.mutateAsync(fileName);
      toast.success("File deleted");
      if (selectedFile?.fileName === fileName) setSelectedFile(null);
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingFile(null);
    }
  };

  const initials = username.slice(0, 2).toUpperCase();

  const emptyMessage = () => {
    if (search || filter !== "all") return "No matching files";
    return "No files yet";
  };

  const emptySubtitle = () => {
    if (search) return "Try adjusting your search or filter";
    if (filter === "documents")
      return "Upload your first document to get started";
    if (filter !== "all") return "Try adjusting your search or filter";
    return "Upload your first file to get started";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top Header ── */}
      <header
        className="sticky top-0 z-40 border-b border-border"
        style={{ background: "oklch(0.17 0.038 250)" }}
      >
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: brand + mobile menu */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
              data-ocid="header.menu.button"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-glow">
                <Cloud className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base text-foreground tracking-tight hidden sm:block">
                CloudVault
              </span>
            </div>
          </div>

          {/* Center: nav tabs (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === item.id
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                data-ocid={`nav.${item.id}.tab`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: search + upload + user */}
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 w-44 lg:w-56 bg-muted border-border text-sm"
                data-ocid="header.search_input"
              />
            </div>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow h-8 px-3 gap-1.5"
              onClick={() => setUploadOpen(true)}
              data-ocid="header.upload.button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl px-2 py-1 hover:bg-accent transition-colors"
                  data-ocid="header.user.dropdown_menu"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">
                    {username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border"
              >
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer"
                  data-ocid="header.logout.button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside
          className="hidden md:flex flex-col w-64 shrink-0 border-r border-border py-5 px-3"
          style={{ background: "oklch(0.17 0.038 250)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-3">
            Folders
          </p>
          <nav className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === item.id
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                data-ocid={`sidebar.${item.id}.tab`}
              >
                <span
                  className={
                    filter === item.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-border my-4" />

          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-3">
            More
          </p>
          <nav className="space-y-0.5">
            {EXTRA_SIDEBAR.map((item) => (
              <button
                type="button"
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4">
            <div className="rounded-xl bg-muted border border-border p-3">
              <p className="text-xs font-semibold text-foreground mb-0.5">
                {files.length} file{files.length !== 1 ? "s" : ""} stored
              </p>
              <p className="text-[11px] text-muted-foreground">
                Secured on Internet Computer
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col py-5 px-3 border-r border-border md:hidden"
                style={{ background: "oklch(0.17 0.038 250)" }}
              >
                <div className="flex items-center justify-between mb-5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <Cloud className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-foreground">
                      CloudVault
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-accent"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-3">
                  Folders
                </p>
                <nav className="space-y-0.5">
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setFilter(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === item.id
                          ? "bg-accent text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="border-t border-border my-4" />
                {EXTRA_SIDEBAR.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Mobile search */}
          <div className="sm:hidden relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-border"
              data-ocid="mobile.search_input"
            />
          </div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome, {username}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {files.length === 0
                ? "Upload your first file to get started"
                : `${files.length} file${files.length !== 1 ? "s" : ""} stored securely`}
            </p>
          </motion.div>

          {/* Secure Storage Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-primary/5 border-primary/20"
            data-ocid="secure_storage.panel"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
                Secure Storage
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Your files are encrypted and stored on the Internet Computer
                blockchain
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-400 font-medium">
                Active
              </span>
            </div>
          </motion.div>

          {/* Section header */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent Uploads
            </p>
            {/* Filter pills (mobile) */}
            <div className="flex md:hidden items-center gap-1 flex-wrap justify-end">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={`filter.${item.id}.tab`}
                >
                  {item.id === "all" ? "All" : item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3"
              data-ocid="media.loading_state"
            >
              {SKELETON_KEYS.map((key) => (
                <div key={key} className="rounded-xl overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-2 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center rounded-2xl bg-card border border-border"
              data-ocid="media.empty_state"
            >
              <div className="text-5xl mb-4">
                {filter === "documents" ? "📄" : "📂"}
              </div>
              <p className="font-semibold text-foreground text-lg">
                {emptyMessage()}
              </p>
              <p className="text-sm text-muted-foreground mt-1.5 mb-5">
                {emptySubtitle()}
              </p>
              {!search && filter === "all" && (
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  onClick={() => setUploadOpen(true)}
                  data-ocid="empty.upload.button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {visible.map((file, index) => (
                  <MediaCard
                    key={file.fileName}
                    file={file}
                    index={index}
                    onClick={() => setSelectedFile(file)}
                    onDelete={() => handleDelete(file.fileName)}
                    isDeleting={deletingFile === file.fileName}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((n) => n + 24)}
                    className="px-6 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                    data-ocid="media.pagination_next"
                  >
                    Show More ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <footer className="text-center py-4 border-t border-border mt-8">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="upload.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Upload File</DialogTitle>
          </DialogHeader>
          <UploadDropzone onSuccess={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Media Detail Modal */}
      <MediaDetailModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDelete}
        isDeleting={
          selectedFile ? deletingFile === selectedFile.fileName : false
        }
      />
    </div>
  );
}
