/**
 * Close a modal `<dialog>` when the user clicks outside its box (backdrop area).
 *
 * We use pointer coordinates instead of `event.target === dialog` because `target`
 * for backdrop clicks is not consistent across browsers when using `showModal()`.
 */
export function closeDialogOnBackdropPointer(dialog: HTMLDialogElement): void {
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (isOutside) {
      dialog.close();
    }
  });
}
