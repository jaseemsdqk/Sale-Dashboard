/** @odoo-module */
import { Component } from "@odoo/owl";
import { formatCurrency } from "../../utils/chart_utils";

export class KpiCards extends Component {
    static template = "sale_dashboard.KpiCards";
    static props = {
        dashboardData: Object
    };

    formatCurrency(amount) {
        return formatCurrency(amount);
    }
}
