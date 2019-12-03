var packager = require('electron-packager');
var options = {
    'arch': 'ia32',
    'platform': 'win32',
    'dir': './',
    'appCopyright': 'Copyright (C) 2019 LG U+ Inc. All rights reserved.',
    'appVersion': '1.0.0',
    'asar': {
        unpack: '*.{node,dll}'
    },
    'icon': './icon-256.ico',
    'name': 'Probit-Auto-Exchanging',
    'ignore': ['./releases', './.git', 'log.txt'],
    'out': './',
    'version': '1.0.0',
    'version-string':{
      'CompanyName': 'Pintech Inc.',
      'FileDescription': 'Probit-Auto-Exchanging', /*This is what display windows on task manager, shortcut and process*/
      'OriginalFilename': 'Probit-Auto-Exchanging',
      'ProductName': 'Probit-Auto-Exchanging',
      'InternalName': 'Probit-Auto-Exchanging'
    }
};
packager(options, function done_callback(err, appPaths) {
    console.log(err);
    console.log(appPaths);
});