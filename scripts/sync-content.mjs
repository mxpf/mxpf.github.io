#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const contentPath = join(root, "src/data/content.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCarouselButton(direction, sectionName) {
  const path =
    direction === "prev" ? "M29 18L21 25L29 32" : "M21 32L29 25L21 18";
  const label = direction === "prev" ? "Previous" : "Next";

  return `                  <button class="swiper-button-${direction}2 ${sectionName}__swiper-button-${direction}" type="button" aria-label="${label} ${sectionName} slide">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="24.5" stroke="var(--color-ui-muted)" />
                      <path d="${path}" stroke="var(--color-ui-muted)" />
                    </svg>
                  </button>`;
}

function renderWorksSection(items) {
  const slides = items
    .map((item) => {
      const slideSize = item.size === "xs" ? "xs" : "sm";
      const titleClass =
        item.titleScale === "large" ? "text-display-md" : "text-card-title";

      return `                    <div class="swiper-slide works__swiper-slide works__slide-${slideSize}">
                      <a class="works__card" href="./case.html#${escapeHtml(item.slug)}">
                        <img
                          class="works__img"
                          src="${escapeHtml(item.image)}"
                          alt="${escapeHtml(item.alt || item.title)}"
                        />
                        <h3 class="type-display works__text ${titleClass}">
                          ${escapeHtml(item.title)}
                        </h3>
                      </a>
                    </div>`;
    })
    .join("\n");

  return `        <div class="section section__works pp-scrollable">
          <div class="section-main works js-section" id="work">
            <div class="container-main works__container">
              <h2 class="text-accent type-display works__title text-section-title">
                selected cases
              </h2>
              <div class="works__row">
                <div class="swiper-container2 works__swiper-container">
                  <div class="swiper-wrapper works__swiper-wrapper">
${slides}
                  </div>
                </div>
                <div class="swiper-button-wrapper">
${renderCarouselButton("prev", "works")}
${renderCarouselButton("next", "works")}
                </div>
              </div>
            </div>
          </div>
        </div>
`;
}

function renderExperimentsSection(items) {
  const slides = items
    .map((item) => {
      const isFeature = item.size === "xl";
      const slideClass = isFeature
        ? "experiments__swiper-slide-xl"
        : "experiments__swiper-slide-sm";
      const cardClass = isFeature ? "experiments__card-md" : "experiments__card-sm";
      const titleClass = isFeature ? "text-display-md" : "text-display-sm";

      return `                    <div class="swiper-slide experiments__swiper-slide ${slideClass}">
                      <a class="experiments__card ${cardClass}" href="./experiments.html#${escapeHtml(item.slug)}">
                        <img
                          class="experiments__card-img"
                          src="${escapeHtml(item.image)}"
                          alt="${escapeHtml(item.alt || item.title)}"
                        />
                        <div class="type-meta experiments__card-date">
                          ${escapeHtml(item.dateLabel)}
                        </div>
                        <div class="type-display experiments__card-title ${titleClass}">
                          ${escapeHtml(item.title)}
                        </div>
                      </a>
                    </div>`;
    })
    .join("\n");

  return `        <div class="section section__experiments pp-scrollable">
          <div class="section-main experiments js-section" id="experiments">
            <div class="container-main experiments__container">
              <div class="experiments__row">
                <h2 class="text-accent type-display experiments__title text-section-title">
                  Experiments
                </h2>
                <div class="swiper-container2 experiments__swiper-container">
                  <div class="swiper-wrapper experiments__swiper-wrapper">
${slides}
                  </div>
                </div>
                <div class="swiper-button-wrapper">
${renderCarouselButton("prev", "experiments")}
${renderCarouselButton("next", "experiments")}
                </div>
              </div>
            </div>
          </div>
        </div>
`;
}

function replaceSection(source, startNeedle, endNeedle, replacement) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);

  if (start === -1 || end === -1) {
    throw new Error(`Could not replace section starting with ${startNeedle}`);
  }

  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`Synced ${path.replace(`${root}/`, "")}`);
}

const worksSection = renderWorksSection(content.portfolioItems);
const experimentsSection = renderExperimentsSection(content.experiments);

writeFile(join(root, "src/partials/home/sections/works.html"), worksSection);
writeFile(join(root, "src/partials/home/sections/experiments.html"), experimentsSection);

const homepagePath = join(root, "index.html");
let homepage = readFileSync(homepagePath, "utf8");
homepage = replaceSection(
  homepage,
  '        <div class="section section__works pp-scrollable">',
  '        <div class="section section__services pp-scrollable">',
  worksSection
);
homepage = replaceSection(
  homepage,
  '        <div class="section section__experiments pp-scrollable">',
  '        <div class="section section__contacts pp-scrollable">',
  experimentsSection
);
writeFile(homepagePath, homepage);

writeFile(
  join(root, "js/content.js"),
  `window.MXPF_CONTENT = ${JSON.stringify(content, null, 2)};\n`
);
