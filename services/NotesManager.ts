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

    // 🔹 Сортировка по дате (новые сверху)
  listNotesNewestFirst(): Note[] {
    return [...this.notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 🔹 Сортировка по дате (старые сверху)
  listNotesOldestFirst(): Note[] {
    return [...this.notes].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

    updateNote(id: number, newTitle?: string, newContent?: string, newTags?: string[]): void {
    const note = this.notes.find(n => n.id === id);
    if (!note) {
      console.log(`Заметка с id=${id} не найдена`);
      return;
    }

    if (newTitle !== undefined) {
      note.title = newTitle;
    }
    if (newContent !== undefined) {
      note.content = newContent;
    }
    if (newTags !== undefined) {
      note.tags = newTags;
    }
  }

  // 🔹 Группировка заметок по тегам
  groupByTags(): Map<string, Note[]> {
    const map = new Map<string, Note[]>();

    this.notes.forEach(note => {
      note.tags.forEach(tag => {
        if (!map.has(tag)) {
          map.set(tag, []);
        }
        map.get(tag)!.push(note);
      });
    });

    return map;
  }

    exportToMarkdown(filename: string): void {
    let md = "# 📒 Notes Export\n\n";

    this.notes.forEach(note => {
      md += `## ${note.title}\n`;
      md += `**ID:** ${note.id}\n\n`;
      md += `**Дата:** ${note.createdAt.toLocaleString()}\n\n`;
      md += `${note.content}\n\n`;

      if (note.tags.length > 0) {
        md += `**Теги:** ${note.tags.map(t => `\`${t}\``).join(", ")}\n\n`;
      }

      md += "---\n\n";
    });

    fs.writeFileSync(filename, md, "utf-8");
  }
}
