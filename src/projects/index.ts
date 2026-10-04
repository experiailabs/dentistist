import type { ComponentType } from "react";
import BookableClinic from "./bookable-clinic/Home";

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  component: ComponentType;
};

// Add each new project here; the gallery and routes use this same list.
export const projects: Project[] = [
  {
    id: "project1",
    title: "Bookable Clinic",
    category: "Healthcare · Clinic dashboard",
    description: "A calmer way to manage waitlists, recover appointments, and bring patients back.",
    href: "/bookable-clinic",
    component: BookableClinic,
  },
];
