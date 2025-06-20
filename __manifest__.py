# -*- coding: utf-8 -*-
{
    'name': 'List View Copy Cell',
    'version': '17.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'Allows copying the value of a cell in a tree view to the clipboard.',
    'description': """
This module adds a small copy icon next to each cell in tree views (list views).
Clicking the icon copies the cell's text content to the user's clipboard.
    """,
    'author': 'Goldwin',
    'website': 'https://odoonotes.com/',
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'copy_value_cell/static/src/**/*',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'OPL-1',
    'price': 15.00,
    'currency': 'USD',
    'support': 'goldwinnguyen96@gmail.com',
}
