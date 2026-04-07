import { useCallback, useState } from "react";
import { CheckCircle, Copy, Terminal } from "lucide-react";

type CliCommandPreviewProps = {
  command: string;
  busy?: boolean;
};

export function CliCommandPreview({ command, busy = false }: CliCommandPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Terminal className="h-3 w-3 text-muted-foreground/50" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Command preview
        </p>
      </div>
      <div className="group relative rounded-lg border border-foreground/10 bg-foreground/[0.03]">
        <pre className="overflow-x-auto px-3 py-2.5 text-xs font-mono text-foreground/80 leading-relaxed">
          {command}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          disabled={busy}
          className="absolute right-2 top-2 rounded-md border border-foreground/10 bg-card px-1.5 py-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground/70 group-hover:opacity-100 disabled:opacity-0"
        >
          {copied ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground/40">
        This is the equivalent CLI command that will be executed.
      </p>
    </div>
  );
}

