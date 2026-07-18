export type RubricItem = Readonly<{
  criterion: string;
  points: number;
  fullMarks: string;
}>;

export const ASSIGNMENT_REQUIREMENTS = [
  "Create a JavaFX application with a main class extending the Application class.",
  "Use a layout manager such as VBox or BorderPane for the text field, buttons, and list view.",
  "Handle the Add Task button so new tasks appear in the list view.",
  "Handle task checkboxes so tasks can be marked as completed.",
  "Handle Remove buttons so tasks can be deleted from the list view.",
  "Keep the interface synchronized when tasks are added, completed, or removed.",
  "Document the code with useful comments and keep the total length around 200–300 lines.",
] as const;

export const RUBRIC_ITEMS = [
  {
    criterion: "JavaFX Frame",
    points: 1,
    fullMarks: "The application opens in a working JavaFX stage and scene.",
  },
  {
    criterion: "Add Task Button",
    points: 1,
    fullMarks: "A clearly labeled control is available for adding tasks.",
  },
  {
    criterion: "List Control",
    points: 1,
    fullMarks: "Tasks are displayed in an appropriate JavaFX list control.",
  },
  {
    criterion: "Check Task Control",
    points: 1,
    fullMarks: "Every task provides a checkbox or equivalent completion control.",
  },
  {
    criterion: "Remove Button",
    points: 1,
    fullMarks: "Every task provides an accessible remove action.",
  },
  {
    criterion: "Layout",
    points: 1,
    fullMarks: "Controls are arranged clearly with VBox, BorderPane, or another suitable layout.",
  },
  {
    criterion: "Add Task Functionality",
    points: 3,
    fullMarks: "Valid tasks are added reliably and the interface updates immediately.",
  },
  {
    criterion: "Remove Task Functionality",
    points: 1,
    fullMarks: "The selected task is removed and the list refreshes correctly.",
  },
  {
    criterion: "Listing Tasks",
    points: 2,
    fullMarks: "All current tasks are listed consistently and remain readable.",
  },
  {
    criterion: "Check Task Complete",
    points: 2,
    fullMarks: "Completion can be toggled and is reflected visually in the task row.",
  },
  {
    criterion: "Formatting",
    points: 2,
    fullMarks: "Code and interface are clean, readable, and professionally organized.",
  },
  {
    criterion: "Screen Recording",
    points: 4,
    fullMarks: "The recording clearly shows the IDE, JavaFX source, running UI, and interactions.",
  },
] as const satisfies readonly RubricItem[];

export const RUBRIC_TOTAL = RUBRIC_ITEMS.reduce((total, item) => total + item.points, 0);
