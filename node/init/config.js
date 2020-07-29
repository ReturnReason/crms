const fs = require('fs')

const config_file_name = 'crms.config'
const default_config = { passwd: '1234', server_port: 4000}

module.exports ={
    existConfig: function (path) {
        try {
            fs.statSync(`${path}/data/${config_file_name}`)
            return true
        } catch {
            return false
        }
    },
    createConfig: function (path) {
        try {
            fs.mkdirSync(`${path}/data`)
            fs.writeFileSync(`${path}/data/${config_file_name}`, JSON.stringify(default_config))
            return true
        } catch {
            console.log('createConfig function Error')
            return false
        }
    },
    getConfig: function (path) {
        try {
            let config = fs.readFileSync(`${path}/data/${config_file_name}`)
            return {...JSON.parse(config), ...{path: path}}
        } catch {
            console.log('getConfig function Error')
            return false
        }
    }

}