

const origin = 'http://192.168.40.59:8080';;
const urlConfig = {
    uploadMultipleFiles: `${origin}/uploadMultipleFiles`,
    save: `${origin}/save`,
    list: `${origin}/list`,
    downloadCSV: `${origin}/downloadCSV`,
    downloadFile: `${origin}/downloadFile`,
    downloadFileBulk: `${origin}/downloadFiles?fileNames=`,
    downloadCSVBulk: `${origin}/downloadCSVs?fileNames=`,
    getFile: `${origin}/getFile`,
    getJson: `${origin}/getJson`
};

export { urlConfig };