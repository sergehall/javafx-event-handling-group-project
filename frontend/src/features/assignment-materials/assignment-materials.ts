export type AssignmentMaterial = Readonly<{
  fileName: string;
  title: string;
  category: "Java" | "FXML" | "Maven";
  description: string;
}>;

export const ASSIGNMENT_MATERIALS = [
  {
    fileName: "CanvasApp.java",
    title: "Canvas event example",
    category: "Java",
    description:
      "Starter example for mouse clicks, shape movement, and listeners that react to window resizing.",
  },
  {
    fileName: "ClickApp.java",
    title: "FXML application entry point",
    category: "Java",
    description:
      "Shows the basic JavaFX application and FXMLLoader setup supplied with the assignment.",
  },
  {
    fileName: "ClickController.java",
    title: "Button event controller",
    category: "Java",
    description:
      "A small controller that reads a text field, updates a label, and clears the input.",
  },
  {
    fileName: "click.fxml",
    title: "Starter FXML layout",
    category: "FXML",
    description: "Declares the text field, button action, output label, and controller connection.",
  },
  {
    fileName: "module-info.java",
    title: "Java module descriptor",
    category: "Java",
    description: "Lists the JavaFX modules and opens the controller package to FXMLLoader.",
  },
  {
    fileName: "pom.xml",
    title: "Starter Maven configuration",
    category: "Maven",
    description: "Records the JavaFX dependencies, compiler level, and JavaFX Maven plugin setup.",
  },
] as const satisfies readonly AssignmentMaterial[];

export function getMaterialHref(fileName: string): string {
  return `/assignment-materials/${encodeURIComponent(fileName)}`;
}
