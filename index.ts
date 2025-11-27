import { NotesManager } from "./services/NotesManager";

const manager = new NotesManager();

manager.addNote("Учеба", "Разобрать generics в TypeScript", ["typescript", "study"]);
manager.addNote("Проект", "Добавить сохранение заметок в JSON", ["project", "todo"]);

console.log("Все заметки:", manager.listNotes());
console.log("Поиск по тегу 'typescript':", manager.findByTag("typescript"));
console.log("Поиск по слову 'JSON':", manager.search("json"));

manager.removeNote(1);
console.log("После удаления:", manager.listNotes());
