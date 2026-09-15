if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true

    const autofocusElement = this.querySelector<HTMLElement>('[autofocus]')
    autofocusElement?.focus()
  }
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.open = false
  }
}
