

export const config = {
    get value() {
        return {
            DEV_URL: process.env.REACT_APP_PUBLIC_BASEURL,
            TOKEN: '34a89f9063bb49a59d2525220b677e25',
            APIKEY: 'vpaas-magic-cookie-d912c09dfba74cf2b05fe117f76fafd1/33de9d',
            APPID: 'vpaas-magic-cookie-d912c09dfba74cf2b05fe117f76fafd1',
            STAGING: process.env.REACT_APP_PUBLIC_STAGE_BASEURL
        }
    }
}