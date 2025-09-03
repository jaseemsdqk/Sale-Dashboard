/** @odoo-module */
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useState, useRef } from "@odoo/owl";
import { session } from "@web/session";
import { setCache, getCache, dashboardStore } from "../../services/indexeddb";
import { KpiCards } from "../kpi_cards/kpi_cards";
import { ChartSidebar } from "../sidebar/chart_sidebar";
import { DropZone } from "../drop_zone/drop_zone";

export class SaleDashBoard extends Component {
    static template = "sale_dashboard.SaleDashboard";
    static components = { KpiCards, ChartSidebar, DropZone };
    static props = {};

    setup() {
        this.busService = this.env.services.bus_service;
        this.busService.addChannel("handle_sale_update");
        console.log()
        this.busService.subscribe("notification", this.handleSaleUpdate.bind(this));

        this.orm = useService("orm");
        this.notification = useService("notification");

        this.state = useState({
            dashboardData: {
                totalSaleOrders: 0,
                totalRevenue: 0,
                totalOrdersToday: 0,
                averageOrderValue: 0
            },
            isEditMode: false,
            sidebarVisible: false
        });

        this.root = useRef("root");
        this.dropZoneRef = useRef("dropZone");

        onWillStart(async () => {
            await this.loadDashboardData();
            await this.loadEditModeState();
        });

        window.addEventListener('offline', () => {
            this.loadDashboardData();
        });
        window.addEventListener('online', () => {
            this.loadDashboardData();
        });
    }

    async loadEditModeState() {
        try {
            const savedState = await getCache(dashboardStore, "editModeState");
            if (savedState) {
                this.state.isEditMode = savedState.isEditMode || false;
                this.state.sidebarVisible = savedState.sidebarVisible || false;
            }
        } catch (error) {
            console.log("No saved edit mode state found, using defaults");
        }
    }

    async saveEditModeState() {
        try {
            const editModeState = {
                isEditMode: this.state.isEditMode,
                sidebarVisible: this.state.sidebarVisible
            };
            await setCache(dashboardStore, "editModeState", editModeState);
        } catch (error) {
            console.error("Error saving edit mode state:", error);
        }
    }

    handleSaleUpdate() {
        console.log("handleSaleUpdate")
        this.loadDashboardData();
    }

    async loadDashboardData() {
        console.log("Loading dashboard data...");
        const cacheKey = "main";
        if (!navigator.onLine) {
            const cachedData = await getCache(dashboardStore, cacheKey);
            if (cachedData) {
                this.state.dashboardData = cachedData;
                this.notification.add("Loaded dashboard from offline data", {type: "info"});
                return;
            } else {
                this.notification.add("No offline data available", {type: "warning"});
                return;
            }
        }

        try {
            const currentDate = new Date();
            const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            const formatDateTime = (date) => date.toISOString();
            const userId = session.current_user;

            const allSaleOrders = await this.orm.searchRead(
                "sale.order",
                [
                    ["state", "in", ["sale", "done"]],
                    ["user_id", "=", userId]
                ],
                ["amount_total", "date_order"],
                {limit: 1000}
            );

            const todaySaleOrders = await this.orm.searchRead(
                "sale.order",
                [
                    ["state", "in", ["sale", "done"]],
                    ["user_id", "=", userId],
                    ["date_order", ">=", formatDateTime(startOfDay)]
                ],
                ["amount_total"],
                {limit: 1000}
            );

            const totalSaleOrders = allSaleOrders.length;
            const totalRevenue = allSaleOrders.reduce((sum, order) => sum + order.amount_total, 0);
            const totalOrdersToday = todaySaleOrders.length;
            const averageOrderValue = totalSaleOrders > 0 ? totalRevenue / totalSaleOrders : 0;

            const dashboardCopy = {
                totalSaleOrders,
                totalRevenue,
                totalOrdersToday,
                averageOrderValue
            };

            this.state.dashboardData = dashboardCopy;
            await setCache(dashboardStore, cacheKey, dashboardCopy);
            console.log("Dashboard data loaded and cached.!!!!!!!!!!");

        } catch (error) {
            console.error("Error loading dashboard data:", error);
            this.notification.add("Error loading dashboard data", {type: "danger"});
        }
    }

    async toggleEditMode() {
        this.state.isEditMode = !this.state.isEditMode;
        this.state.sidebarVisible = this.state.isEditMode;
        await this.saveEditModeState();
    }

    async closeSidebar() {
        this.state.sidebarVisible = false;
        this.state.isEditMode = false;
        await this.saveEditModeState();
    }

    onChartAdded() {
        // Optional: You can add any additional logic here when a chart is added
        console.log("Chart added to dashboard");
    }
}
