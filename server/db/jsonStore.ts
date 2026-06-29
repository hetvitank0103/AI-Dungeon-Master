import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JsonStore<T extends { id: string }> {
  private filePath: string;

  constructor(collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), "utf-8");
    }
  }

  private readAll(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(content) as T[];
    } catch (err) {
      console.error(`Error reading database file ${this.filePath}:`, err);
      return [];
    }
  }

  private writeAll(data: T[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`Error writing database file ${this.filePath}:`, err);
    }
  }

  public find(): T[] {
    return this.readAll();
  }

  public findById(id: string): T | undefined {
    return this.readAll().find((item) => item.id === id);
  }

  public insert(item: T): T {
    const data = this.readAll();
    data.push(item);
    this.writeAll(data);
    return item;
  }

  public update(id: string, updates: Partial<T>): T | undefined {
    const data = this.readAll();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    data[index] = { ...data[index], ...updates };
    this.writeAll(data);
    return data[index];
  }

  public save(item: T): T {
    const data = this.readAll();
    const index = data.findIndex((i) => i.id === item.id);
    if (index === -1) {
      data.push(item);
    } else {
      data[index] = item;
    }
    this.writeAll(data);
    return item;
  }

  public delete(id: string): boolean {
    const data = this.readAll();
    const filtered = data.filter((item) => item.id !== id);
    if (filtered.length === data.length) return false;
    this.writeAll(filtered);
    return true;
  }
}
