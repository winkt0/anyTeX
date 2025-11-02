import { mathjax } from "@mathjax/src/mjs/mathjax.js";
import { TeX } from "@mathjax/src/mjs/input/tex.js";
import { SVG } from "@mathjax/src/mjs/output/svg.js";
import { liteAdaptor } from "@mathjax/src/mjs/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/mjs/handlers/html.js";
import html2canvas from "html2canvas";
import "bootstrap/dist/css/bootstrap.min.css";

// Type declarations
const input = document.getElementById("latex-input") as HTMLTextAreaElement | null;
const btn = document.getElementById("render-btn") as HTMLButtonElement | null;
const preview = document.getElementById("preview") as HTMLElement | null;
const scaleSlider = document.getElementById("scale-slider") as HTMLInputElement | null;
const scaleValue = document.getElementById("scale-value") as HTMLElement | null;
const copyBtn = document.getElementById("copy-btn") as HTMLButtonElement | null;
const downloadBtn = document.getElementById("download-btn") as HTMLButtonElement | null;

let lastLatexInput: string | null = null;
let currentScale = parseFloat(scaleSlider?.value || "1");

// Mathjax variables
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX();
const svg = new SVG({ fontCache: "none" });
const mathjaxDocument = mathjax.document("", { InputJax: tex, OutputJax: svg });

function renderSVG(latex: string) {
    const node = mathjaxDocument.convert(latex, { display: false });
    console.log("Converted node: ");
    console.log(node);
    const svgMarkup = adaptor.outerHTML(node);
    console.log("SVG:");
    console.log(svgMarkup);
    if (preview) {
        preview.innerHTML = svgMarkup;

        const svgElement = preview.querySelector("svg");
        if (svgElement) {
            const originalWidth = parseFloat(svgElement.getAttribute("width") || "1");
            const originalHeight = parseFloat(svgElement.getAttribute("height") || "1");
            svgElement.setAttribute("width", (originalWidth * currentScale).toString());
            svgElement.setAttribute("height", (originalHeight * currentScale).toString());
        }
    }
}

// Update scale text & render with adjusted size
scaleSlider?.addEventListener("input", () => {
    currentScale = parseFloat(scaleSlider.value);
    if (scaleValue) {
        scaleValue.textContent = `${currentScale.toFixed(1)}`;
    }
    if (lastLatexInput) {
        renderSVG(lastLatexInput);
    }
});

// Render on click
btn?.addEventListener("click", () => {
    lastLatexInput = input?.value.trim() || null;
    if (lastLatexInput) {
        if (preview) {
            preview.innerHTML = "";
            renderSVG(lastLatexInput);
        }
    }
});

function createCanvas(container: HTMLElement, scale: number) {
    return html2canvas(container, {
        backgroundColor: null,
        scale: scale,
        removeContainer: true,
        useCORS: true
    });
}

// Copy image to clipboard
copyBtn?.addEventListener("click", async () => {
    if (preview) {
        const canvas = await createCanvas(preview, currentScale);
        const dataURL = canvas.toDataURL("image/png");
        const response = await fetch(dataURL);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy Image"), 1500);
    }
});

downloadBtn?.addEventListener("click", async () => {
    if (preview) {
        const canvas = await createCanvas(preview, currentScale);
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'tex-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
