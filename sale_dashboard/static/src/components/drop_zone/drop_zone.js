/** @odoo-module */
import { Component, useState, useRef, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { setCache, getCache, dashboardStore } from "../../services/indexeddb";
import { RevenueCOGSChart } from "../charts/revenue_cogs_chart/revenue_cogs_chart";
import { SalesTrendChart } from "../charts/sales_trend_chart/sales_trend_chart";

export class DropZone extends Component {
    static template = "sale_dashboard.DropZone";
    static components = { RevenueCOGSChart, SalesTrendChart };
    static props = {
        isEditMode: Boolean,
        onChartAdded: Function
    };

    setup() {
        this.notification = useService("notification");
        this.state = useState({
            showRevenueCOGSChart: false,
            showSalesTrendChart: false
        });
        this.dropZone = useRef("dropZone");

        // Load saved chart state on component initialization
        onWillStart(async () => {
            await this.loadChartState();
        });
    }

    async loadChartState() {
        try {
            const savedState = await getCache(dashboardStore, "chartState");
            if (savedState) {
                this.state.showRevenueCOGSChart = savedState.showRevenueCOGSChart || false;
                this.state.showSalesTrendChart = savedState.showSalesTrendChart || false;
            }
        } catch (error) {
            console.log("No saved chart state found, using defaults");
        }
    }

    async saveChartState() {
        try {
            const chartState = {
                showRevenueCOGSChart: this.state.showRevenueCOGSChart,
                showSalesTrendChart: this.state.showSalesTrendChart
            };
            await setCache(dashboardStore, "chartState", chartState);
        } catch (error) {
            console.error("Error saving chart state:", error);
        }
    }

    onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    async onDrop(ev) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text/plain");

        if (data === "revenue-cogs-chart") {
            this.state.showRevenueCOGSChart = true;
            await this.saveChartState();
            this.notification.add("Revenue vs COGS Chart added to dashboard", {type: "success"});
        } else if (data === "sales-trend-chart") {
            this.state.showSalesTrendChart = true;
            await this.saveChartState();
            this.notification.add("Sales Trend Chart added to dashboard", {type: "success"});
        }

        this.props.onChartAdded();
    }

    async removeRevenueCOGSChart() {
        this.state.showRevenueCOGSChart = false;
        await this.saveChartState();
        this.notification.add("Revenue vs COGS Chart removed from dashboard", {type: "info"});
    }

    async removeSalesTrendChart() {
        this.state.showSalesTrendChart = false;
        await this.saveChartState();
        this.notification.add("Sales Trend Chart removed from dashboard", {type: "info"});
    }
}
