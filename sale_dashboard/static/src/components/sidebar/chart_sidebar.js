/** @odoo-module */
import { Component, useRef } from "@odoo/owl";

export class ChartSidebar extends Component {
    static template = "sale_dashboard.ChartSidebar";
    static props = {
        isVisible: Boolean,
        onClose: Function
    };

    setup() {
        this.dragElement = useRef("dragElement");
        this.lineChartDragElement = useRef("lineChartDragElement");
    }

    onDragStart(ev, chartType) {
        ev.dataTransfer.setData("text/plain", chartType);
        ev.dataTransfer.effectAllowed = "move";
    }

    onDragEnd(ev) {
        // Drag end logic if needed
    }

    closeSidebar() {
        this.props.onClose();
    }
}
