# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    def button_validate(self):
        print("button_validate")
        res = super(StockPicking, self).button_validate()
        self.env["bus.bus"]._sendone("handle_sale_update", "notification",
                                     self.id)
        return res
