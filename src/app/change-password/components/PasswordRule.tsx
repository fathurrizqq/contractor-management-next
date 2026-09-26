type PasswordRuleProps = {
  valid: boolean;
  children: React.ReactNode;
};

export default function PasswordRule({
  valid,
  children,
}: PasswordRuleProps) {
  return (
    <li
      className={
        valid
          ? "text-green-600"
          : "text-slate-500"
      }
    >
      <span className="mr-2">
        {valid ? "✓" : "○"}
      </span>

      {children}
    </li>
  );
}