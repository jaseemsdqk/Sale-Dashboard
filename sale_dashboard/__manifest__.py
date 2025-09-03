{
    'name': 'Sale Dashboard',
    'version': '18.0.1.0.0',
    'category': 'Sales',
    'summary': 'Dashboard for Sale Orders',
    'description': """
        This module adds a dashboard to the sale order list view
        showing key metrics and statistics.
    """,
    'depends': ['sale_management', 'web','stock'],
    'data': [
        'views/sale_order_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'sale_dashboard/static/src/**/*',
            'https://cdn.jsdelivr.net/npm/chart.js'

        ],
    },
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
