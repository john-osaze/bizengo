
import { jsPDF } from "jspdf";
import { AddTextOptions, YCursor } from "@/types/invoice";

/**
 * Adds text (single or multi-line) to the PDF, handling page breaks and re-applying header.
 * @param pdf The jsPDF instance.
 * @param yCursor A mutable object to track the current Y position on the page.
 * @param text The text string or array of strings to add.
 * @param options Styling and positioning options.
 * @param pageHeight The total height of the PDF page.
 * @param margin The document margin.
 * @param headerCallback A function to call to draw the header on a new page.
 */
export const addTextToPdf = (
    pdf: jsPDF,
    yCursor: YCursor,
    text: string | string[],
    options: AddTextOptions,
    pageHeight: number,
    margin: number,
    headerCallback?: () => void
) => {
    pdf.setFont(options.fontFamily || "helvetica", options.fontStyle || "normal");
    pdf.setFontSize(options.fontSize || 10);
    pdf.setTextColor(options.textColor?.[0] ?? 0, options.textColor?.[1] ?? 0, options.textColor?.[2] ?? 0);

    const textLines = Array.isArray(text) ? text : [text];
    const effectiveLineHeight = options.lineHeight || (pdf.getFontSize() * 1.2);

    textLines.forEach((line, index) => {
        if (yCursor.current + effectiveLineHeight > pageHeight - margin) {
            pdf.addPage();
            yCursor.current = margin;
            if (headerCallback) headerCallback();

            pdf.setFont(options.fontFamily || "helvetica", options.fontStyle || "normal");
            pdf.setFontSize(options.fontSize || 10);
            pdf.setTextColor(options.textColor?.[0] ?? 0, options.textColor?.[1] ?? 0, options.textColor?.[2] ?? 0);
        }

        pdf.text(line, options.x, yCursor.current, { align: options.align || 'left' });

        if (index < textLines.length - 1) {
            yCursor.current += effectiveLineHeight;
        }
    });

    yCursor.current += effectiveLineHeight;
};


// src/lib/utils/dateUtils.ts

export const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};