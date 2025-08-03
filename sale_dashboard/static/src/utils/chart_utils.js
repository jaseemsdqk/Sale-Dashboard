/** @odoo-module */

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

export function destroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
    }
}

export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

export function formatDateTime(date) {
    return date.toISOString();
}
