import { ConsoleUI } from "./ui/CUI.js";

const ui = new ConsoleUI();
ui.start().catch((err) => {
    console.error("Критическая ошибка приложения:", err);
    process.exit(1);
});