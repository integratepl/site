import { closeDialogOnBackdropPointer } from "./dialog-backdrop-close";

const faqTrigger = document.querySelector(".footer-faq-btn");
const faqModal = document.querySelector("#faq-modal");

if (faqTrigger instanceof HTMLButtonElement && faqModal instanceof HTMLDialogElement) {
  faqTrigger.addEventListener("click", () => {
    faqModal.showModal();
  });
}

const faqClose = document.querySelector("[data-faq-modal-close]");
if (faqClose instanceof HTMLButtonElement && faqModal instanceof HTMLDialogElement) {
  faqClose.addEventListener("click", () => {
    faqModal.close();
  });

  closeDialogOnBackdropPointer(faqModal);
}
