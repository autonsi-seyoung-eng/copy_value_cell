/** @odoo-module **/

import { ListRenderer } from "@web/views/list/list_renderer";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { onMounted, onPatched, useRef } from "@odoo/owl";

patch(ListRenderer.prototype, {
    setup() {
        super.setup();
        this.notification = useService("notification");
        this.tableRef = useRef("table");

        onMounted(() => this._updateCopyIcons());
        onPatched(() => this._updateCopyIcons());
    },

    _updateCopyIcons() {
        // Use setTimeout to ensure the DOM is fully rendered/patched
        setTimeout(() => {
            if (!this.tableRef.el) {
                return;
            }
            this._addCopyButtonsToCells();
            this._addCopyButtonsToHeaders();
        }, 0);
    },

    _addCopyButtonsToCells() {
        const table = this.tableRef.el;
        if (!table) return;
        const cells = table.querySelectorAll("tbody td:not(.o_list_handle):not(.o_list_button):not(.o_list_record_selector)");

        cells.forEach(cell => {
            if (cell.querySelector(".o_copy_cell_button")) {
                return;
            }

            const cellText = (cell.textContent || "").trim();

            if (cellText) {
                const copyBtn = this._createCopyButton(cellText, "Copy Cell", "fa-clipboard");
                this._styleAndAppendButton(copyBtn, cell);
            }
        });
    },

    _addCopyButtonsToHeaders() {
        const table = this.tableRef.el;
        if (!table) return;
        const headers = table.querySelectorAll("thead th:not(.o_list_handle_cell):not(.o_list_record_selector_cell):not(.o_list_button_cell)");

        headers.forEach((header) => {
            // Find the actual column index considering potential hidden columns or colspan
            const columnIndex = Array.from(header.parentNode.children).indexOf(header);

            if (header.querySelector(".o_copy_header_button")) {
                return;
            }

            const headerTextElement = header.querySelector('.o_column_title');
            const headerText = (headerTextElement?.textContent || header.textContent || "").trim();
            // Only add button if header has text and it's not just a resize handle etc.
            if (!headerText || header.classList.contains('o_resize_handle')) {
                 return;
            }

            const copyBtn = this._createCopyButton(null, "Copy Column Data (with header)", "fa-files-o", () => this._copyColumnData(columnIndex));
            this._styleAndAppendButton(copyBtn, header, true); // Pass true for isHeader
        });
    },

    _createCopyButton(textToCopy, title, iconClass, clickHandler) {
        const copyBtn = document.createElement("button");
        copyBtn.classList.add("fa", iconClass, "btn", "btn-sm", "p-0", "ms-1");
        copyBtn.classList.add(iconClass === 'fa-clipboard' ? "o_copy_cell_button" : "o_copy_header_button");
        copyBtn.setAttribute("title", title);
        copyBtn.setAttribute("aria-label", title);
        copyBtn.style.border = "none";
        copyBtn.style.background = "transparent";
        copyBtn.style.opacity = "0.6";
        copyBtn.style.cursor = "pointer";
        copyBtn.style.display = 'none';
        copyBtn.style.zIndex = '1';

        copyBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            if (clickHandler) {
                clickHandler();
            } else if (textToCopy !== null) {
                this._copyToClipboard(textToCopy, "Cell copied!");
            }
        });
        return copyBtn;
    },

    _styleAndAppendButton(button, parentElement, isHeader = false) {
        button.style.position = 'absolute';
        button.style.right = isHeader ? '5px' : '2px'; // Slightly more padding for header
        button.style.top = isHeader ? '2px' : '1px';

        // Ensure parent can contain absolutely positioned children
        const currentPosition = window.getComputedStyle(parentElement).position;
        if (currentPosition === 'static') {
            parentElement.style.position = 'relative';
        }

        // Add min-height for potentially empty cells to show the button on hover
        if (!parentElement.offsetHeight && parentElement.tagName !== 'TH') {
            parentElement.style.minHeight = '1.5em';
        }

        parentElement.appendChild(button);

        // Show/hide on hover
        parentElement.addEventListener('mouseenter', () => { button.style.display = 'inline-block'; });
        parentElement.addEventListener('mouseleave', () => { button.style.display = 'none'; });
    },

    async _copyColumnData(columnIndex) {
        if (!this.tableRef.el) return;
        const table = this.tableRef.el;
        const headerRow = table.querySelector("thead tr");
        const rows = table.querySelectorAll("tbody tr");
        const columnData = [];

        // Get header text
        if (headerRow && headerRow.children[columnIndex]) {
            const headerCell = headerRow.children[columnIndex];
            // Try to get the text from the specific title span first
            const headerTextElement = headerCell.querySelector('.o_column_title');
            const headerText = (headerTextElement?.textContent || headerCell.textContent || "").trim();
            if (headerText) {
                columnData.push(headerText);
            }
        }

        // Get body cell text
        rows.forEach(row => {
            const cell = row.children[columnIndex];
            // Check if cell exists at this index for the row
            if (cell) {
                const cellText = (cell.textContent || "").trim();
                columnData.push(cellText);
            }
        });

        const textToCopy = columnData.join("\n");
        this._copyToClipboard(textToCopy, "Column with header copied!");
    },

    async _copyToClipboard(text, successMessage = "Copied to clipboard!") {
        if (!text && text !== "") { // Allow copying empty strings if needed, but not null/undefined
            this.notification.add("Nothing to copy.", { type: "warning", sticky: false });
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            this.notification.add(successMessage, {
                type: "success",
                sticky: false,
                className: "o_copy_notification",
            });
        } catch (err) {
            console.error("Failed to copy text: ", err);
            this.notification.add("Failed to copy.", {
                type: "danger",
                sticky: false,
            });
        }
    }
});
