import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const empty = () => ({ leads: [], sessions: [], requirements: [], recommendations: [], shares: [], deliveries: [], reviews: [], auditEvents: [] });

export class JsonStore {
  constructor(file) { this.file = file; this.data = empty(); this.queue = Promise.resolve(); }
  async init() {
    await mkdir(path.dirname(this.file), { recursive: true });
    try { this.data = { ...empty(), ...JSON.parse(await readFile(this.file, "utf8")) }; }
    catch (error) { if (error.code !== "ENOENT") throw error; await this.persist(); }
  }
  async persist() {
    const temp = `${this.file}.tmp`;
    await writeFile(temp, JSON.stringify(this.data, null, 2));
    await rename(temp, this.file);
  }
  async mutate(fn) {
    let result;
    this.queue = this.queue.then(async () => { result = fn(this.data); await this.persist(); });
    await this.queue; return result;
  }
  find(collection, predicate) { return this.data[collection].find(predicate); }
  list(collection) { return this.data[collection]; }
}

export class MemoryStore extends JsonStore {
  constructor() { super(""); this.data = empty(); }
  async init() {}
  async persist() {}
}
