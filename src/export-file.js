const fs = require('fs');
const path = require('path');

class ExportComponent {
    total = 0;
    paths = []

    load = function() {
        return new Promise(async (res, rej) => {
            try {
                this.reset();
                const files = fs.readdirSync(path.join(__dirname, './../database'))
                if (files) {
                    this.total = files.length;
                    this.paths = files;
                }
                res(this.total);
            } catch (error) {
                rej(error)
            }
        })
    }

    getTotal = function() {
        return this.total;
    }

    reset = function() {
        this.total = 0;
        this.paths = [];
    }

    getDestinationPath = function() {
        return new Promise(async (res, rej) => {
            if (process.platform == 'win32') {
                return res(path.join(__dirname, './../output'))
            } else if (process.platform == 'linux') {
                const drives = fs.readdirSync('/media/nvidia')
                console.log(drives)
                if (drives.length) {
                    res(path.join('media/nvidia', drives[0]));
                } else {
                    rej();
                }
            }
        })
    }

    export = function(id) {
        return new Promise(async (res, rej) => {
            try {
                if (this.path[id] === 'index.json') {
                    return res(true);
                }
                const sourcePath = path.join(__dirname, './../database', this.paths[id]);
                const destinationPath = path.join(await this.getDestinationPath(), this.paths[id]);
                fs.copyFileSync(sourcePath, destinationPath);
                res(true);
            } catch (error) {
                console.error(error)
                rej(error)
            }
        });
    }
}

module.exports = ExportComponent