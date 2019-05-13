export default function uploadImage(url, params) {
    return new Promise(function (resolve, reject) {
        let data = new FormData();
        data.append("file", params.data.file.file);
        fetch(`${url}`, {
            method: params.method || 'POST',
            mode: 'cors',
            headers: {
                // 'Content-Type': 'multipart/form-data',    //不设置因为图片上传时不知道boundary的定义方式   https://segmentfault.com/a/1190000010205162
            },
            body: data,
        }).then((response) => response.json())
            .then((responseData) => {
                resolve(responseData);
            })
            .catch((err) => {
                console.log('err', err);
                reject(err);
            });
    });
}