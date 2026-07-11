import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageChromeProvider, PageHeader } from "./page-chrome";

// Seam: the header slot's observable contract — a page's <PageHeader> content replaces
// the provider's fallback, and with no page header the fallback shows. Asserted through
// visible text (CONTEXT.md §Components).

describe("page chrome", () => {
  it("shows the fallback when no page fills the header", () => {
    render(
      <PageChromeProvider fallback={<span>breadcrumb fallback</span>}>
        <main>body</main>
      </PageChromeProvider>,
    );
    expect(screen.getByText("breadcrumb fallback")).toBeInTheDocument();
  });

  it("replaces the fallback with the page header content", () => {
    render(
      <PageChromeProvider fallback={<span>breadcrumb fallback</span>}>
        <main>
          <PageHeader>
            <span>page rail</span>
          </PageHeader>
          body
        </main>
      </PageChromeProvider>,
    );
    expect(screen.getByText("page rail")).toBeInTheDocument();
    expect(screen.queryByText("breadcrumb fallback")).not.toBeInTheDocument();
  });

  it("renders inline when used without a provider (standalone/testing)", () => {
    render(
      <PageHeader>
        <span>inline rail</span>
      </PageHeader>,
    );
    expect(screen.getByText("inline rail")).toBeInTheDocument();
  });
});
