/** @odoo-module */
import { Component, onWillStart, useState, useRef, useEffect, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { session } from "@web/session";
import { setCache, getCache, chartStore } from "../../../services/indexeddb";
import { destroyChart, formatDate } from "../../../utils/chart_utils";

export class SalesTrendChart extends Component {
    static template = "sale_dashboard.SalesTrendChart";
    static props = {
        isEditMode: Boolean,
        onRemove: Function
    };

    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");

        this.state = useState({
            chartData: {
                labels: [],
                salesData: []
            }
        });

        this.salesTrendChartRef = useRef("salesTrendChart");
        this.chart = null;

        onWillStart(async () => {
            await this.loadSalesTrendData();
        });

        onMounted(() => {
            setTimeout(() => {
                this.renderChart();
            }, 100);
        });

        useEffect(() => {
            if (typeof Chart !== 'undefined') {
                this.renderChart();
            }
        }, () => [this.state.chartData]);
    }

    willUnmount() {
        destroyChart(this.chart);
    }

    async loadSalesTrendData() {
        const cacheKey = "sales_trend";
        if (!navigator.onLine) {
            const cachedChart = await getCache(chartStore, cacheKey);
            if (cachedChart) {
                this.state.chartData = cachedChart;
                this.notification.add("Loaded sales trend chart from offline data", {type: "info"});
                return;
            } else {
                this.notification.add("No offline sales trend data available", {type: "warning"});
                return;
            }
        }

        try {
            const currentDate = new Date();
            const last30Days = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
            const userId = session.current_user;

            const saleOrders = await this.orm.searchRead(
                "sale.order",
                [
                    ["state", "in", ["sale", "done"]],
                    ["user_id", "=", userId],
                    ["date_order", ">=", formatDate(last30Days)]
                ],
                ["amount_total", "date_order"],
                {limit: 1000}
            );

            if (saleOrders.length === 0) {
                const emptyTrend = {
                    labels: [],
                    salesData: []
                };
                this.state.chartData = emptyTrend;
                await setCache(chartStore, cacheKey, emptyTrend);
                return;
            }

            // Group sales by date
            const salesByDate = {};
            saleOrders.forEach(order => {
                const orderDate = new Date(order.date_order).toLocaleDateString();
                if (!salesByDate[orderDate]) {
                    salesByDate[orderDate] = 0;
                }
                salesByDate[orderDate] += order.amount_total;
            });

            // Sort by date and get last 7 days
            const sortedDates = Object.entries(salesByDate)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .slice(-7);

            const plainTrend = {
                labels: sortedDates.map(item => item[0]),
                salesData: sortedDates.map(item => item[1])
            };

            this.state.chartData = plainTrend;
            await setCache(chartStore, cacheKey, plainTrend);
        } catch (error) {
            console.error("Error loading sales trend data:", error);
            this.notification.add("Error loading sales trend chart data", {type: "danger"});
        }
    }

    renderChart() {
        console.log("Rendering sales trend chart with data:", this.state.chartData);
        if (!this.salesTrendChartRef.el || typeof Chart === 'undefined') {
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    this.renderChart();
                }
            }, 500);
            return;
        }

        destroyChart(this.chart);

        try {
            console.log("Sales Trend Chart Data:", this.state.chartData);
            const ctx = this.salesTrendChartRef.el.getContext('2d');
            if (ctx && this.state.chartData.labels.length > 0) {
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: this.state.chartData.labels,
                        datasets: [
                            {
                                label: 'Daily Sales',
                                data: this.state.chartData.salesData,
                                borderColor: '#007bff',
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: '#007bff',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error rendering sales trend chart:", error);
        }
    }

    removeChart() {
        this.props.onRemove();
    }
}
