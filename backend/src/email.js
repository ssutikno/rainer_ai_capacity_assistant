export class EmailService {
  constructor(mode = "console") { this.mode = mode; }
  async sendResult({ recipient, name, url, summary }) {
    if (this.mode !== "console") throw new Error(`EMAIL_MODE ${this.mode} belum memiliki adapter`);
    console.info(JSON.stringify({ event: "email.accepted", recipient, template: "result-v1", name, url, summary }));
    return { provider_id: `console_${Date.now()}`, status: "accepted" };
  }
}
