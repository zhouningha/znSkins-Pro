import { html } from 'lit';
import type { TemplateResult } from 'lit';

export function renderPageShell(
  title: string,
  subtitle: string,
  controls: TemplateResult,
  body: TemplateResult,
): TemplateResult {
  return html`
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h1>${title}</h1>
          <p class="quote">${subtitle}</p>
        </div>
        <div class="page-controls">${controls}</div>
      </div>
      <div class="page-body">${body}</div>
    </div>
  `;
}
