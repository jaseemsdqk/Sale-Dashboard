/** @odoo-module */
import { Component, onWillStart, useState, useRef, useEffect, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { session } from "@web/session";
import { setCache, getCache, chartStore } from "../../../services/indexeddb";
import { destroyChart, formatDate } from "../../../utils/chart_utils";

export class RevenueCOGSChart extends Component {
    static template = "sale_dashboard.RevenueCOGSChart";
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
                revenueData: [],
                cogsData: []
            },
            isLoading: true,
            hasData: false
        });

        this.revenueCOGSChartRef = useRef("revenueCOGSChart");
        this.chart = null;

        onWillStart(async () => {
            await this.loadRevenueCOGSData();
        });

        onMounted(() => {
            setTimeout(() => {
                this.renderChart();
            }, 100);
        });

        useEffect(() => {
            if (typeof Chart !== 'undefined' && this.state.hasData) {
                this.renderChart();
            }
        }, () => [this.state.chartData, this.state.hasData]);

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.loadRevenueCOGSData();
        });
    }

    willUnmount() {
        destroyChart(this.chart);
        window.removeEventListener('online', () => {
            this.loadRevenueCOGSData();
        });
    }

    async loadRevenueCOGSData() {
        const cacheKey = "revenue_cogs";
        this.state.isLoading = true;

        // Check for offline mode first
        if (!navigator.onLine) {
            const cachedChart = await getCache(chartStore, cacheKey);
            if (cachedChart) {
                this.state.chartData = cachedChart;
                this.state.hasData = cachedChart.labels.length > 0;
                this.state.isLoading = false;
                this.notification.add("Loaded Revenue vs COGS chart from offline data", {type: "info"});
                return;
            } else {
                this.state.isLoading = false;
                this.notification.add("No offline Revenue vs COGS data available", {type: "warning"});
                return;
            }
        }

        try {
            const currentDate = new Date();
            const last30Days = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
            const userId = session.current_user;

            const saleOrderLines = await this.orm.searchRead(
                "sale.order.line",
                [
                    ["order_id.state", "in", ["sale", "done"]],
                    ["order_id.user_id", "=", userId],
                    ["order_id.date_order", ">=", formatDate(last30Days)]
                ],
                ["product_id", "price_subtotal", "product_uom_qty", "price_unit"],
                {limit: 1000}
            );

            if (saleOrderLines.length === 0) {
                const emptyCOGS = {
                    labels: [],
                    revenueData: [],
                    cogsData: []
                };
                this.state.chartData = emptyCOGS;
                this.state.hasData = false;
                this.state.isLoading = false;
                await setCache(chartStore, cacheKey, emptyCOGS);
                return;
            }

            const productIds = [...new Set(saleOrderLines.map(line => line.product_id[0]))];
            const products = await this.orm.searchRead(
                "product.product",
                [["id", "in", productIds]],
                ["categ_id", "standard_price"]
            );

            const productCategoryMap = {};
            products.forEach(product => {
                productCategoryMap[product.id] = {
                    category: product.categ_id[1],
                    standardPrice: product.standard_price
                };
            });

            const categoryData = {};
            saleOrderLines.forEach(line => {
                const productId = line.product_id[0];
                const productInfo = productCategoryMap[productId];
                if (productInfo) {
                    const categoryName = productInfo.category;
                    const revenue = line.price_subtotal;
                    const cogs = (line.price_unit || productInfo.standardPrice) * line.product_uom_qty;

                    if (!categoryData[categoryName]) {
                        categoryData[categoryName] = { revenue: 0, cogs: 0 };
                    }
                    categoryData[categoryName].revenue += revenue;
                    categoryData[categoryName].cogs += cogs;
                }
            });

            const topCategories = Object.entries(categoryData)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .slice(0, 5);

            const plainCOGS = {
                labels: topCategories.map(cat => cat[0]),
                revenueData: topCategories.map(cat => cat[1].revenue),
                cogsData: topCategories.map(cat => cat[1].cogs)
            };

            this.state.chartData = plainCOGS;
            this.state.hasData = plainCOGS.labels.length > 0;
            this.state.isLoading = false;
            await setCache(chartStore, cacheKey, plainCOGS);
        } catch (error) {
            console.error("Error loading revenue COGS data:", error);
            this.state.isLoading = false;
            this.notification.add("Error loading Revenue vs COGS chart data", {type: "danger"});

            // Try to load from cache as fallback
            const cachedChart = await getCache(chartStore, cacheKey);
            if (cachedChart) {
                this.state.chartData = cachedChart;
                this.state.hasData = cachedChart.labels.length > 0;
                this.notification.add("Loaded Revenue vs COGS from cache due to error", {type: "info"});
            }
        }
    }

    renderChart() {
        if (!this.revenueCOGSChartRef.el || typeof Chart === 'undefined' || this.state.isLoading) {
            setTimeout(() => {
                if (typeof Chart !== 'undefined' && !this.state.isLoading) {
                    this.renderChart();
                }
            }, 500);
            return;
        }

        destroyChart(this.chart);

        try {
            const ctx = this.revenueCOGSChartRef.el.getContext('2d');
            if (ctx && this.state.hasData) {
                this.chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.state.chartData.labels,
                        datasets: [
                            {
                                label: 'Revenue',
                                data: this.state.chartData.revenueData,
                                backgroundColor: '#28a745',
                                borderColor: '#28a745',
                                borderWidth: 1
                            },
                            {
                                label: 'COGS',
                                data: this.state.chartData.cogsData,
                                backgroundColor: '#dc3545',
                                borderColor: '#dc3545',
                                borderWidth: 1
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
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error rendering Revenue vs COGS chart:", error);
        }
    }

    removeChart() {
        if (this.props.onRemove && typeof this.props.onRemove === 'function') {
            this.props.onRemove();
        }
    }
}
