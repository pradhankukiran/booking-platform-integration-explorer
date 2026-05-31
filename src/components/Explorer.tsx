"use client";

import {
  BarChart3,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileText,
  Filter,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  capabilityLabels,
  capabilityLevelLabel,
  capabilityScore,
  platforms,
  type CapabilityLevel,
  type Platform,
} from "@/data/platforms";
import styles from "./Explorer.module.css";

type FlowMode = "inquiry" | "instant" | "payment";

const flowModes: Record<
  FlowMode,
  { label: string; description: string; steps: string[] }
> = {
  inquiry: {
    label: "Request to book",
    description:
      "Lowest payment risk. Guest submits dates and details, operator confirms before charging.",
    steps: [
      "Fetch listing content",
      "Validate date availability",
      "Collect guest details",
      "Create inquiry or pending reservation",
      "Sync confirmation through webhook or admin review",
    ],
  },
  instant: {
    label: "Instant booking",
    description:
      "Guest receives booking confirmation after availability, rate, and reservation checks pass.",
    steps: [
      "Fetch listing and calendar",
      "Generate exact quote",
      "Collect guest details",
      "Create reservation",
      "Confirm status and send confirmation state to site",
    ],
  },
  payment: {
    label: "Payment-enabled checkout",
    description:
      "Highest complexity. Card data must be tokenized through the approved payment provider.",
    steps: [
      "Generate quote",
      "Collect guest details",
      "Tokenize card outside application servers",
      "Create reservation with payment token",
      "Handle failed, pending, and confirmed payment states",
    ],
  },
};

const capabilityKeys = Object.keys(capabilityLabels) as Array<
  keyof typeof capabilityLabels
>;

function levelClass(level: CapabilityLevel) {
  return {
    yes: styles.levelYes,
    partial: styles.levelPartial,
    "plan-gated": styles.levelGated,
    unknown: styles.levelUnknown,
  }[level];
}

function frictionLabel(friction: Platform["friction"]) {
  return {
    low: "Low friction",
    medium: "Medium friction",
    high: "High friction",
  }[friction];
}

function buildReport(platform: Platform, flowMode: FlowMode) {
  const flow = flowModes[flowMode];
  const capabilitySummary = capabilityKeys
    .map(
      (key) =>
        `- ${capabilityLabels[key]}: ${capabilityLevelLabel(platform.capabilities[key])}`,
    )
    .join("\n");
  const checklist = platform.implementationChecklist
    .map((item) => `- ${item}`)
    .join("\n");

  return `# Direct Booking Integration Readiness Report

Platform: ${platform.name}
Recommended flow: ${flow.label}
Effort estimate: ${platform.integrationEffort}
Backend required: ${platform.backendRequired ? "Yes" : "No"}
Documentation: ${platform.docsUrl}

## Capability map
${capabilitySummary}

## Required credentials
${platform.credentials.map((item) => `- ${item}`).join("\n")}

## Booking flow
${flow.steps.map((item) => `- ${item}`).join("\n")}

## Implementation checklist
${checklist}

## Main risks
${platform.risks.map((item) => `- ${item}`).join("\n")}

Note: Based on public API documentation. Final feasibility requires account access, enabled API permissions, payment settings, and sandbox testing.`;
}

