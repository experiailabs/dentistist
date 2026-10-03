import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { Link, Route, Switch } from "wouter";
import { ArrowLeft } from "lucide-react";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

function ClinicDemo() {
  useEffect(() => { document.title = "Demo1 · Bookable Clinic"; }, []);
  return <><Home /><Link href="/" className="demo-back-link"><ArrowLeft size={14} /> All projects</Link></>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Switch>
            <Route path="/" component={Projects} />
            <Route path="/demo1" component={ClinicDemo} />
            <Route path="/demo1/" component={ClinicDemo} />
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
