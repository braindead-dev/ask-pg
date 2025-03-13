export function CitationLink({ essayName }: { essayName: string }) {
  return (
    <a
      href={`https://paulgraham.com/${essayName}.html`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs px-2 py-1 rounded-full 
        text-neutral-900 dark:text-neutral-100
        bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800
        shadow-[0_2px_3px_-1px_rgba(0,0,0,0.2)]
        dark:shadow-[0_2px_3px_-1px_rgba(0,0,0,0.3)]
        relative before:absolute before:inset-0 before:rounded-full
        before:bg-gradient-to-b before:from-white/80 before:to-transparent before:opacity-80 dark:before:from-white/5
        after:absolute after:inset-0 after:rounded-full
        after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),inset_0_-1px_1px_rgba(0,0,0,0.05)]
        dark:after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(0,0,0,0.1)]
        hover:from-neutral-100 hover:to-neutral-200 dark:hover:from-neutral-600 dark:hover:to-neutral-700
        transition-[background,colors] duration-300"
    >
      {essayName}
    </a>
  )
} 