import { Note } from "../models/Note";

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
}
