# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _
from odoo.tools import float_compare

class SaleOrder(models.Model):
    _inherit = 'sale.order'


    def action_confirm(self):
        """ Override the action_confirm method to add custom logic before
        confirming the sale order. """
        res = super(SaleOrder, self).action_confirm()
        print("ACTIONN")
        self.env["bus.bus"]._sendone("handle_sale_update", "notification",self.id)
        return res
