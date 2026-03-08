import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Pencil, Trash2, Plus, LogOut, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  chart_count: number;
  created_at: string;
  updated_at: string;
}

const ProjectsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProjects();
  }, [user, navigate]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, chart_count, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Failed to load projects");
      console.error(error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase
      .from("projects")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to rename project");
    } else {
      toast.success("Project renamed!");
      setEditingId(null);
      loadProjects();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete project");
    } else {
      toast.success("Project deleted!");
      loadProjects();
    }
  };

  const handleLoadProject = (project: Project) => {
    navigate(`/chart?project=${project.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <h1 className="font-display text-lg font-bold text-foreground">My Projects</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
          <Link to="/chart">
            <Button size="sm" className="gap-2 text-xs">
              <Plus className="h-3.5 w-3.5" /> New Chart
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="text-6xl">📁</div>
            <h2 className="font-display text-xl font-bold text-foreground">No projects yet</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Create a chart and save it to start building your project library.
            </p>
            <Link to="/chart">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Chart
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                {/* Thumbnail placeholder */}
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {editingId === project.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm max-w-xs"
                        onKeyDown={(e) => e.key === "Enter" && handleRename(project.id)}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRename(project.id)}>
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => handleLoadProject(project)} className="text-left">
                      <h3 className="font-display text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                    </button>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {project.chart_count} chart{project.chart_count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Updated {format(new Date(project.updated_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingId(project.id);
                      setEditName(project.name);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{project.name}" and all its charts. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
