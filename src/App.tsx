import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { Link, Route, Switch } from "wouter";
import { ArrowLeft } from "lucide-react";
import { projects, type Project } from "./projects";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

function ProjectDemo({ project }: { project: Project }) {
  useEffect(() => { document.title = `${project.title} · Experiai`; }, [project.title]);
  const Component = project.component;
  return <><Component /><Link href="/" className="demo-back-link"><ArrowLeft size={14} /> All projects</Link></>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Switch>
            <Route path="/" component={Projects} />
            {projects.flatMap((project) => [project.href, `${project.href}/`].map((path) => (
              <Route key={path} path={path}><ProjectDemo project={project} /></Route>
            )))}
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
