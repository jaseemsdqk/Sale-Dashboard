
from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        res = super().session_info()
        print("selffff",res)
        print("selffff",self)
        res['current_user'] = self.env.user.id
        return res
