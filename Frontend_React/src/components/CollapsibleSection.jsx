import { useState } from 'react';

export default function CollapsibleSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {icon && <span className="text-gray-400" aria-hidden>{icon}</span>}
          {title}
        </span>
        <span className={`inline-block text-gray-400 text-[10px] transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} aria-hidden>▼</span>
      </button>
      {open && <div className="px-4 pb-4 pt-0 border-t border-gray-100">{children}</div>}
    </section>
  );
}
