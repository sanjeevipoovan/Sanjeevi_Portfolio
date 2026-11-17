export function spotlight(event) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
  el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
}
