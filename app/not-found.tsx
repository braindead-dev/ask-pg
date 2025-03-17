import { Attribution } from "@/components/attribution";

export default function Page() {
  return (
    <main className="mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch px-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-start gap-4">
          {/* PG Avatar */}
          <img
            src="/pgroid.png"
            alt="PG Avatar"
            className="h-12 w-12 rounded-lg"
          />

          {/* Message bubble styled like the chat UI */}
          <div className="flex flex-col gap-3">
            <div
              data-role="assistant"
              className="max-w-[80%] rounded-xl px-4 py-3 text-sm bg-gray-100 text-black"
            >
              Looks like you&apos;ve strayed from the path. But don&apos;t
              worry—exploration is where curiosity lives. Use this moment to ask
              &quot;why&quot; and &quot;what else.&quot; What unexpected corners
              might you discover next?
            </div>

            <a
              href="/"
              className="text-neutral-600 dark:text-neutral-300 text-sm flex items-center
                bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800
                px-1.5 py-0.5 rounded-full w-fit
                shadow-[0_2px_3px_-1px_rgba(0,0,0,0.2)]
                dark:shadow-[0_2px_3px_-1px_rgba(0,0,0,0.3)]
                relative before:absolute before:inset-0 before:rounded-full
                before:bg-gradient-to-b before:from-white/80 before:to-transparent before:opacity-80 dark:before:from-white/5
                after:absolute after:inset-0 after:rounded-full
                after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),inset_0_-1px_1px_rgba(0,0,0,0.05)]
                dark:after:shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(0,0,0,0.1)]
              "
            >
              <div className="relative z-10 flex items-center opacity-95">
                Return Home
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <Attribution />
      </div>
    </main>
  );
}