export function Explorer() {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(platforms[0].slug);
  const [flowMode, setFlowMode] = useState<FlowMode>("payment");
  const [visibleSlugs, setVisibleSlugs] = useState(
    platforms.slice(0, 5).map((platform) => platform.slug),
  );
  const [copyState, setCopyState] = useState("Copy report");

  const selectedPlatform =
    platforms.find((platform) => platform.slug === selectedSlug) ?? platforms[0];

  const filteredPlatforms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return platforms;

    return platforms.filter((platform) =>
      [platform.name, platform.summary, platform.bestFor, platform.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  const visiblePlatforms = platforms.filter((platform) =>
    visibleSlugs.includes(platform.slug),
  );

  const leaders = [...platforms]
    .sort((a, b) => capabilityScore(b) - capabilityScore(a))
    .slice(0, 3);

  const report = buildReport(selectedPlatform, flowMode);

  function toggleVisible(slug: string) {
    setVisibleSlugs((current) => {
      if (current.includes(slug)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== slug);
      }

      return [...current, slug];
    });
  }

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopyState("Copied");
    window.setTimeout(() => setCopyState("Copy report"), 1400);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <p className={styles.kicker}>Short-Term Rental API Capability Mapper</p>
            <h1>Booking Platform Integration Explorer</h1>
            <p className={styles.headerCopy}>
              Compare property management systems across direct-booking API
              readiness, payment complexity, webhooks, and implementation risk.
            </p>
          </div>
          <div className={styles.headerActions}>
            <a className="usa-button" href="#report">
              <FileText aria-hidden="true" size={18} />
              Build report
            </a>
            <a className="usa-button usa-button--outline" href="#compare">
              <BarChart3 aria-hidden="true" size={18} />
              Compare
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.stats} aria-label="Explorer summary">
          <div>
            <strong>{platforms.length}</strong>
            <span>platforms mapped</span>
          </div>
          <div>
            <strong>{capabilityKeys.length}</strong>
            <span>API capability areas</span>
          </div>
          <div>
            <strong>0</strong>
            <span>client credentials needed for demo</span>
          </div>
        </section>

        <div className={styles.workspace}>
          <aside className={styles.sidebar} aria-label="Explorer controls">
            <label className="usa-label" htmlFor="platform-search">
              <Search aria-hidden="true" size={16} />
              Search platforms
            </label>
            <input
              className="usa-input"
              id="platform-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Guesty, Hostaway, payments..."
              type="search"
              value={query}
            />

            <div className={styles.controlGroup}>
              <h2>
                <Filter aria-hidden="true" size={16} />
                Platform detail
              </h2>
              <div className={styles.platformList}>
                {filteredPlatforms.map((platform) => (
                  <button
                    className={`${styles.platformButton} ${
                      platform.slug === selectedSlug ? styles.activePlatform : ""
                    }`}
                    key={platform.slug}
                    onClick={() => setSelectedSlug(platform.slug)}
                    type="button"
                  >
                    <span>{platform.name}</span>
                    <small>{frictionLabel(platform.friction)}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlGroup}>
              <h2>Compare columns</h2>
              <div className={styles.checkboxStack}>
                {platforms.map((platform) => (
                  <label key={platform.slug}>
                    <input
                      checked={visibleSlugs.includes(platform.slug)}
                      onChange={() => toggleVisible(platform.slug)}
                      type="checkbox"
                    />
                    {platform.name}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className={styles.content}>
            <section className={styles.leaderGrid} aria-label="Top adapters">
              {leaders.map((platform) => (
                <article className={styles.leaderCard} key={platform.slug}>
                  <div>
                    <span className="usa-tag">{platform.category}</span>
                    <h2>{platform.name}</h2>
                  </div>
                  <p>{platform.summary}</p>
                  <button
                    className="usa-button usa-button--outline"
                    onClick={() => setSelectedSlug(platform.slug)}
                    type="button"
                  >
                    <CheckCircle2 aria-hidden="true" size={18} />
                    Inspect
                  </button>
                </article>
              ))}
            </section>

            <section className={styles.panel} id="compare">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.kicker}>Capability Matrix</p>
                  <h2>Direct-booking API coverage</h2>
                </div>
                <span className={styles.sourceNote}>
                  Based on public documentation, not live account access.
                </span>
              </div>

              <div className={styles.tableWrap}>
                <table className="usa-table usa-table--borderless">
                  <thead>
                    <tr>
                      <th scope="col">Capability</th>
                      {visiblePlatforms.map((platform) => (
                        <th key={platform.slug} scope="col">
                          {platform.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {capabilityKeys.map((key) => (
                      <tr key={key}>
                        <th scope="row">{capabilityLabels[key]}</th>
                        {visiblePlatforms.map((platform) => {
                          const level = platform.capabilities[key];
                          return (
                            <td key={platform.slug}>
                              <span className={`${styles.level} ${levelClass(level)}`}>
                                {capabilityLevelLabel(level)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.detailGrid}>
              <article className={styles.panel}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.kicker}>Platform Detail</p>
                    <h2>{selectedPlatform.name}</h2>
                  </div>
                  <a
                    className="usa-button usa-button--outline"
                    href={selectedPlatform.docsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden="true" size={18} />
                    Docs
                  </a>
                </div>

                <p className={styles.summary}>{selectedPlatform.bestFor}</p>

                <dl className={styles.facts}>
                  <div>
                    <dt>Auth model</dt>
                    <dd>{selectedPlatform.authModel}</dd>
                  </div>
                  <div>
                    <dt>Backend</dt>
                    <dd>
                      {selectedPlatform.backendRequired
                        ? "Required for secure API calls"
                        : "Optional"}
                    </dd>
                  </div>
                  <div>
                    <dt>Effort</dt>
                    <dd>{selectedPlatform.integrationEffort}</dd>
                  </div>
                  <div>
                    <dt>Friction</dt>
                    <dd>{frictionLabel(selectedPlatform.friction)}</dd>
                  </div>
                </dl>

                <h3>
                  <Lock aria-hidden="true" size={18} />
                  Required access
                </h3>
                <ul className={styles.cleanList}>
                  {selectedPlatform.credentials.map((credential) => (
                    <li key={credential}>{credential}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.panel}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.kicker}>Flow Builder</p>
                    <h2>{flowModes[flowMode].label}</h2>
                  </div>
                </div>
                <div className={styles.segmented} role="group" aria-label="Booking flow">
                  {(Object.keys(flowModes) as FlowMode[]).map((mode) => (
                    <button
                      className={mode === flowMode ? styles.segmentActive : ""}
                      key={mode}
                      onClick={() => setFlowMode(mode)}
                      type="button"
                    >
                      {flowModes[mode].label}
                    </button>
                  ))}
                </div>
                <p className={styles.summary}>{flowModes[flowMode].description}</p>
                <ol className={styles.processList}>
                  {flowModes[flowMode].steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            </section>

            <section className={styles.detailGrid}>
              <article className={styles.panel}>
                <h2>
                  <ShieldCheck aria-hidden="true" size={20} />
                  Risks to validate
                </h2>
                <ul className={styles.cleanList}>
                  {selectedPlatform.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.panel}>
                <h2>Implementation checklist</h2>
                <ul className={styles.checklist}>
                  {selectedPlatform.implementationChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </section>

            <section className={styles.panel} id="report">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.kicker}>Scope Generator</p>
                  <h2>Client-ready readiness report</h2>
                </div>
                <button className="usa-button" onClick={copyReport} type="button">
                  <Clipboard aria-hidden="true" size={18} />
                  {copyState}
                </button>
              </div>
              <pre className={styles.report}>{report}</pre>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
