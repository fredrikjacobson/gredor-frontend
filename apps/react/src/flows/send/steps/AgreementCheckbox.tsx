/** Inramad kryssruta för avtalsgodkännande (Bolagsverket / Gredor). */
export function AgreementCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="inline-block rounded-lg border border-line p-3">
      <label htmlFor={id} className="flex items-center gap-2 text-sm text-ink">
        <input
          id={id}
          type="checkbox"
          className="size-4"
          data-testid={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
}
