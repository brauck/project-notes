import { Note } from "../models/Note";
import * as fs from "fs";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

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

 private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

exportToHtml(filename: string): void {
    const head = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Notes Export</title>
  <style>
    :root {
      --bg: #0f1216;
      --card: #171b21;
      --text: #e6e6e6;
      --muted: #a0a7b4;
      --accent: #7aa2f7;
      --border: #232832;
      --tag-bg: #222734;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 32px; background: var(--bg); color: var(--text);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
    }
    h1 { margin: 0 0 16px; font-size: 28px; }
    .subtitle { color: var(--muted); margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .note {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
    }
    .note h2 {
      margin: 0 0 8px;
      font-size: 18px;
      color: var(--accent);
    }
    .meta {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .content { white-space: pre-wrap; }
    .tags { margin-top: 12px; }
    .tag {
      display: inline-block;
      font-size: 12px;
      color: var(--text);
      background: var(--tag-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 2px 8px;
      margin-right: 6px;
      margin-bottom: 6px;
    }
    hr {
      border: none; border-top: 1px solid var(--border); margin: 24px 0;
    }
    footer {
      margin-top: 24px; color: var(--muted); font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>📒 Notes Export</h1>
  <div class="subtitle">Экспортировано ${new Date().toLocaleString()}</div>
  <div class="grid">`;

    const cards = this.notes.map(n => {
      const title = this.escapeHtml(n.title);
      const content = this.escapeHtml(n.content);
      const date = n.createdAt.toLocaleString();
      const tags = n.tags.map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join(" ");

      return `<article class="note">
        <h2>${title}</h2>
        <div class="meta">ID: ${n.id} • Дата: ${date}</div>
        <div class="content">${content}</div>
        ${n.tags.length ? `<div class="tags">${tags}</div>` : ""}
      </article>`;
    }).join("\n");

    const foot = `</div>
  <footer>Сгенерировано Notes Manager • ${this.notes.length} заметок</footer>
</body>
</html>`;

    const html = head + "\n" + cards + "\n" + foot;
    fs.writeFileSync(filename, html, "utf-8");
  }

    exportToPdf(filename: string, fontPath: string): void {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filename);
    doc.pipe(stream);

    // Подключаем шрифт с поддержкой кириллицы
    doc.font(fontPath);

    doc.fontSize(20).text("📒 Notes Export", { align: "center" });
    doc.moveDown();

    this.notes.forEach(note => {
      doc.fontSize(16).fillColor("#333").text(note.title, { underline: true });
      doc.fontSize(10).fillColor("#666").text(`ID: ${note.id} • Дата: ${note.createdAt.toLocaleString()}`);
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor("#000").text(note.content);
      doc.moveDown(0.5);

      if (note.tags.length > 0) {
        doc.fontSize(10).fillColor("#007ACC").text(`Теги: ${note.tags.join(", ")}`);
      }

      doc.moveDown();
      doc.moveDown();
    });

    doc.end();
  }

    async exportToExcel(filename: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Notes");

    // Заголовки таблицы
    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Заголовок", key: "title", width: 30 },
      { header: "Содержимое", key: "content", width: 50 },
      { header: "Дата создания", key: "createdAt", width: 25 },
      { header: "Теги", key: "tags", width: 30 },
    ];

    // Добавляем строки
    this.notes.forEach(note => {
      sheet.addRow({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt.toLocaleString(),
        tags: note.tags.join(", "),
      });
    });

    // Немного стилей для заголовков
    sheet.getRow(1).font = { bold: true, color: { argb: "FF007ACC" } };

    await workbook.xlsx.writeFile(filename);
  }

    exportToCsv(filename: string): void {
    // Заголовки
    let csv = "ID;Title;Content;CreatedAt;Tags\n";

    // Строки
    this.notes.forEach(note => {
      const id = note.id;
      const title = `"${note.title.replace(/"/g, '""')}"`; // экранируем кавычки
      const content = `"${note.content.replace(/"/g, '""')}"`;
      const createdAt = note.createdAt.toLocaleString();
      const tags = `"${note.tags.join(", ").replace(/"/g, '""')}"`;

      csv += `${id};${title};${content};${createdAt};${tags}\n`;
    });

    fs.writeFileSync(filename, csv, "utf-8");
  }

    importFromCsv(filename: string): void {
    const data = fs.readFileSync(filename, "utf-8");
    const lines = data.split("\n").filter(line => line.trim().length > 0);

    // Первая строка — заголовки, пропускаем её
    lines.slice(1).forEach(line => {
      const [id, title, content, createdAt, tags] = line.split(";");

      // Убираем кавычки и экранирование
      const cleanTitle = title?.replace(/^"|"$/g, "").replace(/""/g, '"') || "";
      const cleanContent = content?.replace(/^"|"$/g, "").replace(/""/g, '"') || "";
      const cleanTags = tags?.replace(/^"|"$/g, "").split(",").map(t => t.trim()).filter(t => t.length > 0) || [];

      const note: Note = {
        id: Number(id),
        title: cleanTitle,
        content: cleanContent,
        createdAt: new Date(createdAt),
        tags: cleanTags,
      };

      this.notes.push(note);
      this.nextId = Math.max(this.nextId, note.id + 1);
    });
  }
}
