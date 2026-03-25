import { closeDialogOnBackdropPointer } from "../dialog-backdrop-close";

type NewsModalEntry = {
  slug: string;
  title: string;
  content: string;
};

export function wireNewsModal(): void {
  const dataEl = document.getElementById("latest-news-modal-data");
  const newsModal = document.querySelector("#latest-news-modal");
  if (!dataEl?.textContent?.trim() || !(newsModal instanceof HTMLDialogElement)) return;

  let entries: NewsModalEntry[];
  try {
    entries = JSON.parse(dataEl.textContent) as NewsModalEntry[];
  } catch {
    return;
  }
  if (entries.length === 0) return;

  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const titleEl = document.getElementById("latest-news-modal-title");
  const contentEl = document.getElementById("latest-news-modal-content");
  const closeBtn = newsModal.querySelector(".news-close");

  if (!titleEl || !contentEl || !(closeBtn instanceof HTMLButtonElement)) return;

  const dlg: HTMLDialogElement = newsModal;
  const elTitle = titleEl;
  const elContent = contentEl;

  function openFor(slug: string): void {
    const item = bySlug.get(slug);
    if (!item) return;
    elTitle.textContent = item.title;
    elContent.replaceChildren();
    const p = document.createElement("p");
    p.className = "news-modal-body";
    p.textContent = item.content;
    elContent.appendChild(p);
    dlg.showModal();
  }

  document.querySelectorAll(".news-trigger[data-news-slug]").forEach((btn) => {
    const slug = btn.getAttribute("data-news-slug");
    if (!slug || !(btn instanceof HTMLButtonElement)) return;
    btn.addEventListener("click", () => openFor(slug));
    btn.addEventListener("keydown", (e) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFor(slug);
      }
    });
  });

  closeBtn.addEventListener("click", () => dlg.close());
  closeDialogOnBackdropPointer(dlg);
}
