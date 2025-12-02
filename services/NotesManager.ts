import { Note } from "../models/Note";
import * as fs from "fs";

export class NotesManager {
  private notes: Note[] = [];
  private nextId: number = 1;

  addNote(title: string, content: string, tags: string[] = []): void {
    const newNote: Note = {
      id: this.nextId++,
      title,
      content,
      tags,
      createdAt: new Date(),
    };
    this.notes.push(newNote);
  }

  listNotes(): Note[] {
    return [...this.notes];
  }

  findByTag(tag: string): Note[] {
    return this.notes.filter(n => n.tags.includes(tag));
  }

  search(keyword: string): Note[] {
    return this.notes.filter(n =>
      n.title.toLowerCase().includes(keyword.toLowerCase()) ||
      n.content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  removeNote(id: number): void {
    this.notes = this.notes.filter(n => n.id !== id);
  }

  // 🔹 Сохранение заметок в JSON
  saveToFile(filename: string): void {
    const data = JSON.stringify(this.notes, null, 2);
    fs.writeFileSync(filename, data, "utf-8");
  }

  // 🔹 Загрузка заметок из JSON
  loadFromFile(filename: string): void {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, "utf-8");
      const parsed: Note[] = JSON.parse(data);

      // Восстанавливаем даты (JSON хранит их как строки)
      this.notes = parsed.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt),
      }));

      // Обновляем nextId
      this.nextId = this.notes.length > 0
        ? Math.max(...this.notes.map(n => n.id)) + 1
        : 1;
    }
  }
}
