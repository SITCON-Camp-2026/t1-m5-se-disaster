type VersionSwitchProps = {
  active: "phase0" | "v1";
};

const baseUrl = import.meta.env.BASE_URL;

export function VersionSwitch({ active }: VersionSwitchProps) {
  return (
    <nav className="version-switch" aria-label="版本切換">
      <a
        aria-current={active === "phase0" ? "page" : undefined}
        aria-label="整理者視角 Phase 0 工作台"
        className={active === "phase0" ? "active" : ""}
        href={baseUrl}
        title="整理者視角 Phase 0 工作台"
      >
        整理者視角
      </a>
      <a
        aria-current={active === "v1" ? "page" : undefined}
        aria-label="行動者視角 V1"
        className={active === "v1" ? "active" : ""}
        href={`${baseUrl}?view=v1`}
        title="行動者視角 V1"
      >
        行動者視角
      </a>
    </nav>
  );
}
