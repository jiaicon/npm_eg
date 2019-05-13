import React from 'react';
import ReactDOM from 'react-dom';

// import Tab from './tab/tab';
//
// let tabIndex = 1;
// function onTabChange() {
//     tabIndex = 0;
// }
//
// ReactDOM.render(<Tab
//         tabs={[
//             { label: "项目详情", component: <div>哈哈哈</div> },
//             { label: "项目社区", component: <div>456</div> }
//         ]}
//         onChange={onTabChange}
//         selectedIndex={tabIndex}
//     />, document.getElementById('app'));

import UploadPhoto from './uploadPhoto/uploadPhoto';

const onPhotoChange = ()=>{
    console.log('图片改变了~~~');
};
const onPreview = ()=>{
    console.log('点击预览了~~~');
};
ReactDOM.render(<UploadPhoto
    onChange={onPhotoChange}
    preview={true}
    multiple={true}
    length={4}
    showToast={true}
    onPreview={onPreview}
/>, document.getElementById('app'));