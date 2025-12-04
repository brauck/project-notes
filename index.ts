import { NotesManager } from "./services/NotesManager";
import * as dotenv from "dotenv";

dotenv.config();

const manager = new NotesManager();

// Загружаем заметки из файла (JSON путь берём из .env)
const jsonFile = process.env.NOTES_JSON || "notes.json";
manager.loadFromFile("notes.json");

manager.addNote("Учеба", "Разобрать generics в TypeScript", ["typescript", "study"]);
manager.addNote("Проект", "Добавить сохранение заметок в JSON", ["project", "todo"]);

console.log("Все заметки:", manager.listNotes());
console.log("Поиск по тегу 'typescript':", manager.findByTag("typescript"));
console.log("Поиск по слову 'JSON':", manager.search("json"));

console.log("Все заметки (новые сверху):", manager.listNotesNewestFirst());
console.log("Все заметки (старые сверху):", manager.listNotesOldestFirst());

// Обновляем заметку
manager.updateNote(1, "Учеба и практика", "Разобрать generics и utility types", ["typescript", "study", "advanced"]);

console.log("После обновления:", manager.listNotes());

const grouped = manager.groupByTags();

console.log("Группировка заметок по тегам:");
grouped.forEach((notes, tag) => {
  console.log(`Тег: ${tag}`);
  notes.forEach(n => console.log(`  [${n.id}] ${n.title}`));
});

// Сохраняем заметки в файл
manager.saveToFile("notes.json");

manager.addNote("Проект", "Добавить экспорт заметок в Markdown", ["project", "todo"]);

// Экспортируем в Markdown и HTML
const mdFile = process.env.NOTES_MD || "notes.md";
const htmlFile = process.env.NOTES_HTML || "notes.html";

manager.exportToMarkdown(mdFile);
manager.exportToHtml(htmlFile);

console.log(`Заметки сохранены в ${jsonFile}, экспортированы в ${mdFile} и ${htmlFile}`);